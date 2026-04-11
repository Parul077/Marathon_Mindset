"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async () => {
    const errs: Record<string, string> = {};
    if (!form.username.trim()) errs.username = "Please enter your username.";
    if (!form.password) errs.password = "Please enter your password.";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const res = await login(form.username.trim(), form.password);
      if (res.token) localStorage.setItem("token", res.token);
      if (res.name)
        localStorage.setItem("mm_user_name", res.name.split(" ")[0]);
      router.push("/dashboard");
    } catch (err: any) {
      setErrors({ api: err?.message || "Invalid username or password." });
    } finally {
      setLoading(false);
    }
  };

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
          --error: #C0392B;
        }
        body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--text-primary); min-height: 100vh; }

        .page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .left-panel {
          background: var(--forest);
          display: flex; flex-direction: column;
          justify-content: space-between;
          padding: 3rem; position: relative; overflow: hidden;
        }
        .left-panel::before {
          content: ''; position: absolute; top: -80px; right: -80px;
          width: 320px; height: 320px; border-radius: 50%;
          background: rgba(139,175,141,0.08); pointer-events: none;
        }
        .panel-logo {
          display: flex; align-items: center; gap: 0.5rem;
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem; color: var(--cream); text-decoration: none;
        }
        .logo-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--amber); }

        .quote-section { position: relative; z-index: 1; }
        .quote-mark {
          font-family: 'Playfair Display', serif;
          font-size: 6rem; line-height: 0.6; color: var(--sage);
          opacity: 0.3; display: block; margin-bottom: 1.5rem;
        }
        .quote-text {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.5rem, 2.5vw, 2.1rem);
          font-style: italic; font-weight: 400; line-height: 1.4;
          color: var(--cream); margin-bottom: 1.25rem;
        }
        .quote-sub {
          font-size: 0.85rem; font-weight: 300;
          color: var(--sage-light); line-height: 1.6;
        }
        .quote-author {
          font-size: 0.75rem; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--sage);
          margin-top: 1.5rem; display: block;
        }

        .streak-card {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(139,175,141,0.2);
          border-radius: 16px; padding: 1.25rem 1.5rem;
          position: relative; z-index: 1;
        }
        .streak-label { font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--sage); margin-bottom: 0.75rem; }
        .streak-days { display: flex; gap: 0.4rem; }
        .streak-day {
          flex:1; height: 32px; border-radius: 6px;
          background: rgba(255,255,255,0.06);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.6rem; color: rgba(255,255,255,0.3);
        }
        .streak-day.done { background: var(--forest-light); color: var(--cream); }
        .streak-day.today { background: var(--amber); color: var(--cream); }
        .streak-note { font-size: 0.78rem; color: var(--sage-light); margin-top: 0.75rem; font-weight: 300; }

        .right-panel {
          display: flex; align-items: center; justify-content: center;
          padding: 3rem 2rem;
        }
        .form-box {
          width: 100%; max-width: 400px;
          animation: fadeUp 0.6s ease both;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

        .welcome-back {
          display: inline-flex; align-items: center; gap: 0.5rem;
          font-size: 0.75rem; font-weight: 500; letter-spacing: 0.06em;
          text-transform: uppercase; color: var(--forest-light);
          background: rgba(74,124,95,0.1); border: 1px solid rgba(74,124,95,0.2);
          padding: 0.35rem 0.85rem; border-radius: 100px;
          margin-bottom: 1.5rem;
        }
        .form-title {
          font-family: 'Playfair Display', serif;
          font-size: 2rem; font-weight: 700; line-height: 1.2;
          color: var(--forest); margin-bottom: 0.4rem;
        }
        .form-subtitle {
          font-size: 0.9rem; color: var(--text-muted);
          font-weight: 300; margin-bottom: 2.25rem; line-height: 1.6;
        }

        .field { margin-bottom: 1.25rem; }
        .field label {
          display: block; font-size: 0.8rem; font-weight: 500;
          color: var(--forest); margin-bottom: 0.45rem; letter-spacing: 0.01em;
        }
        .field-wrap { position: relative; }
        .field input {
          width: 100%; padding: 0.78rem 1rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; color: var(--text-primary);
          background: white;
          border: 1.5px solid rgba(139,175,141,0.3);
          border-radius: 12px; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s; appearance: none;
        }
        .field input:focus {
          border-color: var(--forest-light);
          box-shadow: 0 0 0 3px rgba(74,124,95,0.1);
        }
        .field input.has-error { border-color: var(--error); }
        .field-error { font-size: 0.78rem; color: var(--error); margin-top: 0.35rem; display: block; }

        .pass-toggle {
          position: absolute; right: 0.9rem; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: var(--text-muted); font-size: 0.8rem;
          padding: 0.25rem; transition: color 0.2s;
        }
        .pass-toggle:hover { color: var(--forest); }

        .api-error {
          background: rgba(192,57,43,0.08); border: 1px solid rgba(192,57,43,0.2);
          border-radius: 10px; padding: 0.75rem 1rem;
          font-size: 0.85rem; color: var(--error); margin-bottom: 1.25rem;
        }

        .btn-submit {
          width: 100%; padding: 0.88rem 1rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; font-weight: 500;
          color: var(--cream); background: var(--forest);
          border: none; border-radius: 12px; cursor: pointer;
          transition: all 0.25s ease;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
        }
        .btn-submit:hover:not(:disabled) { background: var(--forest-mid); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(30,58,47,0.22); }
        .btn-submit:disabled { opacity: 0.65; cursor: not-allowed; }

        .spinner { width:16px; height:16px; border-radius:50%; border:2px solid rgba(255,255,255,0.3); border-top-color:white; animation:spin 0.7s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }

        .signup-link { text-align: center; font-size: 0.875rem; color: var(--text-muted); margin-top: 1.5rem; }
        .signup-link a { color: var(--forest-light); font-weight: 500; text-decoration: none; transition: color 0.2s; }
        .signup-link a:hover { color: var(--forest); }

        @media (max-width: 768px) {
          .page { grid-template-columns: 1fr; }
          .left-panel { display: none; }
          .right-panel { padding: 2rem 1.5rem; align-items: flex-start; padding-top: 3rem; }
        }
      `}</style>

      <div className="page">
        {/* LEFT PANEL */}
        <div className="left-panel">
          <a href="/" className="panel-logo">
            <span className="logo-dot" />
            Marathon Mindset
          </a>

          <div className="quote-section">
            <span className="quote-mark">"</span>
            <p className="quote-text">
              Every day you show up is a day you didn't give up.
            </p>
            <p className="quote-sub">
              Your growth is happening — even on the days you can't feel it.
              Welcome back to your journey.
            </p>
            <span className="quote-author">— Marathon Mindset</span>
          </div>

          <div className="streak-card">
            <div className="streak-label">Your streak this week</div>
            <div className="streak-days">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <div
                  key={i}
                  className={`streak-day ${i < 4 ? "done" : i === 4 ? "today" : ""}`}
                >
                  {d}
                </div>
              ))}
            </div>
            <p className="streak-note">Sign in to continue your progress →</p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <div className="form-box">
            <div className="welcome-back">
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--forest-light)",
                  display: "inline-block",
                }}
              />
              Welcome back
            </div>
            <h2 className="form-title">
              Sign in to your
              <br />
              journey
            </h2>
            <p className="form-subtitle">
              Your progress is waiting. Pick up right where you left off.
            </p>

            {errors.api && <div className="api-error">{errors.api}</div>}

            <div className="field">
              <label htmlFor="username">Username</label>
              <div className="field-wrap">
                <input
                  id="username"
                  type="text"
                  placeholder="Your username"
                  value={form.username}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, username: e.target.value }));
                    setErrors((er) => ({ ...er, username: "" }));
                  }}
                  className={errors.username ? "has-error" : ""}
                  autoComplete="username"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                />
              </div>
              {errors.username && (
                <span className="field-error">{errors.username}</span>
              )}
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="field-wrap">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="Your password"
                  value={form.password}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, password: e.target.value }));
                    setErrors((er) => ({ ...er, password: "" }));
                  }}
                  className={errors.password ? "has-error" : ""}
                  autoComplete="current-password"
                  style={{ paddingRight: "3.5rem" }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                />
                <button
                  type="button"
                  className="pass-toggle"
                  onClick={() => setShowPass((s) => !s)}
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <span className="field-error">{errors.password}</span>
              )}
            </div>

            <button
              className="btn-submit"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? (
                <>
                  <span className="spinner" /> Signing in…
                </>
              ) : (
                <>Sign in →</>
              )}
            </button>

            <p className="signup-link">
              New here? <a href="/signup">Create a free account</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
