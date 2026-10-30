"use client";

import { useCallback, useEffect, useState } from "react";

type AlertLog = {
  id: string; alertType: string; status: string; attempts: number; lastError: string | null;
  createdAt: string; updatedAt: string;
  payment: { id: string; paypalOrderId: string; paymentMethod: string; amountCents: number; currency: string; payerEmail: string | null; status: string; createdAt: string; cryptoTxHash: string | null; media: { title: string | null } };
};
type Summary = { sent24h: number; failed: number; processing: number; pendingPayments: number; failedPayments: number };
const initial: Summary = { sent24h: 0, failed: 0, processing: 0, pendingPayments: 0, failedPayments: 0 };
const date = (value: string) => new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export default function PaymentOperationsDashboard() {
  const [logs, setLogs] = useState<AlertLog[]>([]);
  const [summary, setSummary] = useState<Summary>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retrying, setRetrying] = useState<string | null>(null);
  const load = useCallback(async () => {
    setError("");
    try {
      const response = await fetch("/api/admin/payment-alerts", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load payment operations.");
      setLogs(data.logs || []); setSummary(data.summary || initial);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to load payment operations."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function retry(id: string) {
    setRetrying(id); setError("");
    try {
      const response = await fetch(`/api/admin/payment-alerts/${id}`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Alert retry failed.");
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Alert retry failed."); }
    finally { setRetrying(null); }
  }

  const cards: [string, number, string][] = [
    ["Alerts sent · 24h", summary.sent24h, "Successfully delivered"],
    ["Failed alerts", summary.failed, "Can be retried manually"],
    ["In progress", summary.processing, "Currently being processed"],
    ["Pending payments", summary.pendingPayments, `${summary.failedPayments} failed in the last 24 hours`],
  ];
  return <div className="space-y-8">
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs uppercase tracking-[0.25em] text-neutral-500">Commerce · Operations</p><h1 className="mt-2 font-display text-4xl md:text-5xl">Payment operations</h1><p className="mt-2 max-w-2xl text-sm text-neutral-500">Monitor payment health, inspect notification delivery, and retry failed admin alerts.</p></div>
      <button onClick={() => { setLoading(true); void load(); }} className="rounded-full border border-black/10 px-5 py-2.5 text-sm hover:bg-black hover:text-white">Refresh</button>
    </header>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, detail]) => <article key={label} className="rounded-2xl border border-black/10 bg-white p-5"><p className="text-xs uppercase tracking-[0.16em] text-neutral-500">{label}</p><p className="mt-3 text-3xl font-medium">{value}</p><p className="mt-2 text-sm text-neutral-500">{detail}</p></article>)}</section>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    <section className="overflow-hidden rounded-2xl border border-black/10 bg-white">
      <div className="border-b border-black/10 p-5"><h2 className="text-lg font-medium">Alert delivery history</h2><p className="mt-1 text-sm text-neutral-500">Most recent 100 alert records. Retry is available only for failed deliveries.</p></div>
      {loading ? <p className="p-8 text-sm text-neutral-500">Loading payment alerts…</p> : logs.length === 0 ? <p className="p-8 text-sm text-neutral-500">No payment alerts have been recorded yet. Scheduled alerts will appear here.</p> : <div className="divide-y divide-black/10">{logs.map(log => <article key={log.id} className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs ${log.status === "SENT" ? "bg-green-50 text-green-800" : log.status === "FAILED" ? "bg-red-50 text-red-800" : "bg-amber-50 text-amber-800"}`}>{log.status}</span><span className="text-xs uppercase tracking-wide text-neutral-500">{log.alertType.replaceAll("_", " ")}</span><span className="text-xs text-neutral-400">{date(log.createdAt)}</span></div>
          <p className="mt-2 truncate text-sm font-medium">{log.payment.media.title || "Untitled media"} · {(log.payment.amountCents / 100).toFixed(2)} {log.payment.currency}</p>
          <p className="mt-1 break-all text-xs text-neutral-500">Order: {log.payment.paypalOrderId} · {log.payment.paymentMethod} · Payment: {log.payment.status}</p>
          {log.lastError && <p className="mt-2 text-xs text-red-700">Delivery error: {log.lastError}</p>}
          <p className="mt-1 text-xs text-neutral-400">Attempts: {log.attempts} · Updated {date(log.updatedAt)}</p>
        </div>
        {log.status === "FAILED" && <button disabled={retrying === log.id} onClick={() => void retry(log.id)} className="rounded-full border border-black/15 px-4 py-2 text-sm hover:bg-black hover:text-white disabled:opacity-50">{retrying === log.id ? "Retrying…" : "Retry email"}</button>}
      </article>)}</div>}
    </section>
  </div>;
}
