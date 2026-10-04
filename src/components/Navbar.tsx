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
    <header className="sticky top-0 z-50 border-b border-[#171412]/5 bg-[rgba(250,246,241,0.82)] backdrop-blur-xl">
      <div className="container-page flex items-center justify-between py-4">
        <Link href="/" className="font-display text-2xl tracking-[0.16em] text-[#171412] uppercase">
          Avery
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative text-[0.68rem] uppercase tracking-[0.28em] text-[#4d433e] transition-colors hover:text-[#171412]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="#contact" className="hidden btn-primary bg-[#171412] text-[#f9f5f0] hover:bg-[#2a2522] md:inline-flex">
            Book now
          </Link>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#171412]/10 bg-white/60 text-[#171412] md:hidden"
          >
            <span className="sr-only">Toggle menu</span>
            <div className="flex flex-col items-center gap-1.5">
              <span className="block h-0.5 w-4 rounded-full bg-current" />
              <span className="block h-0.5 w-4 rounded-full bg-current" />
              <span className="block h-0.5 w-4 rounded-full bg-current" />
            </div>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[#171412]/10 bg-[#f9f6f2] md:hidden">
          <nav className="container-page flex flex-col gap-3 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-[0.68rem] uppercase tracking-[0.26em] text-[#4d433e]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="#contact"
              onClick={() => setOpen(false)}
              className="mt-2 btn-primary w-full bg-[#171412] text-[#f9f5f0] hover:bg-[#2a2522]"
            >
              Book now
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
