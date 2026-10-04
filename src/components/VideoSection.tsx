"use client";

import { motion } from "framer-motion";
import type { PublicVideo } from "@/lib/videos";

export default function VideoSection({
  videos,
}: {
  videos: PublicVideo[];
}) {
  return (
    <section id="videos" className="section-pad bg-[#171412] py-24 text-white md:py-28">
      <div className="container-page">
        <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="section-kicker text-[#e9dccd]/60">Motion</p>
            <h2 className="mt-3 font-display text-5xl tracking-tight text-[#f7f3ee] md:text-7xl">
              Moving Images
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-[#f0e7dd]/70">
            Campaign films, editorial motion and selected creative work.
          </p>
        </div>

        {videos.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/3 px-6 py-20 text-center text-sm text-white/45">
            New films coming soon.
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {videos.map((video, index) => (
              <motion.article
                key={video.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                className="group"
              >
                <div className="overflow-hidden rounded-[1.6rem] border border-[#f7f3ee]/10 bg-black shadow-[0_26px_60px_rgba(0,0,0,0.24)]">
                  <video
                    src={video.src}
                    poster={video.poster || undefined}
                    controls
                    preload="metadata"
                    playsInline
                    className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>

                <div className="mt-5 flex items-start justify-between gap-5">
                  <div>
                    <h3 className="font-display text-2xl">{video.title}</h3>
                    {video.description && (
                      <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">
                        {video.description}
                      </p>
                    )}
                  </div>
                  <span className="pt-1 text-xs text-white/30">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
