"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { PublicVideo } from "@/lib/videos";

export default function VideoSection({ videos }: { videos: PublicVideo[] }) {
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <section id="videos" className="portfolio-video-section">
      <div className="container-page">
        <div className="video-editorial-intro">
          <div>
            <p className="video-kicker">03 / Moving image</p>
            <h2 className="video-title">Motion<br /><em>studies.</em></h2>
          </div>
          <div className="video-heading-copy">
            <p>Campaign films, beauty stories and editorial motion — a closer look at the work beyond the still frame.</p>
            <div className="video-stat-row">
              <span>{String(videos.length).padStart(2, "0")} films</span>
              <span>Selected motion work</span>
            </div>
          </div>
        </div>

        {videos.length === 0 ? (
          <div className="video-empty">
            <span>03</span>
            <div>
              <h3>The next frame<br /><em>is coming.</em></h3>
              <p>Published films will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="video-showcase">
            {videos.map((video, index) => (
              <motion.article
                key={video.id}
                className={`video-card ${index === 0 ? "video-card-featured" : ""}`}
                initial={{ opacity: 0, y: 34 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.7, delay: Math.min(index, 5) * 0.08 }}
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

                  <div className={`video-art-direction ${playing === video.id ? "video-overlay-hidden" : ""}`} aria-hidden="true">
                    <span className="video-play">Play film</span>
                    <span className="video-play-icon">+</span>
                    <span className="video-index">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                </div>

                <div className="video-meta">
                  <div>
                    <p className="video-meta-tag">{index === 0 ? "Featured film" : "Motion / Film"}</p>
                    <h3>{video.title}</h3>
                    {video.description && <p className="video-description">{video.description}</p>}
                  </div>
                  <span className="video-arrow" aria-hidden="true">↗</span>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        <div className="video-footer-line">
          <span>03 — Motion</span>
          <span>Sound on · full-screen recommended</span>
        </div>
      </div>
    </section>
  );
}
