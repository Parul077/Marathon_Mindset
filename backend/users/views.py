from django.contrib.auth import authenticate
from django.utils import timezone
from django.db.models import Count, Q
from datetime import date, timedelta
import random

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from .models import (
    CustomUser, OnboardingAnswer, Habit, HabitLog, RestDay,
    BadDayLog, DailyJournal, SmallWin, AnonymousWin,
    MilestoneLog, Goal, Book, WeeklyGrowthLetter, DailyInvitationLog
)
from .serializers import RegisterSerializer


# ─── LEVEL CONFIG ─────────────────────────────────────────────────────────────

LEVEL_CONFIG = {
    1: {
        'name': 'Foundations',
        'tagline': 'One thing at a time. The hardest habits start small.',
        'features': ['1 habit', '1 journal prompt', '1 win field'],
        'unlocks_at_days': 0,
    },
    2: {
        'name': 'Building',
        'tagline': "You're showing up. Now we add more.",
        'features': ['Multiple habits', '3 journal prompts', 'Streak details'],
        'unlocks_at_days': 7,
    },
    3: {
        'name': 'Expanding',
        'tagline': 'Goals, full tracking, and your complete practice.',
        'features': ['Goal tracking', 'Full habit list', 'Weekly patterns'],
        'unlocks_at_days': 21,
    },
    4: {
        'name': 'Full Journey',
        'tagline': 'Everything unlocked. Grow at your own pace.',
        'features': ['Growth letters', 'All features', 'Complete dashboard'],
        'unlocks_at_days': 30,
    },
}


def get_disclosure_level(days_joined, manual_level=None):
    if manual_level is not None:
        return manual_level
    if days_joined < 7:
        return 1
    elif days_joined < 21:
        return 2
    elif days_joined < 30:
        return 3
    else:
        return 4


def get_next_level_info(current_level, days_joined, manual_level=None):
    if current_level >= 4:
        return None
    next_level = current_level + 1
    next_config = LEVEL_CONFIG[next_level]
    days_until = None
    if manual_level is None:
        days_needed = next_config['unlocks_at_days']
        days_until = max(0, days_needed - days_joined)
    return {
        'level': next_level,
        'name': next_config['name'],
        'tagline': next_config['tagline'],
        'features': next_config['features'],
        'days_until_auto': days_until,
        'can_unlock_early': True,
    }


# ─── AUTH ────────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.id,
            'username': user.username,
            'name': user.name or user.username,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.id,
            'username': user.username,
            'name': user.name or user.username,
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)


# ─── USER STATUS ─────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_status(request):
    user = request.user
    days_joined = user.days_since_joined()
    streak = calculate_streak(user)

    slow_down_active = False
    today = date.today()
    try:
        bad_day = BadDayLog.objects.get(user=user, date=today)
        slow_down_active = bad_day.is_slow_down_active()
    except BadDayLog.DoesNotExist:
        pass

    pending_milestones = list(
        MilestoneLog.objects.filter(user=user, acknowledged=False)
        .values_list('streak_days', flat=True)
    )

    show_checkin_prompt = False
    checkin_question = None
    unanswered = OnboardingAnswer.objects.filter(
        user=user, next_ask_date__lte=today
    ).first()
    if unanswered:
        show_checkin_prompt = True
        checkin_question = unanswered.question_key

    current_level = get_disclosure_level(days_joined, user.manual_level)
    next_level = get_next_level_info(current_level, days_joined, user.manual_level)
    current_config = LEVEL_CONFIG[current_level]

    return Response({
        'name': user.name or user.username,
        'days_joined': days_joined,
        'streak': streak,
        'slow_down_active': slow_down_active,
        'pending_milestones': pending_milestones,
        'one_thing_mode': user.one_thing_mode,
        'disclosure_level': current_level,
        'level_name': current_config['name'],
        'level_tagline': current_config['tagline'],
        'level_features': current_config['features'],
        'next_level': next_level,
        'manual_level': user.manual_level,
        'show_checkin_prompt': show_checkin_prompt,
        'checkin_question': checkin_question,
        'onboarding_complete': user.onboarding_complete,
    })


# ─── UNLOCK EARLY ────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unlock_early(request):
    user = request.user
    days_joined = user.days_since_joined()
    current_level = get_disclosure_level(days_joined, user.manual_level)
    requested_level = request.data.get('level')
    if requested_level is not None:
        target = int(requested_level)
    else:
        target = current_level + 1
    target = max(1, min(4, target))
    user.manual_level = target
    user.save()
    next_level = get_next_level_info(target, days_joined, target)
    config = LEVEL_CONFIG[target]
    return Response({
        'disclosure_level': target,
        'level_name': config['name'],
        'level_tagline': config['tagline'],
        'level_features': config['features'],
        'next_level': next_level,
        'manual_level': target,
    })


# ─── SETTINGS ────────────────────────────────────────────────────────────────

@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def settings_view(request):
    user = request.user

    if request.method == 'GET':
        return Response({
            'name': user.name,
            'username': user.username,
            'manual_level': user.manual_level,
            'days_joined': user.days_since_joined(),
            'streak': calculate_streak(user),
        })

    elif request.method == 'PATCH':
        new_name = request.data.get('name', '').strip()
        if not new_name:
            return Response({'error': 'Name cannot be empty.'}, status=400)
        if len(new_name) > 150:
            return Response({'error': 'Name is too long.'}, status=400)
        user.name = new_name
        user.save()
        return Response({'name': user.name, 'status': 'updated'})

    elif request.method == 'DELETE':
        password = request.data.get('password', '')
        if not password:
            return Response({'error': 'Password is required to delete your account.'}, status=400)
        confirmed = authenticate(username=user.username, password=password)
        if not confirmed:
            return Response({'error': 'Incorrect password.'}, status=400)
        Token.objects.filter(user=user).delete()
        user.delete()
        return Response({'status': 'deleted'})


# ─── RESET LEVEL TO AUTO ─────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reset_level(request):
    request.user.manual_level = None
    request.user.save()
    days_joined = request.user.days_since_joined()
    auto_level = get_disclosure_level(days_joined)
    return Response({
        'manual_level': None,
        'disclosure_level': auto_level,
        'level_name': LEVEL_CONFIG[auto_level]['name'],
    })


# ─── STREAK ──────────────────────────────────────────────────────────────────

def calculate_streak(user):
    """
    Streak calculation — honest accountability with explicit grace.

    Rules:
    - A day counts if the user completed at least one habit.
    - A day counts if the user explicitly pressed "Today was hard" (BadDayLog exists),
      which creates a RestDay record.
    - A silently skipped day (no habit log, no BadDayLog) BREAKS the streak.
    - We do NOT auto-apply rest days for silent skips anymore.

    This preserves the platform's philosophy:
    "Grow at your own pace" means you choose when to rest — not that every
    missed day is automatically forgiven. The streak should feel earned.
    """
    habits = Habit.objects.filter(user=user, is_active=True)
    if not habits.exists():
        return 0

    today = date.today()
    streak = 0

    for i in range(365):
        check_date = today - timedelta(days=i)

        # Did the user complete any habit on this day?
        completed = HabitLog.objects.filter(
            habit__in=habits, date=check_date, completed=True
        ).exists()

        if completed:
            streak += 1
            continue

        # Was this an explicitly declared rest day (via "Today was hard" button)?
        # RestDay records are ONLY created by log_bad_day() — never auto-applied.
        explicit_rest = RestDay.objects.filter(user=user, date=check_date).exists()

        if explicit_rest:
            streak += 1
            continue

        # Silent skip — streak ends here
        break

    # Check for milestone unlocks
    milestone_days = [7, 21, 50, 100, 365]
    for m in milestone_days:
        if streak >= m:
            MilestoneLog.objects.get_or_create(user=user, streak_days=m)

    return streak


# ─── ONBOARDING ──────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_onboarding(request):
    answers = request.data.get('answers', [])
    for item in answers:
        question_key = item.get('question_key')
        answer = item.get('answer', '')
        skipped = item.get('skipped', False)
        next_ask = date.today() + timedelta(days=90) if skipped else None
        OnboardingAnswer.objects.update_or_create(
            user=request.user,
            question_key=question_key,
            defaults={'answer': answer, 'skipped': skipped, 'next_ask_date': next_ask}
        )
    request.user.onboarding_complete = True
    request.user.save()
    return Response({'status': 'saved'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def answer_checkin(request):
    question_key = request.data.get('question_key')
    answer = request.data.get('answer', '')
    snoozed = request.data.get('snoozed', False)
    try:
        oa = OnboardingAnswer.objects.get(user=request.user, question_key=question_key)
        if snoozed:
            oa.next_ask_date = date.today() + timedelta(days=30)
        else:
            oa.answer = answer
            oa.skipped = False
            oa.next_ask_date = date.today() + timedelta(days=180)
        oa.save()
        return Response({'status': 'saved'})
    except OnboardingAnswer.DoesNotExist:
        return Response({'error': 'Question not found'}, status=404)


# ─── HABITS ──────────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def habits(request):
    if request.method == 'GET':
        user_habits = Habit.objects.filter(user=request.user, is_active=True)
        today = date.today()
        data = []
        for h in user_habits:
            try:
                log = HabitLog.objects.get(habit=h, date=today)
                completed_today = log.completed
            except HabitLog.DoesNotExist:
                completed_today = False
            data.append({
                'id': h.id, 'name': h.name, 'description': h.description,
                'order': h.order, 'completed_today': completed_today,
            })
        return Response(data)

    elif request.method == 'POST':
        name = request.data.get('name')
        if not name:
            return Response({'error': 'Name required'}, status=400)
        max_order = Habit.objects.filter(user=request.user).count()
        habit = Habit.objects.create(
            user=request.user, name=name,
            description=request.data.get('description', ''), order=max_order
        )
        return Response({
            'id': habit.id, 'name': habit.name, 'description': habit.description,
            'order': habit.order, 'completed_today': False,
        }, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_habit(request, habit_id):
    try:
        habit = Habit.objects.get(id=habit_id, user=request.user)
    except Habit.DoesNotExist:
        return Response({'error': 'Habit not found'}, status=404)

    completed = request.data.get('completed', True)

    log_date_str = request.data.get('date')
    if log_date_str:
        try:
            from datetime import datetime
            log_date = datetime.strptime(log_date_str, '%Y-%m-%d').date()
            if log_date > date.today():
                return Response({'error': 'Cannot log future dates'}, status=400)
        except ValueError:
            return Response({'error': 'Invalid date format, use YYYY-MM-DD'}, status=400)
    else:
        log_date = date.today()

    log, _ = HabitLog.objects.update_or_create(
        habit=habit, date=log_date, defaults={'completed': completed}
    )
    streak = calculate_streak(request.user) if log_date == date.today() else None
    response_data = {'completed': log.completed, 'date': str(log_date)}
    if streak is not None:
        response_data['streak'] = streak
    return Response(response_data)


# ─── HABIT LOGS (monthly tracker) ────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def habit_logs(request):
    month_param = request.query_params.get('month')
    if not month_param:
        return Response({'error': 'month param required, e.g. ?month=2026-04'}, status=400)
    try:
        year, month = month_param.split('-')
        year, month = int(year), int(month)
    except (ValueError, AttributeError):
        return Response({'error': 'Invalid month format, use YYYY-MM'}, status=400)

    from calendar import monthrange
    _, last_day = monthrange(year, month)
    start = date(year, month, 1)
    end = date(year, month, last_day)

    user_habits = Habit.objects.filter(user=request.user, is_active=True)
    logs = HabitLog.objects.filter(
        habit__in=user_habits, date__gte=start, date__lte=end,
    ).values('habit_id', 'date', 'completed')

    result: dict = {}
    for log in logs:
        hid = str(log['habit_id'])
        day = str(log['date'].day)
        if hid not in result:
            result[hid] = {}
        result[hid][day] = log['completed']

    return Response(result)


# ─── BAD DAY / SLOW DOWN ─────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_bad_day(request):
    """
    The ONLY place where a RestDay is created.
    When a user presses "Today was hard.", we:
    1. Log the bad day
    2. Create a RestDay for today (explicit grace — user asked for it)
    3. Activate Slow Down Mode for 24h
    """
    today = date.today()
    private_note = request.data.get('note', '')
    bad_day, created = BadDayLog.objects.get_or_create(
        user=request.user, date=today, defaults={'private_note': private_note}
    )
    if not created and private_note:
        bad_day.private_note = private_note
        bad_day.save()

    # Always ensure a RestDay exists for today when user explicitly asks for grace
    RestDay.objects.get_or_create(
        user=request.user,
        date=today,
        defaults={
            'week_year': today.isocalendar()[0],
            'week_number': today.isocalendar()[1],
            'auto_applied': False  # explicitly requested by user
        }
    )

    streak = calculate_streak(request.user)
    return Response({
        'status': 'logged',
        'slow_down_until': bad_day.slow_down_until,
        'rest_day_applied': True,
        'streak': streak,
        'message': "That took courage to say. Rest is part of the journey."
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def slow_down_status(request):
    today = date.today()
    try:
        bad_day = BadDayLog.objects.get(user=request.user, date=today)
        return Response({'active': bad_day.is_slow_down_active(), 'until': bad_day.slow_down_until})
    except BadDayLog.DoesNotExist:
        return Response({'active': False, 'until': None})


# ─── ONE THING MODE ──────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_one_thing_mode(request):
    enabled = request.data.get('enabled', True)
    request.user.one_thing_mode = enabled
    request.user.save()
    return Response({'one_thing_mode': enabled})


# ─── JOURNAL ─────────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def journal(request):
    today = date.today()
    if request.method == 'GET':
        date_param = request.query_params.get('date', str(today))
        try:
            entry = DailyJournal.objects.get(user=request.user, date=date_param)
            return Response({'entry': entry.entry, 'mood': entry.mood, 'date': entry.date})
        except DailyJournal.DoesNotExist:
            return Response({'entry': '', 'mood': '', 'date': date_param})
    elif request.method == 'POST':
        entry_text = request.data.get('entry', '')
        mood = request.data.get('mood', '')
        entry_date = request.data.get('date', str(today))
        journal_entry, _ = DailyJournal.objects.update_or_create(
            user=request.user, date=entry_date,
            defaults={'entry': entry_text, 'mood': mood}
        )
        return Response({'status': 'saved', 'date': journal_entry.date})


# ─── SMALL WINS ──────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def small_wins(request):
    if request.method == 'GET':
        wins = SmallWin.objects.filter(user=request.user).order_by('-created_at')[:20]
        return Response([{
            'id': w.id, 'win': w.win, 'date': w.date,
            'shared_anonymously': w.shared_anonymously
        } for w in wins])
    elif request.method == 'POST':
        win_text = request.data.get('win', '')
        share = request.data.get('share_anonymously', False)
        if not win_text:
            return Response({'error': 'Win text required'}, status=400)
        win = SmallWin.objects.create(
            user=request.user, win=win_text, date=date.today(), shared_anonymously=share
        )
        if share:
            AnonymousWin.objects.create(win_text=win_text)
        return Response({'id': win.id, 'win': win.win, 'date': win.date}, status=201)


# ─── COMMUNITY WIN (single random — used by dashboard bar) ───────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def community_win(request):
    wins = AnonymousWin.objects.filter(is_active=True, flagged=False)
    if not wins.exists():
        seed_wins = [
            "I made my bed today, first time in two weeks.",
            "Went for a 10-minute walk even though I didn't feel like it.",
            "Replied to an email I'd been avoiding for days.",
            "Drank 8 glasses of water. Small, but I did it.",
            "Called my mom. Really talked, not just checked in.",
            "Finished a chapter of the book sitting on my nightstand.",
            "Cooked a real meal instead of ordering in.",
            "Wrote three sentences in my journal.",
            "Said no to something that was draining me.",
            "Sat quietly for five minutes without my phone.",
        ]
        win_text = random.choice(seed_wins)
    else:
        win = random.choice(list(wins))
        win_text = win.win_text
    return Response({'win': win_text})


# ─── COMMUNITY WINS (feed — used by community wall page) ─────────────────────

SEED_WINS = [
    "I made my bed today, first time in two weeks.",
    "Went for a 10-minute walk even though I didn't feel like it.",
    "Replied to an email I'd been avoiding for days.",
    "Drank 8 glasses of water. Small, but I did it.",
    "Called my mom. Really talked, not just checked in.",
    "Finished a chapter of the book sitting on my nightstand.",
    "Cooked a real meal instead of ordering in.",
    "Wrote three sentences in my journal.",
    "Said no to something that was draining me.",
    "Sat quietly for five minutes without my phone.",
    "Got out of bed before 9. That was the win.",
    "Apologised to someone I hurt. It was hard.",
    "Didn't check my phone for a whole hour.",
    "Took my medication on time, three days in a row.",
    "Cried and let myself feel it instead of pushing through.",
    "Told a friend I was struggling. They listened.",
    "Skipped the late night scroll and went to sleep earlier.",
    "Made a to-do list and crossed one thing off.",
    "Stretched for five minutes. My body said thank you.",
    "Ate breakfast. Sounds small. Wasn't.",
]

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def community_wins(request):
    count = min(int(request.query_params.get('count', 15)), 30)
    real_wins = list(
        AnonymousWin.objects.filter(is_active=True, flagged=False)
        .values_list('win_text', flat=True)
    )
    if len(real_wins) >= count:
        selected = random.sample(real_wins, count)
    else:
        available_seeds = [s for s in SEED_WINS if s not in real_wins]
        combined = real_wins + available_seeds
        selected = random.sample(combined, min(count, len(combined)))
    random.shuffle(selected)
    return Response({'wins': selected, 'total': len(selected)})


# ─── MILESTONES ──────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def acknowledge_milestone(request):
    streak_days = request.data.get('streak_days')
    try:
        milestone = MilestoneLog.objects.get(user=request.user, streak_days=streak_days)
        milestone.acknowledged = True
        milestone.save()
        return Response({'status': 'acknowledged'})
    except MilestoneLog.DoesNotExist:
        return Response({'error': 'Milestone not found'}, status=404)


# ─── GOALS ───────────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def goals(request):
    if request.method == 'GET':
        user_goals = Goal.objects.filter(user=request.user).order_by('completed', 'target_date')
        return Response([{
            'id': g.id, 'title': g.title, 'description': g.description,
            'target_date': g.target_date, 'completed': g.completed,
        } for g in user_goals])
    elif request.method == 'POST':
        goal = Goal.objects.create(
            user=request.user,
            title=request.data.get('title', ''),
            description=request.data.get('description', ''),
            target_date=request.data.get('target_date'),
        )
        return Response({'id': goal.id, 'title': goal.title}, status=201)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def complete_goal(request, goal_id):
    try:
        goal = Goal.objects.get(id=goal_id, user=request.user)
        goal.completed = True
        goal.completed_at = timezone.now()
        goal.save()
        return Response({'status': 'completed'})
    except Goal.DoesNotExist:
        return Response({'error': 'Goal not found'}, status=404)


# ─── GROWTH LETTER ────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def growth_letter(request):
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)

    try:
        letter = WeeklyGrowthLetter.objects.get(user=request.user, week_start=week_start)
        return Response({
            'content': letter.letter_content, 'week_start': letter.week_start,
            'stats': {'habits': letter.habits_completed, 'journals': letter.journal_entries,
                      'wins': letter.wins_logged, 'streak': letter.current_streak}
        })
    except WeeklyGrowthLetter.DoesNotExist:
        pass

    habits_completed = HabitLog.objects.filter(
        habit__user=request.user, date__gte=week_start, date__lte=week_end, completed=True
    ).count()
    journal_entries = DailyJournal.objects.filter(
        user=request.user, date__gte=week_start, date__lte=week_end
    ).count()
    wins_logged = SmallWin.objects.filter(
        user=request.user, date__gte=week_start, date__lte=week_end
    ).count()
    streak = calculate_streak(request.user)
    name = request.user.name or request.user.username

    letter_content = generate_growth_letter(
        name=name, habits=habits_completed, journals=journal_entries,
        wins=wins_logged, streak=streak, week_start=week_start
    )
    letter = WeeklyGrowthLetter.objects.create(
        user=request.user, week_start=week_start, week_end=week_end,
        letter_content=letter_content, habits_completed=habits_completed,
        journal_entries=journal_entries, wins_logged=wins_logged, current_streak=streak,
    )
    return Response({
        'content': letter.letter_content, 'week_start': letter.week_start,
        'stats': {'habits': habits_completed, 'journals': journal_entries,
                  'wins': wins_logged, 'streak': streak}
    })


def generate_growth_letter(name, habits, journals, wins, streak, week_start):
    openers = [
        f"Dear {name},\n\nAnother week has quietly passed, and I've been thinking about you.",
        f"Dear {name},\n\nSomewhere between the noise of the week, you kept showing up.",
        f"Dear {name},\n\nThis week wasn't perfect. But you were here for it.",
    ]
    streak_line = ""
    if streak >= 100:
        streak_line = f"A hundred days. Let that settle in for a moment. {streak} days of choosing yourself."
    elif streak >= 21:
        streak_line = f"Twenty-one days is where science says habits begin to root. You're at {streak}. Something is growing."
    elif streak >= 7:
        streak_line = f"Seven days in a row. You've crossed the threshold from intention to identity."
    elif streak > 0:
        streak_line = f"You're on a {streak}-day streak. Not because you had to. Because you chose to."

    parts = []
    if habits > 0:
        parts.append(f"You completed your habits {habits} time{'s' if habits != 1 else ''} this week.")
    if journals > 0:
        parts.append(f"You wrote {journals} time{'s' if journals != 1 else ''} — {journals} moment{'s' if journals != 1 else ''} of clarity.")
    if wins > 0:
        parts.append(f"You logged {wins} small win{'s' if wins != 1 else ''}. The small things are never small.")

    middle = " ".join(parts) if parts else "This might have been a harder week. That's allowed. Rest is not the opposite of growth — it's part of it."
    closing = random.choice([
        "Keep going at your pace. There is no race here.",
        "You don't have to be consistent. You just have to keep coming back.",
        "Slow and steady isn't a consolation prize. It's the whole point.",
    ])

    return f"{random.choice(openers)}\n\n{middle}\n\n{streak_line}\n\n{closing}\n\nWith warmth,\nMarathon Mindset\n\nWeek of {week_start.strftime('%B %d')}".strip()


# ─── STREAK DETAIL ───────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def streak_detail(request):
    """
    Returns the last 7 days with honest status for each day:
    - completed: user logged a habit
    - rest_day: user explicitly pressed "Today was hard" (BadDayLog + RestDay exists)
    - bad_day: same as rest_day (alias for frontend display)
    - skipped: no habit logged, no rest day declared — silent skip
    """
    streak = calculate_streak(request.user)
    today = date.today()
    habits = Habit.objects.filter(user=request.user, is_active=True)
    last_7 = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        completed = HabitLog.objects.filter(habit__in=habits, date=d, completed=True).exists()
        # Only count explicit rest days (from "Today was hard" button)
        is_rest = RestDay.objects.filter(user=request.user, date=d).exists()
        is_bad_day = BadDayLog.objects.filter(user=request.user, date=d).exists()
        # A day is a silent skip if: not completed, not an explicit rest/bad day,
        # and it's in the past (not today)
        is_silent_skip = (
            not completed
            and not is_rest
            and not is_bad_day
            and d < today
        )
        last_7.append({
            'date': str(d),
            'completed': completed,
            'rest_day': is_rest,
            'bad_day': is_bad_day,
            'skipped': is_silent_skip,
            'day_name': d.strftime('%a'),
        })
    return Response({
        'streak': streak,
        'rest_days_used': RestDay.objects.filter(user=request.user).count(),
        'last_7_days': last_7,
    })


# ─── Daily Invitation ────────────────────────────────────────────────────────

DAILY_INVITATIONS = [
    # ── Slow moments ──────────────────────────────────────────────────────────
    "Drink something warm today without looking at your phone.",
    "Step outside for two minutes. No destination. Just air.",
    "Walk slower than you normally would, just for one stretch.",
    "Sit in silence for three minutes. Let thoughts pass like clouds.",
    "Notice five things around you right now. Really look at them.",
    "Eat one meal today without any screen in front of you.",
    "Open a window. Breathe in whatever is outside.",
    "Put your phone face down for the next hour.",
    "Watch the sky for two minutes — morning, noon, or night.",
    "Move from one room to another with no purpose. Just wander.",

    # ── Return to yourself ────────────────────────────────────────────────────
    "Write one sentence about how you actually feel today.",
    "Ask yourself: what do I need right now that I haven't given myself?",
    "Think of something you did recently that you're quietly proud of.",
    "Name one thing that made today a little lighter.",
    "Put down something you've been carrying. Just for today.",
    "Think of a moment this week when you were kind to someone.",
    "Ask yourself: what would feel gentle today?",
    "Recall a time you got through something hard. You did it then too.",
    "Write down one thing you're grateful for that you never say out loud.",
    "Notice how your body feels right now. No judgment — just notice.",

    # ── Tiny courage ──────────────────────────────────────────────────────────
    "Say no to one small thing today that you'd normally say yes to.",
    "Take a break without apologising for it.",
    "Do one thing today purely for yourself, not for anyone else.",
    "Send a message to someone you've been meaning to reach out to.",
    "Tell someone one true thing about how you're doing.",
    "Skip something that drains you today, without guilt.",
    "Ask for help with one thing you've been doing alone.",
    "Admit to yourself one thing that isn't working. Just notice it.",
    "Do one thing at half your usual speed.",
    "Let something be imperfect today and leave it that way.",

    # ── Unexpected kindness ───────────────────────────────────────────────────
    "Write one sentence you needed to hear. Keep it for yourself.",
    "Be kind to yourself in one small way today — whatever that means to you.",
    "Do one thing for your future self: sleep earlier, drink water, rest.",
    "Forgive yourself for one thing you've been holding against yourself.",
    "Treat yourself the way you'd treat a friend having a hard week.",
    "Notice when you're being harsh with yourself today. Just notice.",
    "Say something encouraging to yourself before you sleep tonight.",
    "Do one thing that your body is asking for — rest, movement, food, quiet.",
    "Write down one quality you like about yourself. No disclaimers.",
    "Let today be enough, even if it didn't look like what you planned.",

    # ── Small connections ─────────────────────────────────────────────────────
    "Make eye contact and smile at one person today.",
    "Really listen to someone today — without planning your response.",
    "Call or text someone just to say you were thinking of them.",
    "Thank someone for something small they did that you usually don't mention.",
    "Ask someone how they're really doing — and wait for the answer.",
    "Share one honest thought with someone you trust.",
    "Do something kind anonymously today.",
    "Put your full attention on the next conversation you have.",
    "Tell someone what you appreciate about them.",
    "Reach out to someone you haven't spoken to in a while.",

    # ── Gentle exploration ────────────────────────────────────────────────────
    "Try something slightly different from your usual routine today.",
    "Read one page of something you wouldn't normally read.",
    "Listen to a song you've never heard before.",
    "Take a different route somewhere today, even a short one.",
    "Do something with your hands — draw, cook, write, fold, build anything.",
    "Spend five minutes on something creative with no goal in mind.",
    "Try something you've been curious about but kept putting off.",
    "Go somewhere quiet you've never sat before.",
    "Watch something in nature — clouds, trees, water, birds — for a few minutes.",
    "Do one thing today that your younger self would have enjoyed.",
]


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def daily_invitation(request):
    today = date.today()
    day_index = today.timetuple().tm_yday % len(DAILY_INVITATIONS)
    invitation_text = DAILY_INVITATIONS[day_index]

    if request.method == 'GET':
        already_tried = DailyInvitationLog.objects.filter(
            user=request.user, date=today
        ).exists()
        return Response({
            'invitation': invitation_text,
            'tried_today': already_tried,
            'date': str(today),
        })

    elif request.method == 'POST':
        _, created = DailyInvitationLog.objects.get_or_create(
            user=request.user,
            date=today,
            defaults={'invitation_text': invitation_text},
        )
        return Response({
            'status': 'logged',
            'created': created,
            'invitation': invitation_text,
        })