"use client";

import Link from "next/link";
import { useState } from "react";

const navItems = [
  { href: "#home", label: "Home" },
  { href: "#gallery", label: "Images" },
  { href: "#videos", label: "Videos" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="portfolio-header">
      <div className="portfolio-nav-wrap">
        <Link href="#home" className="portfolio-brand" aria-label="Home">
          <span>Model</span>
          <strong>Portfolio</strong>
        </Link>

        <nav className="portfolio-nav-links" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="portfolio-nav-link">
              {item.label}
            </Link>
          ))}
          <Link href="/admin/login" className="portfolio-login-link">Login</Link>
        </nav>

        <button
          type="button"
          className="portfolio-menu-button"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav className="portfolio-mobile-nav" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <Link key={`mobile-${item.label}`} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link href="/admin/login" onClick={() => setOpen(false)}>Login</Link>
        </nav>
      )}
    </header>
  );
}
