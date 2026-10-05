"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { PublicVideo } from "@/lib/videos";

export default function VideoSection({ videos }: { videos: PublicVideo[] }) {
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <section id="videos" className="portfolio-video-section">
      <div className="container-page">
        <div className="video-heading">
          <div>
            <p className="video-kicker">02 / Moving image</p>
            <h2 className="video-title">Videos</h2>
          </div>
          <div className="video-heading-copy">
            <p>Campaign films, motion tests and editorial stories — made to be watched, not just scrolled past.</p>
            {videos.length > 0 && <span>{String(videos.length).padStart(2, "0")} films</span>}
          </div>
        </div>

        {videos.length === 0 ? (
          <div className="video-empty">
            <span>02</span>
            <div>
              <h3>No films yet.</h3>
              <p>Published videos will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="video-showcase">
            {videos.map((video, index) => (
              <motion.article
                key={video.id}
                className={`video-card ${index === 0 ? "video-card-featured" : ""}`}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6, delay: Math.min(index, 5) * 0.08 }}
              >
                <div className="video-frame">
                  <video
                    src={video.src}
                    poster={video.poster || undefined}
                    controls
                    preload="metadata"
                    playsInline
                    className="video-element"
                    onPlay={() => setPlaying(video.id)}
                    onPause={() => setPlaying((current) => current === video.id ? null : current)}
                    onEnded={() => setPlaying(null)}
                  />
                  <div className={`video-overlay ${playing === video.id ? "video-overlay-hidden" : ""}`} aria-hidden="true">
                    <span className="video-play">Play film</span>
                    <span className="video-play-icon">+</span>
                  </div>
                  <span className="video-index">{String(index + 1).padStart(2, "0")}</span>
                </div>

                <div className="video-meta">
                  <div>
                    <p className="video-meta-tag">Motion / Film</p>
                    <h3>{video.title}</h3>
                    {video.description && <p className="video-description">{video.description}</p>}
                  </div>
                  <span className="video-arrow">↗</span>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        <div className="video-footer-line">
          <span>02 — Videos</span>
          <span>Use headphones for the full experience</span>
        </div>
      </div>
    </section>
  );
}
