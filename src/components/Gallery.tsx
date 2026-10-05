"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import GalleryLightbox, { type GalleryImage } from "@/components/GalleryLightbox";

type GalleryProps = { images: GalleryImage[] };

export default function Gallery({ images }: GalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState("All");
  const filters = ["All", ...Array.from(new Set(images.map((image) => image.tag).filter(Boolean)))];
  const visibleImages = useMemo(() => filter === "All" ? images : images.filter((image) => image.tag === filter), [filter, images]);

  return (
    <section id="gallery" className="portfolio-gallery section-pad">
      <div className="container-page">
        <div className="gallery-heading">
          <div>
            <p className="section-kicker">01 / Selected work</p>
            <h2 className="gallery-title">Images</h2>
          </div>
          <div className="gallery-heading-copy">
            <p>Portraits, editorials and campaign imagery - curated to show range, presence and movement.</p>
            {images.length > 0 && (
              <span className="gallery-count">{String(images.length).padStart(2, "0")} images</span>
            )}
          </div>
        </div>

        {images.length === 0 ? (
          <div className="gallery-empty panel-surface">
            <span className="gallery-empty-mark">01</span>
            <p className="font-display">Images coming soon.</p>
            <small>Published portfolio images will appear here.</small>
          </div>
        ) : (
          <>
            <div className="gallery-filters" aria-label="Portfolio categories">
              {filters.map((item) => (
                <button key={item} type="button" className={filter === item ? "gallery-filter active" : "gallery-filter"} onClick={() => setFilter(item || "All")}>
                  {item || "Portfolio"}
                </button>
              ))}
            </div>

            <div className="gallery-showcase" aria-label="Image portfolio">
              {visibleImages.map((image, index) => {
                const featured = index === 0;
                const layoutClass = featured ? "gallery-card gallery-card-featured" : "gallery-card";

                return (
                  <motion.button
                    key={image.id}
                    type="button"
                    className={layoutClass}
                    onClick={() => setActiveIndex(index)}
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.12 }}
                    transition={{ duration: 0.55, delay: Math.min(index, 5) * 0.06 }}
                    aria-label={`Open ${image.title}`}
                  >
                    <Image
                      src={image.src}
                      alt={image.title}
                      fill
                      sizes={featured ? "(max-width: 900px) 100vw, 58vw" : "(max-width: 900px) 50vw, 28vw"}
                      className="gallery-card-image"
                      priority={index < 2}
                    />
                    <span className="gallery-card-shade" />
                    <span className="gallery-card-topline">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <span>{image.tag || "Portfolio"}</span>
                    </span>
                    <span className="gallery-card-caption">
                      <span className="gallery-card-title">{image.title}</span>
                      <span className="gallery-card-open">View <b>+</b></span>
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <div className="gallery-footer-line">
              <span>Scroll to explore</span>
              <span className="gallery-footer-rule" />
              <span>Click any image to enlarge</span>
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {activeIndex !== null && (
          <GalleryLightbox
            images={images}
            activeIndex={activeIndex}
            onClose={() => setActiveIndex(null)}
            onPrevious={() => setActiveIndex((current) => (current === null ? 0 : (current - 1 + images.length) % images.length))}
            onNext={() => setActiveIndex((current) => (current === null ? 0 : (current + 1) % images.length))}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
