"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveOnboarding } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────
type AnswerState = "answered" | "skipped" | null;

interface Question {
  id: string;
  question: string;
  subtext: string;
  placeholder: string;
  skippable: true;
}

// ─── Questions config ─────────────────────────────────────────────────────────
const QUESTIONS: Question[] = [
  {
    id: "who_you_want_to_become",
    question: "Who do you want to become?",
    subtext:
      "Not what you want to achieve — but who do you want to be? The kind of person you're slowly growing into.",
    placeholder: "e.g. Someone who is disciplined, calm, and keeps their word…",
    skippable: true,
  },
  {
    id: "where_you_see_yourself",
    question: "Where do you see yourself in 1 year?",
    subtext:
      "Paint a picture — your life, your habits, your mindset. What does a good version of your future look like?",
    placeholder:
      "e.g. Waking up early, reading regularly, feeling proud of small wins…",
    skippable: true,
  },
  {
    id: "what_holds_you_back",
    question: "What usually gets in your way?",
    subtext:
      "Knowing your patterns helps us build a system that actually works for you — not against you.",
    placeholder:
      "e.g. I lose motivation after a few days, I compare myself to others…",
    skippable: true,
  },
];

// ─── Reask schedule helper ────────────────────────────────────────────────────
function getReaskDate(months: 3 | 6): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
}

type AnswersRecord = Record<
  string,
  { value: string; state: AnswerState; reaskAt?: string }
>;

// ─── Convert answers record to API format ────────────────────────────────────
function formatAnswersForAPI(finalAnswers: AnswersRecord) {
  return Object.entries(finalAnswers).map(([key, val]) => ({
    question_key: key,
    answer: val.value || "",
    skipped: val.state === "skipped",
  }));
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [userName, setUserName] = useState("there");
  const [step, setStep] = useState<
    "intro" | "question" | "skip-choice" | "done"
  >("intro");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswersRecord>({});
  const [currentText, setCurrentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [animating, setAnimating] = useState(false);

  const [skipMonths, setSkipMonths] = useState<3 | 6>(3);
  const [pendingSkipId, setPendingSkipId] = useState<string | null>(null);

  useEffect(() => {
    const name = localStorage.getItem("mm_user_name");
    if (name) setUserName(name);
  }, []);

  useEffect(() => {
    if (step === "question") {
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [step, qIndex]);

  const currentQ = QUESTIONS[qIndex];
  const progress = qIndex / QUESTIONS.length;

  const transition = (fn: () => void) => {
    setAnimating(true);
    setTimeout(() => {
      fn();
      setAnimating(false);
    }, 320);
  };

  const handleAnswer = () => {
    if (!currentText.trim()) return;
    const updated: AnswersRecord = {
      ...answers,
      [currentQ.id]: { value: currentText.trim(), state: "answered" },
    };
    setAnswers(updated);
    setCurrentText("");
    transition(() => {
      if (qIndex + 1 < QUESTIONS.length) setQIndex((i) => i + 1);
      else finishOnboarding(updated);
    });
  };

  const handleSkipPress = () => {
    setPendingSkipId(currentQ.id);
    setStep("skip-choice");
  };

  const confirmSkip = () => {
    const reaskAt = getReaskDate(skipMonths);
    const updated: AnswersRecord = {
      ...answers,
      [pendingSkipId!]: { value: "", state: "skipped", reaskAt },
    };
    setAnswers(updated);
    setPendingSkipId(null);
    setStep("question");
    setCurrentText("");
    transition(() => {
      if (qIndex + 1 < QUESTIONS.length) setQIndex((i) => i + 1);
      else finishOnboarding(updated);
    });
  };

  const finishOnboarding = async (finalAnswers: AnswersRecord) => {
    setStep("done");
    setSubmitting(true);
    try {
      await saveOnboarding(formatAnswersForAPI(finalAnswers));
    } catch (_) {
      // Non-blocking — continue to dashboard even if save fails
    } finally {
      setSubmitting(false);
      setTimeout(() => router.push("/dashboard"), 1800);
    }
  };

  // ─── Intro screen ──────────────────────────────────────────────────────────
  if (step === "intro") {
    return (
      <PageShell>
        <div
          className="card intro-card"
          style={{ animation: "fadeUp 0.7s ease both" }}
        >
          <div className="intro-icon">🌱</div>
          <h1 className="card-heading">Hey {userName}, welcome.</h1>
          <p className="card-body">
            Before we set up your dashboard, we'd love to ask you a few
            questions.
            <br />
            <br />
            There are <strong>no right answers</strong>. And if you don't know
            yet — that's completely okay. You can skip any question, and we'll
            gently ask again in a few months.
          </p>
          <p className="card-note">3 short questions · takes ~2 minutes</p>
          <button className="btn-primary" onClick={() => setStep("question")}>
            I'm ready →
          </button>
        </div>
      </PageShell>
    );
  }

  // ─── Skip choice modal ─────────────────────────────────────────────────────
  if (step === "skip-choice") {
    return (
      <PageShell progress={progress}>
        <div
          className="card skip-card"
          style={{ animation: "fadeUp 0.4s ease both" }}
        >
          <div className="skip-icon">💛</div>
          <h2 className="card-heading" style={{ fontSize: "1.6rem" }}>
            That's completely okay.
          </h2>
          <p className="card-body">
            Not knowing is actually a good place to start. Many people discover
            their answers by simply <em>showing up every day</em>.
            <br />
            <br />
            We'll remind you of this question in a little while — when you've
            had more time to reflect.
          </p>

          <div className="reask-label">When should we ask you again?</div>
          <div className="reask-options">
            {([3, 6] as const).map((m) => (
              <button
                key={m}
                className={`reask-btn ${skipMonths === m ? "active" : ""}`}
                onClick={() => setSkipMonths(m)}
              >
                In {m} months
              </button>
            ))}
          </div>

          <div className="skip-actions">
            <button className="btn-primary" onClick={confirmSkip}>
              Got it, remind me in {skipMonths} months →
            </button>
            <button
              className="btn-ghost"
              onClick={() => {
                setStep("question");
                setPendingSkipId(null);
              }}
            >
              Actually, let me try to answer
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  // ─── Done screen ───────────────────────────────────────────────────────────
  if (step === "done") {
    const skippedCount = Object.values(answers).filter(
      (a) => a.state === "skipped",
    ).length;
    const answeredCount = Object.values(answers).filter(
      (a) => a.state === "answered",
    ).length;
    return (
      <PageShell>
        <div
          className="card done-card"
          style={{ animation: "fadeUp 0.6s ease both" }}
        >
          <div className="done-circle">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path
                d="M8 18l7 7 13-13"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="card-heading">Your journey begins now.</h2>
          <p className="card-body">
            {answeredCount > 0 &&
              `You answered ${answeredCount} question${answeredCount > 1 ? "s" : ""}. `}
            {skippedCount > 0 &&
              `We'll gently revisit the ${
                skippedCount === 1
                  ? "one you skipped"
                  : `${skippedCount} you skipped`
              } when the time feels right.`}
            <br />
            <br />
            Taking you to your dashboard…
          </p>
          <div className="loading-dots">
            <span />
            <span />
            <span />
          </div>
        </div>
      </PageShell>
    );
  }

  // ─── Question screen ───────────────────────────────────────────────────────
  return (
    <PageShell progress={progress}>
      <div
        className={`card question-card ${animating ? "slide-out" : "slide-in"}`}
        key={qIndex}
      >
        <div className="q-counter">
          Question {qIndex + 1} of {QUESTIONS.length}
        </div>

        <h2 className="card-heading">{currentQ.question}</h2>
        <p className="card-subtext">{currentQ.subtext}</p>

        <textarea
          ref={inputRef}
          className="answer-textarea"
          placeholder={currentQ.placeholder}
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
          rows={4}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAnswer();
          }}
        />
        <div className="textarea-hint">⌘ + Enter to continue</div>

        <div className="question-actions">
          <button
            className="btn-primary"
            onClick={handleAnswer}
            disabled={!currentText.trim()}
          >
            {qIndex + 1 < QUESTIONS.length ? "Next question →" : "Finish →"}
          </button>
          <button className="btn-ghost" onClick={handleSkipPress}>
            I don't know yet
          </button>
        </div>
      </div>
    </PageShell>
  );
}

// ─── Shared shell with progress bar ──────────────────────────────────────────
function PageShell({
  children,
  progress,
}: {
  children: React.ReactNode;
  progress?: number;
}) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --cream: #F5F0E8; --cream-dark: #EDE5D4;
          --forest: #1E3A2F; --forest-mid: #2D5240; --forest-light: #4A7C5F;
          --sage: #8BAF8D; --sage-light: #B8D4BA;
          --amber: #C4793A; --amber-light: #E8A96A;
          --text-primary: #1A2E24; --text-muted: #5A7A65;
        }
        body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--text-primary); min-height: 100vh; }

        .shell {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center;
        }
        .topbar {
          width: 100%; padding: 1.5rem 2.5rem;
          display: flex; align-items: center; justify-content: space-between;
        }
        .topbar-logo {
          display: flex; align-items: center; gap: 0.5rem;
          font-family: 'Playfair Display', serif;
          font-size: 1rem; color: var(--forest); text-decoration: none;
        }
        .logo-dot { width:7px; height:7px; border-radius:50%; background:var(--amber); }
        .progress-track {
          width: 100%; height: 3px;
          background: rgba(139,175,141,0.2);
          position: relative;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--sage) 0%, var(--amber) 100%);
          border-radius: 100px;
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-area {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 3rem 1.5rem; width: 100%;
        }
        .card {
          width: 100%; max-width: 580px;
          background: white;
          border-radius: 24px;
          padding: 3rem;
          box-shadow: 0 4px 40px rgba(30,58,47,0.08);
          border: 1px solid rgba(139,175,141,0.15);
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideOut { to{opacity:0;transform:translateY(-16px)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .slide-in { animation: slideIn 0.35s ease both; }
        .slide-out { animation: slideOut 0.32s ease both; }
        .intro-icon, .skip-icon { font-size: 2.5rem; margin-bottom: 1.25rem; display: block; }
        .q-counter {
          font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--sage); margin-bottom: 1rem;
        }
        .card-heading {
          font-family: 'Playfair Display', serif;
          font-size: 1.9rem; font-weight: 700; line-height: 1.2;
          color: var(--forest); margin-bottom: 0.75rem;
        }
        .card-subtext, .card-body {
          font-size: 0.95rem; font-weight: 300; line-height: 1.75;
          color: var(--text-muted); margin-bottom: 1.75rem;
        }
        .card-body em { font-style: italic; color: var(--forest-light); }
        .card-body strong { font-weight: 500; color: var(--forest); }
        .card-note {
          font-size: 0.78rem; color: var(--sage);
          margin-bottom: 2rem; letter-spacing: 0.02em;
        }
        .answer-textarea {
          width: 100%;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; font-weight: 300; line-height: 1.7;
          color: var(--text-primary);
          background: var(--cream);
          border: 1.5px solid rgba(139,175,141,0.3);
          border-radius: 14px; padding: 1rem 1.1rem;
          resize: vertical; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          min-height: 110px;
        }
        .answer-textarea:focus {
          border-color: var(--forest-light);
          box-shadow: 0 0 0 3px rgba(74,124,95,0.1);
          background: white;
        }
        .answer-textarea::placeholder { color: rgba(90,122,101,0.5); }
        .textarea-hint {
          font-size: 0.72rem; color: var(--sage);
          text-align: right; margin-top: 0.4rem; margin-bottom: 1.5rem;
        }
        .reask-label {
          font-size: 0.8rem; font-weight: 500;
          color: var(--forest); margin-bottom: 0.75rem;
        }
        .reask-options { display: flex; gap: 0.75rem; margin-bottom: 1.75rem; }
        .reask-btn {
          flex: 1; padding: 0.7rem 1rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem; font-weight: 400;
          color: var(--text-muted);
          background: var(--cream);
          border: 1.5px solid rgba(139,175,141,0.3);
          border-radius: 10px; cursor: pointer;
          transition: all 0.2s;
        }
        .reask-btn.active {
          border-color: var(--forest-light);
          background: rgba(74,124,95,0.08);
          color: var(--forest);
          font-weight: 500;
        }
        .reask-btn:hover:not(.active) { border-color: var(--sage); }
        .question-actions, .skip-actions {
          display: flex; flex-direction: column; gap: 0.75rem;
        }
        .btn-primary {
          width: 100%; padding: 0.88rem 1rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; font-weight: 500;
          color: var(--cream); background: var(--forest);
          border: none; border-radius: 12px; cursor: pointer;
          transition: all 0.25s ease;
          display: flex; align-items: center; justify-content: center;
        }
        .btn-primary:hover:not(:disabled) { background: var(--forest-mid); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(30,58,47,0.22); }
        .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
        .btn-ghost {
          width: 100%; padding: 0.75rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem; font-weight: 400;
          color: var(--text-muted);
          background: none; border: none; cursor: pointer;
          transition: color 0.2s; border-radius: 12px;
        }
        .btn-ghost:hover { color: var(--forest); background: rgba(139,175,141,0.08); }
        .done-circle {
          width: 64px; height: 64px; border-radius: 50%;
          background: var(--forest);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.5rem;
          animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes popIn { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }
        .loading-dots {
          display: flex; gap: 6px; justify-content: center; margin-top: 1.5rem;
        }
        .loading-dots span {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--sage-light);
          animation: pulse 1.2s ease-in-out infinite;
        }
        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
        @media (max-width: 600px) {
          .card { padding: 2rem 1.5rem; border-radius: 20px; }
          .topbar { padding: 1.25rem 1.5rem; }
          .card-area { padding: 2rem 1rem; align-items: flex-start; }
        }
      `}</style>

      <div className="shell">
        <div className="topbar">
          <a href="/" className="topbar-logo">
            <span className="logo-dot" />
            Marathon Mindset
          </a>
          {progress !== undefined && (
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Step 2 of 2
            </span>
          )}
        </div>

        {progress !== undefined && (
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${Math.max(5, progress * 100)}%` }}
            />
          </div>
        )}

        <div className="card-area">{children}</div>
      </div>
    </>
  );
}
