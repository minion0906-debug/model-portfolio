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
    <section className="relative min-h-screen overflow-hidden bg-[#12100f] text-[#f7f3ee]">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1 }}
          className="absolute inset-0 overflow-hidden"
        >
          <div className="relative h-full w-full">
            <Image
              src={current.src}
              alt={current.alt}
              width={1800}
              height={1200}
              priority
              loading="eager"
              sizes="100vw"
              className="h-full w-full object-cover grayscale-[0.15] contrast-[1.05]"
            />
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(196,161,110,0.18),transparent_24%),linear-gradient(90deg,rgba(18,16,15,0.86),rgba(18,16,15,0.62),rgba(18,16,15,0.82))]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,16,15,0.18),rgba(18,16,15,0.72))]" />

      <div className="container-page relative flex min-h-screen items-end pb-20 pt-24 md:pb-24 md:pt-28">
        <div className="w-full max-w-5xl">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-[#f7f3ee]/15 bg-[#f7f3ee]/6 px-4 py-2 text-[0.58rem] uppercase tracking-[0.3em] text-[#f3e8dc] backdrop-blur-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-[#d8b07d]" />
            {current.subtitle}
          </div>

          <div className="mb-5 flex items-center gap-3 text-[0.6rem] uppercase tracking-[0.34em] text-[#f0e9e1]/75">
            <span>Maison</span>
            <span className="inline-block h-px w-8 bg-[#f0e9e1]/45" />
            <span>Editorial</span>
          </div>

          <h1 className="font-display text-5xl leading-[0.8] tracking-[-0.07em] text-[#f7f3ee] md:text-7xl lg:text-[9rem] xl:text-[10rem]">
            {current.title}
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-[#efe5dc]/85 md:text-lg">
            Editorial, fashion, and commercial talent crafting standout imagery with a cinematic point of view.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#gallery" className="btn-primary bg-[#f7f3ee] text-[#12100f] hover:bg-[#efe6db]">
              View work
            </a>
            <a href="#contact" className="btn-secondary border-[#f7f3ee]/20 bg-[#f7f3ee]/4 text-[#f7f3ee]">
              Book a shoot
            </a>
          </div>

          <div className="mt-10 grid max-w-xl gap-3 sm:grid-cols-3">
            {[
              ["12+", "Years"],
              ["48", "Campaigns"],
              ["8", "Countries"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <div className="font-display text-3xl text-[#f7f3ee]">{value}</div>
                <div className="mt-1 text-[0.62rem] uppercase tracking-[0.22em] text-[#efe5dc]/70">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute right-5 top-28 hidden rounded-full border border-[#f7f3ee]/10 bg-[#f7f3ee]/5 px-3 py-2 text-[0.58rem] uppercase tracking-[0.36em] text-[#f3e8dc]/80 backdrop-blur-sm md:block">
        Couture
      </div>

      {source.length > 1 && (
        <div className="absolute bottom-8 right-5 flex gap-2 md:right-10">
          {source.map((slide, slideIndex) => (
            <button
              key={slide.id}
              aria-label={`Show slide ${slideIndex + 1}`}
              onClick={() => setIndex(slideIndex)}
              className={`h-1.5 rounded-full transition-all ${slideIndex === index ? "w-10 bg-[#f7f3ee]" : "w-4 bg-[#f7f3ee]/35"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
