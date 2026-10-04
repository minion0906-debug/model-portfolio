"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { PublicHeroSlide } from "@/lib/hero";

const fallbackSlides: PublicHeroSlide[] = [
  {
    id: "fallback-1",
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1800&q=85",
    alt: "Editorial portrait",
    title: "Avery",
    subtitle: "Visual Stories.",
  },
  {
    id: "fallback-2",
    src: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1800&q=85",
    alt: "Fashion portrait",
    title: "Avery",
    subtitle: "Quiet confidence.",
  },
  {
    id: "fallback-3",
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1800&q=85",
    alt: "Creative portrait",
    title: "Avery",
    subtitle: "Made to move.",
  },
];

export default function Hero({ slides = [] }: { slides?: PublicHeroSlide[] }) {
  const heroSlides = slides.length ? slides : fallbackSlides;
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (heroSlides.length < 2) return;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    if (active >= heroSlides.length) setActive(0);
  }, [active, heroSlides.length]);

  const slide = heroSlides[active];

  return (
    <section className="relative min-h-screen overflow-hidden bg-neutral-900 text-white">
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={active === 0}
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-black/20" />

      <div className="container-page relative flex min-h-screen flex-col justify-end pb-14 pt-32 md:pb-20">
        <div className="max-w-3xl">
          <motion.p
            key={`${slide.id}-eyebrow`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 text-xs uppercase tracking-[0.35em] text-white/70"
          >
            Model · Creative · Editorial
          </motion.p>

          <motion.h1
            key={`${slide.id}-title`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-6xl leading-[0.9] md:text-9xl"
          >
            {slide.title}
          </motion.h1>

          <motion.p
            key={`${slide.id}-subtitle`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 max-w-md text-lg text-white/80 md:text-xl"
          >
            {slide.subtitle}
          </motion.p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#gallery"
              className="border border-white/40 px-5 py-3 text-xs uppercase tracking-[0.2em] transition hover:bg-white hover:text-black"
            >
              View Portfolio
            </a>
            <a
              href="#booking"
              className="bg-white px-5 py-3 text-xs uppercase tracking-[0.2em] text-black transition hover:bg-white/80"
            >
              Book Me
            </a>
          </div>
        </div>

        <div className="mt-10 flex items-center gap-2">
          {heroSlides.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Show hero slide ${index + 1}`}
              onClick={() => setActive(index)}
              className={`h-px transition-all ${
                index === active ? "w-12 bg-white" : "w-5 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
