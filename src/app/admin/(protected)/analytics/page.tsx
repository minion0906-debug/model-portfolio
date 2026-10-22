import Link from "next/link";
import { prisma } from "@/lib/prisma";

const currency = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
const percent = (value: number) => `${Math.round(value * 10) / 10}%`;

export default async function AdminAnalyticsPage() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  let bookings: Array<{ createdAt: Date; status: string }> = [];
  let payments: Array<{ createdAt: Date; capturedAt: Date | null; amountCents: number; status: string }> = [];
  let totalBookings = 0;
  let qualifiedBookings = 0;
  let completedPayments = 0;
  let completedRevenue = 0;
  let unreadMessages = 0;
  let dataAvailable = true;

  try {
    [bookings, payments, totalBookings, qualifiedBookings, completedPayments, completedRevenue, unreadMessages] = await Promise.all([
      prisma.bookingRequest.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true, status: true } }),
      prisma.payment.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true, capturedAt: true, amountCents: true, status: true } }),
      prisma.bookingRequest.count(),
      prisma.bookingRequest.count({ where: { status: { in: ["ACCEPTED", "COMPLETED"] } } }),
      prisma.payment.count({ where: { status: "COMPLETED" } }),
      prisma.payment.aggregate({ where: { status: "COMPLETED" }, _sum: { amountCents: true } }).then((result) => result._sum.amountCents ?? 0),
      prisma.contactMessage.count({ where: { read: false } }),
    ]);
  } catch {
    dataAvailable = false;
  }

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    return { key: `${date.getFullYear()}-${date.getMonth()}`, label: new Intl.DateTimeFormat("en-US", { month: "short" }).format(date), bookings: 0, sales: 0, revenue: 0 };
  });
  const monthMap = new Map(months.map((month) => [month.key, month]));
  for (const booking of bookings) {
    const month = monthMap.get(`${booking.createdAt.getFullYear()}-${booking.createdAt.getMonth()}`);
    if (month) month.bookings += 1;
  }
  for (const payment of payments) {
    if (payment.status !== "COMPLETED") continue;
    const eventDate = payment.capturedAt ?? payment.createdAt;
    const month = monthMap.get(`${eventDate.getFullYear()}-${eventDate.getMonth()}`);
    if (month) {
      month.sales += 1;
      month.revenue += payment.amountCents;
    }
  }

  const maxBookings = Math.max(1, ...months.map((month) => month.bookings));
  const maxRevenue = Math.max(1, ...months.map((month) => month.revenue));
  const conversion = totalBookings > 0 ? (qualifiedBookings / totalBookings) * 100 : 0;
  const sixMonthRevenue = months.reduce((sum, month) => sum + month.revenue, 0);
  const sixMonthSales = months.reduce((sum, month) => sum + month.sales, 0);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">Performance</p>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">Analytics</h1>
          <p className="mt-2 text-sm text-neutral-500">Six-month trends for booking requests and completed sales.</p>
        </div>
        <Link href="/admin" className="w-fit rounded-full border border-black/10 px-5 py-2.5 text-sm hover:bg-black hover:text-white">Back to dashboard</Link>
      </header>

      {!dataAvailable && <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">Analytics data could not be loaded. Check the database connection and try again.</div>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "All booking requests", value: totalBookings.toLocaleString("en-US"), detail: "All-time submissions" },
          { label: "Accepted / completed", value: qualifiedBookings.toLocaleString("en-US"), detail: `${percent(conversion)} of all requests` },
          { label: "Completed sales", value: completedPayments.toLocaleString("en-US"), detail: "All-time completed payments" },
          { label: "Completed revenue", value: currency(completedRevenue), detail: `${unreadMessages} unread messages` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-black/10 bg-white p-6">
            <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">{stat.label}</p>
            <p className="mt-4 text-3xl font-medium tabular-nums">{stat.value}</p>
            <p className="mt-2 text-sm text-neutral-500">{stat.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-black/10 bg-white p-6 md:p-8">
          <div className="flex items-start justify-between gap-3">
            <div><p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Demand</p><h2 className="mt-2 font-display text-2xl">Booking requests</h2></div>
            <Link href="/admin/bookings" className="text-sm underline underline-offset-4">Manage</Link>
          </div>
          <div className="mt-8 grid h-56 grid-cols-6 items-end gap-3">
            {months.map((month) => (
              <div key={month.key} className="flex h-full flex-col items-center justify-end gap-2">
                <span className="text-xs font-medium tabular-nums">{month.bookings}</span>
                <div className="flex h-40 w-full items-end overflow-hidden rounded-t-md bg-neutral-100"><div className="w-full rounded-t-md bg-neutral-800" style={{ height: `${Math.max(month.bookings > 0 ? 5 : 0, (month.bookings / maxBookings) * 100)}%` }} /></div>
                <span className="text-xs text-neutral-500">{month.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-neutral-500">Requests are grouped by the date they were submitted.</p>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-6 md:p-8">
          <div className="flex items-start justify-between gap-3">
            <div><p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Revenue</p><h2 className="mt-2 font-display text-2xl">Completed sales</h2></div>
          <Link href="/admin/payments" className="text-sm underline underline-offset-4">View payments</Link>
          </div>
          <p className="mt-5 text-3xl font-medium tabular-nums">{currency(sixMonthRevenue)}</p>
          <p className="mt-1 text-sm text-neutral-500">{sixMonthSales} completed sales in the last six calendar months</p>
          <div className="mt-6 space-y-4">
            {months.map((month) => (
              <div key={month.key}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm"><span className="text-neutral-600">{month.label}</span><span className="font-medium tabular-nums">{currency(month.revenue)} <span className="text-neutral-400">· {month.sales} sales</span></span></div>
                <div className="h-2 overflow-hidden rounded-full bg-neutral-100"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${(month.revenue / maxRevenue) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <p className="text-xs text-neutral-500">Revenue reflects completed payment records and their stored amounts; it does not subtract refunds. Values use USD formatting.</p>
    </div>
  );
}
