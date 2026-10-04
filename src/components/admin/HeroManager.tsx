"use client";

import { useMemo, useState } from "react";

type Slide = {
  id: string;
  title: string | null;
  subtitle: string | null;
  active: boolean;
  sortOrder: number;
  media: {
    id: string;
    url: string;
    thumbnail: string | null;
    title: string | null;
    published: boolean;
  };
};

type MediaItem = {
  id: string;
  url: string;
  thumbnail: string | null;
  title: string | null;
};

export default function HeroManager({
  initialSlides,
  availableMedia: initialMedia,
}: {
  initialSlides: Slide[];
  availableMedia: MediaItem[];
}) {
  const [slides, setSlides] = useState(initialSlides);
  const [availableMedia, setAvailableMedia] = useState(initialMedia);
  const [selectedMediaId, setSelectedMediaId] = useState(initialMedia[0]?.id ?? "");
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const activeCount = useMemo(() => slides.filter((slide) => slide.active).length, [slides]);

  async function addSlide() {
    if (!selectedMediaId) return;
    setBusy(true);
    setMessage("");

    const response = await fetch("/api/admin/hero", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mediaId: selectedMediaId,
        title: newTitle,
        subtitle: newSubtitle,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Unable to add slide.");
      setBusy(false);
      return;
    }

    setSlides((current) => [...current, data.slide]);
    setAvailableMedia((current) => current.filter((item) => item.id !== selectedMediaId));
    setSelectedMediaId("");
    setNewTitle("");
    setNewSubtitle("");
    setMessage("Hero slide added.");
    setBusy(false);
  }

  async function toggleSlide(slide: Slide) {
    const response = await fetch(`/api/admin/hero/${slide.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !slide.active }),
    });

    if (!response.ok) {
      setMessage("Unable to update slide.");
      return;
    }

    setSlides((current) =>
      current.map((item) => (item.id === slide.id ? { ...item, active: !item.active } : item)),
    );
  }

  async function saveEdit(slide: Slide) {
    const response = await fetch(`/api/admin/hero/${slide.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, subtitle: editSubtitle }),
    });

    if (!response.ok) {
      setMessage("Unable to save slide.");
      return;
    }

    setSlides((current) =>
      current.map((item) =>
        item.id === slide.id
          ? { ...item, title: editTitle || null, subtitle: editSubtitle || null }
          : item,
      ),
    );
    setEditingId(null);
    setMessage("Slide saved.");
  }

  async function removeSlide(slide: Slide) {
    if (!window.confirm("Remove this slide from the hero? The gallery image will not be deleted.")) {
      return;
    }

    const response = await fetch(`/api/admin/hero/${slide.id}`, { method: "DELETE" });

    if (!response.ok) {
      setMessage("Unable to remove slide.");
      return;
    }

    setSlides((current) => current.filter((item) => item.id !== slide.id));
    setAvailableMedia((current) => [
      ...current,
      {
        id: slide.media.id,
        url: slide.media.url,
        thumbnail: slide.media.thumbnail,
        title: slide.media.title,
      },
    ]);
    setMessage("Hero slide removed.");
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= slides.length) return;

    const next = [...slides];
    [next[index], next[target]] = [next[target], next[index]];
    setSlides(next);

    const response = await fetch("/api/admin/hero/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((slide) => slide.id) }),
    });

    if (!response.ok) {
      setSlides(slides);
      setMessage("Unable to reorder slides.");
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">CMS / Hero</p>
        <div className="mt-3 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-4xl">Hero slides</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
              Build the homepage hero from your published gallery images. Removing a slide never
              deletes the underlying gallery image.
            </p>
          </div>
          <div className="text-sm text-neutral-500">
            {activeCount} active / {slides.length} total
          </div>
        </div>
      </div>

      {message && (
        <div className="border border-black/10 bg-white px-4 py-3 text-sm">{message}</div>
      )}

      <section className="border border-black/10 bg-white p-5 md:p-6">
        <h2 className="font-display text-2xl">Add from gallery</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Only published gallery images are available here.
        </p>

        {availableMedia.length === 0 ? (
          <p className="mt-6 text-sm text-neutral-500">
            No unused published images are available. Publish another gallery image first.
          </p>
        ) : (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {availableMedia.map((item) => {
                const selected = selectedMediaId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedMediaId(item.id)}
                    className={`overflow-hidden border text-left ${
                      selected ? "border-black" : "border-black/10"
                    }`}
                  >
                    <div className="aspect-[4/5] bg-neutral-100">
                      <img
                        src={item.thumbnail || item.url}
                        alt={item.title || "Gallery image"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="px-3 py-2 text-xs">
                      {item.title || "Untitled"}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="text-sm">
                <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-neutral-500">
                  Title
                </span>
                <input
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  placeholder="Avery"
                  className="w-full border border-black/15 px-3 py-3 outline-none focus:border-black"
                />
              </label>

              <label className="text-sm">
                <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-neutral-500">
                  Subtitle
                </span>
                <input
                  value={newSubtitle}
                  onChange={(event) => setNewSubtitle(event.target.value)}
                  placeholder="Model · Creative · Editorial"
                  className="w-full border border-black/15 px-3 py-3 outline-none focus:border-black"
                />
              </label>
            </div>

            <button
              type="button"
              disabled={!selectedMediaId || busy}
              onClick={addSlide}
              className="mt-5 bg-black px-5 py-3 text-xs uppercase tracking-[0.18em] text-white disabled:opacity-40"
            >
              {busy ? "Adding…" : "Add to hero"}
            </button>
          </>
        )}
      </section>

      <section className="space-y-4">
        {slides.length === 0 ? (
          <div className="border border-dashed border-black/20 bg-white p-10 text-center text-sm text-neutral-500">
            No hero slides yet.
          </div>
        ) : (
          slides.map((slide, index) => (
            <article key={slide.id} className="border border-black/10 bg-white p-4 md:p-5">
              <div className="grid gap-5 md:grid-cols-[180px_1fr_auto] md:items-start">
                <div className="aspect-[4/5] overflow-hidden bg-neutral-100">
                  <img
                    src={slide.media.thumbnail || slide.media.url}
                    alt={slide.media.title || "Hero image"}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div>
                  {editingId === slide.id ? (
                    <div className="space-y-3">
                      <input
                        value={editTitle}
                        onChange={(event) => setEditTitle(event.target.value)}
                        className="w-full border border-black/15 px-3 py-2"
                        placeholder="Title"
                      />
                      <input
                        value={editSubtitle}
                        onChange={(event) => setEditSubtitle(event.target.value)}
                        className="w-full border border-black/15 px-3 py-2"
                        placeholder="Subtitle"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(slide)}
                          className="bg-black px-4 py-2 text-xs uppercase tracking-[0.15em] text-white"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="border border-black/15 px-4 py-2 text-xs uppercase tracking-[0.15em]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                        Slide {index + 1}
                      </p>
                      <h3 className="mt-2 font-display text-2xl">
                        {slide.title || slide.media.title || "Avery"}
                      </h3>
                      <p className="mt-2 text-sm text-neutral-500">
                        {slide.subtitle || "Model · Creative · Editorial"}
                      </p>
                      <p className="mt-3 text-xs text-neutral-400">
                        Source: {slide.media.title || "Untitled gallery image"}
                      </p>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 md:max-w-[180px] md:justify-end">
                  <button
                    type="button"
                    onClick={() => toggleSlide(slide)}
                    className="border border-black/15 px-3 py-2 text-xs uppercase tracking-[0.12em]"
                  >
                    {slide.active ? "Active" : "Inactive"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(slide.id);
                      setEditTitle(slide.title || slide.media.title || "");
                      setEditSubtitle(slide.subtitle || "");
                    }}
                    className="border border-black/15 px-3 py-2 text-xs uppercase tracking-[0.12em]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    className="border border-black/15 px-3 py-2 text-xs disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === slides.length - 1}
                    onClick={() => move(index, 1)}
                    className="border border-black/15 px-3 py-2 text-xs disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSlide(slide)}
                    className="border border-red-200 px-3 py-2 text-xs uppercase tracking-[0.12em] text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
