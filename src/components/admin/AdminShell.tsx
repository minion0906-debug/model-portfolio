"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const nav = [
  ["/admin", "Dashboard", "grid"],
  ["/admin/gallery", "Gallery", "image"],
  ["/admin/videos", "Videos", "play"],
  ["/admin/hero", "Hero", "spark"],
  ["/admin/bookings", "Bookings", "calendar"],
  ["/admin/messages", "Messages", "mail"],
  ["/admin/payments", "Payments", "card"],
  ["/admin/settings", "Settings", "settings"],
] as const;

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "grid") return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
  if (name === "image") return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m4 17 5-5 3.5 3 2.5-2.5 5 4.5"/></svg>;
  if (name === "play") return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m10 9 5 3-5 3V9Z"/></svg>;
  if (name === "spark") return <svg {...common}><path d="m12 2 1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2Z"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"/></svg>;
  if (name === "calendar") return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>;
  if (name === "mail") return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>;
  if (name === "card") return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/></svg>;
  if (name === "settings") return <svg {...common}><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/><path d="m4.9 4.9 1.8 1.8M17.3 17.3l1.8 1.8M4 12H2m20 0h-2M12 4V2m0 20v-2m-7.1-.9 1.8-1.8m12.4-12.4 1.8-1.8"/></svg>;
  if (name === "logout") return <svg {...common}><path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5"/><path d="m14 8 4 4-4 4M18 12H8"/></svg>;
  if (name === "menu") return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
  if (name === "arrow") return <svg {...common}><path d="M5 12h13M13 6l6 6-6 6"/></svg>;
  return null;
}

export default function AdminShell({ children, email }: { children: React.ReactNode; email: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST", cache: "no-store" });
    window.location.href = "/admin/login";
  }

  const current = nav.find(([href]) => href === "/admin" ? pathname === href : pathname.startsWith(href));
  const initials = email.slice(0, 1).toUpperCase();

  const sidebar = (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <Link href="/admin" className="admin-brand-mark">AV</Link>
        <div><strong>Aurelian Voss</strong><span>Studio Control</span></div>
      </div>

      <div className="admin-workspace-label">Workspace</div>
      <nav className="admin-nav" aria-label="Admin navigation">
        {nav.map(([href, label, icon]) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return <Link key={href} href={href} className={active ? "is-active" : ""}>
            <span className="admin-nav-icon"><Icon name={icon} size={17} /></span>
            <span>{label}</span>
            {active && <span className="admin-nav-active" />}
          </Link>;
        })}
      </nav>

      <div className="admin-sidebar-spacer" />
      <Link href="/" target="_blank" className="admin-preview-link"><span>View live site</span><Icon name="arrow" size={15} /></Link>
      <div className="admin-user-card">
        <div className="admin-avatar">{initials}</div>
        <div className="admin-user-copy"><strong>{email}</strong><span>Administrator</span></div>
        <button onClick={logout} aria-label="Sign out" title="Sign out"><Icon name="logout" size={17} /></button>
      </div>
    </aside>
  );

  return <div className="admin-app">
    {sidebar}
    <AnimatePresence>{mobileOpen && <>
      <motion.div className="admin-mobile-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
      <motion.div className="admin-mobile-drawer" initial={{ x: -340 }} animate={{ x: 0 }} exit={{ x: -340 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>{sidebar}</motion.div>
    </>}</AnimatePresence>

    <div className="admin-main">
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <button className="admin-mobile-trigger" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Icon name="menu" /></button>
          <div><span className="admin-breadcrumb">Studio /</span><strong>{current?.[1] ?? "Dashboard"}</strong></div>
        </div>
        <div className="admin-topbar-right">
          <span className="admin-live-dot"><i /> Site online</span>
          <span className="admin-top-email">{email}</span>
          <button className="admin-top-logout" onClick={logout}><Icon name="logout" size={16} /> Sign out</button>
        </div>
      </header>
      <main className="admin-content">{children}</main>
    </div>
  </div>;
}
