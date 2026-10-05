"use client";

import { useEffect, useState } from "react";
import DirectUpload from "@/components/admin/DirectUpload";

type Item = {
  id: string;
  url: string;
  title: string | null;
  published: boolean;
};

export default function GalleryManager() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const response = await fetch("/api/admin/gallery", { cache: "no-store" });
    if (response.ok) setItems((await response.json()).media || []);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  if (loading) {
    return (
      <div className="rounded-[1.75rem] border border-[#171412]/10 bg-[#fffdfb]/80 p-6 text-sm text-[#584e49] shadow-[0_20px_40px_rgba(17,14,12,0.04)]">
        Loading gallery…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-[#171412]/10 bg-[#141210] p-6 text-white shadow-[0_30px_80px_rgba(17,16,15,0.28)] md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.34em] text-[#d7b98c]">Portfolio curation</p>
            <h2 className="mt-2 font-display text-4xl md:text-5xl">Gallery manager</h2>
          </div>
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[9px] uppercase tracking-[0.18em] text-white/80">
            {items.length} assets
          </span>
        </div>
      </div>

      <DirectUpload
        kind="image"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onComplete={load}
      />

      {items.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-[#171412]/18 bg-[#fffdfb]/80 p-10 text-center shadow-[0_20px_40px_rgba(17,14,12,0.04)]">
          <p className="font-display text-3xl text-[#171412]">No images yet.</p>
          <p className="mt-2 text-sm text-[#584e49]">Upload your first curated frame to begin building the portfolio.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <article key={item.id} className="group overflow-hidden rounded-[1.5rem] border border-[#171412]/10 bg-[#fffdfb]/85 shadow-[0_18px_40px_rgba(17,14,12,0.04)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_28px_50px_rgba(17,14,12,0.08)]">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#f3eee8]">
                <img
                  src={item.url}
                  alt={item.title || "Gallery image"}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                  <span className="rounded-full border border-white/30 bg-black/25 px-2 py-1 text-[8px] uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                    {item.published ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <p className="truncate text-sm font-medium text-[#171412]">{item.title || "Untitled"}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#7a6e67]">
                  {item.published ? "Live in portfolio" : "Hidden from portfolio"}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
