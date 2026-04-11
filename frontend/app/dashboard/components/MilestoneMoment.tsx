"use client";

import { useEffect, useState } from "react";
import { acknowledgeMilestone } from "@/lib/api";

interface MilestoneMomentProps {
  streakDay: number;
  userName: string;
  onDismiss: () => void;
}

const MILESTONE_CONTENT: Record<
  number,
  { headline: string; body: string; sub: string }
> = {
  7: {
    headline: "Seven days.",
    body: "You've shown up for seven days in a row. That might sound small. It isn't.",
    sub: "Most people never make it past day three. You just proved something to yourself.",
  },
  21: {
    headline: "Twenty-one days.",
    body: "That's who you're becoming.",
    sub: "Twenty-one days is where intention becomes identity. You're not trying to build a habit anymore — you're living one.",
  },
  50: {
    headline: "Fifty days.",
    body: "You've been doing this for fifty days.",
    sub: "Fifty days of choosing yourself when it was easy and when it wasn't. That kind of consistency is rare. Genuinely rare.",
  },
  100: {
    headline: "One hundred days.",
    body: "You showed up a hundred times.",
    sub: "Not perfectly. Not without struggle. But you kept coming back. That's not discipline — that's love for yourself.",
  },
  365: {
    headline: "A whole year.",
    body: "365 days ago, you began. Look how far you've come.",
    sub: "A year of showing up. A year of small wins, hard days, rest days, and return days. You did this. You.",
  },
};

export default function MilestoneMoment({
  streakDay,
  userName,
  onDismiss,
}: MilestoneMomentProps) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const content = MILESTONE_CONTENT[streakDay] || MILESTONE_CONTENT[7];

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);

  const handleDismiss = async () => {
    setLeaving(true);
    await acknowledgeMilestone(streakDay).catch(() => {});
    setTimeout(() => onDismiss(), 600);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--forest, #1E3A2F)",
        opacity: visible && !leaving ? 1 : 0,
        transition: "opacity 0.6s ease",
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      {/* Particle dots */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: "var(--amber, #C4793A)",
            opacity: 0.4,
            top: `${10 + Math.random() * 80}%`,
            left: `${5 + Math.random() * 90}%`,
            animation: `float${i % 3} ${3 + (i % 4)}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}

      {/* Day number */}
      <div
        style={{
          fontSize: "80px",
          fontFamily: "Playfair Display, serif",
          color: "var(--amber, #C4793A)",
          lineHeight: 1,
          marginBottom: "8px",
          fontWeight: 700,
        }}
      >
        {streakDay}
      </div>

      <div
        style={{
          fontSize: "13px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(245, 240, 232, 0.5)",
          fontFamily: "DM Sans, sans-serif",
          marginBottom: "40px",
        }}
      >
        days
      </div>

      <h1
        style={{
          fontSize: "clamp(28px, 5vw, 42px)",
          fontFamily: "Playfair Display, serif",
          color: "var(--cream, #F5F0E8)",
          fontWeight: 700,
          marginBottom: "20px",
          lineHeight: 1.2,
          maxWidth: "480px",
        }}
      >
        {content.headline}
      </h1>

      <p
        style={{
          fontSize: "18px",
          fontFamily: "DM Sans, sans-serif",
          color: "rgba(245, 240, 232, 0.85)",
          maxWidth: "420px",
          lineHeight: 1.7,
          marginBottom: "20px",
        }}
      >
        {userName && (
          <span style={{ color: "var(--amber, #C4793A)" }}>{userName}, </span>
        )}
        {content.body}
      </p>

      <p
        style={{
          fontSize: "15px",
          fontFamily: "DM Sans, sans-serif",
          color: "rgba(245, 240, 232, 0.55)",
          maxWidth: "380px",
          lineHeight: 1.7,
          marginBottom: "52px",
          fontStyle: "italic",
        }}
      >
        {content.sub}
      </p>

      {/* Divider line */}
      <div
        style={{
          width: "48px",
          height: "1px",
          background: "rgba(196, 121, 58, 0.4)",
          marginBottom: "32px",
        }}
      />

      <button
        onClick={handleDismiss}
        style={{
          background: "transparent",
          border: "1px solid rgba(245, 240, 232, 0.25)",
          borderRadius: "100px",
          padding: "12px 32px",
          color: "var(--cream, #F5F0E8)",
          fontFamily: "DM Sans, sans-serif",
          fontSize: "14px",
          cursor: "pointer",
          letterSpacing: "0.05em",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.background =
            "rgba(245,240,232,0.1)";
          (e.target as HTMLButtonElement).style.borderColor =
            "rgba(245,240,232,0.5)";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.background = "transparent";
          (e.target as HTMLButtonElement).style.borderColor =
            "rgba(245,240,232,0.25)";
        }}
      >
        Keep going →
      </button>

      <style>{`
        @keyframes float0 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes float1 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes float2 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-16px); } }
      `}</style>
    </div>
  );
}
