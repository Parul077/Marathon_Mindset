# Marathon Mindset — Complete Project Handoff

## What We're Building

A personal growth platform with the core philosophy: "Grow at your own pace." Every feature must reduce pressure, not add it. Warm, editorial aesthetic. Not a productivity app — a companion for life-long growth.
The founder wrote a poem that is woven throughout the entire platform. The key lines are:

"Life isn't meant to rush or race, or chase another's hurried pace" → landing page
"If even the moon can lose its light, why must I win each single fight?" → Slow Down Mode
"Each seed has time to be full-grown" → loading screen, empty states
"Like the moon, I'll softly be — not perfect, just beautifully me" → onboarding done screen
"My path is mine, my way is clear" → One Thing Mode footer

## Tech Stack

Frontend: Next.js (React), inline styles only (no Tailwind), planned Vercel deploy
Backend: Django + Django REST Framework, Token authentication
Database: SQLite (dev) → PostgreSQL (production planned)
API base URL: http://127.0.0.1:8000/api/users/
Fonts: Playfair Display (headings, italic) + DM Sans (body)
Colors:

--forest: #1E3A2F
--cream: #F5F0E8
--amber: #C4793A
--sage: #8BAF8D
--cream-dark: #EDE5D4
--forest-mid: #2D5240
--sage-light: #B8D4BA
--amber-light: #E8A96A

## Project File Structure

MARATHON-MINDSET/
├── backend/
│ ├── backend/
│ │ ├── settings.py ← CORS, auth token, REST framework configured
│ │ └── urls.py ← includes users.urls
│ └── users/
│ ├── models.py ← All models listed below
│ ├── views.py ← All endpoints listed below
│ ├── urls.py ← All routes listed below
│ ├── serializers.py ← RegisterSerializer with name field
│ └── admin.py ← All models registered
├── frontend/
│ ├── app/
│ │ ├── page.tsx ← Landing page with full poem section
│ │ ├── components/
│ │ │ └── SmartCTA.tsx ← Login-aware CTA (3 variants: hero/nav/footer)
│ │ ├── dashboard/
│ │ │ ├── page.tsx ← Main dashboard (4 render modes)
│ │ │ └── components/
│ │ │ ├── CommunityWin.tsx ← "Someone out there" bar
│ │ │ ├── MilestoneMoment.tsx ← Full-screen Day 7/21/50/100/365
│ │ │ ├── BadDayButton.tsx ← "Today was hard." fixed button
│ │ │ ├── OneThingMode.tsx ← Stripped mode component
│ │ │ ├── JourneyProgressBar.tsx ← Level 1→2→3→4 dots
│ │ │ ├── UnlockPreviewCard.tsx ← Next level preview + unlock
│ │ │ └── MonthlyHabitTracker.tsx ← Grid tracker (rows=habits, cols=1-31)
│ │ ├── login/page.tsx ← Login page (needs authAPI fix verification)
│ │ ├── signup/page.tsx ← Signup page (fixed, working)
│ │ └── onboarding/page.tsx ← 3-question conversational flow (working)
│ └── lib/
│ └── api.ts ← All typed API calls
└── venv/ ← Python virtual env

## Database Models

ModelKey FieldsPurposeCustomUsername, created_at, onboarding_complete, one_thing_mode, manual_levelExtends AbstractUser. manual_level overrides day-based disclosureOnboardingAnswerquestion_key, answer, skipped, next_ask_date3 onboarding questions, re-ask scheduling at 3/6 monthsHabitname, description, order, is_activeUser habits, orderedHabitLoghabit, date, completedDaily completion logsRestDayuser, date, week_year, week_number, auto_appliedGrace system — 1 missed day/week keeps streak aliveBadDayLoguser, date, private_note, slow_down_untilLogs "Today was hard", activates 24h Slow Down ModeDailyJournaluser, date, entry, moodDaily journal entriesSmallWinuser, date, win, shared_anonymouslySmall wins, optional anonymous sharingAnonymousWinwin_text, is_active, flaggedCommunity wall wins, moderation built inMilestoneLoguser, streak_days, shown_at, acknowledgedTracks Day 7/21/50/100/365 screens shownGoaluser, title, description, target_date, completedUser goals (visible at Level 3+)Booktitle, author, category, reading_time_minutesReading library (frontend not built yet)WeeklyGrowthLetteruser, week_start, letter_content, habits_completed, streakGenerated weekly letters (backend done, frontend not built)

All API Endpoints
MethodURLPurposeAuthPOST/register/Create accountNonePOST/login/Get auth tokenNoneGET/status/Dashboard init — returns level, streak, milestones, slow_down, next_level infoTokenPOST/onboarding/Save onboarding answers arrayTokenPOST/onboarding/checkin/Answer re-ask prompt inside dashboardTokenGET/POST/habits/List or create habitsTokenPOST/habits/<id>/log/Toggle habit complete for todayTokenPOST/bad-day/Log bad day, activate Slow Down, apply rest dayTokenGET/slow-down/status/Check if Slow Down Mode activeTokenPOST/one-thing-mode/Toggle One Thing Mode on/offTokenGET/POST/journal/Get or save today's journal entryTokenGET/POST/wins/List or log small winsTokenGET/community-win/Random anonymous win for "someone out there"TokenPOST/milestones/acknowledge/Dismiss milestone full-screenTokenGET/POST/goals/List or create goalsTokenPATCH/goals/<id>/complete/Mark goal completeTokenGET/growth-letter/Generate or retrieve weekly growth letterTokenGET/streak/Streak number + 7-day grid detailTokenPOST/unlock-level/Manually jump to a disclosure level (body: {level: 3})Token

Progressive Disclosure System
LevelNameDays (auto)Habits shownJournal promptsWhat unlocks1FoundationsDay 0–611 (fixed)Bare minimum — 1 habit, 1 prompt, 1 win2BuildingDay 7–20Up to 33 (selectable chips)Multiple habits, all 3 journal prompts shown as clickable options3ExpandingDay 21–29Up to 63Goals tab visible, more tracker rows4Full JourneyDay 30+Unlimited3Everything unlocked

manual_level on CustomUser overrides auto calculation
POST /unlock-level/ with {level: N} sets manual level
Users see next level via UnlockPreviewCard — shows features list + "unlock early" button
Confirmation step before unlocking: "Starting simple helps habits stick. But you know yourself best."

Dashboard — 4 Render Modes
The dashboard page.tsx has 4 distinct modes, checked in this order:

Loading — rotating poem lines while data fetches
Milestone overlay — full-screen if pending unacknowledged milestones (Day 7/21/50/100/365)
One Thing Mode — stripped to 1 habit + 1 journal prompt + 1 win. Toggle via ⊙ button
Slow Down Mode — dark forest bg, calming poem quote, streak shown as "still intact", 24h duration
Full Dashboard — normal view with tabs: Today / Wins / Tracker / Streak

Always present:

Sticky nav with Marathon Mindset logo → home, user avatar dropdown → Home + Sign out
Journey Progress Bar (level dots)
"Today was hard." button fixed bottom-right
CommunityWin bar ("Someone out there is also trying today")

Streak System (Kinder Version)

RestDay model: one missed day per week auto-applied as rest day — streak continues
Bad day button also auto-applies rest day so streak never breaks
Streak calculation looks back 365 days
Language: always "rest day" — never "broken", "failed", "missed"
7-day grid: ✓ green = completed · 🌙 amber = rest day · 🌱 = hard day

Day Messages (unique per day, Days 1–30)
Every day from Day 0–29 has a unique warm message shown under the greeting. Examples:

Day 0: "Day 1. The hardest and most important day. You showed up."
Day 2: "Day 3. Three days. The resistance is real — and you're moving through it."
Day 6: "Day 6 is where most people drift. You're still here."
Day 14: "Two weeks. You're not trying anymore — you're doing."
Day 30: "Thirty days. A full month. You did something most people only plan."

Streak milestones override: 7 days / 21 days / 50 days / 100 days / 365 days each have special messages.

Monthly Habit Tracker

Component: MonthlyHabitTracker.tsx
Grid: rows = habits, columns = days 1–31
Tap any past day to toggle complete (green checkmark appears)
Today highlighted in amber, future days dashed and untappable
Result column right side: 18/31 — green ≥80%, amber ≥50%, grey otherwise
Month nav arrows at top right (can't navigate to future months)
Completions stored in localStorage: key = mm*habit*{id}_{year}_{month}\_{day}
Level limits: Level 1 = 1 row, Level 2 = 3 rows, Level 3 = 6 rows, Level 4 = unlimited

SmartCTA Component
Located at app/components/SmartCTA.tsx. Three variants:

variant="nav" → compact pill button for nav bar
variant="hero" → large rounded button for hero section
variant="footer" → cream button on dark background

Behavior:

Logged out: shows "Start for free →" / "Start Your Journey →" / "Start for free — no card needed →"
Logged in: shows "Go to dashboard →" / "Continue your journey →" / "Continue your journey, {name} →"

Checks localStorage.getItem('token') on mount. Uses mounted state to prevent hydration mismatch.

What Is Already Built ✅

Landing page (full, with poem section, SmartCTA wired in)
Signup page (working end-to-end)
Onboarding page (3 questions, skip + re-ask, working)
Login page (needs verification after api.ts changes)
Full dashboard with all 4 modes
All dashboard components (CommunityWin, MilestoneMoment, BadDayButton, JourneyProgressBar, UnlockPreviewCard, MonthlyHabitTracker)
All backend models, views, endpoints
Progressive disclosure system (levels 1–4, manual override)
Streak system with rest day grace
Day messages (unique per day 1–30, milestone messages)
Growth letter generation (backend only)
api.ts with all typed calls

What Still Needs to Be Built ❌
Priority 1 — Goals Tab

Frontend only needed (backend fully built)
New tab in dashboard visible at Level 3+
Add goal with title + optional target date
Mark complete → celebration moment
List shows active vs completed goals

Priority 2 — Growth Letter Page (/app/growth/page.tsx)

Backend generates letter via GET /growth-letter/
Need a beautiful letter-styled page to read it
Should feel like opening a personal note, not a report
Show stats (habits this week, streak, wins) woven in warmly

Priority 3 — Login Page Fix

Verify login/page.tsx uses login() from new api.ts (not old authAPI)
Token stored as "token" in localStorage (not "mm_token")
After login: redirect to /dashboard

Priority 4 — Settings Page

Change display name
Reset manual level back to auto (set manual_level = null)
Toggle: receive growth letters by email
Danger zone: delete account

Priority 5 — Production Deploy

Switch SQLite → PostgreSQL
Deploy backend to Railway or Render
Deploy frontend to Vercel
Set up environment variables
Email provider for growth letters (SendGrid or Resend)

Later — Community Features

Anonymous win wall (AnonymousWin model exists, no frontend)
Opt-in streak leaderboard
No DMs, encouragement only
Strict moderation built in from day one

Core Rules — Never Break These

Every feature must reduce pressure, not add it
Ask before building: "Does this reduce pressure or add pressure?" — if it adds, cut it
Language rules: never say "failed", "broken", "behind", "missed" — always "rest", "return", "your pace"
No push notifications — all re-ask prompts appear naturally inside the app
Streak grace system always applies — users must never feel punished for a bad day
Design aesthetic: organic, editorial, warm, calm — never corporate or gamified

Important Code Patterns
Auth headers (api.ts):
tslocalStorage.getItem('token') // always "token", not "mm_token"
Authorization: `Token ${token}` // Django token auth format
Disclosure level check (views.py):
pythondef get_disclosure_level(days_joined, manual_level=None):
if manual_level is not None:
return manual_level
if days_joined < 7: return 1
elif days_joined < 21: return 2
elif days_joined < 30: return 3
else: return 4
Rest day grace (views.py):
python# One missed day per week = auto rest day applied

# Bad day log also auto-applies rest day

# Streak never breaks for one missed day per week

Level config (views.py LEVEL_CONFIG dict):
python1: Foundations — 0 days
2: Building — 7 days  
3: Expanding — 21 days
4: Full Journey — 30 days
