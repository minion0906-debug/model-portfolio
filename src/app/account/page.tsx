"use client";
import { FormEvent, useState } from "react";

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/customer/magic-link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to send link.");
      setMessage(data.message + (data.developmentLink ? ` Development link: ${data.developmentLink}` : ""));
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to send link."); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-[#0b0b0c] px-5 py-10 text-white sm:px-8"><div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/[0.035] p-7 sm:p-10"><p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Secure access</p><h1 className="mt-3 text-3xl font-medium">Recover your purchases</h1><p className="mt-3 text-sm leading-6 text-white/50">Enter the email used for your PayPal purchase. We’ll send a one-time link that lets you access your purchase library on this device.</p><form onSubmit={submit} className="mt-8 space-y-4"><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-white/30"/><button disabled={busy} className="w-full rounded-full bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-black disabled:opacity-50">{busy ? "Sending…" : "Email me a secure link"}</button></form>{message && <p className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm leading-6 text-emerald-200">{message}</p>}{error && <p className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-200">{error}</p>}</div></main>;
}
