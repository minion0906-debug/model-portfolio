"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type MediaItem = {
  id: string;
  title?: string | null;
  description?: string | null;
  url: string;
};

type Props = {
  item: MediaItem;
  items?: MediaItem[];
  kind: "image" | "video";
  onClose: () => void;
  onSaved: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
};

export default function MediaPreviewModal({
  item,
  items = [],
  kind,
  onClose,
  onSaved,
  onPrevious,
  onNext,
}: Props) {
  const [title, setTitle] = useState(item.title || "");
  const [description, setDescription] = useState(item.description || "");
  const [zoom, setZoom] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(item.title || "");
    setDescription(item.description || "");
    setZoom(1);
  }, [item]);

  const canNavigate = items.length > 1;
  const currentIndex = useMemo(
    () => items.findIndex((candidate) => candidate.id === item.id),
    [item.id, items]
  );

  async function save() {
    setSaving(true);
    try {
      await fetch(`/api/admin/${kind === "image" ? "gallery" : "videos"}/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/10 bg-slate-950 shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
          onClick={(event) => event.stopPropagation()}
        >
          {canNavigate && (
            <>
              <button
                type="button"
                onClick={onPrevious}
                className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-2xl text-white transition hover:bg-white/20 md:left-6"
                aria-label="Previous item"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={onNext}
                className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-2xl text-white transition hover:bg-white/20 md:right-6"
                aria-label="Next item"
              >
                ›
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/30 text-xl text-white transition hover:bg-black/50 md:right-6 md:top-6"
            aria-label="Close media preview"
          >
            ×
          </button>

          <div className="grid gap-0 md:grid-cols-[1.35fr_0.65fr]">
            <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden bg-[#0b0d12] p-4 md:min-h-[620px] md:p-6">
              <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/70 backdrop-blur-md">
                {kind === "image" ? "Image" : "Video"}
              </div>

              <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoom((value) => Math.max(1, Number((value - 0.25).toFixed(2))))}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/30 text-lg text-white transition hover:bg-black/50"
                  aria-label="Zoom out"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((value) => Math.min(4, Number((value + 0.25).toFixed(2))))}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/30 text-lg text-white transition hover:bg-black/50"
                  aria-label="Zoom in"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  className="rounded-full border border-white/15 bg-black/30 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-white/80 transition hover:bg-black/50"
                >
                  Reset
                </button>
              </div>

              <motion.div
                className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[22px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                onDoubleClick={() => setZoom((value) => (value > 1 ? 1 : 2.2))}
              >
                {kind === "image" ? (
                  <motion.img
                    key={item.id}
                    src={item.url}
                    alt={title || "Media preview"}
                    className="max-h-[72vh] w-full rounded-[18px] object-contain shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: zoom, transition: { duration: 0.25 } }}
                    style={{ transformOrigin: "center center" }}
                    onLoad={() => setZoom(1)}
                  />
                ) : (
                  <motion.video
                    key={item.id}
                    src={item.url}
                    controls
                    className="max-h-[72vh] w-full rounded-[18px] object-contain shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: zoom, transition: { duration: 0.25 } }}
                    style={{ transformOrigin: "center center" }}
                  />
                )}
              </motion.div>
            </div>

            <div className="flex flex-col justify-between bg-slate-900/90 p-4 md:p-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400">
                  {canNavigate && currentIndex >= 0 ? `Item ${currentIndex + 1} / ${items.length}` : "Preview"}
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-white">Edit media</h3>
              </div>

              <div className="mt-6 space-y-4">
                <label className="block text-sm text-slate-300">
                  <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-slate-400">Title</span>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-white outline-none transition focus:border-slate-400"
                    placeholder="Name"
                  />
                </label>

                <label className="block text-sm text-slate-300">
                  <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-slate-400">Description</span>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className="min-h-[120px] w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-white outline-none transition focus:border-slate-400"
                    placeholder="Description"
                  />
                </label>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

