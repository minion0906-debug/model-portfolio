"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type AdminGalleryItem = {
  id: string;
  src: string;
  title: string;
  description: string;
  published: boolean;
  sortOrder: number;
  size: number | null;
  createdAt: string;
};

type Filter = "all" | "published" | "draft";

function formatSize(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function GalleryManager({
  initialItems,
}: {
  initialItems: AdminGalleryItem[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  useEffect(() => {
    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  const visibleItems = useMemo(() => {
    if (filter === "published") return items.filter((item) => item.published);
    if (filter === "draft") return items.filter((item) => !item.published);
    return items;
  }, [items, filter]);

  const publishedCount = items.filter((item) => item.published).length;
  const draftCount = items.length - publishedCount;

  async function uploadImages() {
    if (!selectedFiles.length) return;

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();

      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/admin/gallery/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed.");
      }

      setSelectedFiles([]);
      router.refresh();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function togglePublished(item: AdminGalleryItem) {
    setError("");
    setSavingId(item.id);

    try {
      const response = await fetch(`/api/admin/gallery/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !item.published }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not update publication status.");
      }

      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id
            ? { ...entry, published: data.media.published }
            : entry,
        ),
      );

      router.refresh();
    } catch (publishError) {
      setError(
        publishError instanceof Error
          ? publishError.message
          : "Could not update publication status.",
      );
    } finally {
      setSavingId(null);
    }
  }

  function startEditing(item: AdminGalleryItem) {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditDescription(item.description);
    setError("");
  }

  async function saveEdit() {
    if (!editingId) return;

    setError("");
    setSavingId(editingId);

    try {
      const response = await fetch(`/api/admin/gallery/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save image details.");
      }

      setItems((current) =>
        current.map((entry) =>
          entry.id === editingId
            ? {
                ...entry,
                title: data.media.title || "",
                description: data.media.description || "",
              }
            : entry,
        ),
      );

      setEditingId(null);
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save image details.");
    } finally {
      setSavingId(null);
    }
  }

  async function deleteItem(item: AdminGalleryItem) {
    const confirmed = window.confirm(
      `Delete "${item.title || "this image"}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    setError("");
    setSavingId(item.id);

    try {
      const response = await fetch(`/api/admin/gallery/${item.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not delete image.");
      }

      setItems((current) => current.filter((entry) => entry.id !== item.id));
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete image.");
    } finally {
      setSavingId(null);
    }
  }

  async function moveItem(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= visibleItems.length) return;

    const currentVisible = [...visibleItems];
    [currentVisible[index], currentVisible[targetIndex]] = [
      currentVisible[targetIndex],
      currentVisible[index],
    ];

    const visibleIds = new Set(visibleItems.map((item) => item.id));
    let visibleCursor = 0;

    const reordered = items.map((item) => {
      if (!visibleIds.has(item.id)) return item;

      const replacement = currentVisible[visibleCursor];
      visibleCursor += 1;

      return replacement;
    });

    setItems(reordered);

    try {
      const response = await fetch("/api/admin/gallery/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: reordered.map((item) => item.id) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not reorder gallery.");
      }

      router.refresh();
    } catch (reorderError) {
      setError(
        reorderError instanceof Error
          ? reorderError.message
          : "Could not reorder gallery.",
      );
      setItems(initialItems);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm md:p-7">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div>
            <h2 className="font-display text-2xl">Upload images</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
              JPG, PNG or WebP. Maximum 10 MB per image and 20 images per upload.
            </p>
          </div>

          <div className="text-xs uppercase tracking-[0.18em] text-neutral-400">
            {items.length} total · {publishedCount} published · {draftCount} drafts
          </div>
        </div>

        <label className="mt-6 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-black/20 bg-[#f7f5f2] px-5 text-center transition hover:border-black/50">
          <span className="text-sm font-medium">
            {selectedFiles.length ? "Choose different images" : "Choose images"}
          </span>
          <span className="mt-2 text-xs text-neutral-500">
            Multiple files supported
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            onChange={(event) => {
              setSelectedFiles(Array.from(event.target.files ?? []));
              setError("");
            }}
          />
        </label>

        {selectedFiles.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {selectedFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="overflow-hidden rounded-xl border border-black/10 bg-white">
                {previews[index] && (
                  <img
                    src={previews[index]}
                    alt=""
                    className="aspect-square w-full object-cover"
                  />
                )}
                <div className="p-2">
                  <p className="truncate text-xs">{file.name}</p>
                  <p className="mt-1 text-[10px] text-neutral-400">
                    {formatSize(file.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!selectedFiles.length || uploading}
            onClick={uploadImages}
            className="rounded-full bg-[#171614] px-5 py-3 text-sm text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {uploading ? "Uploading…" : `Upload ${selectedFiles.length || ""} ${selectedFiles.length === 1 ? "image" : "images"}`}
          </button>

          {selectedFiles.length > 0 && !uploading && (
            <button
              type="button"
              onClick={() => setSelectedFiles([])}
              className="rounded-full border border-black/15 px-5 py-3 text-sm"
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {[
          ["all", `All (${items.length})`],
          ["published", `Published (${publishedCount})`],
          ["draft", `Drafts (${draftCount})`],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value as Filter)}
            className={`rounded-full px-4 py-2 text-xs transition ${
              filter === value
                ? "bg-[#171614] text-white"
                : "border border-black/10 bg-white hover:bg-black/5"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {visibleItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-black/15 bg-white px-6 py-20 text-center">
          <h3 className="font-display text-2xl">Nothing here yet</h3>
          <p className="mt-2 text-sm text-neutral-500">
            Upload an image or change the current filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map((item, index) => {
            const isEditing = editingId === item.id;
            const isSaving = savingId === item.id;

            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm"
              >
                <div className="relative aspect-[4/5] bg-neutral-100">
                  <img
                    src={item.src}
                    alt={item.title || "Gallery image"}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] backdrop-blur">
                    {item.published ? "Published" : "Draft"}
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  {isEditing ? (
                    <>
                      <div>
                        <label className="text-xs uppercase tracking-[0.16em] text-neutral-400">
                          Title
                        </label>
                        <input
                          value={editTitle}
                          onChange={(event) => setEditTitle(event.target.value)}
                          maxLength={120}
                          className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-black/40"
                        />
                      </div>

                      <div>
                        <label className="text-xs uppercase tracking-[0.16em] text-neutral-400">
                          Description
                        </label>
                        <textarea
                          value={editDescription}
                          onChange={(event) => setEditDescription(event.target.value)}
                          maxLength={1000}
                          rows={4}
                          className="mt-2 w-full resize-none rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-black/40"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={saveEdit}
                          className="rounded-full bg-[#171614] px-4 py-2 text-xs text-white disabled:opacity-40"
                        >
                          {isSaving ? "Saving…" : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-full border border-black/10 px-4 py-2 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <h3 className="font-display text-xl">
                          {item.title || "Untitled image"}
                        </h3>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-500">
                          {item.description || "No description added."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                        <span>{formatSize(item.size)}</span>
                        <span>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => startEditing(item)}
                          className="rounded-full border border-black/10 px-3 py-2 text-xs"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => togglePublished(item)}
                          className="rounded-full border border-black/10 px-3 py-2 text-xs"
                        >
                          {isSaving ? "Saving…" : item.published ? "Unpublish" : "Publish"}
                        </button>

                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => deleteItem(item)}
                          className="rounded-full border border-red-200 px-3 py-2 text-xs text-red-600"
                        >
                          Delete
                        </button>
                      </div>

                      <div className="flex gap-2 border-t border-black/10 pt-4">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveItem(index, -1)}
                          className="flex-1 rounded-full border border-black/10 px-3 py-2 text-xs disabled:opacity-30"
                        >
                          ↑ Move up
                        </button>
                        <button
                          type="button"
                          disabled={index === visibleItems.length - 1}
                          onClick={() => moveItem(index, 1)}
                          className="flex-1 rounded-full border border-black/10 px-3 py-2 text-xs disabled:opacity-30"
                        >
                          ↓ Move down
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
