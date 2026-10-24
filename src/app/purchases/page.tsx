import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCustomerEmail } from "@/lib/customer-auth";
import PurchaseLibrary from "./PurchaseLibrary";

export const metadata = {
  title: "Your purchases",
  description: "View and download media you have purchased.",
  robots: { index: false, follow: false },
};

const libraryMessages: Record<string, string> = {
  "invalid-link": "That access link is invalid. Request a fresh link to recover your purchases.",
  "expired-link": "That access link has expired or was already used. Request a new one to continue.",
  "no-purchases": "We couldn't find completed purchases for that link. Check the email used at checkout and try again.",
  "verification-failed": "We couldn't verify that link right now. Please request a new access link and try again.",
};

export default async function PurchasesPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const cookieStore = await cookies();
  const tokens = cookieStore.getAll()
    .filter((cookie) => cookie.name.startsWith("media_access_"))
    .map((cookie) => cookie.value)
    .filter(Boolean);
  const customerEmail = await getCustomerEmail();

  const payments = tokens.length || customerEmail
    ? await prisma.payment.findMany({
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
      })
    : [];

  const purchases = payments.map((payment) => ({ ...payment, capturedAt: payment.capturedAt?.toISOString() ?? null }));

  return (
    <main className="min-h-screen bg-[#0b0b0c] px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-white/10 pb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Customer library</p>
            <h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-5xl">Your purchases</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">View, search, and download your purchased media. Recover your library on another device with a secure email link.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!customerEmail && <Link href="/account" className="rounded-full bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-black">Recover purchases</Link>}
            {customerEmail && <form action="/api/customer/logout" method="post"><button className="rounded-full border border-white/15 px-5 py-2.5 text-xs uppercase tracking-[0.16em] text-white/70 transition hover:bg-white hover:text-black">Sign out</button></form>}
            <Link href="/#gallery" className="rounded-full border border-white/15 px-5 py-2.5 text-xs uppercase tracking-[0.16em] text-white/70 transition hover:bg-white hover:text-black">Back to portfolio</Link>
          </div>
        </div>
        {error && libraryMessages[error] && <div role="alert" className="mb-6 rounded-2xl border border-amber-300/20 bg-amber-300/5 px-5 py-4 text-sm leading-6 text-amber-100">{libraryMessages[error]} <Link href="/account" className="underline underline-offset-4">Recover purchases</Link></div>}
        <PurchaseLibrary purchases={purchases} />
      </div>
    </main>
  );
}
