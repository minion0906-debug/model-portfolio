import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  let galleryCount = 0;
  let publishedGalleryCount = 0;
  let videoCount = 0;
  let publishedVideoCount = 0;
  let newBookingsCount = 0;
  let reviewingBookingsCount = 0;
  let acceptedBookingsCount = 0;
  let completedBookingsCount = 0;
  let totalBookingsCount = 0;
  let totalMessagesCount = 0;
  let unreadMessagesCount = 0;
  let paymentRevenueCents = 0;
  let paymentSalesCount = 0;
  let recentBookings: Array<{ id: string; name: string; email: string; status: string; createdAt: Date }> = [];
  let recentMessages: Array<{ id: string; name: string; email: string; read: boolean; createdAt: Date }> = [];

  try {
    [
      galleryCount,
      publishedGalleryCount,
      videoCount,
      publishedVideoCount,
      newBookingsCount,
      reviewingBookingsCount,
      acceptedBookingsCount,
      completedBookingsCount,
      totalBookingsCount,
      totalMessagesCount,
      unreadMessagesCount,
      paymentRevenueCents,
      paymentSalesCount,
      recentBookings,
      recentMessages,
    ] = await Promise.all([
      prisma.media.count({ where: { type: "IMAGE" } }),
      prisma.media.count({ where: { type: "IMAGE", published: true } }),
      prisma.media.count({ where: { type: "VIDEO" } }),
      prisma.media.count({ where: { type: "VIDEO", published: true } }),
      prisma.bookingRequest.count({ where: { status: "NEW" } }),
      prisma.bookingRequest.count({ where: { status: "REVIEWING" } }),
      prisma.bookingRequest.count({ where: { status: "ACCEPTED" } }),
      prisma.bookingRequest.count({ where: { status: "COMPLETED" } }),
      prisma.bookingRequest.count(),
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { read: false } }),
      prisma.payment.aggregate({ where: { status: "COMPLETED" }, _sum: { amountCents: true } }).then(result => result._sum.amountCents || 0),
      prisma.payment.count({ where: { status: "COMPLETED" } }),
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
    { label: "Payment sales", value: paymentSalesCount, detail: `$${(paymentRevenueCents / 100).toFixed(2)} completed revenue`, href: "/admin/payments" },
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="rounded-2xl border border-black/10 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">{stat.label}</p>
            <p className="mt-4 text-4xl font-medium">{stat.value}</p>
            <p className="mt-2 text-sm text-neutral-500">{stat.detail}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-black/10 bg-white p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Booking pipeline</p>
              <h2 className="mt-2 font-display text-2xl">Requests at a glance</h2>
            </div>
            <Link href="/admin/bookings" className="text-sm underline underline-offset-4">Manage</Link>
          </div>
          <div className="mt-6 space-y-5">
            {[
              { label: "New", count: newBookingsCount, color: "bg-amber-400" },
              { label: "Reviewing", count: reviewingBookingsCount, color: "bg-blue-500" },
              { label: "Accepted", count: acceptedBookingsCount, color: "bg-emerald-500" },
              { label: "Completed", count: completedBookingsCount, color: "bg-neutral-800" },
            ].map((item) => {
              const percent = totalBookingsCount > 0 ? Math.round((item.count / totalBookingsCount) * 100) : 0;
              return (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-neutral-600">{item.label}</span>
                    <span className="font-medium tabular-nums">{item.count} <span className="text-neutral-400">({percent}%)</span></span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
            {totalBookingsCount === 0 && <p className="text-sm text-neutral-500">Booking status summaries will appear when requests arrive.</p>}
          </div>
          <div className="mt-6 border-t border-black/10 pt-4 text-sm text-neutral-500">{totalBookingsCount} total requests received</div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Portfolio health</p>
          <h2 className="mt-2 font-display text-2xl">Published content</h2>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-neutral-50 p-4">
              <p className="text-sm text-neutral-500">Images published</p>
              <p className="mt-2 text-3xl font-medium tabular-nums">{publishedGalleryCount}<span className="text-lg text-neutral-400">/{galleryCount}</span></p>
              <p className="mt-1 text-xs text-neutral-500">{galleryCount > 0 ? Math.round((publishedGalleryCount / galleryCount) * 100) : 0}% of images</p>
            </div>
            <div className="rounded-xl bg-neutral-50 p-4">
              <p className="text-sm text-neutral-500">Videos published</p>
              <p className="mt-2 text-3xl font-medium tabular-nums">{publishedVideoCount}<span className="text-lg text-neutral-400">/{videoCount}</span></p>
              <p className="mt-1 text-xs text-neutral-500">{videoCount > 0 ? Math.round((publishedVideoCount / videoCount) * 100) : 0}% of videos</p>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between rounded-xl border border-black/10 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Messages inbox</p>
              <p className="mt-1 text-xs text-neutral-500">{totalMessagesCount} total · {unreadMessagesCount} unread</p>
            </div>
            <Link href="/admin/messages" className="text-sm underline underline-offset-4">Open inbox</Link>
          </div>
          <div className="mt-3 flex gap-3">
            <Link href="/admin/gallery" className="flex-1 rounded-xl border border-black/10 px-4 py-3 text-center text-sm transition hover:bg-black hover:text-white">Manage images</Link>
            <Link href="/admin/videos" className="flex-1 rounded-xl border border-black/10 px-4 py-3 text-center text-sm transition hover:bg-black hover:text-white">Manage videos</Link>
          </div>
        </div>
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
              ["View payments", "/admin/payments"],
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
