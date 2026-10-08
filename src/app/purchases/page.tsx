import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCustomerEmail } from "@/lib/customer-auth";

function money(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export default async function PurchasesPage() {
  const cookieStore = await cookies();
  const accessCookies = cookieStore.getAll().filter((cookie) => cookie.name.startsWith("media_access_"));
  const tokens = accessCookies.map((cookie) => cookie.value).filter(Boolean);
  const customerEmail = await getCustomerEmail();

  const payments = await prisma.payment.findMany({
        where: {
          status: "COMPLETED",
          OR: [
            ...(tokens.length ? [{ accessToken: { in: tokens } }] : []),
            ...(customerEmail ? [{ payerEmail: customerEmail }] : []),
          ],
        },
        orderBy: { capturedAt: "desc" },
        select: {
          id: true,
          amountCents: true,
          currency: true,
          paypalOrderId: true,
          capturedAt: true,
          media: { select: { id: true, title: true, type: true, thumbnail: true } },
        },
      });

  return (
    <main className="min-h-screen bg-[#0b0b0c] px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5 border-b border-white/10 pb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Customer library</p>
            <h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-5xl">Your purchases</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">
              Purchased media is available here after checkout. You can also recover your library on another device with a secure email link.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!customerEmail && <Link href="/account" className="rounded-full bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-black">Recover purchases</Link>}
            {customerEmail && <form action="/api/customer/logout" method="post"><button className="rounded-full border border-white/15 px-5 py-2.5 text-xs uppercase tracking-[0.16em] text-white/70 transition hover:bg-white hover:text-black">Sign out</button></form>}
            <Link href="/#gallery" className="rounded-full border border-white/15 px-5 py-2.5 text-xs uppercase tracking-[0.16em] text-white/70 transition hover:bg-white hover:text-black">Back to portfolio</Link>
          </div>
        </div>

        {payments.length === 0 ? (
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
            <p className="text-2xl font-medium">No purchases yet</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/45">
              Completed purchases appear here automatically. If you are using a new device, recover your library with the secure email link.
            </p>
            <Link href="/#gallery" className="mt-7 inline-flex rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-black">
              Browse work
            </Link>
          </section>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {payments.map((payment) => (
              <article key={payment.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
                <div className="aspect-[4/3] bg-white/5">
                  {payment.media.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={payment.media.thumbnail} alt={payment.media.title || "Purchased media"} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.25em] text-white/25">{payment.media.type}</div>
                  )}
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">{payment.media.type}</p>
                      <h2 className="mt-1 font-medium">{payment.media.title || "Untitled media"}</h2>
                    </div>
                    <span className="text-sm text-white/70">{money(payment.amountCents, payment.currency)}</span>
                  </div>
                  <div className="text-[10px] leading-5 text-white/35">
                    Purchased {payment.capturedAt ? new Date(payment.capturedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "successfully"}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/api/media/${payment.media.id}`} target="_blank" className="flex-1 rounded-full bg-white px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-black transition hover:bg-white/90">
                      View
                    </Link>
                    <a href={`/api/media/${payment.media.id}?download=1`} className="rounded-full border border-white/15 px-4 py-2.5 text-[10px] uppercase tracking-[0.15em] text-white/70 transition hover:bg-white/10">
                      Download
                    </a>
                  </div>
                  <p className="truncate text-[9px] text-white/20">Order {payment.paypalOrderId}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
