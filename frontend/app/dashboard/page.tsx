"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  getUserStatus,
  getHabits,
  logHabit,
  getJournal,
  saveJournal,
  getWins,
  logWin,
  getStreakDetail,
  toggleOneThingMode,
  answerCheckin,
  createHabit,
  getGoals,
  createGoal,
  completeGoal,
  type UserStatus,
  type Habit,
  type Win,
  type StreakDetail,
  type Goal,
} from "@/lib/api";
import MilestoneMoment from "./components/MilestoneMoment";
import BadDayButton from "./components/BadDayButton";
import JourneyProgressBar from "./components/JourneyProgressBar";
import UnlockPreviewCard from "./components/UnlockPreviewCard";
import MonthlyHabitTracker from "./components/MonthlyHabitTracker";
import GoalCelebration from "./components/GoalCelebration";
import ModeSelector, { type AppMode } from "./components/ModeSelector";
import DailyInvitation from "./components/DailyInvitation";

// ─── Poem lines ───────────────────────────────────────────────────────────────
const POEM_LOADING = [
  "Each seed has time to be full-grown.",
  "My path is mine, my way is clear.",
  "Life isn't meant to rush or race.",
  "Not perfect, just beautifully me.",
];

const CALMING_QUOTES = [
  {
    text: "If even the moon can lose its light, why must I win each single fight?",
    author: null,
  },
  {
    text: "Each soul has roads it walks alone, each seed has time to be full-grown.",
    author: null,
  },
  {
    text: "Nature does not hurry, yet everything is accomplished.",
    author: "Lao Tzu",
  },
  {
    text: "So I will grow, but at my speed — not driven by another's need.",
    author: null,
  },
  {
    text: "Like the moon, I'll softly be — not perfect, just beautifully me.",
    author: null,
  },
];

const JOURNAL_PROMPTS_L1 = ["What's one thing you noticed today?"];
const JOURNAL_PROMPTS_L2 = [
  "What's one thing you noticed today?",
  "What are you grateful for, even in a small way?",
  "What's weighing on you that you haven't said out loud?",
];

const CHECKIN_QUESTIONS: Record<string, string> = {
  goal: "It's been a while — has your main goal shifted at all?",
  motivation: "What's been keeping you going lately?",
  challenge: "What's been the hardest part of your routine recently?",
};

// ─── Journal Section Component ────────────────────────────────────────────────
function JournalSection({
  level,
  initialEntry,
  selectedPromptIndex,
  setSelectedPromptIndex,
  journalPrompts,
  todayPrompt,
}: {
  level: number;
  initialEntry: string;
  selectedPromptIndex: number;
  setSelectedPromptIndex: (i: number) => void;
  journalPrompts: string[];
  todayPrompt: string;
}) {
  const [entry, setEntry] = useState(initialEntry);
  const [savedEntry, setSavedEntry] = useState(initialEntry); // what's confirmed saved
  const [isSaved, setIsSaved] = useState(!!initialEntry); // show card if loaded with data
  const [isEditing, setIsEditing] = useState(!initialEntry); // start in edit mode if no entry
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // When initial data loads from parent, sync it
  useEffect(() => {
    setEntry(initialEntry);
    setSavedEntry(initialEntry);
    setIsSaved(!!initialEntry);
    setIsEditing(!initialEntry);
  }, [initialEntry]);

  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (!entry.trim() || saving) return;
    setSaving(true);
    try {
      await saveJournal(entry.trim());
      setSavedEntry(entry.trim());
      setIsSaved(true);
      setIsEditing(false);
    } catch {
      // Silent fail — don't lose the text
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEntry(savedEntry);
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      {/* Prompt selector for Level 2+ */}
      {level >= 2 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            marginBottom: "16px",
          }}
        >
          {JOURNAL_PROMPTS_L2.map((prompt, i) => (
            <button
              key={i}
              onClick={() => {
                setSelectedPromptIndex(i);
                // If already saved, switch to edit mode when changing prompt
                if (isSaved && !isEditing) setIsEditing(true);
              }}
              style={{
                textAlign: "left",
                background:
                  selectedPromptIndex === i
                    ? "rgba(30,58,47,0.06)"
                    : "transparent",
                border: `1px solid ${selectedPromptIndex === i ? "rgba(30,58,47,0.2)" : "rgba(30,58,47,0.08)"}`,
                borderRadius: "10px",
                padding: "11px 14px",
                cursor: "pointer",
                fontFamily: "Playfair Display, serif",
                fontStyle: "italic",
                fontSize: "14px",
                color:
                  selectedPromptIndex === i
                    ? "var(--forest, #1E3A2F)"
                    : "rgba(30,58,47,0.4)",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  flexShrink: 0,
                  background:
                    selectedPromptIndex === i
                      ? "var(--amber, #C4793A)"
                      : "rgba(30,58,47,0.15)",
                  transition: "background 0.2s",
                }}
              />
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Level 1 prompt label */}
      {level === 1 && (
        <p
          style={{
            fontSize: "15px",
            fontFamily: "Playfair Display, serif",
            fontStyle: "italic",
            color: "var(--forest, #1E3A2F)",
            marginBottom: "12px",
            lineHeight: 1.5,
          }}
        >
          {todayPrompt}
        </p>
      )}

      {/* Input mode */}
      {isEditing && (
        <div>
          <textarea
            ref={textareaRef}
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="Write what's true for you today..."
            rows={level === 1 ? 4 : 5}
            style={{
              width: "100%",
              background: "rgba(30,58,47,0.03)",
              border: "1px solid rgba(30,58,47,0.08)",
              borderRadius: "10px",
              padding: "13px 14px",
              fontSize: "14px",
              fontFamily: "DM Sans, sans-serif",
              color: "var(--forest, #1E3A2F)",
              resize: "none",
              outline: "none",
              lineHeight: 1.6,
              boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave();
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            {entry.trim() && (
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  background: saving
                    ? "rgba(30,58,47,0.4)"
                    : "var(--forest, #1E3A2F)",
                  color: "var(--cream, #F5F0E8)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "9px 18px",
                  fontSize: "13px",
                  fontFamily: "DM Sans, sans-serif",
                  cursor: saving ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "background 0.2s",
                }}
              >
                {saving ? (
                  <>
                    <span
                      style={{
                        width: "11px",
                        height: "11px",
                        borderRadius: "50%",
                        border: "1.5px solid rgba(245,240,232,0.3)",
                        borderTopColor: "var(--cream, #F5F0E8)",
                        animation: "spin 0.7s linear infinite",
                        display: "inline-block",
                        flexShrink: 0,
                      }}
                    />
                    Saving…
                  </>
                ) : (
                  "Save"
                )}
              </button>
            )}
            {isSaved && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEntry(savedEntry);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(30,58,47,0.35)",
                  fontSize: "13px",
                  fontFamily: "DM Sans, sans-serif",
                  cursor: "pointer",
                  padding: "9px 0",
                }}
              >
                Cancel
              </button>
            )}
          </div>
          <p
            style={{
              fontSize: "11px",
              color: "rgba(30,58,47,0.25)",
              fontFamily: "DM Sans, sans-serif",
              marginTop: "6px",
            }}
          >
            ⌘ + Enter to save
          </p>
        </div>
      )}

      {/* Saved card — shown after saving */}
      {isSaved && !isEditing && savedEntry && (
        <div
          style={{
            background: "rgba(139,175,141,0.07)",
            border: "1px solid rgba(139,175,141,0.2)",
            borderRadius: "12px",
            padding: "18px 20px",
            animation: "fadeUp 0.4s ease both",
            position: "relative",
          }}
        >
          {/* Top row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* Green dot */}
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "var(--sage, #8BAF8D)",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--sage, #8BAF8D)",
                  fontFamily: "DM Sans, sans-serif",
                  fontWeight: 500,
                }}
              >
                Saved today
              </span>
            </div>
            <span
              style={{
                fontSize: "11px",
                color: "rgba(30,58,47,0.3)",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              {formattedDate}
            </span>
          </div>

          {/* The actual journal text */}
          <p
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "15px",
              lineHeight: 1.8,
              color: "var(--forest, #1E3A2F)",
              margin: "0 0 16px",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {savedEntry}
          </p>

          {/* Edit button */}
          <button
            onClick={handleEdit}
            style={{
              background: "transparent",
              border: "1px solid rgba(30,58,47,0.12)",
              borderRadius: "8px",
              padding: "7px 14px",
              fontSize: "12px",
              fontFamily: "DM Sans, sans-serif",
              color: "rgba(30,58,47,0.45)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(30,58,47,0.04)";
              e.currentTarget.style.borderColor = "rgba(30,58,47,0.2)";
              e.currentTarget.style.color = "var(--forest, #1E3A2F)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(30,58,47,0.12)";
              e.currentTarget.style.color = "rgba(30,58,47,0.45)";
            }}
          >
            ✎ Edit
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();

  const [status, setStatus] = useState<UserStatus | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [journalEntry, setJournalEntry] = useState(""); // raw loaded entry
  const [wins, setWins] = useState<Win[]>([]);
  const [newWin, setNewWin] = useState("");
  const [streakData, setStreakData] = useState<StreakDetail | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMilestone, setActiveMilestone] = useState<number | null>(null);
  const [checkinAnswer, setCheckinAnswer] = useState("");
  const [checkinDone, setCheckinDone] = useState(false);
  const [shareWin, setShareWin] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "today" | "wins" | "tracker" | "streak" | "goals"
  >("today");
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(0);
  const [loadingPoem, setLoadingPoem] = useState(POEM_LOADING[0]);
  const [celebratingGoal, setCelebratingGoal] = useState<string | null>(null);
  const [showModeSelector, setShowModeSelector] = useState(false);

  // One-thing mode local journal state (separate from main journal)
  const [oneThingJournal, setOneThingJournal] = useState("");
  const [oneThingJournalSaved, setOneThingJournalSaved] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % POEM_LOADING.length;
      setLoadingPoem(POEM_LOADING[i]);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const init = async () => {
      try {
        const [s, h, j, w, sd] = await Promise.all([
          getUserStatus(),
          getHabits(),
          getJournal(),
          getWins(),
          getStreakDetail(),
        ]);
        setStatus(s);
        setHabits(h);
        setJournalEntry(j.entry || "");
        setWins(w);
        setStreakData(sd);
        if (s.pending_milestones.length > 0)
          setActiveMilestone(s.pending_milestones[0]);
        if (s.disclosure_level >= 3) {
          const g = await getGoals();
          setGoals(g);
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const handleHabitToggle = async (habit: Habit) => {
    const newCompleted = !habit.completed_today;
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habit.id ? { ...h, completed_today: newCompleted } : h,
      ),
    );
    try {
      const res = await logHabit(habit.id, newCompleted);
      setStatus((prev) =>
        prev ? { ...prev, streak: res.streak ?? prev.streak } : prev,
      );
    } catch {
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habit.id ? { ...h, completed_today: !newCompleted } : h,
        ),
      );
    }
  };

  const handleTrackerTodayToggle = (habitId: number, completed: boolean) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId ? { ...h, completed_today: completed } : h,
      ),
    );
  };

  const handleLogWin = async () => {
    if (!newWin.trim()) return;
    try {
      const win = await logWin(newWin.trim(), shareWin);
      setWins((prev) => [win, ...prev]);
      setNewWin("");
      setShareWin(false);
    } catch {}
  };

  const handleCheckinSubmit = async () => {
    if (!status?.checkin_question) return;
    await answerCheckin(status.checkin_question, checkinAnswer).catch(() => {});
    setCheckinDone(true);
    setStatus((prev) =>
      prev ? { ...prev, show_checkin_prompt: false } : prev,
    );
  };

  const handleCheckinSnooze = async () => {
    if (!status?.checkin_question) return;
    await answerCheckin(status.checkin_question, "", true).catch(() => {});
    setCheckinDone(true);
    setStatus((prev) =>
      prev ? { ...prev, show_checkin_prompt: false } : prev,
    );
  };

  const currentMode: AppMode = status?.slow_down_active
    ? "slow-down"
    : status?.one_thing_mode
      ? "one-thing"
      : "normal";

  const handleModeSelect = async (mode: AppMode) => {
    setShowModeSelector(false);
    if (mode === "one-thing") {
      await toggleOneThingMode(true).catch(() => {});
      setStatus((prev) =>
        prev
          ? { ...prev, one_thing_mode: true, slow_down_active: false }
          : prev,
      );
    } else if (mode === "slow-down") {
      setStatus((prev) =>
        prev
          ? { ...prev, slow_down_active: true, one_thing_mode: false }
          : prev,
      );
    } else {
      if (status?.one_thing_mode) {
        await toggleOneThingMode(false).catch(() => {});
      }
      setStatus((prev) =>
        prev
          ? { ...prev, one_thing_mode: false, slow_down_active: false }
          : prev,
      );
    }
  };

  const handleBadDayActivated = (newStreak: number) => {
    setStatus((prev) =>
      prev ? { ...prev, slow_down_active: true, streak: newStreak } : prev,
    );
  };

  const handleMilestoneDismiss = () => {
    if (!status) return;
    const remaining = status.pending_milestones.filter(
      (m) => m !== activeMilestone,
    );
    setActiveMilestone(remaining.length > 0 ? remaining[0] : null);
    setStatus((prev) =>
      prev ? { ...prev, pending_milestones: remaining } : prev,
    );
  };

  const handleAddHabit = async (name: string) => {
    const newHabit = await createHabit(name);
    setHabits((prev) => [...prev, newHabit]);
  };

  const handleLevelUnlocked = async () => {
    try {
      const s = await getUserStatus();
      setStatus(s);
      if (s.disclosure_level >= 3 && goals.length === 0) {
        const g = await getGoals();
        setGoals(g);
      }
    } catch {}
  };

  const handleGoalComplete = async (goal: Goal) => {
    try {
      await completeGoal(goal.id);
      setGoals((prev) =>
        prev.map((g) => (g.id === goal.id ? { ...g, completed: true } : g)),
      );
      setCelebratingGoal(goal.title);
    } catch {}
  };

  const handleGoalAdded = (goal: Goal) => {
    setGoals((prev) => [goal, ...prev]);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("mm_user_name");
    router.push("/");
  };

  const level = status?.disclosure_level ?? 1;
  const visibleHabits = level === 1 ? habits.slice(0, 1) : habits;
  const journalPrompts = level === 1 ? JOURNAL_PROMPTS_L1 : JOURNAL_PROMPTS_L2;
  const todayPrompt = journalPrompts[selectedPromptIndex] ?? journalPrompts[0];

  if (celebratingGoal) {
    return (
      <GoalCelebration
        goalTitle={celebratingGoal}
        onDismiss={() => setCelebratingGoal(null)}
      />
    );
  }

  if (showModeSelector && status) {
    return (
      <ModeSelector
        currentMode={currentMode}
        userName={status.name}
        onSelect={handleModeSelect}
        onClose={() => setShowModeSelector(false)}
      />
    );
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--cream, #F5F0E8)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "var(--sage, #8BAF8D)",
            animation: "pulse 1.4s ease-in-out infinite",
          }}
        />
        <p
          style={{
            fontSize: "13px",
            fontFamily: "Playfair Display, serif",
            fontStyle: "italic",
            color: "rgba(30,58,47,0.4)",
            transition: "opacity 0.6s ease",
          }}
        >
          {loadingPoem}
        </p>
        <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.3;transform:scale(0.8)} }`}</style>
      </div>
    );
  }

  if (!status) return null;

  if (activeMilestone) {
    return (
      <MilestoneMoment
        streakDay={activeMilestone}
        userName={status.name}
        onDismiss={handleMilestoneDismiss}
      />
    );
  }

  // ── ONE THING MODE ────────────────────────────────────────────────────────────
  if (status.one_thing_mode) {
    const primaryHabit = habits[0] || null;
    return (
      <>
        <div style={styles.page}>
          <DashboardNav
            name={status.name}
            onLogout={handleLogout}
            onModeClick={() => setShowModeSelector(true)}
            currentMode="one-thing"
          />
          <div
            style={{
              maxWidth: "520px",
              margin: "0 auto",
              padding: "40px 24px",
            }}
          >
            <p style={styles.modeLabel}>One Thing Mode</p>
            {primaryHabit && (
              <div style={styles.oneSectionWrap}>
                <p style={styles.oneSectionNum}>
                  01 — <span style={styles.oneSectionLbl}>Your one habit</span>
                </p>
                <button
                  onClick={() => handleHabitToggle(primaryHabit)}
                  style={{
                    ...styles.habitBtn,
                    background: primaryHabit.completed_today
                      ? "rgba(139,175,141,0.1)"
                      : "rgba(30,58,47,0.03)",
                    borderColor: primaryHabit.completed_today
                      ? "rgba(139,175,141,0.35)"
                      : "rgba(30,58,47,0.1)",
                  }}
                >
                  <CheckCircle done={primaryHabit.completed_today} />
                  <span
                    style={{
                      fontSize: "16px",
                      textDecoration: primaryHabit.completed_today
                        ? "line-through"
                        : "none",
                      color: primaryHabit.completed_today
                        ? "var(--sage, #8BAF8D)"
                        : "var(--forest, #1E3A2F)",
                      transition: "all 0.3s",
                    }}
                  >
                    {primaryHabit.name}
                  </span>
                </button>
              </div>
            )}
            <div style={styles.oneSectionWrap}>
              <p style={styles.oneSectionNum}>
                02 — <span style={styles.oneSectionLbl}>One question</span>
              </p>
              <p style={styles.journalPromptText}>{todayPrompt}</p>
              {/* One-thing mode uses the same JournalSection */}
              <JournalSection
                level={1}
                initialEntry={journalEntry}
                selectedPromptIndex={selectedPromptIndex}
                setSelectedPromptIndex={setSelectedPromptIndex}
                journalPrompts={JOURNAL_PROMPTS_L1}
                todayPrompt={todayPrompt}
              />
            </div>
            <div style={styles.oneSectionWrap}>
              <p style={styles.oneSectionNum}>
                03 — <span style={styles.oneSectionLbl}>One win</span>
              </p>
              <input
                type="text"
                value={newWin}
                onChange={(e) => setNewWin(e.target.value)}
                placeholder="Something small counts..."
                style={styles.input}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLogWin();
                }}
              />
              {newWin.trim() && (
                <button
                  onClick={handleLogWin}
                  style={{ ...styles.saveBtnSmall, marginTop: "10px" }}
                >
                  Log it
                </button>
              )}
            </div>
            <p style={styles.poemLine}>"My path is mine, my way is clear."</p>
          </div>
        </div>
        <BadDayButton onActivated={handleBadDayActivated} />
      </>
    );
  }

  // ── SLOW DOWN MODE ────────────────────────────────────────────────────────────
  if (status.slow_down_active) {
    const quote = CALMING_QUOTES[new Date().getDay() % CALMING_QUOTES.length];
    return (
      <>
        <div style={{ ...styles.page, background: "var(--forest, #1E3A2F)" }}>
          <DashboardNav
            name={status.name}
            onLogout={handleLogout}
            onModeClick={() => setShowModeSelector(true)}
            currentMode="slow-down"
            dark
          />
          <div
            style={{
              maxWidth: "480px",
              margin: "0 auto",
              padding: "60px 24px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(245,240,232,0.35)",
                marginBottom: "40px",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Slow Down Mode
            </p>
            <h1
              style={{
                fontSize: "clamp(28px, 5vw, 38px)",
                fontFamily: "Playfair Display, serif",
                color: "var(--cream, #F5F0E8)",
                fontWeight: 700,
                lineHeight: 1.3,
                marginBottom: "16px",
              }}
            >
              Today was hard,{" "}
              <span style={{ color: "var(--amber, #C4793A)" }}>
                {status.name}.
              </span>
            </h1>
            <p
              style={{
                fontSize: "15px",
                fontFamily: "DM Sans, sans-serif",
                color: "rgba(245,240,232,0.6)",
                lineHeight: 1.8,
                marginBottom: "40px",
              }}
            >
              You don't have to do anything right now.
              <br />
              Your streak is safe. Your progress is safe.
              <br />
              You are safe.
            </p>
            <div
              style={{
                borderTop: "1px solid rgba(245,240,232,0.1)",
                borderBottom: "1px solid rgba(245,240,232,0.1)",
                padding: "28px 0",
                marginBottom: "40px",
              }}
            >
              <p
                style={{
                  fontSize: "17px",
                  fontFamily: "Playfair Display, serif",
                  fontStyle: "italic",
                  color: "var(--cream, #F5F0E8)",
                  lineHeight: 1.8,
                  margin: 0,
                }}
              >
                "{quote.text}"
              </p>
              {quote.author && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "rgba(245,240,232,0.35)",
                    fontFamily: "DM Sans, sans-serif",
                    marginTop: "10px",
                  }}
                >
                  — {quote.author}
                </p>
              )}
            </div>
            <div
              style={{
                background: "rgba(245,240,232,0.05)",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "40px",
              }}
            >
              <p
                style={{
                  fontSize: "13px",
                  color: "rgba(245,240,232,0.5)",
                  fontFamily: "DM Sans, sans-serif",
                  marginBottom: "6px",
                }}
              >
                Your streak
              </p>
              <p
                style={{
                  fontSize: "32px",
                  fontFamily: "Playfair Display, serif",
                  color: "var(--amber, #C4793A)",
                  margin: 0,
                }}
              >
                {status.streak} days
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "rgba(245,240,232,0.35)",
                  fontFamily: "DM Sans, sans-serif",
                  marginTop: "4px",
                }}
              >
                Still intact. Rest days count.
              </p>
            </div>
            <p
              style={{
                fontSize: "14px",
                fontFamily: "DM Sans, sans-serif",
                color: "rgba(245,240,232,0.4)",
                marginBottom: "16px",
              }}
            >
              Is there anything you want to write down?
            </p>
            <textarea
              value={oneThingJournal}
              onChange={(e) => setOneThingJournal(e.target.value)}
              placeholder="No pressure. Just if you want to..."
              rows={4}
              style={{
                ...styles.textarea,
                background: "rgba(245,240,232,0.06)",
                border: "1px solid rgba(245,240,232,0.12)",
                color: "var(--cream, #F5F0E8)",
                width: "100%",
              }}
            />
            {oneThingJournal.trim() && (
              <button
                onClick={async () => {
                  await saveJournal(oneThingJournal).catch(() => {});
                  setOneThingJournalSaved(true);
                  setTimeout(() => setOneThingJournalSaved(false), 3000);
                }}
                style={{
                  ...styles.saveBtnSmall,
                  marginTop: "10px",
                  background: "rgba(245,240,232,0.1)",
                  color: "var(--cream, #F5F0E8)",
                  border: "1px solid rgba(245,240,232,0.15)",
                }}
              >
                {oneThingJournalSaved ? "Saved ✓" : "Save quietly"}
              </button>
            )}
          </div>
        </div>
        <BadDayButton onActivated={handleBadDayActivated} />
      </>
    );
  }

  // ── FULL DASHBOARD ────────────────────────────────────────────────────────────
  const tabs: Array<{
    key: "today" | "wins" | "tracker" | "streak" | "goals";
    label: string;
  }> = [
    { key: "today", label: "Today" },
    { key: "wins", label: "Wins" },
    { key: "tracker", label: "Tracker" },
    { key: "streak", label: "Streak" },
    ...(level >= 3 ? [{ key: "goals" as const, label: "Goals" }] : []),
  ];

  return (
    <>
      <div style={styles.page}>
        <DashboardNav
          name={status.name}
          onLogout={handleLogout}
          onModeClick={() => setShowModeSelector(true)}
          currentMode="normal"
        />

        <div
          style={{
            maxWidth: "720px",
            margin: "0 auto",
            padding: "0 24px 80px",
          }}
        >
          <header style={styles.header}>
            <div>
              <h1 style={styles.greeting}>
                {getGreeting()},{" "}
                <span style={{ color: "var(--amber, #C4793A)" }}>
                  {status.name}
                </span>
                .
              </h1>
              <p style={styles.subGreeting}>
                {getDayMessage(status.days_joined, status.streak)}
              </p>
            </div>
            <div style={styles.headerRight}>
              <div style={styles.streakPill}>
                <span
                  style={{
                    fontSize: "18px",
                    fontFamily: "Playfair Display, serif",
                    color: "var(--amber, #C4793A)",
                    fontWeight: 700,
                  }}
                >
                  {status.streak}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    color: "rgba(30,58,47,0.45)",
                    fontFamily: "DM Sans, sans-serif",
                    letterSpacing: "0.06em",
                  }}
                >
                  day streak
                </span>
              </div>
            </div>
          </header>

          <JourneyProgressBar
            currentLevel={level}
            levelName={status.level_name}
          />

          {status.show_checkin_prompt &&
            !checkinDone &&
            status.checkin_question && (
              <div style={styles.checkinCard}>
                <p style={styles.checkinLabel}>A gentle check-in</p>
                <p style={styles.checkinQ}>
                  {CHECKIN_QUESTIONS[status.checkin_question] ||
                    "How has your journey been lately?"}
                </p>
                <textarea
                  value={checkinAnswer}
                  onChange={(e) => setCheckinAnswer(e.target.value)}
                  placeholder="Take your time..."
                  rows={2}
                  style={{ ...styles.textarea, marginBottom: "10px" }}
                />
                <div style={{ display: "flex", gap: "8px" }}>
                  {checkinAnswer.trim() && (
                    <button
                      onClick={handleCheckinSubmit}
                      style={styles.saveBtnSmall}
                    >
                      Share
                    </button>
                  )}
                  <button onClick={handleCheckinSnooze} style={styles.ghostBtn}>
                    Ask me later
                  </button>
                </div>
              </div>
            )}

          <div style={styles.tabs}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  ...styles.tab,
                  color:
                    activeTab === tab.key
                      ? "var(--forest, #1E3A2F)"
                      : "rgba(30,58,47,0.35)",
                  borderBottom:
                    activeTab === tab.key
                      ? "2px solid var(--amber, #C4793A)"
                      : "2px solid transparent",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── TODAY TAB ── */}
          {activeTab === "today" && (
            <div style={styles.tabContent}>
              <Section title={level === 1 ? "Your habit" : "Habits"}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {visibleHabits.map((habit) => (
                    <button
                      key={habit.id}
                      onClick={() => handleHabitToggle(habit)}
                      style={{
                        ...styles.habitBtn,
                        background: habit.completed_today
                          ? "rgba(139,175,141,0.1)"
                          : "rgba(30,58,47,0.03)",
                        borderColor: habit.completed_today
                          ? "rgba(139,175,141,0.35)"
                          : "rgba(30,58,47,0.1)",
                      }}
                    >
                      <CheckCircle done={habit.completed_today} />
                      <span
                        style={{
                          fontSize: "15px",
                          fontFamily: "DM Sans, sans-serif",
                          color: habit.completed_today
                            ? "var(--sage, #8BAF8D)"
                            : "var(--forest, #1E3A2F)",
                          textDecoration: habit.completed_today
                            ? "line-through"
                            : "none",
                          transition: "all 0.3s",
                        }}
                      >
                        {habit.name}
                      </span>
                    </button>
                  ))}
                  <AddHabitInline
                    showProminent={visibleHabits.length === 0}
                    level={level}
                    onAdd={handleAddHabit}
                  />
                </div>
                {level === 1 && visibleHabits.length > 0 && (
                  <p style={styles.unlockHint}>
                    More habits unlock at Level 2.
                  </p>
                )}
              </Section>

              {/* ── JOURNAL with saved card ── */}
              <Section title={level === 1 ? "Today's question" : "Journal"}>
                <JournalSection
                  level={level}
                  initialEntry={journalEntry}
                  selectedPromptIndex={selectedPromptIndex}
                  setSelectedPromptIndex={setSelectedPromptIndex}
                  journalPrompts={journalPrompts}
                  todayPrompt={todayPrompt}
                />
              </Section>

              <DailyInvitation />

              <Section title="One small win">
                <input
                  type="text"
                  value={newWin}
                  onChange={(e) => setNewWin(e.target.value)}
                  placeholder="What went right today, even a little?"
                  style={styles.input}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLogWin();
                  }}
                />
                {newWin.trim() && (
                  <div
                    style={{
                      marginTop: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button onClick={handleLogWin} style={styles.saveBtnSmall}>
                      Log it
                    </button>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                        color: "rgba(30,58,47,0.45)",
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={shareWin}
                        onChange={(e) => setShareWin(e.target.checked)}
                        style={{ accentColor: "var(--sage, #8BAF8D)" }}
                      />
                      Share anonymously with community
                    </label>
                  </div>
                )}
              </Section>

              {status.next_level && (
                <UnlockPreviewCard
                  currentLevel={level}
                  nextLevel={status.next_level}
                  daysJoined={status.days_joined}
                  onUnlocked={handleLevelUnlocked}
                />
              )}
            </div>
          )}

          {/* ── WINS TAB ── */}
          {activeTab === "wins" && (
            <div style={styles.tabContent}>
              {wins.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <p
                    style={{
                      fontFamily: "Playfair Display, serif",
                      fontSize: "20px",
                      color: "var(--forest, #1E3A2F)",
                      marginBottom: "8px",
                    }}
                  >
                    No wins logged yet.
                  </p>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "rgba(30,58,47,0.4)",
                      fontFamily: "DM Sans, sans-serif",
                      marginBottom: "24px",
                    }}
                  >
                    They're coming. Switch to Today to log your first.
                  </p>
                  <p style={styles.poemLine}>
                    "Each seed has time to be full-grown."
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {wins.map((w) => (
                    <div key={w.id} style={styles.winCard}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          fontFamily: "DM Sans, sans-serif",
                          color: "var(--forest, #1E3A2F)",
                          lineHeight: 1.5,
                        }}
                      >
                        {w.win}
                      </p>
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: "11px",
                          color: "rgba(30,58,47,0.35)",
                          fontFamily: "DM Sans, sans-serif",
                        }}
                      >
                        {formatDate(w.date)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TRACKER TAB ── */}
          {activeTab === "tracker" && (
            <div style={styles.tabContent}>
              <p
                style={{
                  fontSize: "13px",
                  color: "rgba(30,58,47,0.45)",
                  fontFamily: "DM Sans, sans-serif",
                  marginBottom: "16px",
                  fontStyle: "italic",
                }}
              >
                Tap any past day to mark it complete. Today stays in sync with
                your habits above.
              </p>
              <MonthlyHabitTracker
                habits={habits}
                level={level}
                onHabitToggled={handleTrackerTodayToggle}
              />
              {habits.length === 0 && (
                <p
                  style={{
                    fontSize: "13px",
                    color: "rgba(30,58,47,0.4)",
                    fontFamily: "DM Sans, sans-serif",
                    marginTop: "16px",
                    textAlign: "center",
                  }}
                >
                  Add a habit in the Today tab first — then track it here.
                </p>
              )}
            </div>
          )}

          {/* ── STREAK TAB ── */}
          {activeTab === "streak" && streakData && (
            <div style={styles.tabContent}>
              <div style={{ textAlign: "center", padding: "32px 0 40px" }}>
                <div
                  style={{
                    fontSize: "72px",
                    fontFamily: "Playfair Display, serif",
                    color: "var(--amber, #C4793A)",
                    lineHeight: 1,
                    fontWeight: 700,
                  }}
                >
                  {streakData.streak}
                </div>
                <p
                  style={{
                    fontSize: "13px",
                    color: "rgba(30,58,47,0.45)",
                    fontFamily: "DM Sans, sans-serif",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginTop: "8px",
                  }}
                >
                  day streak
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  justifyContent: "center",
                  marginBottom: "40px",
                }}
              >
                {streakData.last_7_days.map((day, i) => {
                  const isCompleted = day.completed;
                  const isRestDay = day.rest_day && !day.completed;
                  const isSkipped = !day.completed && !day.rest_day;

                  let bgColor = "rgba(30,58,47,0.06)";
                  let content = null;

                  if (isCompleted) {
                    bgColor = "var(--sage, #8BAF8D)";
                    content = (
                      <svg
                        width="14"
                        height="11"
                        viewBox="0 0 14 11"
                        fill="none"
                      >
                        <path
                          d="M1 5L5 9L13 1"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    );
                  } else if (isRestDay) {
                    bgColor = "rgba(196,121,58,0.15)";
                    content = <span style={{ fontSize: "12px" }}>🌙</span>;
                  } else if (isSkipped) {
                    bgColor = "rgba(30,58,47,0.04)";
                    content = (
                      <span
                        style={{
                          fontSize: "11px",
                          color: "rgba(30,58,47,0.2)",
                          lineHeight: 1,
                        }}
                      >
                        ·
                      </span>
                    );
                  }

                  return (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "10px",
                          background: bgColor,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: "4px",
                          border: isSkipped
                            ? "1px dashed rgba(30,58,47,0.1)"
                            : "none",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {content}
                      </div>
                      <p
                        style={{
                          fontSize: "10px",
                          color: "rgba(30,58,47,0.35)",
                          fontFamily: "DM Sans, sans-serif",
                          margin: 0,
                        }}
                      >
                        {day.day_name}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  marginBottom: "32px",
                }}
              >
                {[
                  {
                    color: "var(--sage, #8BAF8D)",
                    label: "Completed",
                    border: "none",
                  },
                  {
                    color: "rgba(196,121,58,0.15)",
                    label: "Rest day",
                    border: "none",
                  },
                  {
                    color: "rgba(30,58,47,0.04)",
                    label: "Stepped away",
                    border: "1px dashed rgba(30,58,47,0.1)",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "3px",
                        background: item.color,
                        border: item.border,
                      }}
                    />
                    <span
                      style={{
                        fontSize: "11px",
                        color: "rgba(30,58,47,0.45)",
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
              <div
                style={{
                  background: "rgba(196,121,58,0.07)",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  marginBottom: "24px",
                }}
              >
                <p
                  style={{
                    fontSize: "13px",
                    fontFamily: "DM Sans, sans-serif",
                    color: "rgba(30,58,47,0.6)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  <strong style={{ color: "var(--forest, #1E3A2F)" }}>
                    Rest days protect your streak
                  </strong>{" "}
                  — but only when you ask for them. Press{" "}
                  <em>"Today was hard."</em> on any day you genuinely need
                  grace. Showing up the next day is what the streak is for.
                </p>
              </div>
              <p style={{ ...styles.poemLine, marginTop: "8px" }}>
                "When even stars will dim and rest, why must I always be my
                best?"
              </p>
            </div>
          )}

          {/* ── GOALS TAB ── */}
          {activeTab === "goals" && level >= 3 && (
            <div style={styles.tabContent}>
              <GoalsTab
                goals={goals}
                onGoalComplete={handleGoalComplete}
                onGoalAdded={handleGoalAdded}
              />
            </div>
          )}
        </div>
      </div>
      <BadDayButton onActivated={handleBadDayActivated} />
    </>
  );
}

// ─── Dashboard Nav ────────────────────────────────────────────────────────────
function DashboardNav({
  name,
  onLogout,
  onModeClick,
  currentMode,
  level = 1,
  dark = false,
}: {
  name: string;
  onLogout: () => void;
  onModeClick: () => void;
  currentMode: AppMode;
  level?: number;
  dark?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const fg = dark ? "rgba(245,240,232,0.8)" : "var(--forest, #1E3A2F)";
  const border = dark ? "rgba(245,240,232,0.12)" : "rgba(30,58,47,0.1)";
  const bg = dark ? "var(--forest, #1E3A2F)" : "var(--cream, #F5F0E8)";
  const MODE_LABELS: Record<AppMode, string> = {
    normal: "Full Dashboard",
    "one-thing": "One Thing Mode",
    "slow-down": "Slow Down Mode",
  };
  const MODE_ICONS: Record<AppMode, string> = {
    normal: "◎",
    "one-thing": "⊙",
    "slow-down": "🌙",
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 24px",
        borderBottom: `1px solid ${border}`,
        background: bg,
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <a
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          textDecoration: "none",
          fontFamily: "Playfair Display, serif",
          fontSize: "15px",
          color: fg,
          fontWeight: 700,
        }}
      >
        <div
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: "var(--amber, #C4793A)",
          }}
        />
        Marathon Mindset
      </a>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          onClick={onModeClick}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "transparent",
            border: `1px solid ${border}`,
            borderRadius: "100px",
            padding: "6px 12px",
            fontSize: "12px",
            fontFamily: "DM Sans, sans-serif",
            color: dark ? "rgba(245,240,232,0.55)" : "rgba(30,58,47,0.5)",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: "13px" }}>{MODE_ICONS[currentMode]}</span>
          <span>{MODE_LABELS[currentMode]}</span>
          <span style={{ fontSize: "9px", opacity: 0.5 }}>▾</span>
        </button>
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "transparent",
              border: `1px solid ${border}`,
              borderRadius: "100px",
              padding: "5px 12px 5px 5px",
              fontSize: "13px",
              fontFamily: "DM Sans, sans-serif",
              color: dark ? "rgba(245,240,232,0.6)" : "rgba(30,58,47,0.6)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <div
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                background: "var(--sage, #8BAF8D)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{ fontSize: "11px", color: "white", fontWeight: 600 }}
              >
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
            {name.split(" ")[0]}
            <span style={{ fontSize: "10px", opacity: 0.5 }}>▾</span>
          </button>
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                background: "white",
                border: "1px solid rgba(30,58,47,0.1)",
                borderRadius: "12px",
                padding: "8px",
                minWidth: "180px",
                boxShadow: "0 8px 24px rgba(30,58,47,0.1)",
                zIndex: 100,
              }}
            >
              <a
                href="/"
                style={menuItemStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(30,58,47,0.04)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                🏠 Home
              </a>
              <a
                href="/community"
                style={menuItemStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(30,58,47,0.04)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                🌱 Community wins
              </a>
              {level >= 4 && (
                <a
                  href="/growth"
                  style={menuItemStyle}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(30,58,47,0.04)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  ✉️ Growth letter
                </a>
              )}
              <a
                href="/settings"
                style={menuItemStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(30,58,47,0.04)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                ⚙️ Settings
              </a>
              <div
                style={{
                  height: "1px",
                  background: "rgba(30,58,47,0.06)",
                  margin: "4px 0",
                }}
              />
              <button
                onClick={onLogout}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 12px",
                  fontSize: "13px",
                  fontFamily: "DM Sans, sans-serif",
                  color: "rgba(30,58,47,0.45)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "8px",
                  display: "block",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(30,58,47,0.04)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: "block",
  padding: "10px 12px",
  fontSize: "13px",
  fontFamily: "DM Sans, sans-serif",
  color: "var(--forest, #1E3A2F)",
  textDecoration: "none",
  borderRadius: "8px",
  background: "transparent",
};

// ─── Goals Tab ────────────────────────────────────────────────────────────────
function GoalsTab({
  goals,
  onGoalComplete,
  onGoalAdded,
}: {
  goals: Goal[];
  onGoalComplete: (goal: Goal) => void;
  onGoalAdded: (goal: Goal) => void;
}) {
  const [addingGoal, setAddingGoal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [completingId, setCompletingId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (addingGoal) setTimeout(() => inputRef.current?.focus(), 80);
  }, [addingGoal]);

  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);

  const handleSaveGoal = async () => {
    if (!newTitle.trim() || saving) return;
    setSaving(true);
    try {
      const goal = await createGoal(newTitle.trim(), "", newDate || undefined);
      onGoalAdded(goal);
      setNewTitle("");
      setNewDate("");
      setAddingGoal(false);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (goal: Goal) => {
    if (completingId) return;
    setCompletingId(goal.id);
    await new Promise((r) => setTimeout(r, 180));
    onGoalComplete(goal);
    setCompletingId(null);
  };

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <p
          style={{
            fontSize: "15px",
            fontFamily: "Playfair Display, serif",
            fontStyle: "italic",
            color: "rgba(30,58,47,0.55)",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Goals are intentions, not obligations. Set them with kindness.
        </p>
      </div>
      {activeGoals.length > 0 && (
        <div style={{ marginBottom: "32px" }}>
          <p style={styles.sectionTitle}>In progress</p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {activeGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                completing={completingId === goal.id}
                onComplete={() => handleComplete(goal)}
              />
            ))}
          </div>
        </div>
      )}
      {!addingGoal ? (
        <button
          onClick={() => setAddingGoal(true)}
          style={
            activeGoals.length === 0
              ? {
                  width: "100%",
                  border: "1.5px dashed rgba(30,58,47,0.15)",
                  borderRadius: "14px",
                  padding: "28px 20px",
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "32px",
                }
              : {
                  background: "transparent",
                  border: "none",
                  color: "rgba(30,58,47,0.35)",
                  fontSize: "13px",
                  fontFamily: "DM Sans, sans-serif",
                  cursor: "pointer",
                  padding: "6px 0",
                  marginBottom: "32px",
                  display: "block",
                }
          }
        >
          {activeGoals.length === 0 ? (
            <>
              <p
                style={{
                  fontSize: "15px",
                  fontFamily: "Playfair Display, serif",
                  fontStyle: "italic",
                  color: "rgba(30,58,47,0.4)",
                  margin: 0,
                }}
              >
                What's one thing you're working toward?
              </p>
              <span
                style={{
                  fontSize: "13px",
                  fontFamily: "DM Sans, sans-serif",
                  color: "rgba(30,58,47,0.3)",
                }}
              >
                + Set your first goal
              </span>
            </>
          ) : (
            "+ Add another goal"
          )}
        </button>
      ) : (
        <div
          style={{
            background: "rgba(30,58,47,0.03)",
            border: "1px solid rgba(30,58,47,0.1)",
            borderRadius: "14px",
            padding: "20px",
            marginBottom: "32px",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(30,58,47,0.35)",
              fontFamily: "DM Sans, sans-serif",
              marginBottom: "14px",
            }}
          >
            New goal
          </p>
          <input
            ref={inputRef}
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. Run a 5K, Read 12 books this year..."
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveGoal();
              if (e.key === "Escape") {
                setAddingGoal(false);
                setNewTitle("");
                setNewDate("");
              }
            }}
            style={{ ...styles.input, marginBottom: "12px", display: "block" }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "16px",
              flexWrap: "wrap",
            }}
          >
            <label
              style={{
                fontSize: "12px",
                fontFamily: "DM Sans, sans-serif",
                color: "rgba(30,58,47,0.4)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              Target date{" "}
              <span style={{ fontSize: "11px", color: "rgba(30,58,47,0.25)" }}>
                (optional)
              </span>
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              style={{
                background: "transparent",
                border: "1px solid rgba(30,58,47,0.12)",
                borderRadius: "8px",
                padding: "6px 10px",
                fontSize: "13px",
                fontFamily: "DM Sans, sans-serif",
                color: "var(--forest, #1E3A2F)",
                outline: "none",
                cursor: "pointer",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleSaveGoal}
              disabled={!newTitle.trim() || saving}
              style={{
                ...styles.saveBtnSmall,
                opacity: !newTitle.trim() || saving ? 0.5 : 1,
              }}
            >
              {saving ? "Saving..." : "Set this goal"}
            </button>
            <button
              onClick={() => {
                setAddingGoal(false);
                setNewTitle("");
                setNewDate("");
              }}
              style={styles.ghostBtn}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {completedGoals.length > 0 && (
        <div>
          <p style={styles.sectionTitle}>Completed</p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {completedGoals.map((goal) => (
              <div
                key={goal.id}
                style={{
                  background: "rgba(139,175,141,0.07)",
                  border: "1px solid rgba(139,175,141,0.18)",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "var(--sage, #8BAF8D)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 3.5L3.5 6.5L9 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    fontFamily: "DM Sans, sans-serif",
                    color: "rgba(30,58,47,0.55)",
                    textDecoration: "line-through",
                    lineHeight: 1.4,
                  }}
                >
                  {goal.title}
                </p>
              </div>
            ))}
          </div>
          <p style={{ ...styles.poemLine, marginTop: "28px" }}>
            "Each seed has time to be full-grown."
          </p>
        </div>
      )}
      {goals.length === 0 && !addingGoal && (
        <p style={{ ...styles.poemLine, marginTop: "8px" }}>
          "So I will grow, but at my speed."
        </p>
      )}
    </div>
  );
}

function GoalCard({
  goal,
  completing,
  onComplete,
}: {
  goal: Goal;
  completing: boolean;
  onComplete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const today = new Date();
  const targetDate = goal.target_date ? new Date(goal.target_date) : null;
  const daysLeft = targetDate
    ? Math.ceil(
        (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      )
    : null;

  return (
    <div
      style={{
        background: hovered ? "rgba(30,58,47,0.04)" : "rgba(30,58,47,0.02)",
        border: "1px solid rgba(30,58,47,0.1)",
        borderRadius: "14px",
        padding: "16px 18px",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div style={{ flex: 1 }}>
          <p
            style={{
              margin: 0,
              fontSize: "15px",
              fontFamily: "DM Sans, sans-serif",
              color: "var(--forest, #1E3A2F)",
              lineHeight: 1.4,
              fontWeight: 500,
            }}
          >
            {goal.title}
          </p>
          {targetDate && daysLeft !== null && (
            <p
              style={{
                margin: "5px 0 0",
                fontSize: "12px",
                fontFamily: "DM Sans, sans-serif",
                color:
                  daysLeft < 0
                    ? "rgba(30,58,47,0.35)"
                    : daysLeft <= 7
                      ? "var(--amber, #C4793A)"
                      : "rgba(30,58,47,0.35)",
              }}
            >
              {daysLeft < 0
                ? `Past target · ${targetDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                : daysLeft === 0
                  ? "Target is today"
                  : daysLeft === 1
                    ? "1 day left"
                    : `${daysLeft} days · ${targetDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
            </p>
          )}
        </div>
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            style={{
              background: "transparent",
              border: "1px solid rgba(30,58,47,0.12)",
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "12px",
              fontFamily: "DM Sans, sans-serif",
              color: "rgba(30,58,47,0.4)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(139,175,141,0.1)";
              e.currentTarget.style.borderColor = "rgba(139,175,141,0.3)";
              e.currentTarget.style.color = "var(--sage, #8BAF8D)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(30,58,47,0.12)";
              e.currentTarget.style.color = "rgba(30,58,47,0.4)";
            }}
          >
            Done
          </button>
        ) : (
          <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
            <button
              onClick={onComplete}
              disabled={completing}
              style={{
                background: "var(--sage, #8BAF8D)",
                border: "none",
                borderRadius: "8px",
                padding: "6px 12px",
                fontSize: "12px",
                fontFamily: "DM Sans, sans-serif",
                color: "white",
                cursor: "pointer",
                opacity: completing ? 0.7 : 1,
              }}
            >
              {completing ? "..." : "Yes, done ✓"}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              style={{
                background: "transparent",
                border: "1px solid rgba(30,58,47,0.1)",
                borderRadius: "8px",
                padding: "6px 10px",
                fontSize: "12px",
                fontFamily: "DM Sans, sans-serif",
                color: "rgba(30,58,47,0.35)",
                cursor: "pointer",
              }}
            >
              Not yet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AddHabitInline ───────────────────────────────────────────────────────────
function AddHabitInline({
  showProminent,
  level,
  onAdd,
}: {
  showProminent: boolean;
  level: number;
  onAdd: (name: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const handleSave = async () => {
    if (!value.trim() || saving) return;
    setSaving(true);
    try {
      await onAdd(value.trim());
      setSaved(true);
      setValue("");
      setOpen(false);
      setTimeout(() => setSaved(false), 3000);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  if (showProminent) {
    return (
      <div
        style={{
          border: "1.5px dashed rgba(30,58,47,0.15)",
          borderRadius: "12px",
          padding: "20px",
          textAlign: "center",
        }}
      >
        {!open ? (
          <>
            <p
              style={{
                fontSize: "14px",
                fontFamily: "Playfair Display, serif",
                fontStyle: "italic",
                color: "rgba(30,58,47,0.45)",
                marginBottom: "12px",
              }}
            >
              What's one habit you want to build?
            </p>
            <button
              onClick={() => setOpen(true)}
              style={{
                background: "var(--forest, #1E3A2F)",
                color: "var(--cream, #F5F0E8)",
                border: "none",
                borderRadius: "8px",
                padding: "10px 24px",
                fontSize: "13px",
                fontFamily: "DM Sans, sans-serif",
                cursor: "pointer",
              }}
            >
              + Add your first habit
            </button>
          </>
        ) : (
          <div style={{ textAlign: "left" }}>
            <p
              style={{
                fontSize: "12px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(30,58,47,0.4)",
                fontFamily: "DM Sans, sans-serif",
                marginBottom: "10px",
              }}
            >
              Name your habit
            </p>
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. Read for 10 minutes, Morning walk..."
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") setOpen(false);
              }}
              style={{
                width: "100%",
                background: "rgba(30,58,47,0.03)",
                border: "1px solid rgba(30,58,47,0.12)",
                borderRadius: "10px",
                padding: "12px 14px",
                fontSize: "14px",
                fontFamily: "DM Sans, sans-serif",
                color: "var(--forest, #1E3A2F)",
                outline: "none",
                boxSizing: "border-box",
                marginBottom: "10px",
              }}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleSave}
                disabled={!value.trim() || saving}
                style={{
                  background: "var(--forest, #1E3A2F)",
                  color: "var(--cream, #F5F0E8)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  fontSize: "13px",
                  fontFamily: "DM Sans, sans-serif",
                  cursor: "pointer",
                  opacity: !value.trim() || saving ? 0.5 : 1,
                }}
              >
                {saving ? "Saving..." : "Save habit"}
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  setValue("");
                }}
                style={{
                  background: "transparent",
                  color: "rgba(30,58,47,0.4)",
                  border: "1px solid rgba(30,58,47,0.1)",
                  borderRadius: "8px",
                  padding: "10px 16px",
                  fontSize: "13px",
                  fontFamily: "DM Sans, sans-serif",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {saved && (
          <p
            style={{
              fontSize: "12px",
              color: "var(--sage, #8BAF8D)",
              fontFamily: "DM Sans, sans-serif",
              marginTop: "8px",
            }}
          >
            ✓ Habit added. It'll appear in your Tracker tab too.
          </p>
        )}
      </div>
    );
  }

  if (level < 2) return null;
  return (
    <div style={{ marginTop: "4px" }}>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(30,58,47,0.35)",
            fontSize: "13px",
            fontFamily: "DM Sans, sans-serif",
            cursor: "pointer",
            padding: "6px 0",
          }}
        >
          + Add another habit
        </button>
      ) : (
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="New habit name..."
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") setOpen(false);
            }}
            style={{
              flex: 1,
              background: "rgba(30,58,47,0.03)",
              border: "1px solid rgba(30,58,47,0.12)",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "14px",
              fontFamily: "DM Sans, sans-serif",
              color: "var(--forest, #1E3A2F)",
              outline: "none",
            }}
          />
          <button
            onClick={handleSave}
            disabled={!value.trim() || saving}
            style={{
              background: "var(--forest, #1E3A2F)",
              color: "var(--cream, #F5F0E8)",
              border: "none",
              borderRadius: "8px",
              padding: "10px 16px",
              fontSize: "13px",
              fontFamily: "DM Sans, sans-serif",
              cursor: "pointer",
              opacity: !value.trim() || saving ? 0.5 : 1,
              whiteSpace: "nowrap",
            }}
          >
            {saving ? "..." : "Add"}
          </button>
          <button
            onClick={() => {
              setOpen(false);
              setValue("");
            }}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(30,58,47,0.3)",
              fontSize: "18px",
              cursor: "pointer",
              padding: "0 4px",
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "36px" }}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      {children}
    </div>
  );
}

function CheckCircle({ done }: { done: boolean }) {
  return (
    <div
      style={{
        width: "22px",
        height: "22px",
        borderRadius: "50%",
        border: `2px solid ${done ? "var(--sage, #8BAF8D)" : "rgba(30,58,47,0.2)"}`,
        background: done ? "var(--sage, #8BAF8D)" : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "all 0.3s ease",
      }}
    >
      {done && (
        <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
          <path
            d="M1 4L4 7.5L10 1"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function getDayMessage(daysJoined: number, streak?: number) {
  if (streak && streak >= 365)
    return "A full year. You didn't just build a habit — you built a new self.";
  if (streak && streak >= 100)
    return "100 days. Let that settle in. You chose yourself, again and again.";
  if (streak && streak >= 50)
    return "50 days in. This is no longer something you're trying. It's who you are.";
  if (streak && streak >= 21)
    return "21 days. Science says this is where habits take root. Feel that.";
  if (streak && streak >= 7)
    return "A full week. You've done the hardest part — you started and kept going.";
  const dailyMessages: Record<number, string> = {
    0: "Day 1. The hardest and most important day. You showed up.",
    1: "Day 2. Showing up twice is harder than showing up once. You did it.",
    2: "Day 3. Three days. The resistance is real — and you're moving through it.",
    3: "Day 4. Four quiet mornings of choosing yourself. That's not small.",
    4: "Day 5. Halfway through your first week. Keep the pace that feels like yours.",
    5: "Day 6. Day 6 is where most people drift. You're still here.",
    6: "Day 7. A full week. Something is beginning to root in you.",
    7: "Day 8. Starting your second week. The path is becoming familiar.",
    8: "Day 9. Nine days of small choices adding up to something real.",
    9: "Day 10. Ten days. You've earned the right to call this a practice.",
    10: "Day 11. Eleven days. The habit is starting to feel less like effort.",
    11: "Day 12. Day 12. You're in the middle — the least glamorous place. Stay.",
    12: "Day 13. Thirteen days of showing up for yourself. Keep going.",
    13: "Day 14. Two weeks. You're not trying anymore — you're doing.",
    14: "Day 15. Halfway through your third week. The momentum is real.",
    15: "Day 16. Sixteen days. Notice how this is starting to feel like you.",
    16: "Day 17. Day 17. You've built more than a habit — you've built trust in yourself.",
    17: "Day 18. Eighteen days. The version of you from Day 1 would be proud.",
    18: "Day 19. Almost three weeks. The roots are deeper than you think.",
    19: "Day 20. Twenty days. This is becoming who you are, not just what you do.",
    20: "Day 21. Three weeks. Science says habits form here. You beat the odds.",
    21: "Day 22. Into your fourth week. The hardest part is behind you.",
    22: "Day 23. Twenty-three days. You're not the same person who started.",
    23: "Day 24. Day 24. Growth this quiet is still growth.",
    24: "Day 25. Twenty-five days. A quarter of 100. You're on your way.",
    25: "Day 26. Day 26. Keep your pace. This isn't a race.",
    26: "Day 27. Twenty-seven days. Three more and you'll have a full month.",
    27: "Day 28. Four weeks exactly. What started as effort is becoming ease.",
    28: "Day 29. One day away from 30. You've built something lasting.",
    29: "Day 30. Thirty days. A full month. You did something most people only plan.",
  };
  const msg = dailyMessages[daysJoined];
  if (msg) return msg;
  if (daysJoined < 50)
    return `Day ${daysJoined + 1}. Over a month in. This is becoming part of you.`;
  return `Day ${daysJoined + 1}. Keep going at your pace.`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "var(--cream, #F5F0E8)",
    fontFamily: "DM Sans, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "32px 0 20px",
    gap: "16px",
  },
  greeting: {
    fontSize: "clamp(22px, 4vw, 30px)",
    fontFamily: "Playfair Display, serif",
    color: "var(--forest, #1E3A2F)",
    margin: 0,
    fontWeight: 700,
    lineHeight: 1.2,
  },
  subGreeting: {
    fontSize: "13px",
    color: "rgba(30,58,47,0.45)",
    margin: "6px 0 0",
    fontFamily: "DM Sans, sans-serif",
    lineHeight: 1.4,
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0,
  },
  streakPill: {
    background: "rgba(30,58,47,0.05)",
    border: "1px solid rgba(30,58,47,0.08)",
    borderRadius: "100px",
    padding: "8px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1px",
  },
  checkinCard: {
    background: "rgba(139,175,141,0.08)",
    border: "1px solid rgba(139,175,141,0.2)",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "20px",
  },
  checkinLabel: {
    fontSize: "11px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--sage, #8BAF8D)",
    margin: "0 0 8px",
    fontFamily: "DM Sans, sans-serif",
  },
  checkinQ: {
    fontSize: "16px",
    fontFamily: "Playfair Display, serif",
    color: "var(--forest, #1E3A2F)",
    margin: "0 0 14px",
    lineHeight: 1.5,
    fontStyle: "italic",
  },
  tabs: {
    display: "flex",
    gap: "0",
    marginBottom: "28px",
    borderBottom: "1px solid rgba(30,58,47,0.08)",
    overflowX: "auto",
  },
  tab: {
    background: "transparent",
    border: "none",
    padding: "12px 18px 10px",
    fontSize: "13px",
    fontFamily: "DM Sans, sans-serif",
    letterSpacing: "0.04em",
    cursor: "pointer",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  },
  tabContent: { paddingTop: "4px" },
  sectionTitle: {
    fontSize: "11px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "rgba(30,58,47,0.4)",
    margin: "0 0 14px",
    fontWeight: 500,
    fontFamily: "DM Sans, sans-serif",
  },
  habitBtn: {
    width: "100%",
    border: "1px solid",
    borderRadius: "12px",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
  },
  journalPromptText: {
    fontSize: "15px",
    fontFamily: "Playfair Display, serif",
    fontStyle: "italic",
    color: "var(--forest, #1E3A2F)",
    marginBottom: "12px",
    lineHeight: 1.5,
  },
  textarea: {
    width: "100%",
    background: "rgba(30,58,47,0.03)",
    border: "1px solid rgba(30,58,47,0.08)",
    borderRadius: "10px",
    padding: "13px 14px",
    fontSize: "14px",
    fontFamily: "DM Sans, sans-serif",
    color: "var(--forest, #1E3A2F)",
    resize: "none",
    outline: "none",
    lineHeight: 1.6,
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  input: {
    width: "100%",
    background: "rgba(30,58,47,0.03)",
    border: "1px solid rgba(30,58,47,0.08)",
    borderRadius: "10px",
    padding: "13px 14px",
    fontSize: "14px",
    fontFamily: "DM Sans, sans-serif",
    color: "var(--forest, #1E3A2F)",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  saveBtnSmall: {
    background: "var(--forest, #1E3A2F)",
    color: "var(--cream, #F5F0E8)",
    border: "none",
    borderRadius: "8px",
    padding: "9px 18px",
    fontSize: "13px",
    fontFamily: "DM Sans, sans-serif",
    cursor: "pointer",
  },
  ghostBtn: {
    background: "transparent",
    color: "rgba(30,58,47,0.4)",
    border: "1px solid rgba(30,58,47,0.12)",
    borderRadius: "8px",
    padding: "9px 18px",
    fontSize: "13px",
    fontFamily: "DM Sans, sans-serif",
    cursor: "pointer",
  },
  winCard: {
    background: "rgba(196,121,58,0.06)",
    border: "1px solid rgba(196,121,58,0.12)",
    borderRadius: "10px",
    padding: "14px 16px",
  },
  modeLabel: {
    fontSize: "11px",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "rgba(30,58,47,0.35)",
    marginBottom: "40px",
    fontFamily: "DM Sans, sans-serif",
  },
  oneSectionWrap: { marginBottom: "48px" },
  oneSectionNum: {
    fontSize: "11px",
    color: "rgba(30,58,47,0.4)",
    fontFamily: "DM Sans, sans-serif",
    letterSpacing: "0.06em",
    marginBottom: "12px",
  },
  oneSectionLbl: { textTransform: "uppercase", letterSpacing: "0.1em" },
  unlockHint: {
    fontSize: "12px",
    color: "rgba(30,58,47,0.3)",
    fontFamily: "DM Sans, sans-serif",
    marginTop: "10px",
    fontStyle: "italic",
  },
  poemLine: {
    fontSize: "13px",
    fontFamily: "Playfair Display, serif",
    fontStyle: "italic",
    color: "rgba(30,58,47,0.35)",
    textAlign: "center",
    margin: "32px 0 0",
    lineHeight: 1.7,
  },
};
