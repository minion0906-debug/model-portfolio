"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import GalleryLightbox, { type GalleryImage } from "@/components/GalleryLightbox";

export default function Gallery({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const filters = ["All", ...Array.from(new Set(images.map((x) => x.tag).filter(Boolean)))];
  const filtered = useMemo(() => filter === "All" ? images : images.filter((x) => x.tag === filter), [images, filter]);
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page]);
  return (
    <section id="gallery" className="studio-gallery">
      <div className="studio-shell">
        <div className="studio-section-head">
          <div><p className="studio-label">02 / Selected work</p><h2>Visual<br /><em>language.</em></h2></div>
          <div className="studio-section-head-right"><p>Still imagery across fashion, beauty, editorial and commercial work.</p><span>{String(images.length).padStart(2, "0")} images</span></div>
        </div>
        {images.length ? <>
          <div className="studio-filters">{filters.map((item) => <button key={item} className={filter === item ? "is-active" : ""} onClick={() => { setFilter(item || "All"); setPage(1); setActive(null); }}>{item}</button>)}</div>
          <div className="studio-gallery-grid">
            {visible.map((image, index) => <motion.button key={image.id} className={`studio-shot shot-${index % 6}`} onClick={() => setActive(index)} initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.1}} transition={{duration:.55,delay:Math.min(index,4)*.05}}>
              <img
                src={image.src}
                alt={image.title}
                className="studio-shot-image"
                loading={index < 2 ? "eager" : "lazy"}
                decoding="async"
              />
              <span className="studio-shot-overlay" /><span className="studio-shot-meta"><b>{String(index+1).padStart(2,"0")}</b><em>{image.tag || "Selected work"}</em></span><span className="studio-shot-title">{image.title}<i>↗</i></span>
            </motion.button>)}
          </div>
          {totalPages > 1 && <div className="studio-pagination">{Array.from({length: totalPages}, (_, i) => <button key={i} className={page === i+1 ? "is-active" : ""} onClick={() => setPage(i+1)}>{i+1}</button>)}</div>}
        </> : <div className="studio-empty">Published work will appear here.</div>}
      </div>
      <AnimatePresence>{active !== null && <GalleryLightbox images={visible} activeIndex={active} onClose={() => setActive(null)} onPrevious={() => setActive((i) => i === null ? 0 : (i - 1 + visible.length) % visible.length)} onNext={() => setActive((i) => i === null ? 0 : (i + 1) % visible.length)} />}</AnimatePresence>
    </section>
  );
}
