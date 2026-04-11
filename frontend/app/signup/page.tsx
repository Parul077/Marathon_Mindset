"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", username: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "What should we call you?";
    if (!form.username.trim()) e.username = "Choose a username.";
    else if (form.username.includes(" "))
      e.username = "Username can't have spaces.";
    if (form.password.length < 8)
      e.password = "Password must be at least 8 characters.";
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const res = await register(
        form.username.trim(),
        form.password,
        form.name.trim(),
      );
      localStorage.setItem("token", res.token);
      localStorage.setItem("mm_user_name", res.name.split(" ")[0]);
      router.push("/onboarding");
    } catch (err: any) {
      setErrors({
        api: err?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{--cream:#F5F0E8;--forest:#1E3A2F;--forest-mid:#2D5240;--forest-light:#4A7C5F;--sage:#8BAF8D;--sage-light:#B8D4BA;--amber:#C4793A;--amber-light:#E8A96A;--text-primary:#1A2E24;--text-muted:#5A7A65;--error:#C0392B;}
        body{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--text-primary);min-height:100vh;}
        .page{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;}
        .left{background:var(--forest);display:flex;flex-direction:column;justify-content:space-between;padding:3rem;position:relative;overflow:hidden;}
        .left::before{content:'';position:absolute;top:-80px;right:-80px;width:320px;height:320px;border-radius:50%;background:rgba(139,175,141,0.08);pointer-events:none;}
        .logo{display:flex;align-items:center;gap:.5rem;font-family:'Playfair Display',serif;font-size:1.1rem;color:var(--cream);text-decoration:none;}
        .logo-dot{width:8px;height:8px;border-radius:50%;background:var(--amber);}
        .left-body{position:relative;z-index:1;}
        .left-tag{font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:var(--sage);margin-bottom:1.25rem;}
        .left-h{font-family:'Playfair Display',serif;font-size:clamp(2rem,3vw,2.8rem);font-weight:700;line-height:1.15;color:var(--cream);margin-bottom:1.25rem;}
        .left-h em{font-style:italic;color:var(--amber-light);}
        .left-sub{font-size:.95rem;font-weight:300;line-height:1.75;color:var(--sage-light);max-width:380px;}
        .pillars{display:flex;flex-direction:column;gap:.75rem;position:relative;z-index:1;}
        .pillar{display:flex;align-items:center;gap:.85rem;font-size:.85rem;color:var(--sage-light);}
        .pillar-icon{width:32px;height:32px;border-radius:8px;flex-shrink:0;background:rgba(139,175,141,0.12);display:flex;align-items:center;justify-content:center;}
        .right{display:flex;align-items:center;justify-content:center;padding:3rem 2rem;}
        .form-box{width:100%;max-width:420px;animation:fadeUp .6s ease both;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .eyebrow{font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:.6rem;}
        .form-title{font-family:'Playfair Display',serif;font-size:2rem;font-weight:700;color:var(--forest);margin-bottom:.4rem;}
        .form-sub{font-size:.9rem;color:var(--text-muted);font-weight:300;margin-bottom:2.25rem;line-height:1.6;}
        .field{margin-bottom:1.25rem;}
        .field label{display:block;font-size:.8rem;font-weight:500;color:var(--forest);margin-bottom:.45rem;}
        .field .hint{font-size:.75rem;color:var(--text-muted);font-weight:300;margin-bottom:.45rem;display:block;}
        .fw{position:relative;}
        .fw input{width:100%;padding:.78rem 1rem;font-family:'DM Sans',sans-serif;font-size:.95rem;color:var(--text-primary);background:white;border:1.5px solid rgba(139,175,141,.3);border-radius:12px;outline:none;transition:border-color .2s,box-shadow .2s;appearance:none;}
        .fw input:focus{border-color:var(--forest-light);box-shadow:0 0 0 3px rgba(74,124,95,.1);}
        .fw input.err{border-color:var(--error);}
        .ferr{font-size:.78rem;color:var(--error);margin-top:.35rem;display:block;}
        .show-btn{position:absolute;right:.9rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:.8rem;}
        .api-err{background:rgba(192,57,43,.08);border:1px solid rgba(192,57,43,.2);border-radius:10px;padding:.75rem 1rem;font-size:.85rem;color:var(--error);margin-bottom:1.25rem;}
        .strength{display:flex;gap:4px;margin-top:.5rem;}
        .sbar{height:3px;flex:1;border-radius:100px;background:rgba(139,175,141,.2);transition:background .3s;}
        .sbar.weak{background:#e74c3c;}.sbar.med{background:var(--amber);}.sbar.strong{background:var(--forest-light);}
        .btn{width:100%;padding:.88rem;font-family:'DM Sans',sans-serif;font-size:.95rem;font-weight:500;color:var(--cream);background:var(--forest);border:none;border-radius:12px;cursor:pointer;transition:all .25s;display:flex;align-items:center;justify-content:center;gap:.5rem;}
        .btn:hover:not(:disabled){background:var(--forest-mid);transform:translateY(-1px);box-shadow:0 6px 20px rgba(30,58,47,.22);}
        .btn:disabled{opacity:.65;cursor:not-allowed;}
        .spinner{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,.3);border-top-color:white;animation:spin .7s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .link-row{text-align:center;font-size:.875rem;color:var(--text-muted);margin-top:1.25rem;}
        .link-row a{color:var(--forest-light);font-weight:500;text-decoration:none;}
        @media(max-width:768px){.page{grid-template-columns:1fr;}.left{display:none;}.right{padding:2rem 1.5rem;align-items:flex-start;padding-top:3rem;}}
      `}</style>

      <div className="page">
        <div className="left">
          <a href="/" className="logo">
            <span className="logo-dot" />
            Marathon Mindset
          </a>
          <div className="left-body">
            <div className="left-tag">Begin your journey</div>
            <h1 className="left-h">
              Small steps.
              <br />
              <em>Visible growth.</em>
            </h1>
            <p className="left-sub">
              Join people who stopped comparing timelines and started trusting
              their own journey.
            </p>
          </div>
          <div className="pillars">
            {[
              ["🌱", "Personalized daily focus"],
              ["📈", "Progress you can actually see"],
              ["🧘", "No pressure. No burnout."],
              ["🏆", "Celebrate every small win"],
            ].map(([icon, text], i) => (
              <div className="pillar" key={i}>
                <div className="pillar-icon">{icon}</div>
                {text}
              </div>
            ))}
          </div>
        </div>

        <div className="right">
          <div className="form-box">
            <div className="eyebrow">Step 1 of 2</div>
            <h2 className="form-title">Create your account</h2>
            <p className="form-sub">
              Free forever on the basics. No credit card needed.
            </p>

            {errors.api && <div className="api-err">{errors.api}</div>}

            {/* Name */}
            <div className="field">
              <label>Your name</label>
              <div className="fw">
                <input
                  type="text"
                  placeholder="e.g. Arjun Sharma"
                  autoComplete="name"
                  value={form.name}
                  className={errors.name ? "err" : ""}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, name: e.target.value }));
                    setErrors((er) => ({ ...er, name: "" }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                />
              </div>
              {errors.name && <span className="ferr">{errors.name}</span>}
            </div>

            {/* Username */}
            <div className="field">
              <label>Username</label>
              <span className="hint">This is what you'll use to sign in.</span>
              <div className="fw">
                <input
                  type="text"
                  placeholder="e.g. arjun_sharma"
                  autoComplete="username"
                  value={form.username}
                  className={errors.username ? "err" : ""}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, username: e.target.value }));
                    setErrors((er) => ({ ...er, username: "" }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                />
              </div>
              {errors.username && (
                <span className="ferr">{errors.username}</span>
              )}
            </div>

            {/* Password */}
            <div className="field">
              <label>Password</label>
              <div className="fw">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  style={{ paddingRight: "3.5rem" }}
                  value={form.password}
                  className={errors.password ? "err" : ""}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, password: e.target.value }));
                    setErrors((er) => ({ ...er, password: "" }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                />
                <button
                  type="button"
                  className="show-btn"
                  onClick={() => setShowPass((s) => !s)}
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="strength">
                  {[1, 2, 3].map((n) => {
                    const l = form.password.length;
                    const c =
                      l < 6
                        ? n === 1
                          ? "weak"
                          : ""
                        : l < 10
                          ? n <= 2
                            ? "med"
                            : ""
                          : "strong";
                    return <div key={n} className={`sbar ${c}`} />;
                  })}
                </div>
              )}
              {errors.password && (
                <span className="ferr">{errors.password}</span>
              )}
            </div>

            <button className="btn" disabled={loading} onClick={handleSubmit}>
              {loading ? (
                <>
                  <span className="spinner" />
                  Creating account…
                </>
              ) : (
                <>Create account →</>
              )}
            </button>

            <p className="link-row">
              Already have an account? <a href="/login">Sign in</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
