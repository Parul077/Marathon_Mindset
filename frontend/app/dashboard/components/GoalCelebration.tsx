"use client";

import { useEffect, useState } from "react";

interface GoalCelebrationProps {
  goalTitle: string;
  onDismiss: () => void;
}

export default function GoalCelebration({
  goalTitle,
  onDismiss,
}: GoalCelebrationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fade in
    const t1 = setTimeout(() => setVisible(true), 30);
    // Auto-dismiss after 5s
    const t2 = setTimeout(() => handleDismiss(), 5500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 400);
  };

  const CELEBRATION_LINES = [
    "You set your sights on something — and you got there.",
    "Goals are just promises you make to yourself. You kept this one.",
    "Something you once imagined is now something you did.",
    "This is what showing up looks like, over time.",
  ];

  const line =
    CELEBRATION_LINES[Math.floor(Math.random() * CELEBRATION_LINES.length)];

  return (
    <div
      onClick={handleDismiss}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "var(--forest, #1E3A2F)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 32px",
        textAlign: "center",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease",
        cursor: "pointer",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          width: "320px",
          height: "320px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(196,121,58,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Check mark ring */}
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          border: "2px solid rgba(196,121,58,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "32px",
          position: "relative",
          animation: visible ? "goalRing 0.6s ease forwards" : "none",
        }}
      >
        <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
          <path
            d="M2 11L10 19L26 3"
            stroke="var(--amber, #C4793A)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 50,
              strokeDashoffset: visible ? 0 : 50,
              transition: "stroke-dashoffset 0.7s ease 0.2s",
            }}
          />
        </svg>
      </div>

      <p
        style={{
          fontSize: "11px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--amber, #C4793A)",
          fontFamily: "DM Sans, sans-serif",
          marginBottom: "16px",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(8px)",
          transition: "all 0.5s ease 0.15s",
        }}
      >
        Goal complete
      </p>

      <h1
        style={{
          fontSize: "clamp(22px, 5vw, 32px)",
          fontFamily: "Playfair Display, serif",
          color: "var(--cream, #F5F0E8)",
          fontWeight: 700,
          lineHeight: 1.3,
          margin: "0 0 20px",
          maxWidth: "480px",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(10px)",
          transition: "all 0.5s ease 0.25s",
        }}
      >
        {goalTitle}
      </h1>

      <div
        style={{
          width: "40px",
          height: "1px",
          background: "rgba(245,240,232,0.15)",
          margin: "0 auto 20px",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.5s ease 0.35s",
        }}
      />

      <p
        style={{
          fontSize: "16px",
          fontFamily: "Playfair Display, serif",
          fontStyle: "italic",
          color: "rgba(245,240,232,0.55)",
          lineHeight: 1.7,
          maxWidth: "360px",
          margin: "0 0 48px",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(8px)",
          transition: "all 0.5s ease 0.4s",
        }}
      >
        "{line}"
      </p>

      <p
        style={{
          fontSize: "11px",
          fontFamily: "DM Sans, sans-serif",
          color: "rgba(245,240,232,0.2)",
          letterSpacing: "0.08em",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.5s ease 0.6s",
        }}
      >
        Tap anywhere to continue
      </p>

      <style>{`
        @keyframes goalRing {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
