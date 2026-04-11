"use client";

import { useState } from "react";
import { unlockLevel, type NextLevel } from "@/lib/api";

interface UnlockPreviewCardProps {
  currentLevel: number;
  nextLevel: NextLevel;
  daysJoined: number;
  onUnlocked: (newLevel: number) => void;
}

export default function UnlockPreviewCard({
  currentLevel,
  nextLevel,
  daysJoined,
  onUnlocked,
}: UnlockPreviewCardProps) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleUnlock = async () => {
    setLoading(true);
    try {
      const res = await unlockLevel(nextLevel.level);
      onUnlocked(res.disclosure_level);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  const daysLeft = nextLevel.days_until_auto;
  const autoSoon = daysLeft !== null && daysLeft <= 2 && daysLeft > 0;
  const autoToday = daysLeft === 0;

  return (
    <div
      style={{
        border: "1px solid rgba(196,121,58,0.2)",
        borderRadius: "14px",
        padding: "20px",
        background: "rgba(196,121,58,0.04)",
        marginTop: "8px",
      }}
    >
      {!confirming ? (
        <>
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "14px",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(196,121,58,0.7)",
                  fontFamily: "DM Sans, sans-serif",
                  marginBottom: "4px",
                }}
              >
                {autoToday
                  ? "🎉 Ready to unlock"
                  : autoSoon
                    ? `Unlocks in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`
                    : `Level ${nextLevel.level} coming up`}
              </p>
              <p
                style={{
                  fontSize: "16px",
                  fontFamily: "Playfair Display, serif",
                  color: "var(--forest, #1E3A2F)",
                  margin: 0,
                  fontWeight: 700,
                }}
              >
                {nextLevel.name}
              </p>
            </div>
            <button
              onClick={() => setDismissed(true)}
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(30,58,47,0.25)",
                fontSize: "18px",
                cursor: "pointer",
                padding: "0 0 0 8px",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          {/* Tagline */}
          <p
            style={{
              fontSize: "13px",
              fontFamily: "DM Sans, sans-serif",
              color: "rgba(30,58,47,0.55)",
              marginBottom: "14px",
              fontStyle: "italic",
              lineHeight: 1.5,
            }}
          >
            "{nextLevel.tagline}"
          </p>

          {/* Feature list */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              marginBottom: "18px",
            }}
          >
            {nextLevel.features.map((f) => (
              <div
                key={f}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <div
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "var(--amber, #C4793A)",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "13px",
                    fontFamily: "DM Sans, sans-serif",
                    color: "rgba(30,58,47,0.6)",
                  }}
                >
                  {f}
                </span>
              </div>
            ))}
          </div>

          {/* Auto unlock countdown OR unlock now button */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => setConfirming(true)}
              style={{
                background: "var(--forest, #1E3A2F)",
                color: "var(--cream, #F5F0E8)",
                border: "none",
                borderRadius: "8px",
                padding: "9px 18px",
                fontSize: "13px",
                fontFamily: "DM Sans, sans-serif",
                cursor: "pointer",
              }}
            >
              {autoToday ? "Unlock now →" : "I'm ready, unlock early →"}
            </button>

            {daysLeft !== null && daysLeft > 0 && (
              <span
                style={{
                  fontSize: "12px",
                  color: "rgba(30,58,47,0.35)",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                or auto-unlocks in {daysLeft} day{daysLeft === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </>
      ) : (
        /* Confirmation step */
        <div>
          <p
            style={{
              fontSize: "15px",
              fontFamily: "Playfair Display, serif",
              color: "var(--forest, #1E3A2F)",
              marginBottom: "8px",
              lineHeight: 1.4,
            }}
          >
            Starting simple helps habits stick.
          </p>
          <p
            style={{
              fontSize: "13px",
              fontFamily: "DM Sans, sans-serif",
              color: "rgba(30,58,47,0.5)",
              marginBottom: "18px",
              lineHeight: 1.5,
            }}
          >
            But you know yourself best. If you're ready for more, go for it.
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleUnlock}
              disabled={loading}
              style={{
                background: "var(--forest, #1E3A2F)",
                color: "var(--cream, #F5F0E8)",
                border: "none",
                borderRadius: "8px",
                padding: "10px 18px",
                fontSize: "13px",
                fontFamily: "DM Sans, sans-serif",
                cursor: "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Unlocking..." : "Yes, show me more"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              style={{
                background: "transparent",
                color: "rgba(30,58,47,0.45)",
                border: "1px solid rgba(30,58,47,0.12)",
                borderRadius: "8px",
                padding: "10px 18px",
                fontSize: "13px",
                fontFamily: "DM Sans, sans-serif",
                cursor: "pointer",
              }}
            >
              Keep it simple for now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
