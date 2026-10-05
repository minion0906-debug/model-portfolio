"use client";

import { motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

export default function MotionEffects() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: 0.2 });
  const cursor = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    let x = -100, y = -100, tx = -100, ty = -100;
    const move = (event: MouseEvent) => { tx = event.clientX; ty = event.clientY; };
    const tick = () => {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      if (cursor.current) cursor.current.style.transform = `translate3d(${x}px,${y}px,0)`;
      if (dot.current) dot.current.style.transform = `translate3d(${tx}px,${ty}px,0)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", move, { passive: true });
    raf = requestAnimationFrame(tick);
    const hover = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      root.classList.toggle("cursor-hover", !!target?.closest("a,button,[data-cursor]"));
    };
    document.addEventListener("mouseover", hover);
    return () => { window.removeEventListener("mousemove", move); document.removeEventListener("mouseover", hover); cancelAnimationFrame(raf); };
  }, []);

  useMotionValueEvent(scrollYProgress, "change", () => {});

  return <>
    <motion.div className="scroll-progress" style={{ scaleX: progress }} />
    <div ref={cursor} className="motion-cursor" aria-hidden="true" />
    <div ref={dot} className="motion-cursor-dot" aria-hidden="true" />
  </>;
}
