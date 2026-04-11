"use client";

import { useState } from "react";
import { logBadDay } from "@/lib/api";

interface BadDayButtonProps {
  onActivated: (streak: number) => void;
}

export default function BadDayButton({ onActivated }: BadDayButtonProps) {
  const [state, setState] = useState<"idle" | "confirming" | "done">("idle");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await logBadDay();
      setMessage(res.message);
      setState("done");
      onActivated(res.streak);
    } catch {
      setState("idle");
    } finally {
      setLoading(false);
    }
  };

  if (state === "done") {
    return (
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          background: "var(--forest, #1E3A2F)",
          borderRadius: "16px",
          padding: "16px 20px",
          maxWidth: "260px",
          boxShadow: "0 8px 32px rgba(30,58,47,0.2)",
          zIndex: 100,
          animation: "slideUp 0.4s ease",
        }}
      >
        <p
          style={{
            fontSize: "14px",
            color: "var(--cream, #F5F0E8)",
            fontFamily: "DM Sans, sans-serif",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {message}
        </p>
        <p
          style={{
            fontSize: "12px",
            color: "rgba(245,240,232,0.5)",
            fontFamily: "DM Sans, sans-serif",
            marginTop: "6px",
            marginBottom: 0,
          }}
        >
          Your streak is safe. Rest well.
        </p>
      </div>
    );
  }

  if (state === "confirming") {
    return (
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          background: "var(--cream, #F5F0E8)",
          border: "1px solid rgba(30,58,47,0.1)",
          borderRadius: "16px",
          padding: "18px 20px",
          maxWidth: "280px",
          boxShadow: "0 8px 32px rgba(30,58,47,0.12)",
          zIndex: 100,
          animation: "slideUp 0.3s ease",
        }}
      >
        <p
          style={{
            fontSize: "15px",
            color: "var(--forest, #1E3A2F)",
            fontFamily: "Playfair Display, serif",
            lineHeight: 1.5,
            marginBottom: "12px",
            marginTop: 0,
          }}
        >
          Hard days are part of the journey too.
        </p>
        <p
          style={{
            fontSize: "13px",
            color: "rgba(30,58,47,0.6)",
            fontFamily: "DM Sans, sans-serif",
            lineHeight: 1.5,
            marginBottom: "16px",
          }}
        >
          This will simplify your dashboard and protect your streak. No pressure
          today.
        </p>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              flex: 1,
              background: "var(--forest, #1E3A2F)",
              color: "var(--cream, #F5F0E8)",
              border: "none",
              borderRadius: "8px",
              padding: "10px 0",
              fontSize: "13px",
              fontFamily: "DM Sans, sans-serif",
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "..." : "Yes, rest today"}
          </button>
          <button
            onClick={() => setState("idle")}
            style={{
              flex: 1,
              background: "transparent",
              color: "rgba(30,58,47,0.5)",
              border: "1px solid rgba(30,58,47,0.15)",
              borderRadius: "8px",
              padding: "10px 0",
              fontSize: "13px",
              fontFamily: "DM Sans, sans-serif",
              cursor: "pointer",
            }}
          >
            Never mind
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setState("confirming")}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          background: "rgba(30, 58, 47, 0.06)",
          border: "1px solid rgba(30, 58, 47, 0.12)",
          borderRadius: "100px",
          padding: "10px 18px",
          fontSize: "12px",
          color: "rgba(30, 58, 47, 0.5)",
          fontFamily: "DM Sans, sans-serif",
          cursor: "pointer",
          zIndex: 100,
          transition: "all 0.2s ease",
          letterSpacing: "0.02em",
        }}
        onMouseEnter={(e) => {
          const btn = e.target as HTMLButtonElement;
          btn.style.background = "rgba(30,58,47,0.1)";
          btn.style.color = "rgba(30,58,47,0.7)";
        }}
        onMouseLeave={(e) => {
          const btn = e.target as HTMLButtonElement;
          btn.style.background = "rgba(30,58,47,0.06)";
          btn.style.color = "rgba(30,58,47,0.5)";
        }}
      >
        Today was hard.
      </button>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
