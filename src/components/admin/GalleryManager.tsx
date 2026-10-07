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

      <div className="studio-gallery-grid admin-public-gallery-grid">
        {items.map((item, index) => (
          <article key={item.id} className={`studio-shot shot-${index % 6} admin-media-tile`} style={{ cursor: "default" }}>
            <button
              type="button"
              onClick={() => setPreviewIndex(index)}
              className="absolute inset-0 z-10 h-full w-full border-0 bg-transparent p-0 text-left"
              aria-label={`Open ${item.title || "gallery image"} preview`}
            >
              <img src={item.url} alt={item.title || "Gallery item"} className="studio-shot-image" loading={index < 2 ? "eager" : "lazy"} />
              <span className="studio-shot-overlay" />
              <span className="studio-shot-meta"><b>{String(index + 1).padStart(2, "0")}</b><em>{item.published ? "Published" : "Hidden"}</em></span>
              <span className="studio-shot-title">{item.title || "Untitled"}<i>↗</i></span>
            </button>
            <div className="admin-media-actions">
              <span className={`admin-media-status ${item.published ? "is-published" : "is-hidden"}`}>{item.published ? "Published" : "Hidden"}</span>
              <button type="button" onClick={() => void edit(item)}>Edit</button>
              <button type="button" onClick={() => void toggle(item)}>{item.published ? "Hide" : "Publish"}</button>
              <button type="button" onClick={() => void remove(item.id)}>Delete</button>
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

