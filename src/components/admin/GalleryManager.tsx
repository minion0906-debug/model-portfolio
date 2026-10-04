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

  if (loading) return <div className="text-sm text-neutral-500">Loading gallery…</div>;

  return (
    <div className="space-y-8">
      <DirectUpload
        kind="image"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onComplete={load}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-2xl border border-black/10 bg-white">
            <div className="aspect-[4/5] bg-neutral-100">
              <img src={item.url} alt={item.title || "Gallery image"} className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div className="p-4">
              <p className="truncate text-sm">{item.title || "Untitled"}</p>
              <p className="mt-1 text-xs text-neutral-500">{item.published ? "Published" : "Draft"}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
