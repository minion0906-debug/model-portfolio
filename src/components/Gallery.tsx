"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import type { GalleryImage } from "@/components/GalleryLightbox";

type GalleryProps = { images: GalleryImage[] };

export default function Gallery({ images }: GalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  const showPrevious = () => {
    setActiveIndex((current) => (images.length ? (current - 1 + images.length) % images.length : 0));
  };

  const showNext = () => {
    setActiveIndex((current) => (images.length ? (current + 1) % images.length : 0));
  };

  return (
    <section id="gallery" className="section-pad bg-[#f7f3ee] py-24 md:py-28">
      <div className="container-page">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-kicker mb-3">Selected work</p>
            <h2 className="font-display text-5xl text-[#171412] md:text-7xl">Images</h2>
          </div>
          <div className="flex items-end justify-between gap-8 md:justify-end">
            <p className="max-w-xs text-sm leading-6 text-[#584e49]">
              A curated selection of stills, editorials and campaign imagery.
            </p>
            {images.length > 0 && (
              <span className="hidden whitespace-nowrap text-xs uppercase tracking-[0.22em] text-[#584e49] md:block">
                {String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
              </span>
            )}
          </div>
        </div>

        {images.length === 0 ? (
          <div className="panel-surface rounded-[2rem] border-dashed px-6 py-20 text-center">
            <p className="font-display text-3xl">Images coming soon.</p>
            <p className="mt-3 text-sm text-neutral-500">Published images will appear here.</p>
          </div>
        ) : (
          <div className="relative">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative overflow-hidden rounded-[2rem] bg-black shadow-[0_30px_80px_rgba(17,15,13,0.18)]"
            >
              <div className="relative aspect-[4/5] min-h-[520px] w-full md:aspect-[16/10] md:min-h-0">
                <Image
                  src={active.src}
                  alt={active.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 90vw"
                  className="object-cover"
                  priority
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent px-5 pb-5 pt-24 text-white md:px-8 md:pb-8">
                  <div className="flex items-end justify-between gap-5">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.28em] text-white/65">Still</span>
                      <h3 className="mt-2 font-display text-3xl md:text-5xl">{active.title}</h3>
                    </div>
                  </div>
                </div>
              </div>

              <button type="button" onClick={showPrevious} aria-label="Previous image" className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-2xl text-white backdrop-blur-md transition hover:bg-black/60 md:left-5">&lt;</button>
              <button type="button" onClick={showNext} aria-label="Next image" className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-2xl text-white backdrop-blur-md transition hover:bg-black/60 md:right-5">&gt;</button>
            </motion.div>

            <div className="mt-5 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none">
              {images.map((image, index) => (
                <button key={image.id} type="button" onClick={() => setActiveIndex(index)} aria-label={`Show ${image.title}`} aria-current={index === activeIndex} className={`relative h-20 w-16 shrink-0 snap-start overflow-hidden rounded-xl border transition md:h-24 md:w-20 ${index === activeIndex ? "border-[#171412] ring-2 ring-[#171412]/10" : "border-transparent opacity-55 hover:opacity-100"}`}>
                  <Image src={image.src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex gap-1.5" aria-label="Image pagination">
                {images.map((image, index) => (
                  <button key={image.id} type="button" onClick={() => setActiveIndex(index)} aria-label={`Go to image ${index + 1}`} className={`h-1.5 rounded-full transition-all ${index === activeIndex ? "w-8 bg-[#171412]" : "w-1.5 bg-[#171412]/20"}`} />
                ))}
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#584e49] md:hidden">
                {String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
