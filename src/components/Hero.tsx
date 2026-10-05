"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { PublicHeroSlide } from "@/lib/hero";
import type { PublicSiteSettings } from "@/lib/site-settings";

type Props = {
  slides?: PublicHeroSlide[];
  settings: PublicSiteSettings;
};

const fallbackImage =
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=90";

export default function Hero({ slides, settings }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.18]);
  const image = slides?.[0]?.src || settings.profileImage || fallbackImage;

  return (
    <section ref={ref} id="home" className="studio-hero">
      <motion.div className="studio-hero-image" style={{ y: imageY, scale: imageScale }}>
        <motion.div
          initial={{ scale: 1.16, opacity: 0 }}
          animate={{ scale: 1.08, opacity: 1 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={image}
            alt={slides?.[0]?.alt || settings.name}
            fill
            priority
            sizes="(max-width: 800px) 100vw, 72vw"
          />
        </motion.div>
        <div className="studio-hero-vignette" />
      </motion.div>

      <div className="studio-hero-top">
        <span>Model / Creative</span>
        <span>{settings.location || "Worldwide"}</span>
      </div>

      <motion.div
        className="studio-hero-title"
        style={{ y: titleY }}
        initial={{ opacity: 0, y: 55 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.15, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="studio-label">Selected talent</p>
        <h1>
          {settings.name}
          <i>.</i>
        </h1>
        <div className="studio-hero-sub">
          <span>Fashion</span>
          <span>Beauty</span>
          <span>Editorial</span>
        </div>
      </motion.div>

      <motion.div
        className="studio-hero-side"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <span>Scroll to explore</span>
        <b>↓</b>
      </motion.div>

      <motion.div
        className="studio-hero-status"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <i /> {settings.acceptingBookings ? "Available for selected projects" : "Currently unavailable"}
      </motion.div>

      <motion.div
        className="studio-hero-number"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        01 <span>/ 01</span>
      </motion.div>
    </section>
  );
}
