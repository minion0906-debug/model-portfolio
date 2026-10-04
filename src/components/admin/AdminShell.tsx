"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type AdminShellProps = {
  email: string;
  children: React.ReactNode;
};

const navigation = [
  { label: "Dashboard", href: "/admin" },
  { label: "Gallery", href: "/admin/gallery" },
  { label: "Videos", href: "/admin/videos" },
  { label: "Hero", href: "/admin/hero" },
  { label: "Bookings", href: "/admin/bookings" },
  { label: "Messages", href: "/admin/messages" },
  { label: "Settings", href: "/admin/settings" },
];

export default function AdminShell({ email, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);

    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });

      router.replace("/admin/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f5f2] text-[#171614]">
      <header className="border-b border-black/10 bg-[#f7f5f2]">
        <div className="mx-auto flex min-h-20 max-w-[1440px] items-center justify-between gap-6 px-5 md:px-10">
          <Link href="/admin" className="font-display text-2xl">
            AV. <span className="text-sm text-neutral-400">ADMIN</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-neutral-500 md:block">
              {email}
            </span>

            <button
              type="button"
              onClick={logout}
              disabled={loggingOut}
              className="rounded-full border border-black/15 px-4 py-2 text-xs transition-colors hover:bg-black hover:text-white disabled:opacity-50"
            >
              {loggingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px] flex-col md:flex-row">
        <aside className="w-full border-b border-black/10 md:min-h-[calc(100vh-5rem)] md:w-64 md:border-b-0 md:border-r">
          <nav className="flex gap-2 overflow-x-auto p-4 md:flex-col md:p-6">
            {navigation.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap rounded-full px-4 py-2.5 text-sm transition-colors md:rounded-xl ${
                    active
                      ? "bg-[#171614] text-white"
                      : "text-neutral-600 hover:bg-black/5 hover:text-black"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-5 md:p-10">{children}</main>
      </div>
    </div>
  );
}
