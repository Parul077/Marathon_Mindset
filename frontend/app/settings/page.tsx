"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getSettings,
  updateName,
  deleteAccount,
  resetLevel,
  type SettingsData,
} from "@/lib/api";

const LEVEL_NAMES: Record<number, string> = {
  1: "Foundations",
  2: "Building",
  3: "Expanding",
  4: "Full Journey",
};

export default function SettingsPage() {
  const router = useRouter();
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Name section
  const [nameValue, setNameValue] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMsg, setNameMsg] = useState<{ text: string; ok: boolean } | null>(
    null,
  );

  // Level section
  const [levelResetting, setLevelResetting] = useState(false);
  const [levelMsg, setLevelMsg] = useState<string | null>(null);

  // Delete section
  const [deleteStep, setDeleteStep] = useState<"idle" | "confirm" | "password">(
    "idle",
  );
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    getSettings()
      .then((d) => {
        setData(d);
        setNameValue(d.name || "");
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleNameSave = async () => {
    if (!nameValue.trim() || !data) return;
    if (nameValue.trim() === data.name) {
      setNameMsg({ text: "That's already your name.", ok: false });
      return;
    }
    setNameSaving(true);
    setNameMsg(null);
    try {
      const res = await updateName(nameValue.trim());
      setData((prev) => (prev ? { ...prev, name: res.name } : prev));
      localStorage.setItem("mm_user_name", res.name.split(" ")[0]);
      setNameMsg({ text: "Name updated.", ok: true });
    } catch (err: any) {
      setNameMsg({ text: err?.message || "Something went wrong.", ok: false });
    } finally {
      setNameSaving(false);
      setTimeout(() => setNameMsg(null), 4000);
    }
  };

  const handleResetLevel = async () => {
    setLevelResetting(true);
    setLevelMsg(null);
    try {
      const res = await resetLevel();
      setData((prev) => (prev ? { ...prev, manual_level: null } : prev));
      setLevelMsg(`Reset to auto. You're currently at ${res.level_name}.`);
    } catch {
      setLevelMsg("Something went wrong. Try again.");
    } finally {
      setLevelResetting(false);
      setTimeout(() => setLevelMsg(null), 5000);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      setDeleteError("Please enter your password.");
      return;
    }
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteAccount(deletePassword);
      localStorage.removeItem("token");
      localStorage.removeItem("mm_user_name");
      router.push("/");
    } catch (err: any) {
      setDeleteError(err?.message || "Incorrect password.");
      setDeleting(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingDot} />
        <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.3;transform:scale(0.8)}}`}</style>
      </div>
    );
  }

  if (!data) return null;

  const autoLevel = autoLevelFromDays(data.days_joined);
  const isManual = data.manual_level !== null;
  const currentLevel = isManual ? data.manual_level! : autoLevel;

  return (
    <div style={styles.page}>
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
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Settings</h1>
          <p style={styles.pageSubtitle}>Your journey, your way.</p>
        </div>

        {/* ── Display Name ── */}
        <SettingsCard
          label="Your name"
          description="This is the name shown in your dashboard and growth letters."
        >
          <div style={styles.fieldRow}>
            <input
              type="text"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              placeholder="Your display name"
              style={styles.input}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleNameSave();
              }}
              maxLength={150}
            />
            <button
              onClick={handleNameSave}
              disabled={nameSaving || !nameValue.trim()}
              style={{
                ...styles.btn,
                opacity: nameSaving || !nameValue.trim() ? 0.5 : 1,
              }}
            >
              {nameSaving ? "Saving…" : "Save"}
            </button>
          </div>
          {nameMsg && (
            <p
              style={{
                fontSize: "13px",
                fontFamily: "DM Sans, sans-serif",
                color: nameMsg.ok
                  ? "var(--sage, #8BAF8D)"
                  : "rgba(192,57,43,0.8)",
                marginTop: "8px",
              }}
            >
              {nameMsg.ok ? "✓ " : ""}
              {nameMsg.text}
            </p>
          )}
          <p style={styles.fieldMeta}>
            Username: <strong>{data.username}</strong> — this can't be changed.
          </p>
        </SettingsCard>

        {/* ── Disclosure Level ── */}
        <SettingsCard
          label="Journey level"
          description="Controls how much of the app is visible. Levels unlock automatically as you show up."
        >
          <div style={styles.levelRow}>
            <div style={styles.levelBadge}>
              <span style={styles.levelNum}>{currentLevel}</span>
              <span style={styles.levelName}>{LEVEL_NAMES[currentLevel]}</span>
            </div>
            <div style={styles.levelMeta}>
              {isManual ? (
                <p style={styles.levelNote}>
                  You've manually set your level. Auto-progression is paused.
                </p>
              ) : (
                <p style={styles.levelNote}>
                  Level adjusts automatically based on your {data.days_joined}{" "}
                  days with the app.
                </p>
              )}
            </div>
          </div>

          {isManual && (
            <div style={{ marginTop: "16px" }}>
              <button
                onClick={handleResetLevel}
                disabled={levelResetting}
                style={styles.ghostBtn}
              >
                {levelResetting ? "Resetting…" : "Reset to auto-progression"}
              </button>
              <p style={styles.fieldMeta}>
                Your auto level would be{" "}
                <strong>{LEVEL_NAMES[autoLevel]}</strong> based on{" "}
                {data.days_joined} days joined.
              </p>
            </div>
          )}
          {levelMsg && (
            <p
              style={{
                fontSize: "13px",
                fontFamily: "DM Sans, sans-serif",
                color: "var(--sage, #8BAF8D)",
                marginTop: "10px",
              }}
            >
              ✓ {levelMsg}
            </p>
          )}
        </SettingsCard>

        {/* ── Journey Stats (read-only) ── */}
        <SettingsCard
          label="Your journey"
          description="A quiet look at where you are."
        >
          <div style={styles.statsRow}>
            <StatItem value={data.days_joined} label="days with the app" />
            <StatItem value={data.streak} label="day streak" amber />
          </div>
        </SettingsCard>

        {/* ── Email Notifications (placeholder) ── */}
        <SettingsCard
          label="Growth letters by email"
          description="Receive your weekly growth letter in your inbox. Coming soon."
        >
          <div style={styles.comingSoonPill}>
            <span>✦</span>
            <span>Coming in a future update</span>
          </div>
          <p style={styles.fieldMeta}>
            For now, read your letter any time in the{" "}
            <a href="/growth" style={styles.inlineLink}>
              Growth Letter
            </a>{" "}
            page.
          </p>
        </SettingsCard>

        {/* ── Danger Zone ── */}
        <div style={styles.dangerCard}>
          <p style={styles.dangerLabel}>Danger zone</p>
          <p style={styles.dangerTitle}>Delete your account</p>
          <p style={styles.dangerDesc}>
            This permanently removes your account, habits, journal entries,
            wins, goals, and all progress. This cannot be undone.
          </p>

          {deleteStep === "idle" && (
            <button
              onClick={() => setDeleteStep("confirm")}
              style={styles.dangerGhostBtn}
            >
              Delete my account
            </button>
          )}

          {deleteStep === "confirm" && (
            <div style={styles.confirmBlock}>
              <p style={styles.confirmQ}>
                Are you sure? Everything will be permanently deleted — your
                streak, habits, journal, wins, all of it.
              </p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  onClick={() => setDeleteStep("password")}
                  style={styles.dangerSolidBtn}
                >
                  Yes, continue
                </button>
                <button
                  onClick={() => setDeleteStep("idle")}
                  style={styles.ghostBtn}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {deleteStep === "password" && (
            <div style={styles.confirmBlock}>
              <p style={styles.confirmQ}>
                Enter your password to confirm deletion.
              </p>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => {
                  setDeletePassword(e.target.value);
                  setDeleteError("");
                }}
                placeholder="Your password"
                style={{ ...styles.input, marginBottom: "10px" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleDeleteAccount();
                }}
                autoFocus
              />
              {deleteError && <p style={styles.deleteError}>{deleteError}</p>}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting || !deletePassword.trim()}
                  style={{
                    ...styles.dangerSolidBtn,
                    opacity: deleting || !deletePassword.trim() ? 0.6 : 1,
                  }}
                >
                  {deleting ? "Deleting…" : "Delete permanently"}
                </button>
                <button
                  onClick={() => {
                    setDeleteStep("idle");
                    setDeletePassword("");
                    setDeleteError("");
                  }}
                  style={styles.ghostBtn}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom poem line */}
        <p style={styles.poemLine}>
          "Like the moon, I'll softly be — not perfect, just beautifully me."
        </p>
      </main>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SettingsCard({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <p style={styles.cardLabel}>{label}</p>
        <p style={styles.cardDesc}>{description}</p>
      </div>
      <div style={styles.cardBody}>{children}</div>
    </div>
  );
}

function StatItem({
  value,
  label,
  amber = false,
}: {
  value: number;
  label: string;
  amber?: boolean;
}) {
  return (
    <div style={styles.statItem}>
      <span
        style={{
          fontFamily: "Playfair Display, serif",
          fontSize: "32px",
          fontWeight: 700,
          color: amber ? "var(--amber, #C4793A)" : "var(--forest, #1E3A2F)",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: "DM Sans, sans-serif",
          fontSize: "12px",
          color: "rgba(30,58,47,0.4)",
          marginTop: "4px",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function autoLevelFromDays(days: number): number {
  if (days < 7) return 1;
  if (days < 21) return 2;
  if (days < 30) return 3;
  return 4;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "var(--cream, #F5F0E8)",
    fontFamily: "DM Sans, sans-serif",
  },
  loadingPage: {
    minHeight: "100vh",
    background: "var(--cream, #F5F0E8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "var(--sage, #8BAF8D)",
    animation: "pulse 1.4s ease-in-out infinite",
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: "1px solid rgba(30,58,47,0.06)",
    background: "rgba(245,240,232,0.9)",
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
    maxWidth: "580px",
    margin: "0 auto",
    padding: "40px 24px 80px",
  },
  pageHeader: {
    marginBottom: "36px",
  },
  pageTitle: {
    fontFamily: "Playfair Display, serif",
    fontSize: "28px",
    fontWeight: 700,
    color: "var(--forest, #1E3A2F)",
    margin: "0 0 6px",
  },
  pageSubtitle: {
    fontFamily: "Playfair Display, serif",
    fontStyle: "italic",
    fontSize: "15px",
    color: "rgba(30,58,47,0.4)",
    margin: 0,
  },
  card: {
    background: "white",
    border: "1px solid rgba(30,58,47,0.07)",
    borderRadius: "16px",
    marginBottom: "16px",
    overflow: "hidden",
  },
  cardHeader: {
    padding: "20px 24px 16px",
    borderBottom: "1px solid rgba(30,58,47,0.05)",
  },
  cardLabel: {
    fontSize: "11px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "rgba(30,58,47,0.4)",
    fontFamily: "DM Sans, sans-serif",
    margin: "0 0 4px",
    fontWeight: 500,
  },
  cardDesc: {
    fontSize: "13px",
    fontFamily: "DM Sans, sans-serif",
    color: "rgba(30,58,47,0.5)",
    margin: 0,
    lineHeight: 1.5,
  },
  cardBody: {
    padding: "20px 24px",
  },
  fieldRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  input: {
    flex: 1,
    background: "rgba(30,58,47,0.03)",
    border: "1px solid rgba(30,58,47,0.1)",
    borderRadius: "10px",
    padding: "11px 14px",
    fontSize: "14px",
    fontFamily: "DM Sans, sans-serif",
    color: "var(--forest, #1E3A2F)",
    outline: "none",
    boxSizing: "border-box" as const,
    width: "100%",
  },
  btn: {
    background: "var(--forest, #1E3A2F)",
    color: "var(--cream, #F5F0E8)",
    border: "none",
    borderRadius: "9px",
    padding: "11px 20px",
    fontSize: "13px",
    fontFamily: "DM Sans, sans-serif",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  },
  ghostBtn: {
    background: "transparent",
    color: "rgba(30,58,47,0.5)",
    border: "1px solid rgba(30,58,47,0.15)",
    borderRadius: "9px",
    padding: "10px 18px",
    fontSize: "13px",
    fontFamily: "DM Sans, sans-serif",
    cursor: "pointer",
  },
  fieldMeta: {
    fontSize: "12px",
    fontFamily: "DM Sans, sans-serif",
    color: "rgba(30,58,47,0.35)",
    marginTop: "10px",
    marginBottom: 0,
    lineHeight: 1.5,
  },
  inlineLink: {
    color: "var(--forest, #1E3A2F)",
    textDecoration: "underline",
    textUnderlineOffset: "2px",
  },
  levelRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  levelBadge: {
    minWidth: "72px",
    height: "72px",
    padding: "0 10px",
    borderRadius: "14px",
    background: "rgba(30,58,47,0.05)",
    border: "1px solid rgba(30,58,47,0.08)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    gap: "4px",
  },
  levelNum: {
    fontFamily: "Playfair Display, serif",
    fontSize: "26px",
    fontWeight: 700,
    color: "var(--amber, #C4793A)",
    lineHeight: 1,
  },
  levelName: {
    fontFamily: "DM Sans, sans-serif",
    fontSize: "8px",
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    color: "rgba(30,58,47,0.4)",
    textAlign: "center",
    lineHeight: 1.3,
    whiteSpace: "nowrap",
  },
  levelMeta: {
    flex: 1,
  },
  levelNote: {
    fontFamily: "DM Sans, sans-serif",
    fontSize: "13px",
    color: "rgba(30,58,47,0.55)",
    margin: 0,
    lineHeight: 1.5,
  },
  statsRow: {
    display: "flex",
    gap: "32px",
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  comingSoonPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(139,175,141,0.1)",
    border: "1px solid rgba(139,175,141,0.2)",
    borderRadius: "100px",
    padding: "6px 14px",
    fontSize: "12px",
    fontFamily: "DM Sans, sans-serif",
    color: "var(--sage, #8BAF8D)",
    marginBottom: "10px",
  },
  dangerCard: {
    background: "rgba(192,57,43,0.03)",
    border: "1px solid rgba(192,57,43,0.12)",
    borderRadius: "16px",
    padding: "24px",
    marginTop: "8px",
    marginBottom: "16px",
  },
  dangerLabel: {
    fontSize: "10px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "rgba(192,57,43,0.5)",
    fontFamily: "DM Sans, sans-serif",
    margin: "0 0 8px",
    fontWeight: 500,
  },
  dangerTitle: {
    fontFamily: "Playfair Display, serif",
    fontSize: "17px",
    color: "var(--forest, #1E3A2F)",
    margin: "0 0 8px",
    fontWeight: 700,
  },
  dangerDesc: {
    fontSize: "13px",
    fontFamily: "DM Sans, sans-serif",
    color: "rgba(30,58,47,0.5)",
    lineHeight: 1.6,
    margin: "0 0 20px",
  },
  dangerGhostBtn: {
    background: "transparent",
    color: "rgba(192,57,43,0.6)",
    border: "1px solid rgba(192,57,43,0.2)",
    borderRadius: "9px",
    padding: "10px 18px",
    fontSize: "13px",
    fontFamily: "DM Sans, sans-serif",
    cursor: "pointer",
  },
  dangerSolidBtn: {
    background: "rgba(192,57,43,0.85)",
    color: "white",
    border: "none",
    borderRadius: "9px",
    padding: "10px 18px",
    fontSize: "13px",
    fontFamily: "DM Sans, sans-serif",
    cursor: "pointer",
  },
  confirmBlock: {
    marginTop: "4px",
  },
  confirmQ: {
    fontSize: "13px",
    fontFamily: "DM Sans, sans-serif",
    color: "rgba(30,58,47,0.6)",
    lineHeight: 1.6,
    margin: "0 0 14px",
  },
  deleteError: {
    fontSize: "13px",
    fontFamily: "DM Sans, sans-serif",
    color: "rgba(192,57,43,0.8)",
    margin: "0 0 10px",
  },
  poemLine: {
    fontFamily: "Playfair Display, serif",
    fontStyle: "italic",
    fontSize: "13px",
    color: "rgba(30,58,47,0.3)",
    textAlign: "center",
    margin: "32px 0 0",
    lineHeight: 1.7,
  },
};
