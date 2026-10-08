"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import PayPalCheckout from "@/components/PayPalCheckout";

export type GalleryImage = {
  id: string;
  src: string;
  title: string;
  tag: string;
  priceCents: number;
  currency: string;
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
  const [zoom, setZoom] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [purchased, setPurchased] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const lastDistance = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const lastTap = useRef(0);

  useEffect(() => {
    if (activeIndex === null) return;
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setLoaded(false);
    setFailed(false);
    setPurchased(image ? image.priceCents <= 0 : false);
    setCheckingAccess(Boolean(image && image.priceCents > 0));

    if (image?.priceCents > 0) {
      void fetch(`/api/media/${image.id}?check=1`, { cache: "no-store" })
        .then((response) => response.ok ? response.json() : { authorized: false })
        .then((data) => setPurchased(Boolean(data.authorized)))
        .catch(() => setPurchased(false))
        .finally(() => setCheckingAccess(false));
    }

    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrevious();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "+") setZoom((z) => Math.min(z + .25, 4));
      if (e.key === "-") setZoom((z) => Math.max(z - .25, 1));
    };
    window.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = old;
      window.removeEventListener("keydown", key);
    };
  }, [activeIndex, onClose, onPrevious, onNext]);

  const wheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.min(Math.max(z - e.deltaY * .002, 1), 4));
  };

  const touchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 2) return;
    const [a, b] = e.touches;
    const distance = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
    if (lastDistance.current) {
      setZoom((z) => Math.min(Math.max(z + (distance - lastDistance.current!) * .005, 1), 4));
    }
    lastDistance.current = distance;
  };

  const touchEnd = () => { lastDistance.current = null; };
  const doubleZoom = () => setZoom((z) => z > 1 ? 1 : 2.5);
  const tap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) doubleZoom();
    lastTap.current = now;
  };
  const swipeStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };
  const handlePurchaseSuccess = useCallback(() => {
    setPurchased(true);
    setCheckingAccess(false);
  }, []);

  const swipeEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || zoom > 1) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 80) diff > 0 ? onNext() : onPrevious();
    touchStartX.current = null;
  };

  return <AnimatePresence>{image && (
    <motion.div className="fixed inset-0 z-[200] flex h-screen w-screen items-center justify-center bg-black" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}>
      <motion.div className="relative h-full w-full overflow-hidden touch-none" onClick={(e)=>e.stopPropagation()} onWheel={wheel} onTouchMove={touchMove} onTouchEnd={touchEnd} onTouchStart={swipeStart} onClickCapture={tap} onDoubleClick={doubleZoom} onTouchCancel={swipeEnd}>
        <motion.div className="h-full w-full" animate={{scale:zoom, x:position.x, y:position.y}} drag={zoom > 1} dragConstraints={{left:-400,right:400,top:-400,bottom:400}} transition={{type:"spring", stiffness:200, damping:25}}>
          {!failed ? (
            <img
              src={image.priceCents > 0 && purchased ? `/api/media/${image.id}` : image.src}
              alt={image.title}
              draggable={false}
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
              className={`h-full w-full object-contain transition duration-700 ${loaded ? "opacity-100" : "opacity-50"} ${image.priceCents > 0 && !purchased ? "scale-105 blur-md brightness-50" : "blur-0"}`}
            />
          ) : (
            <div className="flex h-full items-center justify-center px-8 text-center text-sm uppercase tracking-[.2em] text-white/60">
              Image unavailable
            </div>
          )}
        </motion.div>
        {image.priceCents > 0 && !purchased && !checkingAccess && (
          <div className="absolute left-1/2 top-1/2 z-20 w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-[24px] border border-white/10 bg-black/75 p-6 shadow-2xl backdrop-blur-xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-[9px] uppercase tracking-[0.25em] text-white/50">Premium image</p>
            <h4 className="mt-2 text-2xl font-semibold text-white">Unlock this work</h4>
            <p className="mt-2 mb-5 text-sm leading-6 text-white/55">Purchase once to unlock the full-resolution image in this browser.</p>
            <PayPalCheckout
              mediaId={image.id}
              priceCents={image.priceCents}
              currency={image.currency}
              onSuccess={handlePurchaseSuccess}
            />
          </div>
        )}
        {image.priceCents > 0 && checkingAccess && (
          <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/65 px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-white/60 backdrop-blur-xl">
            Checking purchase…
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent px-8 pb-10 pt-32 text-white">
          <p className="text-[10px] uppercase tracking-[.35em] text-white/60">{image.tag}</p>
          <h3 className="mt-2 text-3xl md:text-5xl">{image.title}</h3>
          <p className="mt-2 text-xs text-white/50">{activeIndex + 1} / {images.length}</p>
        </div>
      </motion.div>
      <button aria-label="Close image viewer" className="absolute right-8 top-8 z-10 h-12 w-12 rounded-full bg-white/10 text-3xl text-white backdrop-blur-md" onClick={onClose}>×</button>
      <button aria-label="Previous image" className="absolute left-8 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full bg-white/10 text-4xl text-white backdrop-blur-md" onClick={onPrevious}>‹</button>
      <button aria-label="Next image" className="absolute right-8 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full bg-white/10 text-4xl text-white backdrop-blur-md" onClick={onNext}>›</button>
    </motion.div>
  )}</AnimatePresence>;
}
