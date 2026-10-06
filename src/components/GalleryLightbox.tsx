"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

export type GalleryImage = {
  id: string;
  src: string;
  title: string;
  tag: string;
};

type Props = {
  images: GalleryImage[];
  activeIndex: number | null;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
};

export default function GalleryLightbox({ images, activeIndex, onClose, onPrevious, onNext }: Props) {
  const image = activeIndex === null ? null : images[activeIndex];

  useEffect(() => {
    if (activeIndex === null) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrevious();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = old;
      window.removeEventListener("keydown", key);
    };
  }, [activeIndex, onClose, onPrevious, onNext]);

  return <AnimatePresence>{image && (
    <motion.div className="fixed inset-0 z-[200] flex h-screen w-screen items-center justify-center bg-black" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}>
      <motion.div key={image.id} className="relative h-full w-full" initial={{scale:1.03,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:1.03,opacity:0}} transition={{duration:.3}} onClick={e=>e.stopPropagation()}>
        <Image src={image.src} alt={image.title} fill sizes="100vw" className="object-contain" priority />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent px-8 pb-10 pt-32 text-white">
          <p className="text-[10px] uppercase tracking-[.35em] text-white/60">{image.tag}</p>
          <h3 className="mt-2 text-3xl md:text-5xl">{image.title}</h3>
          <p className="mt-2 text-xs text-white/50">{activeIndex + 1} / {images.length}</p>
        </div>
      </motion.div>
      <button className="absolute right-8 top-8 z-10 h-12 w-12 rounded-full bg-white/10 text-3xl text-white backdrop-blur-md" onClick={onClose}>×</button>
      <button className="absolute left-8 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full bg-white/10 text-4xl text-white backdrop-blur-md" onClick={onPrevious}>‹</button>
      <button className="absolute right-8 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full bg-white/10 text-4xl text-white backdrop-blur-md" onClick={onNext}>›</button>
    </motion.div>
  )}</AnimatePresence>;
}
