import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCustomerEmail } from "@/lib/customer-auth";
import PrintReceiptButton from "./PrintReceiptButton";

export const metadata = {
  title: "Purchase receipt",
  description: "View your completed media purchase receipt.",
  robots: { index: false, follow: false },
};

type Context = { params: Promise<{ paymentId: string }> };

function money(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}

export default async function PurchaseReceiptPage({ params }: Context) {
  const { paymentId } = await params;
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: {
      id: true,
      mediaId: true,
      paypalOrderId: true,
      amountCents: true,
      currency: true,
      status: true,
      payerName: true,
      payerEmail: true,
      paymentMethod: true,
      capturedAt: true,
      createdAt: true,
      media: { select: { id: true, title: true, type: true } },
    },
  });

  if (!payment || payment.status !== "COMPLETED") notFound();

  const cookieStore = await cookies();
  const token = cookieStore.get(`media_access_${payment.mediaId}`)?.value;
  const customerEmail = await getCustomerEmail();
  let tokenAuthorized = false;

  if (token) {
    const match = await prisma.payment.findFirst({
      where: { id: payment.id, mediaId: payment.mediaId, accessToken: token, status: "COMPLETED" },
      select: { id: true },
    });
    tokenAuthorized = Boolean(match);
  }

  const emailAuthorized = Boolean(customerEmail && payment.payerEmail && customerEmail.toLowerCase() === payment.payerEmail.toLowerCase());
  if (!tokenAuthorized && !emailAuthorized) notFound();

  const date = payment.capturedAt ?? payment.createdAt;
  const receiptNumber = `MP-${payment.id.slice(-10).toUpperCase()}`;

  return (
    <main className="min-h-screen bg-[#0b0b0c] px-5 py-10 text-white sm:px-8 print:bg-white print:p-0 print:text-black">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link href="/purchases" className="text-xs uppercase tracking-[0.16em] text-white/55 transition hover:text-white">← Back to purchases</Link>
          <PrintReceiptButton />
        </div>
        <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-10 print:rounded-none print:border-0 print:bg-white print:p-0">
          <div className="flex flex-wrap items-start justify-between gap-5 border-b border-white/10 pb-8 print:border-gray-200">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 print:text-gray-500">Model Portfolio</p>
              <h1 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">Purchase receipt</h1>
              <p className="mt-3 text-sm text-emerald-300 print:text-green-700">Payment completed</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 print:text-gray-500">Receipt number</p>
              <p className="mt-2 font-mono text-sm">{receiptNumber}</p>
              <p className="mt-2 text-sm text-white/50 print:text-gray-600">{date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
          </div>

          <section className="grid gap-6 border-b border-white/10 py-8 sm:grid-cols-2 print:border-gray-200">
            <div>
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-white/40 print:text-gray-500">Purchased item</h2>
              <p className="mt-3 text-lg font-medium">{payment.media.title || "Untitled media"}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.15em] text-white/45 print:text-gray-600">{payment.media.type === "IMAGE" ? "Photo / image" : "Video"}</p>
            </div>
            <div>
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-white/40 print:text-gray-500">Customer</h2>
              <p className="mt-3 text-sm">{payment.payerName || "Customer"}</p>
              {payment.payerEmail && <p className="mt-1 break-all text-sm text-white/55 print:text-gray-600">{payment.payerEmail}</p>}
            </div>
          </section>

          <section className="py-8">
            <div className="flex items-start justify-between gap-5 border-b border-white/10 pb-5 print:border-gray-200">
              <div>
                <p className="font-medium">{payment.media.title || "Media purchase"}</p>
                <p className="mt-1 text-xs text-white/45 print:text-gray-600">Digital media · {payment.paymentMethod.replaceAll("_", " ")}</p>
              </div>
              <p className="shrink-0 text-sm font-medium">{money(payment.amountCents, payment.currency)}</p>
            </div>
            <div className="ml-auto flex max-w-sm items-center justify-between gap-4 pt-5">
              <span className="text-sm text-white/55 print:text-gray-600">Total paid</span>
              <span className="text-2xl font-medium">{money(payment.amountCents, payment.currency)}</span>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-black/15 p-5 print:border-gray-200 print:bg-white">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 print:text-gray-500">Transaction details</p>
            <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-[150px_1fr]">
              <dt className="text-white/40 print:text-gray-500">Payment method</dt><dd>{payment.paymentMethod.replaceAll("_", " ")}</dd>
              <dt className="text-white/40 print:text-gray-500">PayPal order ID</dt><dd className="break-all font-mono">{payment.paypalOrderId}</dd>
              <dt className="text-white/40 print:text-gray-500">Payment date</dt><dd>{date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</dd>
              <dt className="text-white/40 print:text-gray-500">Payment status</dt><dd>Completed</dd>
            </dl>
          </section>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-white/40 print:text-gray-500">
            <p>Keep this receipt for your records.</p>
            <Link href={`/api/media/${payment.media.id}`} className="underline underline-offset-4 print:hidden">Open purchased media</Link>
          </div>
        </article>
      </div>
      <style>{`@media print { @page { margin: 16mm; } body { background: white !important; } }`}</style>
    </main>
  );
}
