# 🌱 Marathon Mindset

> *"Life isn't meant to rush or race, or chase another's hurried pace."*

A personal growth platform built on one belief: **you don't need to be perfect, you just need to keep coming back.**

Marathon Mindset is a soft, human-centered habit and journaling app designed for people tired of productivity culture. No streaks that shame you. No notifications that guilt you. No gamification that exhausts you. Just gentle tools to help you grow — at your own pace.

**Live:** [marathon-mindset.vercel.app](https://marathon-mindset.vercel.app)


---

## ✨ What Makes This Different

Most habit apps add pressure. Marathon Mindset removes it.

- **Streak grace system** — One missed day per week is automatically protected. Your streak never breaks for real life.
- **Bad day mode** — Tap "Today was hard." and the app shifts to a calming dark mode, preserves your streak, and just... holds space.
- **Progressive disclosure** — New users see only 1 habit, 1 journal prompt, 1 win field. Features unlock gradually so the app never overwhelms.
- **One Thing Mode** — Strip everything down to the single most important habit, question, and win.
- **Weekly growth letters** — A warm, personal letter generated each week reflecting your progress back to you.
- **A founder's poem** woven throughout every screen, replacing copy with verses about patience and self-acceptance.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, inline styles |
| Backend | Django 5 + Django REST Framework |
| Auth | Django Token Authentication |
| Database | PostgreSQL (Render) |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |
| Fonts | Playfair Display + DM Sans |

---

## 🎨 Design System

```
Colors
──────
--forest:      #1E3A2F   (primary text, backgrounds)
--cream:       #F5F0E8   (page background)
--amber:       #C4793A   (accents, streaks, highlights)
--sage:        #8BAF8D   (completed states, success)
--cream-dark:  #EDE5D4
--forest-mid:  #2D5240
--sage-light:  #B8D4BA
--amber-light: #E8A96A

Typography
──────────
Headings / quotes:  Playfair Display (serif, italic)
Body / UI:          DM Sans (sans-serif)
```

---

## 🗂 Project Structure

```
Marathon_Mindset/
├── backend/
│   ├── backend/
│   │   ├── settings.py        # Production-ready settings
│   │   └── urls.py
│   └── users/
│       ├── models.py          # All data models
│       ├── views.py           # All API endpoints
│       ├── urls.py            # URL routing
│       ├── serializers.py     # DRF serializers
│       └── admin.py
├── frontend/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── dashboard/
│   │   │   ├── page.tsx       # Main dashboard (4 render modes)
│   │   │   └── components/
│   │   │       ├── CommunityWin.tsx
│   │   │       ├── MilestoneMoment.tsx
│   │   │       ├── BadDayButton.tsx
│   │   │       ├── JourneyProgressBar.tsx
│   │   │       ├── UnlockPreviewCard.tsx
│   │   │       └── MonthlyHabitTracker.tsx
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── onboarding/page.tsx
│   └── lib/
│       └── api.ts             # All typed API calls
├── .gitignore
└── README.md
```

---

## 🚀 Features

### Dashboard — 4 Render Modes
The dashboard intelligently switches between four states:

1. **Loading** — Rotating poem lines while data fetches
2. **Milestone** — Full-screen celebration at Day 7, 21, 50, 100, 365
3. **One Thing Mode** — Stripped to 1 habit + 1 question + 1 win
4. **Slow Down Mode** — Dark forest background, calming poem, streak shown as "still intact"

### Progressive Disclosure System
| Level | Name | Unlocks At | What's Available |
|---|---|---|---|
| 1 | Foundations | Day 0 | 1 habit, 1 journal prompt, 1 win |
| 2 | Building | Day 7 | Multiple habits, 3 journal prompts, streak details |
| 3 | Expanding | Day 21 | Goal tracking, full habit list, weekly patterns |
| 4 | Full Journey | Day 30 | Everything — growth letters, complete dashboard |

Users can also unlock levels early if they feel ready.

### Streak System (The Kinder Version)
- One missed day per week = automatic rest day 🌙
- Bad day button also applies rest day
- Language is always "rest day" — never "missed", "broken", or "failed"
- 7-day visual grid: ✓ green = completed · 🌙 amber = rest · 🌱 = hard day

### Onboarding
A 3-question conversational flow that sets the tone:
- What's your main goal?
- What's been your biggest challenge?
- What does success look like for you?

Questions re-surface gently at 3 and 6 months to check in on how things have shifted.

---

## 📡 API Reference

All endpoints require `Authorization: Token <token>` except auth routes.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users/register/` | Create account |
| POST | `/api/users/login/` | Get auth token |
| GET | `/api/users/status/` | Full dashboard state |
| POST | `/api/users/onboarding/` | Save onboarding answers |
| POST | `/api/users/onboarding/checkin/` | Answer re-ask prompt |
| GET/POST | `/api/users/habits/` | List or create habits |
| POST | `/api/users/habits/<id>/log/` | Toggle habit complete |
| POST | `/api/users/bad-day/` | Log bad day + apply rest |
| GET | `/api/users/slow-down/status/` | Check slow down state |
| POST | `/api/users/one-thing-mode/` | Toggle One Thing Mode |
| GET/POST | `/api/users/journal/` | Get or save journal entry |
| GET/POST | `/api/users/wins/` | List or log small wins |
| GET | `/api/users/community-win/` | Random anonymous win |
| POST | `/api/users/milestones/acknowledge/` | Dismiss milestone screen |
| GET/POST | `/api/users/goals/` | List or create goals |
| PATCH | `/api/users/goals/<id>/complete/` | Mark goal complete |
| GET | `/api/users/growth-letter/` | Weekly growth letter |
| GET | `/api/users/streak/` | Streak + 7-day grid |
| POST | `/api/users/unlock-level/` | Manually jump to a level |

---

## 🏗 Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/Parul077/Marathon_Mindset.git
cd Marathon_Mindset/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your local values

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver
```

Your backend will be running at `http://127.0.0.1:8000`

### Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000/api/users" > .env.local

# Start dev server
npm run dev
```

Your frontend will be running at `http://localhost:3000`

### Environment Variables

**Backend `.env`:**
```
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

**Frontend `.env.local`:**
```
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000/api/users
```

---

## 🚢 Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | [marathon-mindset.vercel.app](https://marathon-mindset.vercel.app) |
| Backend | Render | marathon-mindset-backend.onrender.com |
| Database | Render PostgreSQL | — |

**Production environment variables (Render):**
```
SECRET_KEY=<generated-secret>
DEBUG=False
ALLOWED_HOSTS=marathon-mindset-backend.onrender.com
CORS_ALLOWED_ORIGINS=https://marathon-mindset.vercel.app
DATABASE_URL=<auto-injected-by-render>
```

---

## 🗺 Roadmap

- [ ] **Goals tab** — Frontend for goal tracking (backend complete)
- [ ] **Growth Letter page** — Beautiful letter-style weekly reflection page
- [ ] **Settings page** — Change name, reset level, email preferences
- [ ] **Anonymous win wall** — Community board of shared small wins
- [ ] **Email growth letters** — Weekly letter delivered to your inbox
- [ ] **Opt-in streak leaderboard** — Encouragement only, no competition

---

## 🧠 Data Models

| Model | Purpose |
|---|---|
| `CustomUser` | Extends AbstractUser with `one_thing_mode`, `manual_level`, `onboarding_complete` |
| `OnboardingAnswer` | 3 onboarding questions with re-ask scheduling |
| `Habit` | User habits, ordered |
| `HabitLog` | Daily completion records |
| `RestDay` | Grace system — 1 missed day/week keeps streak alive |
| `BadDayLog` | Activates 24h Slow Down Mode |
| `DailyJournal` | Daily journal entries with mood |
| `SmallWin` | Personal wins with optional anonymous sharing |
| `AnonymousWin` | Community wall wins with moderation |
| `MilestoneLog` | Day 7/21/50/100/365 celebration tracking |
| `Goal` | User goals with target dates |
| `WeeklyGrowthLetter` | Generated weekly reflection letters |

---

## 💭 Philosophy

> *"Each soul has roads it walks alone, each seed has time to be full-grown."*

This app was built around a poem. Every screen has a verse. Every feature was run through one question before building:

**"Does this reduce pressure, or add it?"**

If it adds pressure — it doesn't ship.

**Language rules (never broken):**
- Never say "failed", "broken", "behind", or "missed"
- Always say "rest", "return", "your pace"
- No push notifications — all prompts appear naturally inside the app
- Streak grace always applies — users are never punished for a hard day


---

<p align="center">
  <em>"Like the moon, I'll softly be — not perfect, just beautifully me."</em>
  <br><br>
  Built with care. Grown slowly. 🌱
</p>
