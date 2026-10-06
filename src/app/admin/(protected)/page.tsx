import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  let galleryCount = 0;
  let publishedGalleryCount = 0;
  let videoCount = 0;
  let publishedVideoCount = 0;
  let newBookingsCount = 0;
  let unreadMessagesCount = 0;
  let recentBookings: Array<{ id: string; name: string; email: string; status: string; createdAt: Date }> = [];
  let recentMessages: Array<{ id: string; name: string; email: string; read: boolean; createdAt: Date }> = [];

  try {
    [
      galleryCount,
      publishedGalleryCount,
      videoCount,
      publishedVideoCount,
      newBookingsCount,
      unreadMessagesCount,
      recentBookings,
      recentMessages,
    ] = await Promise.all([
      prisma.media.count({ where: { type: "IMAGE" } }),
      prisma.media.count({ where: { type: "IMAGE", published: true } }),
      prisma.media.count({ where: { type: "VIDEO" } }),
      prisma.media.count({ where: { type: "VIDEO", published: true } }),
      prisma.bookingRequest.count({ where: { status: "NEW" } }),
      prisma.contactMessage.count({ where: { read: false } }),
      prisma.bookingRequest.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, email: true, status: true, createdAt: true },
      }),
      prisma.contactMessage.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, email: true, read: true, createdAt: true },
      }),
    ]);
  } catch {
    recentBookings = [];
    recentMessages = [];
  }

  const activity = [
    ...recentBookings.map((item) => ({
      id: `booking-${item.id}`,
      kind: "Booking",
      title: item.name,
      detail: item.status,
      date: item.createdAt,
      href: "/admin/bookings",
    })),
    ...recentMessages.map((item) => ({
      id: `message-${item.id}`,
      kind: "Message",
      title: item.name,
      detail: item.read ? "Read" : "Unread",
      date: item.createdAt,
      href: "/admin/messages",
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 8);

  const stats = [
    { label: "Gallery images", value: galleryCount, detail: `${publishedGalleryCount} published`, href: "/admin/gallery" },
    { label: "Videos", value: videoCount, detail: `${publishedVideoCount} published`, href: "/admin/videos" },
    { label: "New bookings", value: newBookingsCount, detail: "Awaiting review", href: "/admin/bookings" },
    { label: "Unread messages", value: unreadMessagesCount, detail: "Need attention", href: "/admin/messages" },
  ];

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">Overview</p>
        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-4xl md:text-5xl">Dashboard</h1>
            <p className="mt-2 text-sm text-neutral-500">
              A quick view of your portfolio and incoming requests.
            </p>
          </div>
          <Link href="/admin/settings" className="w-fit rounded-full border border-black/10 px-5 py-2.5 text-sm hover:bg-black hover:text-white">
            Site settings
          </Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="rounded-2xl border border-black/10 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">{stat.label}</p>
            <p className="mt-4 text-4xl font-medium">{stat.value}</p>
            <p className="mt-2 text-sm text-neutral-500">{stat.detail}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-black/10 bg-white p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Recent activity</p>
              <h2 className="mt-2 font-display text-2xl">Latest incoming activity</h2>
            </div>
            <Link href="/admin/bookings" className="text-sm underline underline-offset-4">View bookings</Link>
          </div>

          {activity.length === 0 ? (
            <div className="mt-8 rounded-xl bg-neutral-50 p-8 text-center text-sm text-neutral-500">
              No activity yet.
            </div>
          ) : (
            <div className="mt-6 divide-y divide-black/10">
              {activity.map((item) => (
                <Link key={item.id} href={item.href} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.15em] text-neutral-400">{item.kind}</p>
                    <p className="mt-1 truncate text-sm font-medium">{item.title}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-neutral-500">{item.detail}</p>
                    <p className="mt-1 text-xs text-neutral-400">{formatter.format(item.date)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Quick actions</p>
          <h2 className="mt-2 font-display text-2xl">Manage your site</h2>

          <div className="mt-6 grid gap-3">
            {[
              ["Upload gallery images", "/admin/gallery"],
              ["Manage videos", "/admin/videos"],
              ["Edit hero", "/admin/hero"],
              ["Review bookings", "/admin/bookings"],
              ["Read messages", "/admin/messages"],
              ["Update profile", "/admin/settings"],
            ].map(([label, href]) => (
              <Link key={href} href={href} className="flex items-center justify-between rounded-xl border border-black/10 px-4 py-3 text-sm transition hover:bg-black hover:text-white">
                <span>{label}</span>
                <span aria-hidden>→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
