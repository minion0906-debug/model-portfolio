"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

type MediaItem = {
  id: string;
  title?: string | null;
  description?: string | null;
  url: string;
  priceCents?: number;
  currency?: string;
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
  const [price, setPrice] = useState(((item.priceCents || 0) / 100).toFixed(2));
  const [currency, setCurrency] = useState(item.currency || "USD");
  const [zoom, setZoom] = useState(1);
  const [saving, setSaving] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  useEffect(() => {
    setTitle(item.title || "");
    setDescription(item.description || "");
    setPrice(((item.priceCents || 0) / 100).toFixed(2));
    setCurrency(item.currency || "USD");
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [item]);

  const canNavigate = items.length > 1;
  const currentIndex = useMemo(
    () => items.findIndex((candidate) => candidate.id === item.id),
    [item.id, items]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        onPrevious?.();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        onNext?.();
      } else if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        setZoom((value) => Math.min(4, Number((value + 0.25).toFixed(2))));
      } else if (event.key === "-") {
        event.preventDefault();
        setZoom((value) => {
          const next = Math.max(1, Number((value - 0.25).toFixed(2)));
          if (next === 1) setPan({ x: 0, y: 0 });
          return next;
        });
      } else if (event.key === "0") {
        event.preventDefault();
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, onNext, onPrevious]);

  function updateZoom(next: number) {
    const value = Math.min(4, Math.max(1, Number(next.toFixed(2))));
    setZoom(value);
    if (value === 1) setPan({ x: 0, y: 0 });
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    if (kind !== "image") return;
    event.preventDefault();
    updateZoom(zoom - event.deltaY * 0.002);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (kind !== "image" || zoom <= 1) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragStart.current) return;
    setPan({
      x: dragStart.current.panX + event.clientX - dragStart.current.x,
      y: dragStart.current.panY + event.clientY - dragStart.current.y,
    });
  }

  function handlePointerUp() {
    dragStart.current = null;
  }

  async function save() {
    setSaving(true);
    try {
      await fetch(`/api/admin/${kind === "image" ? "gallery" : "videos"}/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, priceCents: Math.round(Math.max(0, Number(price) || 0) * 100), currency }),
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
                  onClick={() => updateZoom(zoom - 0.25)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/30 text-lg text-white transition hover:bg-black/50"
                  aria-label="Zoom out"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => updateZoom(zoom + 0.25)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/30 text-lg text-white transition hover:bg-black/50"
                  aria-label="Zoom in"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                  className="rounded-full border border-white/15 bg-black/30 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-white/80 transition hover:bg-black/50"
                >
                  Reset
                </button>
              </div>

              {kind === "image" && (
                <div className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-full border border-white/10 bg-black/35 px-3 py-2 text-[9px] uppercase tracking-[0.16em] text-white/60 backdrop-blur-md">
                  Wheel zoom · Drag when zoomed · ← → navigate · Esc close
                </div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                onDoubleClick={() => updateZoom(zoom > 1 ? 1 : 2.2)}
                onWheel={handleWheel}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-[22px] ${zoom > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"}`}
              >
                {kind === "image" ? (
                  <motion.img
                    key={item.id}
                    src={item.url}
                    alt={title || "Media preview"}
                    className="max-h-[72vh] w-full rounded-[18px] object-contain shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: zoom, x: pan.x, y: pan.y, transition: { duration: 0.25 } }}
                    style={{ transformOrigin: "center center" }}
                    onLoad={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                  />
                ) : (
                  <motion.video
                    key={item.id}
                    src={item.url}
                    controls
                    className="max-h-[72vh] w-full rounded-[18px] object-contain shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: zoom, x: pan.x, y: pan.y, transition: { duration: 0.25 } }}
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

                <div className="grid grid-cols-[1fr_110px] gap-3">
                  <label className="block text-sm text-slate-300">
                    <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-slate-400">Price</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-white outline-none transition focus:border-slate-400"
                      placeholder="0.00"
                    />
                    <span className="mt-1 block text-[9px] text-slate-500">Set 0 for free.</span>
                  </label>
                  <label className="block text-sm text-slate-300">
                    <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-slate-400">Currency</span>
                    <select
                      value={currency}
                      onChange={(event) => setCurrency(event.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-white outline-none"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                      <option value="AUD">AUD</option>
                    </select>
                  </label>
                </div>
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

