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
    <div className="min-h-screen bg-[#f7f5f2] text-[#171614]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f7f5f2]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:px-8">
          <Link href="/admin" className="font-display text-xl">AV. CMS</Link>

          <button
            onClick={() => setOpen((value) => !value)}
            className="rounded-full border border-black/10 px-4 py-2 text-xs md:hidden"
          >
            Menu
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            {nav.map(([href, label]) => {
              const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-full px-3 py-2 text-xs transition ${
                    active ? "bg-black text-white" : "text-neutral-600 hover:bg-black/5 hover:text-black"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <span className="max-w-48 truncate text-xs text-neutral-500">{email}</span>
            <button onClick={logout} className="text-xs underline underline-offset-4">Sign out</button>
          </div>
        </div>

        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-black/10 px-5 py-4 md:hidden"
          >
            <nav className="grid gap-1">
              {nav.map(([href, label]) => {
                const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`rounded-xl px-4 py-3 text-sm ${active ? "bg-black text-white" : "hover:bg-black/5"}`}
                  >
                    {label}
                  </Link>
                );
              })}
              <button onClick={logout} className="mt-2 rounded-xl px-4 py-3 text-left text-sm hover:bg-black/5">
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
