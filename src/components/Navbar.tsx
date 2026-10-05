"use client";

import Link from "next/link";
import { useState } from "react";

const navItems = [
  { href: "#gallery", label: "Work" },
  { href: "#videos", label: "Motion" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="portfolio-header">
      <div className="portfolio-nav-wrap">
        <Link href="#home" className="portfolio-brand" aria-label="Lera Aumila home">
          <span className="portfolio-brand-mark">LA</span>
          <span className="portfolio-brand-name">Lera Aumila</span>
        </Link>

        <nav className="portfolio-nav-links" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="portfolio-nav-link">
              {item.label}
            </Link>
          ))}
          <Link href="#contact" className="portfolio-nav-cta">Book a project <span aria-hidden="true">↗</span></Link>
        </nav>

        <button
          type="button"
          className="portfolio-menu-button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="portfolio-mobile-navigation"
        >
          <span>{open ? "Close" : "Menu"}</span>
          <i aria-hidden="true" />
        </button>
      </div>

      {open && (
        <nav id="portfolio-mobile-navigation" className="portfolio-mobile-nav" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <Link key={`mobile-${item.label}`} href={item.href} onClick={() => setOpen(false)}>
              <span>{item.label}</span><span aria-hidden="true">↗</span>
            </Link>
          ))}
          <Link href="#contact" onClick={() => setOpen(false)} className="mobile-book-link">
            <span>Book a project</span><span aria-hidden="true">↗</span>
          </Link>
        </nav>
      )}
    </header>
  );
}
