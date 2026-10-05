"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok) {
        setError(data.error || "Unable to sign in.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0d0b0a] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(203,165,112,0.28),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.08),_transparent_32%)]" />
      <div className="absolute inset-y-0 right-0 hidden w-1/2 opacity-80 blur-3xl md:block" style={{ background: "radial-gradient(circle at center, rgba(203,165,112,0.18), transparent 60%)" }} />

      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-5 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
        <section className="hidden lg:flex lg:min-h-[620px] lg:flex-col lg:justify-between lg:rounded-[2rem] lg:border lg:border-white/10 lg:bg-white/4 lg:p-10 lg:shadow-[0_40px_120px_rgba(0,0,0,0.45)] lg:backdrop-blur-sm">
          <div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d9ba8d] bg-[#d9ba8d]/10 font-display text-xl text-[#f4d3a3]">
                AV
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.38em] text-white/55">Private studio</p>
                <p className="font-display text-2xl text-white">Aurelian Voss</p>
              </div>
            </div>

            <div className="mt-16 max-w-md">
              <p className="text-[10px] uppercase tracking-[0.38em] text-[#d9ba8d]">Curated portfolio control</p>
              <h1 className="font-display mt-6 text-6xl leading-none text-white">Your world, beautifully managed.</h1>
              <p className="mt-6 max-w-sm text-base leading-7 text-white/70">
                Update bookings, upload imagery, refine the gallery, and maintain the luxury story of your studio from one discreet, premium dashboard.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["14", "Projects"],
              ["3", "Campaigns"],
              ["24/7", "Access"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-5">
                <div className="font-display text-3xl text-[#f4d3a3]">{value}</div>
                <div className="mt-2 text-[10px] uppercase tracking-[0.28em] text-white/55">{label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative mx-auto w-full max-w-xl">
          <div className="rounded-[2rem] border border-white/10 bg-[#12100f]/80 p-5 shadow-[0_35px_100px_rgba(0,0,0,0.6)] backdrop-blur-xl md:p-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.36em] text-[#d9ba8d]">Secure access</p>
                <h2 className="font-display mt-2 text-4xl text-white md:text-5xl">Admin login</h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d9ba8d]/40 bg-[#d9ba8d]/10 text-[#f4d3a3]">
                ⎈
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-[10px] uppercase tracking-[0.28em] text-white/55">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-[#d9ba8d] focus:bg-white/7 focus:ring-2 focus:ring-[#d9ba8d]/20"
                  placeholder="admin@example.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-[10px] uppercase tracking-[0.28em] text-white/55">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-[#d9ba8d] focus:bg-white/7 focus:ring-2 focus:ring-[#d9ba8d]/20"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-gradient-to-r from-[#f2d7aa] via-[#d4ae72] to-[#b98f51] px-6 py-4 text-sm font-semibold uppercase tracking-[0.24em] text-[#171412] shadow-[0_18px_40px_rgba(184,143,81,0.38)] transition-all duration-200 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Signing in..." : "Enter studio"}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/10 pt-5 text-xs uppercase tracking-[0.22em] text-white/50">
              <a href="/" className="transition-colors hover:text-white">
                ← Website
              </a>
              <span>Protected area</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
