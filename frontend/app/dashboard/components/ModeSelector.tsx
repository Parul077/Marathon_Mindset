"use client";

import { useState } from "react";

export type AppMode = "normal" | "one-thing" | "slow-down";

interface ModeSelectorProps {
  currentMode: AppMode;
  userName: string;
  onSelect: (mode: AppMode) => void;
  onClose: () => void;
}

const MODES = [
  {
    key: "normal" as AppMode,
    icon: "◎",
    name: "Full Dashboard",
    tagline: "Everything at your own pace",
    description:
      "All your habits, journal prompts, wins, and goals. The complete view — for days when you have the capacity.",
    when: "When you're feeling steady and want the full picture.",
    color: "var(--forest, #1E3A2F)",
    bg: "rgba(30,58,47,0.04)",
    border: "rgba(30,58,47,0.12)",
  },
  {
    key: "one-thing" as AppMode,
    icon: "⊙",
    name: "One Thing Mode",
    tagline: "Strip it down to what matters",
    description:
      "One habit. One journal question. One win. That's it. When everything feels like too much, this is enough.",
    when: "When you're overwhelmed, busy, or just need a simpler day.",
    color: "var(--amber, #C4793A)",
    bg: "rgba(196,121,58,0.05)",
    border: "rgba(196,121,58,0.2)",
  },
  {
    key: "slow-down" as AppMode,
    icon: "🌙",
    name: "Slow Down Mode",
    tagline: "Rest is part of the journey",
    description:
      "A quiet space with a calming poem, your streak shown as safe, and an optional journal. No tasks. No pressure.",
    when: "When today was hard and you need to be held, not pushed.",
    color: "rgba(139,175,141,1)",
    bg: "rgba(139,175,141,0.06)",
    border: "rgba(139,175,141,0.25)",
  },
];

export default function ModeSelector({
  currentMode,
  userName,
  onSelect,
  onClose,
}: ModeSelectorProps) {
  const [hovered, setHovered] = useState<AppMode | null>(null);
  const [selected, setSelected] = useState<AppMode | null>(null);

  const handleSelect = (mode: AppMode) => {
    setSelected(mode);
    setTimeout(() => {
      onSelect(mode);
    }, 280);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 150,
        background: "var(--cream, #F5F0E8)",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          borderBottom: "1px solid rgba(30,58,47,0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontFamily: "Playfair Display, serif",
            fontSize: "15px",
            color: "var(--forest, #1E3A2F)",
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
        </div>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(30,58,47,0.4)",
            fontSize: "20px",
            cursor: "pointer",
            lineHeight: 1,
            padding: "4px 8px",
          }}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: "560px",
          margin: "0 auto",
          padding: "48px 24px 80px",
          width: "100%",
        }}
      >
        {/* Heading */}
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(30,58,47,0.35)",
            fontFamily: "DM Sans, sans-serif",
            marginBottom: "12px",
          }}
        >
          Choose your mode
        </p>
        <h1
          style={{
            fontSize: "clamp(24px, 5vw, 32px)",
            fontFamily: "Playfair Display, serif",
            color: "var(--forest, #1E3A2F)",
            fontWeight: 700,
            lineHeight: 1.2,
            margin: "0 0 8px",
          }}
        >
          How are you today,{" "}
          <span style={{ color: "var(--amber, #C4793A)" }}>
            {userName.split(" ")[0]}
          </span>
          ?
        </h1>
        <p
          style={{
            fontSize: "14px",
            fontFamily: "DM Sans, sans-serif",
            color: "rgba(30,58,47,0.45)",
            lineHeight: 1.6,
            margin: "0 0 40px",
          }}
        >
          Your dashboard adapts to how you're feeling. Pick the mode that
          matches today's energy.
        </p>

        {/* Mode cards */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            marginBottom: "40px",
          }}
        >
          {MODES.map((mode) => {
            const isActive = currentMode === mode.key;
            const isHovered = hovered === mode.key;
            const isSelected = selected === mode.key;

            return (
              <button
                key={mode.key}
                onClick={() => handleSelect(mode.key)}
                onMouseEnter={() => setHovered(mode.key)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: isSelected
                    ? mode.bg
                    : isActive
                      ? mode.bg
                      : isHovered
                        ? "rgba(30,58,47,0.03)"
                        : "white",
                  border: `1.5px solid ${isActive || isSelected ? mode.border : isHovered ? "rgba(30,58,47,0.1)" : "rgba(30,58,47,0.07)"}`,
                  borderRadius: "16px",
                  padding: "20px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  position: "relative",
                  opacity: isSelected ? 0.85 : 1,
                }}
              >
                {/* Active badge */}
                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      top: "14px",
                      right: "14px",
                      background: mode.color,
                      color: "white",
                      fontSize: "9px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      fontFamily: "DM Sans, sans-serif",
                      padding: "3px 8px",
                      borderRadius: "100px",
                      fontWeight: 600,
                    }}
                  >
                    Active
                  </div>
                )}

                {/* Icon + name */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "10px",
                  }}
                >
                  <span style={{ fontSize: "20px", lineHeight: 1 }}>
                    {mode.icon}
                  </span>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "15px",
                        fontFamily: "Playfair Display, serif",
                        fontWeight: 700,
                        color: "var(--forest, #1E3A2F)",
                        lineHeight: 1.2,
                      }}
                    >
                      {mode.name}
                    </p>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: "12px",
                        fontFamily: "DM Sans, sans-serif",
                        color: mode.color,
                        opacity: 0.8,
                      }}
                    >
                      {mode.tagline}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p
                  style={{
                    margin: "0 0 10px",
                    fontSize: "13px",
                    fontFamily: "DM Sans, sans-serif",
                    color: "rgba(30,58,47,0.6)",
                    lineHeight: 1.6,
                  }}
                >
                  {mode.description}
                </p>

                {/* When to use */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    paddingTop: "10px",
                    borderTop: "1px solid rgba(30,58,47,0.06)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "rgba(30,58,47,0.3)",
                      fontFamily: "DM Sans, sans-serif",
                      flexShrink: 0,
                      paddingTop: "1px",
                    }}
                  >
                    Use when
                  </span>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      fontFamily: "Playfair Display, serif",
                      fontStyle: "italic",
                      color: "rgba(30,58,47,0.45)",
                      lineHeight: 1.5,
                    }}
                  >
                    {mode.when}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Philosophy note */}
        <div
          style={{
            borderTop: "1px solid rgba(30,58,47,0.08)",
            paddingTop: "28px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              fontFamily: "Playfair Display, serif",
              fontStyle: "italic",
              color: "rgba(30,58,47,0.35)",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            "Life isn't meant to rush or race, or chase another's hurried pace."
          </p>
          <p
            style={{
              fontSize: "11px",
              fontFamily: "DM Sans, sans-serif",
              color: "rgba(30,58,47,0.25)",
              marginTop: "6px",
            }}
          >
            You can switch modes any time. No commitment.
          </p>
        </div>
      </div>
    </div>
  );
}
