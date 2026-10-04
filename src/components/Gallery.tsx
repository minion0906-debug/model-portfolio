"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import GalleryLightbox, {
  type GalleryImage,
} from "@/components/GalleryLightbox";

type GalleryProps = {
  images: GalleryImage[];
};

export default function Gallery({ images }: GalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const showPrevious = () => {
    setActiveIndex((current) => {
      if (current === null || images.length === 0) return null;
      return current === 0 ? images.length - 1 : current - 1;
    });
  };

  const showNext = () => {
    setActiveIndex((current) => {
      if (current === null || images.length === 0) return null;
      return current === images.length - 1 ? 0 : current + 1;
    });
  };

  return (
    <>
      <section id="gallery" className="section-pad py-24 md:py-28">
        <div className="container-page">
          <div className="mb-12 flex items-end justify-between gap-8">
            <div>
              <p className="section-kicker mb-3">Selected work</p>
              <h2 className="font-display text-5xl text-[#171412] md:text-7xl">Gallery</h2>
            </div>

            <p className="hidden max-w-xs text-sm leading-6 text-[#584e49] md:block">
              A curated selection of editorial, fashion, beauty and commercial work.
            </p>
          </div>

          {images.length === 0 ? (
            <div className="panel-surface rounded-[2rem] border-dashed px-6 py-20 text-center">
              <p className="font-display text-3xl">Gallery coming soon.</p>
              <p className="mt-3 text-sm text-neutral-500">
                Published portfolio images will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
              {images.map((image, index) => (
                <motion.button
                  type="button"
                  key={image.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.65, delay: index * 0.05 }}
                  onClick={() => setActiveIndex(index)}
                  className={`group relative block w-full overflow-hidden rounded-[1.8rem] border border-[#171412]/5 bg-[#f7f3ee] text-left shadow-[0_24px_60px_rgba(17,15,13,0.08)] ${
                    index % 3 === 1 ? "aspect-[3/4]" : "aspect-[4/5]"
                  }`}
                  aria-label={`Open ${image.title}`}
                >
                  <Image
                    src={image.src}
                    alt={image.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-4 pt-16 text-white">
                    <span className="text-[0.6rem] uppercase tracking-[0.22em] text-white/80">
                      {image.tag}
                    </span>

                    <div className="mt-1 text-sm md:text-base">{image.title}</div>

                    <span className="mt-3 inline-block text-[10px] uppercase tracking-[0.2em] text-white/90 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      View image
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </section>

      <GalleryLightbox
        images={images}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
        onPrevious={showPrevious}
        onNext={showNext}
      />
    </>
  );
}
