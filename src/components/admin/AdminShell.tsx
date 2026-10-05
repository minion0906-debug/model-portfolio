"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";

const nav = [
  ["/admin", "Dashboard"],
  ["/admin/gallery", "Gallery"],
  ["/admin/videos", "Videos"],
  ["/admin/hero", "Hero"],
  ["/admin/bookings", "Bookings"],
  ["/admin/messages", "Messages"],
  ["/admin/settings", "Settings"],
];

export default function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(203,165,112,0.14),_transparent_28%),linear-gradient(180deg,#f5f0ea_0%,#f1ebe4_100%)] text-[#171412]">
      <header className="sticky top-0 z-40 border-b border-[#1a1816]/10 bg-[#f7f3ee]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-3 px-5 md:px-8">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d5b38a] bg-[#d5b38a]/10 font-display text-lg text-[#8a6842]">
              AV
            </span>
            <div className="leading-none">
              <div className="font-display text-xl">Aurelian Voss</div>
              <div className="mt-1 text-[9px] uppercase tracking-[0.28em] text-[#584e49]">Studio CMS</div>
            </div>
          </Link>

          <button
            onClick={() => setOpen((value) => !value)}
            className="rounded-full border border-[#171412]/10 bg-white/70 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-[#171412] md:hidden"
          >
            Menu
          </button>

          <nav className="hidden items-center gap-2 md:flex">
            {nav.map(([href, label]) => {
              const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-full border px-3.5 py-2 text-[10px] uppercase tracking-[0.18em] transition-all ${
                    active
                      ? "border-[#171412] bg-[#171412] text-white shadow-[0_10px_30px_rgba(23,20,18,0.16)]"
                      : "border-transparent text-[#584e49] hover:border-[#171412]/10 hover:bg-white/50 hover:text-[#171412]"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <span className="max-w-48 truncate rounded-full border border-[#171412]/10 bg-white/50 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-[#584e49]">
              {email}
            </span>
            <button
              onClick={logout}
              className="rounded-full border border-[#171412]/10 bg-transparent px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-[#171412] transition hover:bg-[#171412] hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>

        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[#171412]/10 bg-[#f7f3ee]/95 px-5 py-4 md:hidden"
          >
            <nav className="grid gap-2">
              {nav.map(([href, label]) => {
                const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      active ? "bg-[#171412] text-white" : "bg-white/60 text-[#171412] hover:bg-white"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
              <button
                onClick={logout}
                className="mt-2 rounded-2xl bg-[#171412] px-4 py-3 text-left text-sm text-white"
              >
                Sign out
              </button>
            </nav>
          </motion.div>
        )}
      </header>

      <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-8 md:py-10">
        {children}
      </main>
    </div>
  );
}
