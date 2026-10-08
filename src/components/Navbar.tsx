"use client";
import Link from "next/link";
import { useState } from "react";

const navItems = [
  { href: "#gallery", label: "Work" },
  { href: "#videos", label: "Motion" },
  { href: "#about", label: "Profile" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="studio-nav">
      <div className="studio-nav-inner">
        <Link href="#home" className="studio-logo" aria-label="Home">LA<span>/</span></Link>
        <nav className="studio-nav-links">
          {navItems.map((item) => <Link key={item.label} href={item.href}>{item.label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/purchases" className="hidden rounded-full border border-black/10 px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-black/65 transition hover:bg-black hover:text-white sm:inline-flex">Purchases</Link>
          <Link href="#booking" className="studio-nav-book">Book <span>↗</span></Link>
        </div>
        <button className="studio-menu" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? "Close" : "Menu"}</button>
      </div>
      {open && <nav className="studio-mobile-nav"><Link href="/purchases" onClick={() => setOpen(false)}>Purchases<span>↗</span></Link>{navItems.map((item) => <Link key={item.label} href={item.href} onClick={() => setOpen(false)}>{item.label}<span>↗</span></Link>)}<Link href="#booking" onClick={() => setOpen(false)}>Book a project<span>↗</span></Link></nav>}
    </header>
  );
}
