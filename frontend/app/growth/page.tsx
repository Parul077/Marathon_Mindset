"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getGrowthLetter, type GrowthLetter } from "@/lib/api";

export default function GrowthLetterPage() {
  const router = useRouter();
  const [letter, setLetter] = useState<GrowthLetter | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    getGrowthLetter()
      .then((data) => {
        setLetter(data);
        // Small delay so the envelope animation plays before text appears
        setTimeout(() => setRevealed(true), 600);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [router]);

  const formatWeekDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Split letter into paragraphs for rendering
  const paragraphs = letter?.content
    ? letter.content.split("\n\n").filter((p) => p.trim())
    : [];

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <style>{keyframes}</style>
        <div style={styles.envelopeWrap}>
          <EnvelopeIcon />
          <p style={styles.loadingText}>Folding your letter…</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !letter) {
    return (
      <div style={styles.loadingPage}>
        <style>{keyframes}</style>
        <div
          style={{ textAlign: "center", maxWidth: "360px", padding: "0 24px" }}
        >
          <p
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "22px",
              color: "var(--cream, #F5F0E8)",
              marginBottom: "12px",
            }}
          >
            Your letter isn't ready yet.
          </p>
          <p
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: "14px",
              color: "rgba(245,240,232,0.5)",
              lineHeight: 1.7,
              marginBottom: "32px",
            }}
          >
            Growth letters arrive after your first week. Keep showing up — yours
            is being written.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            style={styles.backBtnLight}
          >
            ← Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Letter ───────────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      <style>{keyframes}</style>

      {/* Subtle grain texture overlay */}
      <div style={styles.grain} />

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

      {/* Postmark row */}
      <div
        style={{
          ...styles.postmarkRow,
          opacity: revealed ? 1 : 0,
          transform: revealed ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
        }}
      >
        <div style={styles.postmarkCircle}>
          <span style={styles.postmarkTop}>WEEK OF</span>
          <span style={styles.postmarkDate}>
            {formatWeekDate(letter.week_start)}
          </span>
          <span style={styles.postmarkBottom}>MARATHON MINDSET</span>
        </div>
        <div style={styles.postmarkLine} />
      </div>

      {/* Letter card */}
      <main
        style={{
          ...styles.letterWrap,
          opacity: revealed ? 1 : 0,
          transform: revealed ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.8s ease 0.25s, transform 0.8s ease 0.25s",
        }}
      >
        <div style={styles.letterCard}>
          {/* Decorative top rule */}
          <div style={styles.topRule}>
            <div style={styles.ruleLine} />
            <div style={styles.ruleLeaf}>🌿</div>
            <div style={styles.ruleLine} />
          </div>

          {/* Letter body */}
          <div style={styles.letterBody}>
            {paragraphs.map((para, i) => {
              // First paragraph — the dear line — gets special treatment
              if (i === 0) {
                return (
                  <p
                    key={i}
                    style={{
                      ...styles.paragraph,
                      ...styles.dearLine,
                      animationDelay: `${0.4 + i * 0.12}s`,
                    }}
                  >
                    {para}
                  </p>
                );
              }

              // Closing — "With warmth, Marathon Mindset"
              if (para.startsWith("With warmth")) {
                const lines = para.split("\n");
                return (
                  <div
                    key={i}
                    style={{
                      ...styles.closingBlock,
                      animationDelay: `${0.4 + i * 0.12}s`,
                    }}
                  >
                    {lines.map((line, j) => (
                      <p
                        key={j}
                        style={{
                          margin: 0,
                          fontFamily:
                            j === 0
                              ? "Playfair Display, serif"
                              : "DM Sans, sans-serif",
                          fontStyle: j === 0 ? "italic" : "normal",
                          fontSize: j === 0 ? "16px" : "13px",
                          color:
                            j === 0
                              ? "var(--forest, #1E3A2F)"
                              : "rgba(30,58,47,0.45)",
                          marginBottom: j === 0 ? "4px" : "0",
                          letterSpacing: j === 1 ? "0.06em" : "normal",
                        }}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                );
              }

              // Week of line at the end
              if (para.startsWith("Week of")) {
                return (
                  <p
                    key={i}
                    style={{
                      fontFamily: "DM Sans, sans-serif",
                      fontSize: "12px",
                      color: "rgba(30,58,47,0.3)",
                      letterSpacing: "0.08em",
                      margin: "4px 0 0",
                      animationDelay: `${0.4 + i * 0.12}s`,
                    }}
                  >
                    {para}
                  </p>
                );
              }

              // Streak lines — slightly styled differently
              const isStreakLine =
                para.includes("streak") ||
                para.includes("days") ||
                para.includes("hundred") ||
                para.includes("twenty-one");

              return (
                <p
                  key={i}
                  style={{
                    ...styles.paragraph,
                    ...(isStreakLine ? styles.streakPara : {}),
                    animationDelay: `${0.4 + i * 0.12}s`,
                  }}
                >
                  {para}
                </p>
              );
            })}
          </div>

          {/* Divider */}
          <div style={styles.divider} />

          {/* Stats — as a quiet postscript */}
          <div style={styles.psBlock}>
            <p style={styles.psLabel}>P.S. — This week in numbers</p>
            <div style={styles.statsRow}>
              <StatPill
                value={letter.stats.habits}
                label={letter.stats.habits === 1 ? "habit done" : "habits done"}
              />
              <StatPill
                value={letter.stats.journals}
                label={
                  letter.stats.journals === 1
                    ? "journal entry"
                    : "journal entries"
                }
              />
              <StatPill
                value={letter.stats.wins}
                label={letter.stats.wins === 1 ? "small win" : "small wins"}
              />
              <StatPill
                value={letter.stats.streak}
                label="day streak"
                highlight
              />
            </div>
          </div>

          {/* Bottom rule */}
          <div style={{ ...styles.topRule, marginTop: "32px" }}>
            <div style={styles.ruleLine} />
            <div style={styles.ruleLeaf}>🌱</div>
            <div style={styles.ruleLine} />
          </div>
        </div>

        {/* Poem line below card */}
        <p
          style={{
            ...styles.poemLine,
            opacity: revealed ? 1 : 0,
            transition: "opacity 1s ease 1.2s",
          }}
        >
          "Each seed has time to be full-grown."
        </p>

        {/* Back link */}
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            ...styles.backBtnBottom,
            opacity: revealed ? 1 : 0,
            transition: "opacity 0.8s ease 1.4s",
          }}
        >
          Return to your dashboard
        </button>
      </main>
    </div>
  );
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────

function StatPill({
  value,
  label,
  highlight = false,
}: {
  value: number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2px",
        padding: "12px 16px",
        background: highlight ? "rgba(196,121,58,0.08)" : "rgba(30,58,47,0.03)",
        border: `1px solid ${highlight ? "rgba(196,121,58,0.18)" : "rgba(30,58,47,0.07)"}`,
        borderRadius: "12px",
        minWidth: "64px",
      }}
    >
      <span
        style={{
          fontFamily: "Playfair Display, serif",
          fontSize: "24px",
          fontWeight: 700,
          color: highlight ? "var(--amber, #C4793A)" : "var(--forest, #1E3A2F)",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: "DM Sans, sans-serif",
          fontSize: "11px",
          color: "rgba(30,58,47,0.4)",
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Envelope Icon ────────────────────────────────────────────────────────────

function EnvelopeIcon() {
  return (
    <svg
      width="48"
      height="36"
      viewBox="0 0 48 36"
      fill="none"
      style={{ animation: "floatEnvelope 2.4s ease-in-out infinite" }}
    >
      <rect
        x="1"
        y="1"
        width="46"
        height="34"
        rx="4"
        stroke="rgba(245,240,232,0.4)"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M1 5L24 20L47 5"
        stroke="rgba(245,240,232,0.4)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M1 31L16 18M47 31L32 18"
        stroke="rgba(245,240,232,0.25)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Keyframes ────────────────────────────────────────────────────────────────

const keyframes = `
  @keyframes floatEnvelope {
    0%, 100% { transform: translateY(0px); opacity: 0.7; }
    50% { transform: translateY(-8px); opacity: 1; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "var(--cream, #F5F0E8)",
    fontFamily: "DM Sans, sans-serif",
    position: "relative",
    overflowX: "hidden",
  },
  grain: {
    position: "fixed",
    inset: 0,
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
    pointerEvents: "none",
    zIndex: 0,
  },
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    background: "rgba(245,240,232,0.9)",
    backdropFilter: "blur(8px)",
    borderBottom: "1px solid rgba(30,58,47,0.06)",
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
  postmarkRow: {
    display: "flex",
    alignItems: "center",
    maxWidth: "620px",
    margin: "40px auto 0",
    padding: "0 24px",
    gap: "20px",
    position: "relative",
    zIndex: 1,
  },
  postmarkCircle: {
    flexShrink: 0,
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    border: "1.5px solid rgba(30,58,47,0.15)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "2px",
    padding: "8px",
  },
  postmarkTop: {
    fontFamily: "DM Sans, sans-serif",
    fontSize: "7px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "rgba(30,58,47,0.35)",
  },
  postmarkDate: {
    fontFamily: "Playfair Display, serif",
    fontSize: "9px",
    color: "var(--forest, #1E3A2F)",
    fontWeight: 700,
    textAlign: "center",
    lineHeight: 1.4,
  },
  postmarkBottom: {
    fontFamily: "DM Sans, sans-serif",
    fontSize: "6px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "rgba(30,58,47,0.25)",
  },
  postmarkLine: {
    flex: 1,
    height: "1px",
    background:
      "repeating-linear-gradient(90deg, rgba(30,58,47,0.12) 0, rgba(30,58,47,0.12) 4px, transparent 4px, transparent 10px)",
  },
  letterWrap: {
    maxWidth: "620px",
    margin: "32px auto 80px",
    padding: "0 24px",
    position: "relative",
    zIndex: 1,
  },
  letterCard: {
    background: "#FDFAF4",
    border: "1px solid rgba(30,58,47,0.07)",
    borderRadius: "16px",
    padding: "48px 52px",
    boxShadow: "0 2px 8px rgba(30,58,47,0.04), 0 16px 48px rgba(30,58,47,0.06)",
  },
  topRule: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "36px",
  },
  ruleLine: {
    flex: 1,
    height: "1px",
    background: "rgba(30,58,47,0.08)",
  },
  ruleLeaf: {
    fontSize: "14px",
    opacity: 0.6,
  },
  letterBody: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  paragraph: {
    fontFamily: "Playfair Display, serif",
    fontSize: "17px",
    lineHeight: 1.9,
    color: "rgba(30,58,47,0.85)",
    margin: 0,
    animation: "fadeUp 0.6s ease both",
  },
  dearLine: {
    fontSize: "18px",
    color: "var(--forest, #1E3A2F)",
    fontWeight: 700,
  },
  streakPara: {
    color: "var(--forest, #1E3A2F)",
    fontStyle: "italic",
    borderLeft: "2px solid rgba(196,121,58,0.3)",
    paddingLeft: "18px",
  },
  closingBlock: {
    marginTop: "8px",
    animation: "fadeUp 0.6s ease both",
  },
  divider: {
    height: "1px",
    background: "rgba(30,58,47,0.07)",
    margin: "36px 0 28px",
  },
  psBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  psLabel: {
    fontFamily: "DM Sans, sans-serif",
    fontSize: "11px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "rgba(30,58,47,0.35)",
    margin: 0,
  },
  statsRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  poemLine: {
    fontFamily: "Playfair Display, serif",
    fontStyle: "italic",
    fontSize: "14px",
    color: "rgba(30,58,47,0.3)",
    textAlign: "center",
    margin: "28px 0 0",
    lineHeight: 1.7,
  },
  backBtnBottom: {
    display: "block",
    margin: "20px auto 0",
    background: "transparent",
    border: "none",
    fontFamily: "DM Sans, sans-serif",
    fontSize: "13px",
    color: "rgba(30,58,47,0.35)",
    cursor: "pointer",
    letterSpacing: "0.04em",
  },
  loadingPage: {
    minHeight: "100vh",
    background: "var(--forest, #1E3A2F)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  envelopeWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
  },
  loadingText: {
    fontFamily: "Playfair Display, serif",
    fontStyle: "italic",
    fontSize: "15px",
    color: "rgba(245,240,232,0.45)",
    margin: 0,
  },
  backBtnLight: {
    background: "transparent",
    border: "1px solid rgba(245,240,232,0.2)",
    borderRadius: "8px",
    padding: "10px 20px",
    fontFamily: "DM Sans, sans-serif",
    fontSize: "13px",
    color: "rgba(245,240,232,0.5)",
    cursor: "pointer",
  },
};
