"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type AdminVideoItem = {
  id: string;
  src: string;
  thumbnail: string | null;
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

export default function VideoManager({
  initialItems,
}: {
  initialItems: AdminVideoItem[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<Filter>("all");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
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
    if (!thumbnailFile) {
      setThumbnailPreview("");
      return;
    }

    const url = URL.createObjectURL(thumbnailFile);
    setThumbnailPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [thumbnailFile]);

  const visibleItems = useMemo(() => {
    if (filter === "published") return items.filter((item) => item.published);
    if (filter === "draft") return items.filter((item) => !item.published);
    return items;
  }, [items, filter]);

  const publishedCount = items.filter((item) => item.published).length;
  const draftCount = items.length - publishedCount;

  async function uploadVideo() {
    if (!videoFile) return;

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("video", videoFile);

      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }

      const response = await fetch("/api/admin/videos/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Video upload failed.");
      }

      setVideoFile(null);
      setThumbnailFile(null);
      router.refresh();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Video upload failed.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function togglePublished(item: AdminVideoItem) {
    setError("");
    setSavingId(item.id);

    try {
      const response = await fetch(`/api/admin/videos/${item.id}`, {
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

  function startEditing(item: AdminVideoItem) {
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
      const response = await fetch(`/api/admin/videos/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save video details.");
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
      setError(
        saveError instanceof Error ? saveError.message : "Could not save video details.",
      );
    } finally {
      setSavingId(null);
    }
  }

  async function deleteItem(item: AdminVideoItem) {
    const confirmed = window.confirm(
      `Delete "${item.title || "this video"}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    setError("");
    setSavingId(item.id);

    try {
      const response = await fetch(`/api/admin/videos/${item.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not delete video.");
      }

      setItems((current) => current.filter((entry) => entry.id !== item.id));
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Could not delete video.",
      );
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
      const response = await fetch("/api/admin/videos/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: reordered.map((item) => item.id) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not reorder videos.");
      }

      router.refresh();
    } catch (reorderError) {
      setError(
        reorderError instanceof Error
          ? reorderError.message
          : "Could not reorder videos.",
      );
      setItems(initialItems);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm md:p-7">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div>
            <h2 className="font-display text-2xl">Upload video</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
              MP4, WebM or MOV up to 100 MB. A poster image is optional.
            </p>
          </div>

          <div className="text-xs uppercase tracking-[0.18em] text-neutral-400">
            {items.length} total · {publishedCount} published · {draftCount} drafts
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-black/20 bg-[#f7f5f2] px-5 text-center transition hover:border-black/50">
            <span className="text-sm font-medium">
              {videoFile ? videoFile.name : "Choose video"}
            </span>
            <span className="mt-2 text-xs text-neutral-500">
              MP4 · WebM · MOV
            </span>
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="sr-only"
              onChange={(event) => {
                setVideoFile(event.target.files?.[0] ?? null);
                setError("");
              }}
            />
          </label>

          <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-black/20 bg-[#f7f5f2] px-5 text-center transition hover:border-black/50">
            {thumbnailPreview ? (
              <img
                src={thumbnailPreview}
                alt=""
                className="mb-3 h-24 w-40 rounded-lg object-cover"
              />
            ) : (
              <span className="text-sm font-medium">Choose poster image</span>
            )}
            <span className="mt-2 text-xs text-neutral-500">
              Optional · JPG · PNG · WebP
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                setThumbnailFile(event.target.files?.[0] ?? null);
                setError("");
              }}
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={!videoFile || uploading}
            onClick={uploadVideo}
            className="rounded-full bg-[#171614] px-5 py-3 text-sm text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {uploading ? "Uploading…" : "Upload video"}
          </button>

          {(videoFile || thumbnailFile) && !uploading && (
            <button
              type="button"
              onClick={() => {
                setVideoFile(null);
                setThumbnailFile(null);
              }}
              className="rounded-full border border-black/10 px-5 py-3 text-sm"
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
          <h3 className="font-display text-2xl">No videos yet</h3>
          <p className="mt-2 text-sm text-neutral-500">
            Upload a film or campaign video to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {visibleItems.map((item, index) => {
            const isEditing = editingId === item.id;
            const isSaving = savingId === item.id;

            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm"
              >
                <div className="relative aspect-video bg-black">
                  <video
                    src={item.src}
                    poster={item.thumbnail || undefined}
                    controls
                    preload="metadata"
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
                          {item.title || "Untitled video"}
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
