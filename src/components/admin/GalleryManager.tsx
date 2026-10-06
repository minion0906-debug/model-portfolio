"use client";

import { useEffect, useState } from "react";
import DirectUpload from "@/components/admin/DirectUpload";
import MediaPreviewModal from "@/components/admin/MediaPreviewModal";

type Item = {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  published: boolean;
};

export default function GalleryManager() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    const response = await fetch("/api/admin/gallery", { cache: "no-store" });
    if (response.ok) setItems((await response.json()).media || []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function remove(id: string) {
    if (!confirm("Delete this image?")) return;
    await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    load();
  }

  async function edit(item: Item) {
    const title = prompt("Title", item.title || "");
    if (title === null) return;
    await fetch(`/api/admin/gallery/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description: item.description || "" }),
    });
    load();
  }

  async function toggle(item: Item) {
    await fetch(`/api/admin/gallery/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !item.published }),
    });
    load();
  }

  if (loading) return <div className="p-6">Loading gallery...</div>;

  return (
    <div className="space-y-6">
      <DirectUpload kind="image" multiple accept="image/jpeg,image/png,image/webp" onComplete={load} />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => (
          <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <img
              onDoubleClick={() => setPreviewIndex(index)}
              src={item.url}
              alt={item.title || "Gallery item"}
              className="aspect-[4/5] w-full rounded-lg object-cover"
            />

            <div className="mt-3 text-sm text-slate-700">{item.title || "Untitled"}</div>

            <div className="mt-3 flex gap-2 text-xs">
              <button type="button" onClick={() => edit(item)}>
                Edit
              </button>
              <button type="button" onClick={() => toggle(item)}>
                {item.published ? "Hide" : "Publish"}
              </button>
              <button type="button" onClick={() => remove(item.id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      {previewIndex !== null && items[previewIndex] && (
        <MediaPreviewModal
          item={items[previewIndex]}
          items={items}
          kind="image"
          onClose={() => setPreviewIndex(null)}
          onSaved={() => {
            setPreviewIndex(null);
            void load();
          }}
          onPrevious={() => setPreviewIndex((index) => (index === null ? null : (index - 1 + items.length) % items.length))}
          onNext={() => setPreviewIndex((index) => (index === null ? null : (index + 1) % items.length))}
        />
      )}
    </div>
  );
}

