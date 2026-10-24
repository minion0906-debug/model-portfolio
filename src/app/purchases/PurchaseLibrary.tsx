"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Purchase = {
  id: string;
  amountCents: number;
  currency: string;
  paypalOrderId: string;
  capturedAt: string | null;
  media: { id: string; title: string | null; type: "IMAGE" | "VIDEO"; thumbnail: string | null };
};

function money(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}

export default function PurchaseLibrary({ purchases }: { purchases: Purchase[] }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"ALL" | "IMAGE" | "VIDEO">("ALL");
  const [order, setOrder] = useState<"NEWEST" | "OLDEST">("NEWEST");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return purchases
      .filter((purchase) => kind === "ALL" || purchase.media.type === kind)
      .filter((purchase) => {
        if (!normalized) return true;
        return [purchase.media.title || "", purchase.media.type, purchase.paypalOrderId]
          .some((value) => value.toLowerCase().includes(normalized));
      })
      .sort((a, b) => {
        const left = a.capturedAt ? new Date(a.capturedAt).getTime() : 0;
        const right = b.capturedAt ? new Date(b.capturedAt).getTime() : 0;
        return order === "NEWEST" ? right - left : left - right;
      });
  }, [purchases, query, kind, order]);

  if (purchases.length === 0) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
        <p className="text-2xl font-medium">No purchases yet</p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/45">
          Completed purchases appear here automatically. If you are using a new device, recover your library with the secure email link.
        </p>
        <Link href="/#gallery" className="mt-7 inline-flex rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-black">
          Browse work
        </Link>
      </section>
    );
  }

  return (
    <>
      <section aria-label="Filter purchases" className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-[1fr_auto_auto]">
        <label className="sr-only" htmlFor="purchase-search">Search purchases</label>
        <input
          id="purchase-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search title or order ID…"
          className="min-w-0 rounded-full border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30"
        />
        <label className="sr-only" htmlFor="purchase-kind">Media type</label>
        <select id="purchase-kind" value={kind} onChange={(event) => setKind(event.target.value as typeof kind)} className="rounded-full border border-white/10 bg-[#171719] px-4 py-3 text-xs text-white/80 outline-none focus:border-white/30">
          <option value="ALL">All media</option>
          <option value="IMAGE">Images</option>
          <option value="VIDEO">Videos</option>
        </select>
        <label className="sr-only" htmlFor="purchase-order">Sort purchases</label>
        <select id="purchase-order" value={order} onChange={(event) => setOrder(event.target.value as typeof order)} className="rounded-full border border-white/10 bg-[#171719] px-4 py-3 text-xs text-white/80 outline-none focus:border-white/30">
          <option value="NEWEST">Newest first</option>
          <option value="OLDEST">Oldest first</option>
        </select>
      </section>

      <p className="mb-4 text-xs text-white/40" aria-live="polite">Showing {filtered.length} of {purchases.length} purchases</p>
      {filtered.length === 0 ? (
        <section className="rounded-2xl border border-white/10 px-6 py-12 text-center">
          <p className="font-medium">No matching purchases</p>
          <p className="mt-2 text-sm text-white/45">Try a different search or media type.</p>
          <button type="button" onClick={() => { setQuery(""); setKind("ALL"); }} className="mt-5 rounded-full border border-white/20 px-5 py-2.5 text-xs uppercase tracking-wider hover:bg-white/10">Clear filters</button>
        </section>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((purchase) => (
            <article key={purchase.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
              <div className="aspect-[4/3] bg-white/5">
                {purchase.media.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={purchase.media.thumbnail} alt={purchase.media.title || "Purchased media"} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.25em] text-white/25">{purchase.media.type}</div>
                )}
              </div>
              <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">{purchase.media.type}</p>
                    <h2 className="mt-1 font-medium">{purchase.media.title || "Untitled media"}</h2>
                  </div>
                  <span className="shrink-0 text-sm text-white/70">{money(purchase.amountCents, purchase.currency)}</span>
                </div>
                <div className="text-[10px] leading-5 text-white/35">
                  Purchased {purchase.capturedAt ? new Date(purchase.capturedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "successfully"}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/api/media/${purchase.media.id}`} target="_blank" rel="noreferrer" className="min-w-[76px] flex-1 rounded-full bg-white px-3 py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-black transition hover:bg-white/90">View</Link>
                  <a href={`/api/media/${purchase.media.id}?download=1`} className="rounded-full border border-white/15 px-3 py-2.5 text-[10px] uppercase tracking-[0.12em] text-white/70 transition hover:bg-white/10">Download</a>
                  <Link href={`/purchases/receipt/${purchase.id}`} className="rounded-full border border-white/15 px-3 py-2.5 text-[10px] uppercase tracking-[0.12em] text-white/70 transition hover:bg-white/10">Receipt</Link>
                </div>
                <p className="truncate text-[9px] text-white/20">Order {purchase.paypalOrderId}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
