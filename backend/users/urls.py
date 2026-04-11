from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('status/', views.user_status, name='user_status'),
    path('onboarding/', views.save_onboarding, name='save_onboarding'),
    path('onboarding/checkin/', views.answer_checkin, name='answer_checkin'),
    path('habits/', views.habits, name='habits'),
    path('habits/<int:habit_id>/log/', views.log_habit, name='log_habit'),
    path('habits/logs/', views.habit_logs, name='habit_logs'),
    path('bad-day/', views.log_bad_day, name='log_bad_day'),
    path('slow-down/status/', views.slow_down_status, name='slow_down_status'),
    path('one-thing-mode/', views.toggle_one_thing_mode, name='one_thing_mode'),
    path('journal/', views.journal, name='journal'),
    path('wins/', views.small_wins, name='small_wins'),
    path('community-win/', views.community_win, name='community_win'),
    path('community-wins/', views.community_wins, name='community_wins'),
    path('milestones/acknowledge/', views.acknowledge_milestone, name='acknowledge_milestone'),
    path('goals/', views.goals, name='goals'),
    path('goals/<int:goal_id>/complete/', views.complete_goal, name='complete_goal'),
    path('growth-letter/', views.growth_letter, name='growth_letter'),
    path('streak/', views.streak_detail, name='streak_detail'),
    path('unlock-level/', views.unlock_early, name='unlock_early'),
    path('settings/', views.settings_view, name='settings'),
    path('reset-level/', views.reset_level, name='reset_level'),
    path('daily-invitation/', views.daily_invitation, name='daily_invitation'),  # ← NEW
]