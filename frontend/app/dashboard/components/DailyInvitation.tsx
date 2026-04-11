"use client";

import { useEffect, useState } from "react";
import { getDailyInvitation, tryInvitation } from "@/lib/api";

export default function DailyInvitation() {
  const [invitation, setInvitation] = useState<string | null>(null);
  const [triedToday, setTriedToday] = useState(false);
  const [logging, setLogging] = useState(false);
  const [visible, setVisible] = useState(false);
  const [justTried, setJustTried] = useState(false);

  useEffect(() => {
    getDailyInvitation()
      .then((data) => {
        setInvitation(data.invitation);
        setTriedToday(data.tried_today);
        setTimeout(() => setVisible(true), 150);
      })
      .catch(() => {});
  }, []);

  const handleTry = async () => {
    if (logging || triedToday) return;
    setLogging(true);
    try {
      await tryInvitation();
      setTriedToday(true);
      setJustTried(true);
    } catch {
      // Silent fail — the invitation is still shown
    } finally {
      setLogging(false);
    }
  };

  if (!invitation) return null;

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: "all 0.5s ease",
        marginBottom: "36px",
      }}
    >
      {/* Section label */}
      <h2
        style={{
          fontSize: "11px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(30,58,47,0.4)",
          margin: "0 0 14px",
          fontWeight: 500,
          fontFamily: "DM Sans, sans-serif",
        }}
      >
        Today's invitation
      </h2>

      <div
        style={{
          background: triedToday
            ? "rgba(139,175,141,0.08)"
            : "rgba(196,121,58,0.05)",
          border: `1px solid ${triedToday ? "rgba(139,175,141,0.2)" : "rgba(196,121,58,0.15)"}`,
          borderRadius: "14px",
          padding: "20px 22px",
          transition: "all 0.4s ease",
        }}
      >
        {/* Top row — leaf icon + "optional" tag */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <span style={{ fontSize: "16px", opacity: 0.7 }}>🌿</span>
          <span
            style={{
              fontSize: "10px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontFamily: "DM Sans, sans-serif",
              color: "rgba(30,58,47,0.3)",
            }}
          >
            Optional · No pressure
          </span>
        </div>

        {/* Invitation text */}
        <p
          style={{
            fontFamily: "Playfair Display, serif",
            fontStyle: "italic",
            fontSize: "16px",
            color: "var(--forest, #1E3A2F)",
            lineHeight: 1.7,
            margin: "0 0 18px",
          }}
        >
          {invitation}
        </p>

        {/* Bottom row — button or confirmation */}
        {triedToday ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                background: "var(--sage, #8BAF8D)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                <path
                  d="M1 3L3.5 5.5L8 1"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: "13px",
                color: "var(--sage, #8BAF8D)",
                margin: 0,
              }}
            >
              {justTried
                ? "You tried this today. That's something."
                : "You tried this today."}
            </p>
          </div>
        ) : (
          <button
            onClick={handleTry}
            disabled={logging}
            style={{
              background: "transparent",
              border: "1px solid rgba(30,58,47,0.15)",
              borderRadius: "100px",
              padding: "8px 20px",
              fontSize: "13px",
              fontFamily: "DM Sans, sans-serif",
              color: "rgba(30,58,47,0.55)",
              cursor: logging ? "default" : "pointer",
              opacity: logging ? 0.6 : 1,
              transition: "all 0.2s ease",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
            onMouseEnter={(e) => {
              if (!logging) {
                e.currentTarget.style.background = "rgba(30,58,47,0.04)";
                e.currentTarget.style.borderColor = "rgba(30,58,47,0.25)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(30,58,47,0.15)";
            }}
          >
            {logging ? (
              <>
                <span style={spinnerStyle} />
                Noting it…
              </>
            ) : (
              "🌱 I tried this"
            )}
          </button>
        )}
      </div>

      {/* Quiet note below */}
      <p
        style={{
          fontFamily: "DM Sans, sans-serif",
          fontSize: "11px",
          color: "rgba(30,58,47,0.28)",
          margin: "8px 0 0 2px",
          lineHeight: 1.5,
        }}
      >
        A new invitation appears each day. This one is just for you.
      </p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const spinnerStyle: React.CSSProperties = {
  width: "11px",
  height: "11px",
  borderRadius: "50%",
  border: "1.5px solid rgba(30,58,47,0.2)",
  borderTopColor: "var(--sage, #8BAF8D)",
  animation: "spin 0.7s linear infinite",
  display: "inline-block",
};
