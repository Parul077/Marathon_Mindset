"use client";

import { useEffect, useState } from "react";
import { logHabit, getHabitLogs, type Habit } from "@/lib/api";

interface Props {
  habits: Habit[];
  level: number;
  onHabitToggled?: (habitId: number, completed: boolean) => void;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function toMonthParam(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function toDateParam(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function MonthlyHabitTracker({
  habits,
  level,
  onHabitToggled,
}: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);

  // completions[habitId][day] = boolean
  const [completions, setCompletions] = useState<
    Record<string, Record<string, boolean>>
  >({});
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const totalDays = daysInMonth(viewYear, viewMonth);
  const isCurrentMonth =
    viewYear === today.getFullYear() && viewMonth === today.getMonth() + 1;
  const todayDay = today.getDate();

  // Level row limits
  const maxRows =
    level === 1 ? 1 : level === 2 ? 3 : level === 3 ? 6 : undefined;
  const visibleHabits =
    maxRows !== undefined ? habits.slice(0, maxRows) : habits;

  // ── Fetch logs from backend whenever month or habits change ──────────────
  useEffect(() => {
    if (visibleHabits.length === 0) {
      setLoadingLogs(false);
      return;
    }

    setLoadingLogs(true);
    getHabitLogs(toMonthParam(viewYear, viewMonth))
      .then((data) => {
        // data shape: { "42": { "1": true, "5": true }, ... }
        // Seed all visible habits with empty records first
        const seeded: Record<string, Record<string, boolean>> = {};
        for (const h of visibleHabits) {
          seeded[String(h.id)] = data[String(h.id)] ?? {};
        }

        // For today in current month, trust the live completed_today prop
        if (isCurrentMonth) {
          for (const h of visibleHabits) {
            seeded[String(h.id)][String(todayDay)] = h.completed_today;
          }
        }

        setCompletions(seeded);
      })
      .catch(() => {
        // On error, fall back to empty (don't crash the UI)
        const empty: Record<string, Record<string, boolean>> = {};
        for (const h of visibleHabits) {
          empty[String(h.id)] = {};
        }
        setCompletions(empty);
      })
      .finally(() => setLoadingLogs(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewYear, viewMonth, habits.length]);

  // ── Keep today's cell in sync when dashboard toggles a habit ────────────
  useEffect(() => {
    if (!isCurrentMonth) return;
    setCompletions((prev) => {
      const next = { ...prev };
      for (const h of visibleHabits) {
        const hid = String(h.id);
        next[hid] = {
          ...(next[hid] || {}),
          [String(todayDay)]: h.completed_today,
        };
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habits]);

  const handleCellClick = async (habit: Habit, day: number) => {
    // Block future days
    if (isCurrentMonth && day > todayDay) return;
    if (
      viewYear > today.getFullYear() ||
      (viewYear === today.getFullYear() && viewMonth > today.getMonth() + 1)
    )
      return;

    const hid = String(habit.id);
    const dayStr = String(day);
    const current = completions[hid]?.[dayStr] ?? false;
    const next = !current;
    const saveKey = `${habit.id}-${day}`;

    // Optimistic update
    setCompletions((prev) => ({
      ...prev,
      [hid]: { ...(prev[hid] || {}), [dayStr]: next },
    }));

    setSaving(saveKey);
    try {
      const dateParam = toDateParam(viewYear, viewMonth, day);
      await logHabit(habit.id, next, dateParam);

      // If this was today, propagate streak update up
      if (isCurrentMonth && day === todayDay) {
        onHabitToggled?.(habit.id, next);
      }
    } catch {
      // Rollback on failure
      setCompletions((prev) => ({
        ...prev,
        [hid]: { ...(prev[hid] || {}), [dayStr]: current },
      }));
    } finally {
      setSaving(null);
    }
  };

  const goToPrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };

  const goToNextMonth = () => {
    if (isCurrentMonth) return;
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const monthName = new Date(viewYear, viewMonth - 1).toLocaleString(
    "default",
    { month: "long", year: "numeric" },
  );

  const getCompletionRate = (habitId: number) => {
    const entries = completions[String(habitId)] || {};
    const relevantDays = isCurrentMonth ? todayDay : totalDays;
    let done = 0;
    for (let d = 1; d <= relevantDays; d++) {
      if (entries[String(d)]) done++;
    }
    return relevantDays > 0 ? Math.round((done / relevantDays) * 100) : 0;
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "20px",
        border: "1px solid rgba(30,58,47,0.08)",
        overflowX: "auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "20px",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "10px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(30,58,47,0.35)",
              fontFamily: "DM Sans, sans-serif",
              margin: "0 0 4px",
            }}
          >
            Habit Tracker
          </p>
          <p
            style={{
              fontSize: "18px",
              fontFamily: "Playfair Display, serif",
              fontWeight: 700,
              color: "var(--forest, #1E3A2F)",
              margin: 0,
            }}
          >
            {monthName}
          </p>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button onClick={goToPrevMonth} style={navBtnStyle}>
            ‹
          </button>
          <button
            onClick={goToNextMonth}
            style={{
              ...navBtnStyle,
              opacity: isCurrentMonth ? 0.3 : 1,
              cursor: isCurrentMonth ? "default" : "pointer",
            }}
            disabled={isCurrentMonth}
          >
            ›
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loadingLogs ? (
        <div
          style={{
            padding: "32px 0",
            textAlign: "center",
            fontSize: "13px",
            fontFamily: "DM Sans, sans-serif",
            color: "rgba(30,58,47,0.3)",
            fontStyle: "italic",
          }}
        >
          Loading your history…
        </div>
      ) : (
        <>
          {/* Grid */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", minWidth: "100%" }}>
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      paddingRight: "16px",
                      paddingBottom: "10px",
                      fontSize: "10px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "rgba(30,58,47,0.3)",
                      fontFamily: "DM Sans, sans-serif",
                      fontWeight: 500,
                      minWidth: "100px",
                    }}
                  >
                    Habit
                  </th>
                  {Array.from({ length: totalDays }, (_, i) => i + 1).map(
                    (day) => (
                      <th
                        key={day}
                        style={{
                          width: "28px",
                          minWidth: "28px",
                          paddingBottom: "10px",
                          fontSize: "10px",
                          color:
                            isCurrentMonth && day === todayDay
                              ? "var(--amber, #C4793A)"
                              : "rgba(30,58,47,0.3)",
                          fontFamily: "DM Sans, sans-serif",
                          fontWeight:
                            isCurrentMonth && day === todayDay ? 700 : 400,
                          textAlign: "center",
                          position: "relative",
                        }}
                      >
                        {day}
                        {isCurrentMonth && day === todayDay && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: 2,
                              left: "50%",
                              transform: "translateX(-50%)",
                              width: "4px",
                              height: "4px",
                              borderRadius: "50%",
                              background: "var(--amber, #C4793A)",
                            }}
                          />
                        )}
                      </th>
                    ),
                  )}
                  <th
                    style={{
                      paddingLeft: "12px",
                      paddingBottom: "10px",
                      fontSize: "10px",
                      color: "rgba(30,58,47,0.3)",
                      fontFamily: "DM Sans, sans-serif",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleHabits.map((habit) => {
                  const rate = getCompletionRate(habit.id);
                  return (
                    <tr key={habit.id}>
                      <td
                        style={{
                          paddingRight: "16px",
                          paddingBottom: "8px",
                          fontSize: "13px",
                          fontFamily: "DM Sans, sans-serif",
                          color: "var(--forest, #1E3A2F)",
                          maxWidth: "100px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={habit.name}
                      >
                        {habit.name.length > 12
                          ? habit.name.slice(0, 12) + "…"
                          : habit.name}
                      </td>
                      {Array.from({ length: totalDays }, (_, i) => i + 1).map(
                        (day) => {
                          const isFuture =
                            (isCurrentMonth && day > todayDay) ||
                            viewYear > today.getFullYear() ||
                            (viewYear === today.getFullYear() &&
                              viewMonth > today.getMonth() + 1);
                          const isToday = isCurrentMonth && day === todayDay;
                          const done =
                            completions[String(habit.id)]?.[String(day)] ??
                            false;
                          const isSaving = saving === `${habit.id}-${day}`;

                          return (
                            <td
                              key={day}
                              style={{
                                paddingBottom: "8px",
                                textAlign: "center",
                              }}
                            >
                              <button
                                onClick={() => handleCellClick(habit, day)}
                                disabled={isFuture || isSaving}
                                style={{
                                  width: "22px",
                                  height: "22px",
                                  borderRadius: "6px",
                                  border: isFuture
                                    ? "1px dashed rgba(30,58,47,0.12)"
                                    : isToday && !done
                                      ? "1.5px solid rgba(196,121,58,0.4)"
                                      : done
                                        ? "none"
                                        : "1px solid rgba(30,58,47,0.15)",
                                  background: done
                                    ? "var(--sage, #8BAF8D)"
                                    : isToday
                                      ? "rgba(196,121,58,0.08)"
                                      : "rgba(30,58,47,0.04)",
                                  cursor: isFuture ? "default" : "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  transition: "all 0.15s ease",
                                  opacity: isSaving ? 0.5 : 1,
                                }}
                              >
                                {done && !isSaving && (
                                  <svg
                                    width="10"
                                    height="8"
                                    viewBox="0 0 10 8"
                                    fill="none"
                                  >
                                    <path
                                      d="M1 3.5L3.5 6.5L9 1"
                                      stroke="white"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                )}
                                {isSaving && (
                                  <div
                                    style={{
                                      width: "6px",
                                      height: "6px",
                                      borderRadius: "50%",
                                      border: "1.5px solid rgba(30,58,47,0.3)",
                                      borderTopColor: "var(--sage, #8BAF8D)",
                                      animation: "spin 0.6s linear infinite",
                                    }}
                                  />
                                )}
                              </button>
                            </td>
                          );
                        },
                      )}
                      <td
                        style={{
                          paddingLeft: "12px",
                          paddingBottom: "8px",
                          textAlign: "right",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            fontFamily: "DM Sans, sans-serif",
                            fontWeight: 600,
                            color:
                              rate >= 80
                                ? "var(--sage, #8BAF8D)"
                                : rate >= 50
                                  ? "var(--amber, #C4793A)"
                                  : "rgba(30,58,47,0.3)",
                          }}
                        >
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "16px",
              paddingTop: "14px",
              borderTop: "1px solid rgba(30,58,47,0.06)",
            }}
          >
            {[
              { color: "var(--sage, #8BAF8D)", label: "Done" },
              {
                color: "rgba(196,121,58,0.08)",
                label: "Today",
                border: "1.5px solid rgba(196,121,58,0.4)",
              },
              {
                color: "rgba(30,58,47,0.04)",
                label: "Missed",
                border: "1px solid rgba(30,58,47,0.15)",
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "3px",
                    background: item.color,
                    border: item.border,
                  }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    color: "rgba(30,58,47,0.4)",
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  width: "30px",
  height: "30px",
  borderRadius: "8px",
  border: "1px solid rgba(30,58,47,0.12)",
  background: "transparent",
  color: "rgba(30,58,47,0.5)",
  fontSize: "16px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "DM Sans, sans-serif",
};
