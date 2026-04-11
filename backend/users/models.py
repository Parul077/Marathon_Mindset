from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import date, timedelta


class CustomUser(AbstractUser):
    name = models.CharField(max_length=150, blank=True)
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    onboarding_complete = models.BooleanField(default=False)
    one_thing_mode = models.BooleanField(default=False)
    # If set, overrides the automatic day-based disclosure level
    manual_level = models.IntegerField(null=True, blank=True)

    def days_since_joined(self):
        return (date.today() - self.date_joined.date()).days

    def __str__(self):
        return self.username


class OnboardingAnswer(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='onboarding_answers')
    question_key = models.CharField(max_length=100)
    answer = models.TextField()
    asked_at = models.DateTimeField(auto_now_add=True)
    next_ask_date = models.DateField(null=True, blank=True)
    skipped = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.question_key}"


class Habit(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='habits')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.user.username} - {self.name}"


class HabitLog(models.Model):
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='logs')
    date = models.DateField(default=date.today)
    completed = models.BooleanField(default=False)
    note = models.TextField(blank=True)

    class Meta:
        unique_together = ['habit', 'date']

    def __str__(self):
        return f"{self.habit.name} - {self.date} - {'✓' if self.completed else '✗'}"


class RestDay(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='rest_days')
    date = models.DateField(default=date.today)
    week_year = models.IntegerField()
    week_number = models.IntegerField()
    auto_applied = models.BooleanField(default=True)

    class Meta:
        unique_together = ['user', 'date']

    def save(self, *args, **kwargs):
        iso = self.date.isocalendar()
        self.week_year = iso[0]
        self.week_number = iso[1]
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} rest day - {self.date}"


class BadDayLog(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='bad_days')
    date = models.DateField(default=date.today)
    logged_at = models.DateTimeField(auto_now_add=True)
    private_note = models.TextField(blank=True)
    slow_down_until = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ['user', 'date']

    def save(self, *args, **kwargs):
        if not self.slow_down_until:
            self.slow_down_until = timezone.now() + timedelta(hours=24)
        super().save(*args, **kwargs)

    def is_slow_down_active(self):
        return timezone.now() < self.slow_down_until

    def __str__(self):
        return f"{self.user.username} bad day - {self.date}"


class DailyJournal(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='journals')
    date = models.DateField(default=date.today)
    entry = models.TextField()
    mood = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'date']

    def __str__(self):
        return f"{self.user.username} journal - {self.date}"


class SmallWin(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='small_wins')
    date = models.DateField(default=date.today)
    win = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    shared_anonymously = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} win - {self.date}"


class AnonymousWin(models.Model):
    win_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    flagged = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Anonymous win - {self.created_at.date()}: {self.win_text[:50]}"


class MilestoneLog(models.Model):
    MILESTONE_CHOICES = [
        (7, 'Day 7'), (21, 'Day 21'), (50, 'Day 50'),
        (100, 'Day 100'), (365, 'Day 365'),
    ]
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='milestones')
    streak_days = models.IntegerField(choices=MILESTONE_CHOICES)
    shown_at = models.DateTimeField(auto_now_add=True)
    acknowledged = models.BooleanField(default=False)

    class Meta:
        unique_together = ['user', 'streak_days']

    def __str__(self):
        return f"{self.user.username} milestone - Day {self.streak_days}"


class Goal(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='goals')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    target_date = models.DateField(null=True, blank=True)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.title}"


class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    cover_color = models.CharField(max_length=20, default='#8BAF8D')
    reading_time_minutes = models.IntegerField(default=10)
    category = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} by {self.author}"


class WeeklyGrowthLetter(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='growth_letters')
    week_start = models.DateField()
    week_end = models.DateField()
    letter_content = models.TextField()
    habits_completed = models.IntegerField(default=0)
    journal_entries = models.IntegerField(default=0)
    wins_logged = models.IntegerField(default=0)
    current_streak = models.IntegerField(default=0)
    sent_at = models.DateTimeField(null=True, blank=True)
    email_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'week_start']
        ordering = ['-week_start']

    def __str__(self):
        return f"{self.user.username} letter - week of {self.week_start}"


class DailyInvitationLog(models.Model):
    """
    Records when a user tries a daily invitation.
    Private only — never shown as a stat or streak.
    One per user per day maximum.
    """
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='invitation_logs')
    date = models.DateField(default=date.today)
    invitation_text = models.TextField()
    tried_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'date']

    def __str__(self):
        return f"{self.user.username} tried invitation - {self.date}"