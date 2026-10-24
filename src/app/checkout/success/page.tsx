import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCustomerEmail } from "@/lib/customer-auth";

export const metadata = {
  title: "Purchase successful",
  description: "Payment confirmation and access to your purchased media.",
  robots: { index: false, follow: false },
};

type Context = { searchParams: Promise<{ paymentId?: string }> };

function money(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}

export default async function CheckoutSuccessPage({ searchParams }: Context) {
  const { paymentId } = await searchParams;
  if (!paymentId || paymentId.length > 128) notFound();

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: {
      id: true,
      mediaId: true,
      amountCents: true,
      currency: true,
      status: true,
      paymentMethod: true,
      payerEmail: true,
      capturedAt: true,
      createdAt: true,
      accessToken: true,
      media: { select: { id: true, title: true, type: true } },
    },
  });
  if (!payment || payment.status !== "COMPLETED") notFound();

  const cookieStore = await cookies();
  const token = cookieStore.get(`media_access_${payment.mediaId}`)?.value;
  const tokenAuthorized = token === payment.accessToken;
  const customerEmail = await getCustomerEmail();
  const emailAuthorized = Boolean(
    customerEmail && payment.payerEmail &&
    customerEmail.toLowerCase() === payment.payerEmail.toLowerCase(),
  );
  if (!tokenAuthorized && !emailAuthorized) notFound();

  const paidAt = payment.capturedAt ?? payment.createdAt;
  const itemLabel = payment.media.type === "IMAGE" ? "Photo / image" : "Video";

  return (
    <main className="min-h-screen bg-[#0b0b0c] px-5 py-12 text-white sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-6 sm:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-300/25 bg-emerald-300/10 text-2xl text-emerald-200" aria-hidden="true">✓</div>
          <p className="mt-7 text-[10px] uppercase tracking-[0.3em] text-emerald-200/75">Payment confirmed</p>
          <h1 className="mt-3 text-3xl font-medium tracking-tight sm:text-5xl">Thank you for your purchase.</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/55">Your payment was verified and your purchased media is now available. Keep this page or use your receipt for your records.</p>

          <section className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5 sm:p-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Order summary</p>
            <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="break-words text-lg font-medium">{payment.media.title || "Purchased media"}</h2>
                <p className="mt-1 text-xs text-white/45">{itemLabel} · {payment.paymentMethod.replaceAll("_", " ")}</p>
              </div>
              <p className="shrink-0 text-xl font-medium">{money(payment.amountCents, payment.currency)}</p>
            </div>
            <dl className="mt-5 grid gap-3 border-t border-white/10 pt-5 text-xs sm:grid-cols-[130px_1fr]">
              <dt className="text-white/40">Order reference</dt><dd className="break-all font-mono">MP-{payment.id.slice(-10).toUpperCase()}</dd>
              <dt className="text-white/40">Payment date</dt><dd>{paidAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</dd>
              <dt className="text-white/40">Status</dt><dd className="text-emerald-200">Completed</dd>
            </dl>
          </section>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href={`/api/media/${payment.media.id}`} className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-white/85">Open purchased media ↗</Link>
            <Link href={`/purchases/receipt/${payment.id}`} className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-xs uppercase tracking-[0.14em] text-white/75 transition hover:bg-white/10">View receipt</Link>
            <Link href="/purchases" className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-xs uppercase tracking-[0.14em] text-white/75 transition hover:bg-white/10">My purchases</Link>
          </div>
        </div>
        <p className="mt-5 text-center text-xs leading-5 text-white/35">Need to access this purchase later? Visit your purchase library to recover access using your email.</p>
      </div>
    </main>
  );
}
