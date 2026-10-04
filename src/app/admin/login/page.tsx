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
    <main className="min-h-screen bg-[#171614] px-5 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <div className="w-full">
          <div className="mb-10">
            <p className="font-display text-3xl">AV.</p>
            <p className="mt-8 text-xs uppercase tracking-[0.3em] text-white/50">
              Private Studio
            </p>
            <h1 className="font-display mt-3 text-5xl">Admin Login</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/50"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full border-b border-white/20 bg-transparent px-0 py-4 outline-none transition-colors focus:border-white"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/50"
              >
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
                className="w-full border-b border-white/20 bg-transparent px-0 py-4 outline-none transition-colors focus:border-white"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-white px-6 py-4 text-sm font-medium text-black transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <a
            href="/"
            className="mt-8 inline-block text-xs uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-white"
          >
            ← Back to website
          </a>
        </div>
      </div>
    </main>
  );
}
