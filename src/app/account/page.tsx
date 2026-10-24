"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/customer/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to send link.");
      setMessage(data.message + (data.developmentLink ? ` Development link: ${data.developmentLink}` : ""));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to send link.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0b0c] px-5 py-10 text-white sm:px-8 sm:py-16">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <section className="pt-2">
          <Link href="/#gallery" className="text-[10px] uppercase tracking-[0.25em] text-white/40 transition hover:text-white">← Back to portfolio</Link>
          <p className="mt-10 text-[10px] uppercase tracking-[0.3em] text-white/40">Customer account</p>
          <h1 className="mt-3 max-w-lg text-4xl font-medium tracking-tight sm:text-5xl">Your purchases, all in one place.</h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-white/55">Get a secure access link to your customer library using the email you entered at checkout. No password required.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm font-medium">Your media library</p>
              <p className="mt-2 text-xs leading-5 text-white/45">Find purchased photos and videos, then view or download them again.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm font-medium">Purchase receipts</p>
              <p className="mt-2 text-xs leading-5 text-white/45">Open a receipt for a completed purchase and print it or save it as a PDF.</p>
            </div>
          </div>
          <Link href="/purchases" className="mt-5 inline-flex rounded-full border border-white/15 px-5 py-3 text-[10px] uppercase tracking-[0.17em] text-white/70 transition hover:bg-white hover:text-black">Open purchase library</Link>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-10">
          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5"><rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4.5 7 7.5 5.5L19.5 7"/></svg>
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Secure access</p>
          <h2 className="mt-3 text-2xl font-medium">Recover your purchases</h2>
          <p className="mt-3 text-sm leading-6 text-white/50">Enter the email used for your PayPal purchase. We’ll send a one-time link to restore access to your purchase library on this device.</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <label htmlFor="account-email" className="block text-xs text-white/65">Email address</label>
            <input id="account-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm outline-none placeholder:text-white/25 focus:border-white/30" />
            <button disabled={busy} className="w-full rounded-full bg-white px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Sending secure link…" : "Email me a secure link"}</button>
          </form>
          {message && <p role="status" className="mt-5 break-words rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm leading-6 text-emerald-200">{message}</p>}
          {error && <p role="alert" className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm leading-6 text-red-200">{error}</p>}
          <p className="mt-6 text-[11px] leading-5 text-white/30">For your security, only use access links sent to your own email inbox. Links may expire after a short period.</p>
        </section>
      </div>
    </main>
  );
}
