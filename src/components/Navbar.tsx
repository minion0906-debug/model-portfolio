"use client";

import Link from "next/link";
import { useState } from "react";

const navItems = [
  { href: "#gallery", label: "Gallery" },
  { href: "#videos", label: "Videos" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="container-page pt-4">
        <div className="rounded-2xl border border-white/40 bg-white/70 px-4 py-3 shadow-xl backdrop-blur-xl md:px-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="font-display text-2xl uppercase tracking-[0.12em] text-neutral-900">
              Avery
            </Link>

            <nav className="hidden items-center gap-8 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="nav-link text-xs uppercase tracking-[0.22em] text-neutral-600"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link href="#contact" className="btn-primary hidden md:inline-flex">
                Book now
              </Link>

              <button
                onClick={() => setOpen(!open)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white md:hidden"
                aria-label="Menu"
              >
                <span className="text-xl">{open ? "×" : "☰"}</span>
              </button>
            </div>
          </div>

          {open && (
            <nav className="mt-4 flex flex-col gap-4 border-t border-black/10 pt-4 md:hidden">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-xs uppercase tracking-[0.22em]"
                >
                  {item.label}
                </Link>
              ))}
              <Link href="#contact" className="btn-primary text-center">
                Book now
              </Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
