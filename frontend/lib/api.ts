// In production, set NEXT_PUBLIC_API_URL in Vercel environment variables
// to your Railway backend URL e.g.:
// https://your-app.up.railway.app/api/users
// In development it falls back to localhost automatically.

const BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/users";

function getToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: authHeaders(),
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ─── AUTH ─────────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  user_id: number;
  username: string;
  name: string;
}

export async function register(
  username: string,
  password: string,
  name?: string,
): Promise<AuthResponse> {
  return request("/register/", {
    method: "POST",
    body: JSON.stringify({ username, password, name }),
  });
}

export async function login(
  username: string,
  password: string,
): Promise<AuthResponse> {
  return request("/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

// ─── USER STATUS ──────────────────────────────────────────────────────────

export interface NextLevel {
  level: number;
  name: string;
  tagline: string;
  features: string[];
  days_until_auto: number | null;
  can_unlock_early: boolean;
}

export interface UserStatus {
  name: string;
  days_joined: number;
  streak: number;
  slow_down_active: boolean;
  pending_milestones: number[];
  one_thing_mode: boolean;
  disclosure_level: 1 | 2 | 3 | 4;
  level_name: string;
  level_tagline: string;
  level_features: string[];
  next_level: NextLevel | null;
  manual_level: number | null;
  show_checkin_prompt: boolean;
  checkin_question: string | null;
  onboarding_complete: boolean;
}

export async function getUserStatus(): Promise<UserStatus> {
  return request("/status/");
}

// ─── UNLOCK LEVEL ─────────────────────────────────────────────────────────

export interface UnlockResponse {
  disclosure_level: number;
  level_name: string;
  level_tagline: string;
  level_features: string[];
  next_level: NextLevel | null;
  manual_level: number;
}

export async function unlockLevel(level?: number): Promise<UnlockResponse> {
  return request("/unlock-level/", {
    method: "POST",
    body: JSON.stringify(level !== undefined ? { level } : {}),
  });
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────

export interface SettingsData {
  name: string;
  username: string;
  manual_level: number | null;
  days_joined: number;
  streak: number;
}

export async function getSettings(): Promise<SettingsData> {
  return request("/settings/");
}

export async function updateName(
  name: string,
): Promise<{ name: string; status: string }> {
  return request("/settings/", {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export async function deleteAccount(
  password: string,
): Promise<{ status: string }> {
  return request("/settings/", {
    method: "DELETE",
    body: JSON.stringify({ password }),
  });
}

export async function resetLevel(): Promise<{
  manual_level: null;
  disclosure_level: number;
  level_name: string;
}> {
  return request("/reset-level/", { method: "POST" });
}

// ─── ONBOARDING ──────────────────────────────────────────────────────────

export async function saveOnboarding(
  answers: Array<{
    question_key: string;
    answer: string;
    skipped?: boolean;
  }>,
): Promise<{ status: string }> {
  return request("/onboarding/", {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
}

export async function answerCheckin(
  question_key: string,
  answer: string,
  snoozed?: boolean,
): Promise<{ status: string }> {
  return request("/onboarding/checkin/", {
    method: "POST",
    body: JSON.stringify({ question_key, answer, snoozed }),
  });
}

// ─── HABITS ───────────────────────────────────────────────────────────────

export interface Habit {
  id: number;
  name: string;
  description: string;
  order: number;
  completed_today: boolean;
}

export async function getHabits(): Promise<Habit[]> {
  return request("/habits/");
}

export async function createHabit(
  name: string,
  description?: string,
): Promise<Habit> {
  return request("/habits/", {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });
}

export async function logHabit(
  habitId: number,
  completed: boolean,
  date?: string,
): Promise<{ completed: boolean; streak?: number; date: string }> {
  return request(`/habits/${habitId}/log/`, {
    method: "POST",
    body: JSON.stringify({ completed, ...(date ? { date } : {}) }),
  });
}

// ─── HABIT LOGS (monthly tracker) ─────────────────────────────────────────

export async function getHabitLogs(
  month: string,
): Promise<Record<string, Record<string, boolean>>> {
  return request(`/habits/logs/?month=${month}`);
}

// ─── BAD DAY ──────────────────────────────────────────────────────────────

export interface BadDayResponse {
  status: string;
  slow_down_until: string;
  rest_day_applied: boolean;
  streak: number;
  message: string;
}

export async function logBadDay(note?: string): Promise<BadDayResponse> {
  return request("/bad-day/", {
    method: "POST",
    body: JSON.stringify({ note: note || "" }),
  });
}

export async function getSlowDownStatus(): Promise<{
  active: boolean;
  until: string | null;
}> {
  return request("/slow-down/status/");
}

// ─── ONE THING MODE ───────────────────────────────────────────────────────

export async function toggleOneThingMode(
  enabled: boolean,
): Promise<{ one_thing_mode: boolean }> {
  return request("/one-thing-mode/", {
    method: "POST",
    body: JSON.stringify({ enabled }),
  });
}

// ─── JOURNAL ──────────────────────────────────────────────────────────────

export interface JournalEntry {
  entry: string;
  mood: string;
  date: string;
}

export async function getJournal(date?: string): Promise<JournalEntry> {
  const params = date ? `?date=${date}` : "";
  return request(`/journal/${params}`);
}

export async function saveJournal(
  entry: string,
  mood?: string,
  date?: string,
): Promise<{ status: string; date: string }> {
  return request("/journal/", {
    method: "POST",
    body: JSON.stringify({ entry, mood, date }),
  });
}

// ─── SMALL WINS ───────────────────────────────────────────────────────────

export interface Win {
  id: number;
  win: string;
  date: string;
  shared_anonymously: boolean;
}

export async function getWins(): Promise<Win[]> {
  return request("/wins/");
}

export async function logWin(
  win: string,
  share_anonymously?: boolean,
): Promise<Win> {
  return request("/wins/", {
    method: "POST",
    body: JSON.stringify({ win, share_anonymously }),
  });
}

// ─── COMMUNITY WIN (single — dashboard bar) ───────────────────────────────

export async function getCommunityWin(): Promise<{ win: string }> {
  return request("/community-win/");
}

// ─── COMMUNITY WINS (feed — community wall page) ──────────────────────────

export async function getCommunityWins(
  count = 15,
): Promise<{ wins: string[]; total: number }> {
  return request(`/community-wins/?count=${count}`);
}

// ─── MILESTONES ───────────────────────────────────────────────────────────

export async function acknowledgeMilestone(
  streak_days: number,
): Promise<{ status: string }> {
  return request("/milestones/acknowledge/", {
    method: "POST",
    body: JSON.stringify({ streak_days }),
  });
}

// ─── GOALS ────────────────────────────────────────────────────────────────

export interface Goal {
  id: number;
  title: string;
  description: string;
  target_date: string | null;
  completed: boolean;
}

export async function getGoals(): Promise<Goal[]> {
  return request("/goals/");
}

export async function createGoal(
  title: string,
  description?: string,
  target_date?: string,
): Promise<Goal> {
  return request("/goals/", {
    method: "POST",
    body: JSON.stringify({ title, description, target_date }),
  });
}

export async function completeGoal(
  goalId: number,
): Promise<{ status: string }> {
  return request(`/goals/${goalId}/complete/`, { method: "PATCH" });
}

// ─── GROWTH LETTER ────────────────────────────────────────────────────────

export interface GrowthLetter {
  content: string;
  week_start: string;
  stats: { habits: number; journals: number; wins: number; streak: number };
}

export async function getGrowthLetter(): Promise<GrowthLetter> {
  return request("/growth-letter/");
}

// ─── STREAK ───────────────────────────────────────────────────────────────

export interface StreakDetail {
  streak: number;
  rest_days_used: number;
  last_7_days: Array<{
    date: string;
    completed: boolean;
    rest_day: boolean;
    bad_day: boolean;
    day_name: string;
  }>;
}

export async function getStreakDetail(): Promise<StreakDetail> {
  return request("/streak/");
}

// ─── DAILY INVITATION ─────────────────────────────────────────────────────

export interface DailyInvitation {
  invitation: string;
  tried_today: boolean;
  date: string;
}

export async function getDailyInvitation(): Promise<DailyInvitation> {
  return request("/daily-invitation/");
}

export async function tryInvitation(): Promise<{
  status: string;
  created: boolean;
  invitation: string;
}> {
  return request("/daily-invitation/", { method: "POST" });
}
