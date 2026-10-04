"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import type { PublicHeroSlide } from "@/lib/hero";

type Props = {
  slides?: PublicHeroSlide[];
  fallbackName?: string;
};

const fallback = [
  {
    id: "fallback-1",
    src: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=85",
    alt: "Editorial fashion portrait",
    title: "Avery",
    subtitle: "Model · Creative · Editorial",
  },
];

export default function Hero({ slides, fallbackName = "Avery" }: Props) {
  const source = slides && slides.length > 0 ? slides : fallback.map((slide) => ({ ...slide, title: fallbackName }));
  const [index, setIndex] = useState(0);
  const current = source[index % source.length];

  useEffect(() => {
    if (source.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % source.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [source.length]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-black text-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1 }}
          className="absolute inset-0"
        >
          <Image src={current.src} alt={current.alt} fill priority sizes="100vw" className="object-cover" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />

      <div className="container-page relative flex min-h-screen items-end pb-16 pt-32">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-white/65">{current.subtitle}</p>
          <h1 className="mt-5 font-display text-7xl leading-none md:text-[10rem]">{current.title}</h1>
        </div>
      </div>

      {source.length > 1 && (
        <div className="absolute bottom-8 right-5 flex gap-2 md:right-10">
          {source.map((slide, slideIndex) => (
            <button
              key={slide.id}
              aria-label={`Show slide ${slideIndex + 1}`}
              onClick={() => setIndex(slideIndex)}
              className={`h-1.5 rounded-full transition-all ${slideIndex === index ? "w-10 bg-white" : "w-4 bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
