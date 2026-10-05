import Link from "next/link";
import { prisma } from "@/lib/prisma";

const formatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export default async function AdminDashboard() {
  let galleryCount = 0, publishedGalleryCount = 0, videoCount = 0, publishedVideoCount = 0, newBookingsCount = 0, unreadMessagesCount = 0;
  let recentBookings: Array<{ id: string; name: string; email: string; status: string; createdAt: Date }> = [];
  let recentMessages: Array<{ id: string; name: string; email: string; read: boolean; createdAt: Date }> = [];

  try {
    [galleryCount, publishedGalleryCount, videoCount, publishedVideoCount, newBookingsCount, unreadMessagesCount, recentBookings, recentMessages] = await Promise.all([
      prisma.media.count({ where: { type: "IMAGE" } }), prisma.media.count({ where: { type: "IMAGE", published: true } }),
      prisma.media.count({ where: { type: "VIDEO" } }), prisma.media.count({ where: { type: "VIDEO", published: true } }),
      prisma.bookingRequest.count({ where: { status: "NEW" } }), prisma.contactMessage.count({ where: { read: false } }),
      prisma.bookingRequest.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, email: true, status: true, createdAt: true } }),
      prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, email: true, read: true, createdAt: true } }),
    ]);
  } catch { /* dashboard stays usable if a non-critical query fails */ }

  const activity = [
    ...recentBookings.map(item => ({ id: `b-${item.id}`, kind: "Booking", title: item.name, detail: item.status, date: item.createdAt, href: "/admin/bookings", tone: "booking" })),
    ...recentMessages.map(item => ({ id: `m-${item.id}`, kind: "Message", title: item.name, detail: item.read ? "Read" : "Unread", date: item.createdAt, href: "/admin/messages", tone: "message" })),
  ].sort((a,b) => b.date.getTime() - a.date.getTime()).slice(0, 7);

  const stats = [
    { label: "Gallery", value: galleryCount, sub: `${publishedGalleryCount} published`, href: "/admin/gallery", className: "purple" },
    { label: "Video library", value: videoCount, sub: `${publishedVideoCount} published`, href: "/admin/videos", className: "blue" },
    { label: "New bookings", value: newBookingsCount, sub: newBookingsCount ? "Needs review" : "All caught up", href: "/admin/bookings", className: "orange" },
    { label: "Unread messages", value: unreadMessagesCount, sub: unreadMessagesCount ? "Needs attention" : "Inbox clear", href: "/admin/messages", className: "green" },
  ];

  return <div className="dashboard-page">
    <section className="dashboard-hero">
      <div>
        <div className="admin-eyebrow">Studio overview · October 2026</div>
        <h1>Good morning.</h1>
        <p>Everything important about your portfolio, content and incoming work in one place.</p>
      </div>
      <div className="dashboard-hero-actions"><Link href="/" target="_blank" className="admin-secondary-button">View website ↗</Link><Link href="/admin/gallery" className="admin-primary-button">Add new work <span>+</span></Link></div>
    </section>

    <section className="dashboard-stat-grid">
      {stats.map(stat => <Link href={stat.href} key={stat.label} className={`dashboard-stat ${stat.className}`}>
        <div className="dashboard-stat-top"><span>{stat.label}</span><span className="stat-arrow">↗</span></div>
        <div className="dashboard-stat-number">{stat.value}</div><div className="dashboard-stat-sub">{stat.sub}</div>
      </Link>)}
    </section>

    <section className="dashboard-grid">
      <div className="admin-panel activity-panel">
        <div className="admin-panel-heading"><div><span className="admin-eyebrow">Inbox</span><h2>Recent activity</h2></div><Link href="/admin/bookings">See all →</Link></div>
        {activity.length ? <div className="activity-list">{activity.map(item => <Link href={item.href} key={item.id} className="activity-row">
          <span className={`activity-icon ${item.tone}`}>{item.kind === "Booking" ? "B" : "M"}</span>
          <span className="activity-main"><strong>{item.title}</strong><small>{item.kind} · {item.detail}</small></span>
          <time>{formatter.format(item.date)}</time><span className="activity-chevron">→</span>
        </Link>)}</div> : <div className="empty-state"><strong>Nothing new yet</strong><span>New bookings and messages will appear here.</span></div>}
      </div>

      <div className="admin-panel quick-panel">
        <div className="admin-panel-heading"><div><span className="admin-eyebrow">Shortcuts</span><h2>Quick actions</h2></div></div>
        <div className="quick-grid">
          {[["Gallery", "/admin/gallery", "Add images"], ["Hero", "/admin/hero", "Edit cover"], ["Bookings", "/admin/bookings", "Review requests"], ["Messages", "/admin/messages", "Open inbox"], ["Videos", "/admin/videos", "Manage reels"], ["Settings", "/admin/settings", "Edit profile"]].map(([label, href, sub]) => <Link href={href} key={href} className="quick-action"><span><strong>{label}</strong><small>{sub}</small></span><b>↗</b></Link>)}
        </div>
      </div>
    </section>

    <section className="dashboard-footer-strip"><div><span className="status-pulse" /> Website is live</div><div>Portfolio content · {galleryCount + videoCount} total assets</div><Link href="/admin/settings">Manage site settings →</Link></section>
  </div>;
}
