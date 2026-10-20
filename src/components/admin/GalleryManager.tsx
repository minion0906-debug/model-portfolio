"use client";

import { useEffect, useMemo, useState } from "react";
import DirectUpload from "@/components/admin/DirectUpload";
import MediaPreviewModal from "@/components/admin/MediaPreviewModal";

type Item = {
  id: string; url: string; title: string | null; description: string | null;
  category: string | null; orientation: string | null; published: boolean;
  priceCents: number; currency: string;
};

type SortMode = "newest" | "oldest" | "title" | "category";
const CATEGORY_OPTIONS = ["Beauty", "Fashion", "Runway", "Commercial", "Editorial", "Portrait", "Product", "Event", "Other"] as const;

export default function GalleryManager() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState<SortMode>("newest");
  const [bulkCategory, setBulkCategory] = useState("Fashion");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/gallery", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load gallery.");
      setItems((await response.json()).media || []);
      setSelected([]);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not load gallery."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesQuery = !q || [item.title, item.description, item.category, item.orientation].some((v) => v?.toLowerCase().includes(q));
      const matchesCategory = categoryFilter === "all" || (item.category || "Uncategorized") === categoryFilter;
      const matchesStatus = statusFilter === "all" || (statusFilter === "published" ? item.published : !item.published);
      return matchesQuery && matchesCategory && matchesStatus;
    }).sort((a, b) => {
      if (sort === "title") return (a.title || "").localeCompare(b.title || "");
      if (sort === "category") return (a.category || "").localeCompare(b.category || "");
      const dateA = 0; // API order is stable; creation date is not needed for title/category sorting.
      if (sort === "oldest") return b.id.localeCompare(a.id);
      return dateA || 0;
    });
  }, [items, query, categoryFilter, statusFilter, sort]);

  const categories = useMemo(() => Array.from(new Set(items.map((item) => item.category || "Uncategorized"))).sort(), [items]);
  const allVisibleSelected = visibleItems.length > 0 && visibleItems.every((item) => selected.includes(item.id));
  function toggleSelected(id: string) { setSelected((current) => current.includes(id) ? current.filter((v) => v !== id) : [...current, id]); }
  function selectVisible() { setSelected((current) => allVisibleSelected ? current.filter((id) => !visibleItems.some((item) => item.id === id)) : Array.from(new Set([...current, ...visibleItems.map((item) => item.id)]))); }

  async function runBulk(action: "publish" | "hide" | "category") {
    if (!selected.length) { setNotice("Select at least one image first."); return; }
    if (action === "category" && !bulkCategory.trim()) { setNotice("Choose a category first."); return; }
    setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/admin/gallery/bulk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: selected, action, ...(action === "category" ? { category: bulkCategory } : {}) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Bulk update failed.");
      setNotice(`${data.updated} image${data.updated === 1 ? "" : "s"} updated.`);
      await load();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Bulk update failed."); }
    finally { setBusy(false); }
  }

  async function remove(id: string) {
    if (!confirm("Delete this image permanently? This cannot be undone.")) return;
    const response = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    if (!response.ok) { setNotice("Could not delete image."); return; }
    setNotice("Image deleted."); void load();
  }
  async function toggle(item: Item) {
    const response = await fetch(`/api/admin/gallery/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: !item.published }) });
    if (!response.ok) { setNotice("Could not update publication status."); return; }
    void load();
  }

  if (loading) return <div className="p-6">Loading gallery...</div>;
  return (
    <div className="space-y-6">
      <DirectUpload kind="image" multiple accept="image/jpeg,image/png,image/webp" onComplete={load} />
      <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div><h2 className="text-lg font-semibold">Media library</h2><p className="text-sm text-neutral-500">{items.length} images · {items.filter((item) => item.published).length} published</p></div>
          <button type="button" onClick={() => void load()} className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50">Refresh</button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm">Search images<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Title, description, category..." className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
          <label className="text-sm">Category<select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2"><option value="all">All categories</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
          <label className="text-sm">Publication<select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2"><option value="all">All statuses</option><option value="published">Published</option><option value="hidden">Hidden</option></select></label>
          <label className="text-sm">Sort by<select value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className="mt-1 w-full rounded-lg border px-3 py-2"><option value="newest">Default order</option><option value="oldest">Reverse default order</option><option value="title">Title A–Z</option><option value="category">Category A–Z</option></select></label>
        </div>
        <div className="flex flex-col gap-3 rounded-xl bg-neutral-50 p-3 md:flex-row md:items-center md:flex-wrap">
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={allVisibleSelected} onChange={selectVisible} />Select visible ({visibleItems.length})</label>
          <span className="text-sm text-neutral-500">{selected.length} selected</span>
          <div className="flex flex-wrap items-center gap-2 md:ml-auto">
            <button type="button" disabled={busy || !selected.length} onClick={() => void runBulk("publish")} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Publish</button>
            <button type="button" disabled={busy || !selected.length} onClick={() => void runBulk("hide")} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Hide</button>
            <select aria-label="Bulk category" value={bulkCategory} onChange={(e) => setBulkCategory(e.target.value)} className="rounded-lg border bg-white px-3 py-2 text-sm">{CATEGORY_OPTIONS.map((category) => <option key={category} value={category}>{category}</option>)}</select>
            <button type="button" disabled={busy || !selected.length} onClick={() => void runBulk("category")} className="rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white disabled:opacity-40">Set category</button>
          </div>
        </div>
        {notice && <p role="status" className="text-sm text-neutral-600">{notice}</p>}
      </section>
      {visibleItems.length === 0 ? <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-neutral-500">No images match these filters.</div> : (
        <div className="studio-gallery-grid admin-public-gallery-grid">
          {visibleItems.map((item, index) => { const originalIndex = items.findIndex((entry) => entry.id === item.id); return (
            <article key={item.id} className={`studio-shot shot-${index % 6} admin-media-tile`} style={{ cursor: "default" }}>
              <label className="absolute left-3 top-3 z-20 rounded-md bg-white/95 p-2 shadow"><input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleSelected(item.id)} aria-label={`Select ${item.title || "image"}`} /></label>
              <button type="button" onClick={() => setPreviewIndex(originalIndex)} className="absolute inset-0 z-10 h-full w-full border-0 bg-transparent p-0 text-left" aria-label={`Open ${item.title || "gallery image"} preview`}>
                <img src={item.url} alt={item.title || "Gallery item"} className="studio-shot-image" loading={index < 2 ? "eager" : "lazy"} />
                <span className="studio-shot-overlay" />
                <span className="studio-shot-meta"><b>{String(index + 1).padStart(2, "0")}</b><em>{item.published ? "Published" : "Hidden"}</em></span>
                <span className="studio-shot-title">{item.title || "Untitled"}<i>↗</i></span>
              </button>
              <div className="admin-media-actions">
                <span className={`admin-media-status ${item.published ? "is-published" : "is-hidden"}`}>{item.published ? "Published" : "Hidden"}</span>
                <span className="text-xs text-neutral-500">{item.category || "Uncategorized"}</span>
                <button type="button" onClick={() => setPreviewIndex(originalIndex)}>Edit</button>
                <button type="button" onClick={() => void toggle(item)}>{item.published ? "Hide" : "Publish"}</button>
                <button type="button" onClick={() => void remove(item.id)}>Delete</button>
              </div>
            </article>
          ); })}
        </div>
      )}
      {previewIndex !== null && items[previewIndex] && <MediaPreviewModal item={items[previewIndex]} items={items} kind="image" onClose={() => setPreviewIndex(null)} onSaved={() => { setPreviewIndex(null); void load(); }} onPrevious={() => setPreviewIndex((index) => index === null ? null : (index - 1 + items.length) % items.length)} onNext={() => setPreviewIndex((index) => index === null ? null : (index + 1) % items.length)} />}
    </div>
  );
}
