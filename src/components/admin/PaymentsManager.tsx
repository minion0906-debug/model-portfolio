"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

 type Payment = {
  id: string;
  paypalOrderId: string;
  amountCents: number;
  currency: string;
  status: string;
  payerName: string | null;
  payerEmail: string | null;
  createdAt: string;
  capturedAt: string | null;
  media: { id: string; title: string | null; type: "IMAGE" | "VIDEO"; thumbnail: string | null; url: string };
};

type Summary = { revenueCents: number; total: number; completed: number; pending: number; failed: number };

const money = (cents: number, currency: string) => new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

export default function PaymentsManager() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<Summary>({ revenueCents: 0, total: 0, completed: 0, pending: 0, failed: 0 });
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    const params = new URLSearchParams({ take: "250" });
    if (q) params.set("q", q); if (status !== "ALL") params.set("status", status); if (from) params.set("from", from); if (to) params.set("to", to);
    try {
      const response = await fetch(`/api/admin/payments?${params}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load payments.");
      setPayments(data.payments || []); setSummary(data.summary);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to load payments."); }
    finally { setLoading(false); }
  }, [q, status, from, to]);

  useEffect(() => { void load(); }, [load]);

  const title = useMemo(() => payments.length === 1 ? "1 transaction" : `${payments.length} transactions`, [payments.length]);

  return <div className="space-y-8">
    <div>
      <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">Commerce</p>
      <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div><h1 className="font-display text-4xl md:text-5xl">Payments</h1><p className="mt-2 text-sm text-neutral-500">Monitor PayPal sales and paid media access.</p></div>
        <button onClick={() => void load()} className="rounded-full border border-black/10 px-5 py-2.5 text-sm hover:bg-black hover:text-white">Refresh</button>
      </div>
    </div>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[["Revenue", money(summary.revenueCents, "USD"), "Completed payments"], ["Sales", summary.completed, "Successful transactions"], ["Pending", summary.pending, "Awaiting completion"], ["Failed", summary.failed, "Unsuccessful transactions"]].map(([label, value, detail]) => <div key={String(label)} className="rounded-2xl border border-black/10 bg-white p-6"><p className="text-xs uppercase tracking-[0.18em] text-neutral-500">{label}</p><p className="mt-4 text-3xl font-medium">{value}</p><p className="mt-2 text-sm text-neutral-500">{detail}</p></div>)}
    </section>

    <section className="rounded-2xl border border-black/10 bg-white p-5 md:p-6">
      <div className="grid gap-3 lg:grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr]">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search buyer, email, order ID, media…" className="h-11 rounded-xl border border-black/10 bg-white px-4 text-sm outline-none focus:border-black" />
        <select value={status} onChange={e => setStatus(e.target.value)} className="h-11 rounded-xl border border-black/10 bg-white px-4 text-sm"><option value="ALL">All statuses</option><option value="COMPLETED">Completed</option><option value="PENDING">Pending</option><option value="FAILED">Failed</option></select>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="h-11 rounded-xl border border-black/10 bg-white px-4 text-sm" />
        <input type="date" value={to} onChange={e => setTo(e.target.value)} className="h-11 rounded-xl border border-black/10 bg-white px-4 text-sm" />
      </div>
    </section>

    <section className="overflow-hidden rounded-2xl border border-black/10 bg-white">
      <div className="flex items-center justify-between gap-4 border-b border-black/10 px-5 py-4 md:px-6"><div><p className="text-sm font-medium">Transactions</p><p className="mt-1 text-xs text-neutral-500">{loading ? "Loading…" : title}</p></div><span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600">PayPal</span></div>
      {error ? <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
      {loading ? <div className="p-10 text-center text-sm text-neutral-500">Loading payments…</div> : payments.length === 0 ? <div className="p-12 text-center"><p className="font-medium">No payments found</p><p className="mt-2 text-sm text-neutral-500">Completed PayPal purchases will appear here.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left"><thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.16em] text-neutral-500"><tr><th className="px-6 py-4">Media</th><th className="px-6 py-4">Buyer</th><th className="px-6 py-4">Order</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Date</th></tr></thead><tbody className="divide-y divide-black/10">{payments.map(payment => <tr key={payment.id} className="hover:bg-neutral-50/70"><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="h-11 w-14 overflow-hidden rounded-lg bg-neutral-100">{payment.media.thumbnail || payment.media.url ? <img src={payment.media.thumbnail || payment.media.url} alt="" className="h-full w-full object-cover" /> : null}</div><div><p className="max-w-[190px] truncate text-sm font-medium">{payment.media.title || `Untitled ${payment.media.type.toLowerCase()}`}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-neutral-400">{payment.media.type}</p></div></div></td><td className="px-6 py-4"><p className="text-sm">{payment.payerName || "PayPal buyer"}</p><p className="mt-1 text-xs text-neutral-500">{payment.payerEmail || "Email unavailable"}</p></td><td className="px-6 py-4 font-mono text-xs text-neutral-500">{payment.paypalOrderId}</td><td className="px-6 py-4 text-sm font-medium">{money(payment.amountCents, payment.currency)}</td><td className="px-6 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider ${payment.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700" : payment.status === "PENDING" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>{payment.status}</span></td><td className="px-6 py-4 text-xs text-neutral-500">{dateFormat.format(new Date(payment.capturedAt || payment.createdAt))}</td></tr>)}</tbody></table></div>}
    </section>
  </div>;
}
