import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [
    galleryCount,
    publishedGalleryCount,
    videoCount,
    newBookings,
    unreadMessages,
  ] = await Promise.all([
    prisma.media.count({
      where: { type: "IMAGE" },
    }),
    prisma.media.count({
      where: {
        type: "IMAGE",
        published: true,
      },
    }),
    prisma.media.count({
      where: { type: "VIDEO" },
    }),
    prisma.bookingRequest.count({
      where: { status: "NEW" },
    }),
    prisma.contactMessage.count({
      where: { read: false },
    }),
  ]);

  const stats = [
    ["Gallery Images", galleryCount, `${publishedGalleryCount} published`],
    ["Videos", videoCount, "Media library"],
    ["New Bookings", newBookings, "Needs attention"],
    ["Unread Messages", unreadMessages, "Needs attention"],
  ];

  return (
    <div>
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
          Studio management
        </p>
        <h1 className="font-display mt-3 text-5xl md:text-7xl">Dashboard</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-500">
          Manage portfolio media, booking requests, contact messages and site
          settings from one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, note]) => (
          <div
            key={label}
            className="rounded-2xl border border-black/10 bg-white/60 p-6"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              {label}
            </p>
            <p className="font-display mt-6 text-5xl">{value}</p>
            <p className="mt-3 text-xs text-neutral-400">{note}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl bg-[#171614] p-7 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">
            Next
          </p>
          <h2 className="font-display mt-3 text-3xl">
            Gallery management
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-white/60">
            Upload, publish, unpublish, edit and reorder your portfolio images.
          </p>
          <a
            href="/admin/gallery"
            className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm text-black"
          >
            Open gallery
          </a>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white/60 p-7">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            Public website
          </p>
          <h2 className="font-display mt-3 text-3xl">
            View your portfolio
          </h2>
          <p className="mt-3 text-sm leading-6 text-neutral-500">
            Published media is automatically displayed on the public site.
          </p>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex rounded-full border border-black/15 px-5 py-3 text-sm"
          >
            Open website ↗
          </a>
        </div>
      </div>
    </div>
  );
}
