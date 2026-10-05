"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false); const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }), cache: "no-store" });
      const data = await response.json() as { success?: boolean; error?: string };
      if (!response.ok) { setError(data.error || "Unable to sign in."); return; }
      router.replace("/admin"); router.refresh();
    } catch { setError("Unable to connect. Please try again."); } finally { setLoading(false); }
  }

  return <main className="admin-login-page">
    <div className="login-noise" /><div className="login-orb orb-one" /><div className="login-orb orb-two" />
    <header className="login-brand"><a href="/" className="login-logo">AV</a><div><strong>Aurelian Voss</strong><span>Private studio</span></div></header>
    <div className="login-grid">
      <section className="login-editorial">
        <div className="login-index">01 — Private workspace</div>
        <h1>Make the<br/><i>work</i> visible.</h1>
        <p>Your private control room for the portfolio. Curate imagery, manage inquiries and keep every detail of the studio presentation sharp.</p>
        <div className="login-meta"><span>Portfolio CMS</span><span>Secure access</span><span>v2.0</span></div>
      </section>
      <motion.section className="login-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, ease: [.16,1,.3,1] }}>
        <div className="login-card-top"><span>Welcome back</span><span>02 / 02</span></div>
        <div className="login-heading"><span className="login-eyebrow">Administrator access</span><h2>Sign in</h2><p>Enter your studio credentials to continue.</p></div>
        <form onSubmit={handleSubmit} className="login-form">
          <label>Email address<input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></label>
          <label>Password<div className="login-password"><input type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password"/><button type="button" onClick={() => setShowPassword(v => !v)}>{showPassword ? "Hide" : "Show"}</button></div></label>
          {error && <div className="login-error" role="alert">{error}</div>}
          <button className="login-submit" disabled={loading}>{loading ? "Authenticating…" : "Enter studio"}<span>↗</span></button>
        </form>
        <div className="login-card-bottom"><a href="/">← Back to website</a><span><i /> Encrypted session</span></div>
      </motion.section>
    </div>
    <footer className="login-footer"><span>© {new Date().getFullYear()} Aurelian Voss</span><span>Private administration</span></footer>
  </main>;
}
