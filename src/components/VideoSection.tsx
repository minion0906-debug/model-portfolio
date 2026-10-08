"use client";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import PayPalCheckout from "@/components/PayPalCheckout";
import type { PublicVideo } from "@/lib/videos";

function VideoCard({ video, index, page }: { video: PublicVideo; index: number; page: number }) {
  const [purchased, setPurchased] = useState(video.priceCents <= 0);
  const [checking, setChecking] = useState(video.priceCents > 0);

  const refreshAccess = useCallback(async () => {
    if (video.priceCents <= 0) {
      setPurchased(true);
      setChecking(false);
      return;
    }
    try {
      const response = await fetch(`/api/media/${video.id}?check=1`, { cache: "no-store" });
      const data = await response.json();
      setPurchased(Boolean(data.authorized));
    } finally {
      setChecking(false);
    }
  }, [video.id, video.priceCents]);

  useEffect(() => { void refreshAccess(); }, [refreshAccess]);

  const handlePurchaseSuccess = useCallback(() => setPurchased(true), []);
  const featured = index === 0;
  return (
    <motion.article initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className={featured ? "studio-film featured" : "studio-film"}>
      <div className="studio-film-frame relative">
        {purchased ? (
          <video src={video.priceCents > 0 ? `/api/media/${video.id}` : video.src} poster={video.poster||undefined} controls playsInline preload="metadata" />
        ) : (
          <>
            <video poster={video.poster||undefined} muted playsInline preload="metadata" className="pointer-events-none opacity-45 blur-sm" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/45 p-6 text-center">
              <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-black/65 p-5 backdrop-blur-xl">
                <p className="text-[9px] uppercase tracking-[0.22em] text-white/45">Premium film</p>
                <h4 className="mt-2 text-xl text-white">Unlock this film</h4>
                <p className="mt-2 mb-4 text-xs leading-5 text-white/55">One-time purchase. Access is saved in this browser.</p>
                {!checking && <PayPalCheckout mediaId={video.id} priceCents={video.priceCents} currency={video.currency} onSuccess={handlePurchaseSuccess} />}
              </div>
            </div>
          </>
        )}
      </div>
      <div className="studio-film-info">
        <span>Film {String((page - 1) * 4 + index + 1).padStart(2,"0")}</span>
        <h3>{video.title}</h3>
        <b>{video.priceCents > 0 ? `${video.currency} ${(video.priceCents / 100).toFixed(2)}` : "↗"}</b>
      </div>
    </motion.article>
  );
}

export default function VideoSection({ videos }: { videos: PublicVideo[] }) {
  const [page, setPage] = useState(1);
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(videos.length / pageSize));
  const visible = useMemo(() => videos.slice((page - 1) * pageSize, page * pageSize), [videos, page]);
  return <section id="videos" className="studio-motion"><div className="studio-shell">
    <div className="studio-motion-head"><div><p className="studio-label">03 / Motion</p><h2>Beyond<br /><em>the still.</em></h2></div><p>Campaign films, movement and personality. A closer look at the work in motion.</p></div>
    {videos.length ? <><div className="studio-motion-grid">{visible.map((video,index)=><VideoCard key={video.id} video={video} index={index} page={page} />)}</div>{totalPages > 1 && <div className="studio-pagination">{Array.from({length: totalPages}, (_, i) => <button key={i} className={page === i+1 ? "is-active" : ""} onClick={() => setPage(i+1)}>{i+1}</button>)}</div>}</> : <div className="studio-empty studio-empty-dark">Motion work will appear here.</div>}
  </div></section>;
}
