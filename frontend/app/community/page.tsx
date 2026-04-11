"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCommunityWins } from "@/lib/api";

export default function CommunityPage() {
  const router = useRouter();
  const [wins, setWins] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const fetchWins = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await getCommunityWins(15);
      setWins(data.wins);
      setRevealed(false);
      // Stagger the reveal after new wins load
      setTimeout(() => setRevealed(true), 80);
    } catch {
      // Silent fail — seed wins always exist on backend
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchWins();
  }, [router]);

  return (
    <div style={styles.page}>
      <style>{keyframes}</style>

      {/* Nav */}
      <nav style={styles.nav}>
        <button
          onClick={() => router.push("/dashboard")}
          style={styles.backBtn}
        >
          ← Dashboard
        </button>
        <a href="/" style={styles.logo}>
          <div style={styles.logoDot} />
          Marathon Mindset
        </a>
      </nav>

      <main style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.glowDot} />
          <div>
            <p style={styles.eyebrow}>Community</p>
            <h1 style={styles.title}>Someone out there is also trying.</h1>
            <p style={styles.subtitle}>
              These are real wins from real people — shared anonymously,
              received with warmth. No names. No numbers. Just quiet proof that
              you're not alone.
            </p>
          </div>
        </div>

        {/* Wins grid */}
        {loading ? (
          <div style={styles.loadingWrap}>
            <div style={styles.loadingDot} />
            <p style={styles.loadingText}>Gathering quiet wins…</p>
          </div>
        ) : (
          <>
            <div style={styles.grid}>
              {wins.map((win, i) => (
                <WinCard
                  key={`${win}-${i}`}
                  win={win}
                  index={i}
                  revealed={revealed}
                />
              ))}
            </div>

            {/* See more */}
            <div style={styles.moreWrap}>
              <p style={styles.moreHint}>
                Each time you look, you'll find different people, different
                moments.
              </p>
              <button
                onClick={() => fetchWins(true)}
                disabled={refreshing}
                style={{
                  ...styles.moreBtn,
                  opacity: refreshing ? 0.5 : 1,
                }}
              >
                {refreshing ? (
                  <>
                    <span style={styles.miniSpinner} />
                    Finding more…
                  </>
                ) : (
                  "Show me more wins"
                )}
              </button>
            </div>

            {/* Share nudge */}
            <div style={styles.shareNudge}>
              <p style={styles.shareText}>Had a small win today?</p>
              <p style={styles.shareSubtext}>
                When you log a win in your dashboard and tick "share
                anonymously", it appears here for someone else who needs to see
                it.
              </p>
              <button
                onClick={() => router.push("/dashboard")}
                style={styles.shareBtn}
              >
                Go log a win →
              </button>
            </div>
          </>
        )}

        {/* Poem line */}
        <p style={styles.poemLine}>
          "Each soul has roads it walks alone, each seed has time to be
          full-grown."
        </p>
      </main>
    </div>
  );
}

// ─── Win Card ─────────────────────────────────────────────────────────────────

function WinCard({
  win,
  index,
  revealed,
}: {
  win: string;
  index: number;
  revealed: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  // Vary the card accent very subtly across cards
  const accents = [
    "rgba(139,175,141,0.12)", // sage
    "rgba(196,121,58,0.08)", // amber
    "rgba(30,58,47,0.05)", // forest
  ];
  const borderAccents = [
    "rgba(139,175,141,0.22)",
    "rgba(196,121,58,0.15)",
    "rgba(30,58,47,0.09)",
  ];
  const accentIndex = index % 3;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? accents[accentIndex] : "white",
        border: `1px solid ${hovered ? borderAccents[accentIndex] : "rgba(30,58,47,0.07)"}`,
        borderRadius: "14px",
        padding: "20px 22px",
        transition: "all 0.25s ease",
        opacity: revealed ? 1 : 0,
        transform: revealed ? "translateY(0)" : "translateY(12px)",
        // Stagger the reveal by card index
        transitionDelay: `${Math.min(index * 40, 400)}ms`,
        cursor: "default",
        position: "relative",
      }}
    >
      {/* Quiet dot */}
      <div
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: "var(--sage, #8BAF8D)",
          marginBottom: "12px",
          opacity: 0.6,
        }}
      />
      <p
        style={{
          fontFamily: "Playfair Display, serif",
          fontStyle: "italic",
          fontSize: "15px",
          color: "var(--forest, #1E3A2F)",
          lineHeight: 1.7,
          margin: 0,
        }}
      >
        "{win}"
      </p>
    </div>
  );
}

// ─── Keyframes ────────────────────────────────────────────────────────────────

const keyframes = `
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.3; transform: scale(0.8); }
  }
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 6px rgba(139,175,141,0.4); }
    50% { box-shadow: 0 0 14px rgba(139,175,141,0.7); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "var(--cream, #F5F0E8)",
    fontFamily: "DM Sans, sans-serif",
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: "1px solid rgba(30,58,47,0.06)",
    background: "rgba(245,240,232,0.92)",
    backdropFilter: "blur(8px)",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  backBtn: {
    background: "transparent",
    border: "none",
    fontSize: "13px",
    fontFamily: "DM Sans, sans-serif",
    color: "rgba(30,58,47,0.4)",
    cursor: "pointer",
    letterSpacing: "0.04em",
    padding: 0,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
    fontFamily: "Playfair Display, serif",
    fontSize: "15px",
    color: "var(--forest, #1E3A2F)",
    fontWeight: 700,
  },
  logoDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "var(--amber, #C4793A)",
  },
  main: {
    maxWidth: "680px",
    margin: "0 auto",
    padding: "48px 24px 80px",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "48px",
  },
  glowDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "var(--sage, #8BAF8D)",
    flexShrink: 0,
    marginTop: "8px",
    animation: "glow 3s ease-in-out infinite",
  },
  eyebrow: {
    fontSize: "11px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--sage, #8BAF8D)",
    fontFamily: "DM Sans, sans-serif",
    margin: "0 0 8px",
  },
  title: {
    fontFamily: "Playfair Display, serif",
    fontSize: "clamp(22px, 4vw, 30px)",
    fontWeight: 700,
    color: "var(--forest, #1E3A2F)",
    margin: "0 0 12px",
    lineHeight: 1.25,
  },
  subtitle: {
    fontFamily: "DM Sans, sans-serif",
    fontSize: "14px",
    color: "rgba(30,58,47,0.5)",
    lineHeight: 1.7,
    margin: 0,
    maxWidth: "520px",
  },
  loadingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    padding: "60px 0",
  },
  loadingDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "var(--sage, #8BAF8D)",
    animation: "pulse 1.4s ease-in-out infinite",
  },
  loadingText: {
    fontFamily: "Playfair Display, serif",
    fontStyle: "italic",
    fontSize: "14px",
    color: "rgba(30,58,47,0.35)",
    margin: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "12px",
    marginBottom: "48px",
  },
  moreWrap: {
    textAlign: "center",
    marginBottom: "48px",
  },
  moreHint: {
    fontFamily: "Playfair Display, serif",
    fontStyle: "italic",
    fontSize: "13px",
    color: "rgba(30,58,47,0.35)",
    marginBottom: "16px",
  },
  moreBtn: {
    background: "transparent",
    border: "1px solid rgba(30,58,47,0.15)",
    borderRadius: "100px",
    padding: "11px 28px",
    fontSize: "13px",
    fontFamily: "DM Sans, sans-serif",
    color: "rgba(30,58,47,0.55)",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s ease",
  },
  miniSpinner: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    border: "1.5px solid rgba(30,58,47,0.2)",
    borderTopColor: "var(--sage, #8BAF8D)",
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
  },
  shareNudge: {
    background: "rgba(139,175,141,0.08)",
    border: "1px solid rgba(139,175,141,0.18)",
    borderRadius: "16px",
    padding: "28px 32px",
    textAlign: "center",
    marginBottom: "48px",
  },
  shareText: {
    fontFamily: "Playfair Display, serif",
    fontSize: "18px",
    fontWeight: 700,
    color: "var(--forest, #1E3A2F)",
    margin: "0 0 8px",
  },
  shareSubtext: {
    fontFamily: "DM Sans, sans-serif",
    fontSize: "13px",
    color: "rgba(30,58,47,0.5)",
    lineHeight: 1.7,
    margin: "0 0 20px",
    maxWidth: "400px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  shareBtn: {
    background: "var(--forest, #1E3A2F)",
    color: "var(--cream, #F5F0E8)",
    border: "none",
    borderRadius: "10px",
    padding: "11px 24px",
    fontSize: "13px",
    fontFamily: "DM Sans, sans-serif",
    cursor: "pointer",
  },
  poemLine: {
    fontFamily: "Playfair Display, serif",
    fontStyle: "italic",
    fontSize: "13px",
    color: "rgba(30,58,47,0.3)",
    textAlign: "center",
    margin: 0,
    lineHeight: 1.7,
  },
};
