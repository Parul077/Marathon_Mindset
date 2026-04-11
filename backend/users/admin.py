from django.contrib import admin
from .models import (
    CustomUser, OnboardingAnswer, Habit, HabitLog, RestDay,
    BadDayLog, DailyJournal, SmallWin, AnonymousWin,
    MilestoneLog, Goal, Book, WeeklyGrowthLetter
)

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ['username', 'name', 'email', 'date_joined', 'one_thing_mode']
    search_fields = ['username', 'name', 'email']

@admin.register(OnboardingAnswer)
class OnboardingAnswerAdmin(admin.ModelAdmin):
    list_display = ['user', 'question_key', 'skipped', 'next_ask_date']

@admin.register(Habit)
class HabitAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'is_active', 'order']

@admin.register(HabitLog)
class HabitLogAdmin(admin.ModelAdmin):
    list_display = ['habit', 'date', 'completed']

@admin.register(RestDay)
class RestDayAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'week_number', 'auto_applied']

@admin.register(BadDayLog)
class BadDayLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'logged_at', 'slow_down_until']

@admin.register(DailyJournal)
class DailyJournalAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'mood']

@admin.register(SmallWin)
class SmallWinAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'win', 'shared_anonymously']

@admin.register(AnonymousWin)
class AnonymousWinAdmin(admin.ModelAdmin):
    list_display = ['win_text', 'created_at', 'is_active', 'flagged']
    list_editable = ['is_active', 'flagged']

@admin.register(MilestoneLog)
class MilestoneLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'streak_days', 'shown_at', 'acknowledged']

@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'completed', 'target_date']

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category']

@admin.register(WeeklyGrowthLetter)
class WeeklyGrowthLetterAdmin(admin.ModelAdmin):
    list_display = ['user', 'week_start', 'email_sent', 'created_at']
