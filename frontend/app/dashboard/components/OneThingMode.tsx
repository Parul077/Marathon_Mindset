"use client";

import { toggleOneThingMode } from "@/lib/api";

interface OneThingModeProps {
  enabled: boolean;
  habitName: string;
  habitId: number | null;
  journalPrompt: string;
  onHabitDone: () => void;
  onJournalSave: (entry: string) => void;
  onWinSave: (win: string) => void;
  onToggleOff: () => void;
}

const ONE_THING_PROMPTS = [
  "What's one small thing you can do for yourself today?",
  "What would make today feel worth it?",
  "If today only had one win, what would you want it to be?",
];

export default function OneThingMode({
  enabled,
  habitName,
  habitId,
  journalPrompt,
  onHabitDone,
  onJournalSave,
  onWinSave,
  onToggleOff,
}: OneThingModeProps) {
  const prompt =
    ONE_THING_PROMPTS[new Date().getDay() % ONE_THING_PROMPTS.length];

  const handleToggleOff = async () => {
    await toggleOneThingMode(false).catch(() => {});
    onToggleOff();
  };

  if (!enabled) return null;

  return (
    <div
      style={{
        background: "var(--cream, #F5F0E8)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      {/* Toggle off hint */}
      <button
        onClick={handleToggleOff}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          background: "transparent",
          border: "none",
          fontSize: "12px",
          color: "rgba(30,58,47,0.35)",
          cursor: "pointer",
          letterSpacing: "0.06em",
          fontFamily: "DM Sans, sans-serif",
        }}
      >
        See full dashboard →
      </button>

      <div style={{ maxWidth: "440px", width: "100%" }}>
        {/* Label */}
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "rgba(30,58,47,0.4)",
            marginBottom: "40px",
            textAlign: "center",
          }}
        >
          One thing mode · Take it easy
        </p>

        {/* Section 1: One habit */}
        {habitName && (
          <OneSection label="Your one habit" number="01">
            <HabitCheck
              name={habitName}
              habitId={habitId}
              onDone={onHabitDone}
            />
          </OneSection>
        )}

        {/* Section 2: One question */}
        <OneSection label="One question" number="02">
          <JournalPrompt prompt={prompt} onSave={onJournalSave} />
        </OneSection>

        {/* Section 3: One win */}
        <OneSection label="One win" number="03">
          <WinField onSave={onWinSave} />
        </OneSection>
      </div>
    </div>
  );
}

function OneSection({
  label,
  number,
  children,
}: {
  label: string;
  number: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "48px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            color: "rgba(196,121,58,0.6)",
            fontFamily: "Playfair Display, serif",
            fontStyle: "italic",
          }}
        >
          {number}
        </span>
        <div
          style={{ flex: 1, height: "1px", background: "rgba(30,58,47,0.08)" }}
        />
        <span
          style={{
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(30,58,47,0.4)",
          }}
        >
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

function HabitCheck({
  name,
  habitId,
  onDone,
}: {
  name: string;
  habitId: number | null;
  onDone: () => void;
}) {
  const [done, setDone] = useState(false);

  const handle = async () => {
    if (done || !habitId) return;
    const { logHabit } = await import("@/lib/api");
    await logHabit(habitId, true).catch(() => {});
    setDone(true);
    onDone();
  };

  return (
    <button
      onClick={handle}
      style={{
        width: "100%",
        background: done ? "rgba(139,175,141,0.15)" : "rgba(30,58,47,0.04)",
        border: `1px solid ${done ? "rgba(139,175,141,0.4)" : "rgba(30,58,47,0.1)"}`,
        borderRadius: "12px",
        padding: "16px 20px",
        textAlign: "left",
        cursor: done ? "default" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        transition: "all 0.3s ease",
      }}
    >
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
          <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
            <path
              d="M1 4L4.5 7.5L11 1"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <span
        style={{
          fontSize: "16px",
          color: done ? "var(--sage, #8BAF8D)" : "var(--forest, #1E3A2F)",
          fontFamily: "DM Sans, sans-serif",
          textDecoration: done ? "line-through" : "none",
          transition: "all 0.3s ease",
        }}
      >
        {name}
      </span>
    </button>
  );
}

function JournalPrompt({
  prompt,
  onSave,
}: {
  prompt: string;
  onSave: (entry: string) => void;
}) {
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);

  const handle = async () => {
    if (!value.trim() || saved) return;
    const { saveJournal } = await import("@/lib/api");
    await saveJournal(value).catch(() => {});
    setSaved(true);
    onSave(value);
  };

  return (
    <div>
      <p
        style={{
          fontSize: "15px",
          color: "var(--forest, #1E3A2F)",
          fontFamily: "Playfair Display, serif",
          fontStyle: "italic",
          marginBottom: "12px",
          lineHeight: 1.5,
        }}
      >
        {prompt}
      </p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="A few words is enough..."
        rows={3}
        disabled={saved}
        style={{
          width: "100%",
          background: saved ? "rgba(139,175,141,0.08)" : "rgba(30,58,47,0.03)",
          border: `1px solid ${saved ? "rgba(139,175,141,0.3)" : "rgba(30,58,47,0.1)"}`,
          borderRadius: "10px",
          padding: "12px 14px",
          fontSize: "14px",
          fontFamily: "DM Sans, sans-serif",
          color: "var(--forest, #1E3A2F)",
          resize: "none",
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.2s",
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handle();
        }}
      />
      {!saved && value.trim() && (
        <button
          onClick={handle}
          style={{
            marginTop: "8px",
            background: "var(--forest, #1E3A2F)",
            color: "var(--cream, #F5F0E8)",
            border: "none",
            borderRadius: "8px",
            padding: "9px 20px",
            fontSize: "13px",
            fontFamily: "DM Sans, sans-serif",
            cursor: "pointer",
          }}
        >
          Save
        </button>
      )}
    </div>
  );
}

function WinField({ onSave }: { onSave: (win: string) => void }) {
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);

  const handle = async () => {
    if (!value.trim() || saved) return;
    const { logWin } = await import("@/lib/api");
    await logWin(value).catch(() => {});
    setSaved(true);
    onSave(value);
  };

  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Something small counts..."
        disabled={saved}
        style={{
          width: "100%",
          background: saved ? "rgba(196,121,58,0.08)" : "rgba(30,58,47,0.03)",
          border: `1px solid ${saved ? "rgba(196,121,58,0.3)" : "rgba(30,58,47,0.1)"}`,
          borderRadius: "10px",
          padding: "13px 16px",
          fontSize: "14px",
          fontFamily: "DM Sans, sans-serif",
          color: "var(--forest, #1E3A2F)",
          outline: "none",
          boxSizing: "border-box",
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") handle();
        }}
      />
      {saved && (
        <p
          style={{
            fontSize: "12px",
            color: "var(--sage, #8BAF8D)",
            marginTop: "6px",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          ✓ Logged. That matters.
        </p>
      )}
    </div>
  );
}

// Need to import useState inside component file
import { useState } from "react";
