"use client";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { PublicVideo } from "@/lib/videos";

export default function VideoSection({ videos }: { videos: PublicVideo[] }) {
  const [page, setPage] = useState(1);
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(videos.length / pageSize));
  const visible = useMemo(() => videos.slice((page - 1) * pageSize, page * pageSize), [videos, page]);
  return <section id="videos" className="studio-motion"><div className="studio-shell">
    <div className="studio-motion-head"><div><p className="studio-label">03 / Motion</p><h2>Beyond<br /><em>the still.</em></h2></div><p>Campaign films, movement and personality. A closer look at the work in motion.</p></div>
    {videos.length ? <><div className="studio-motion-grid">{visible.map((video,index)=><motion.article key={video.id} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className={index===0?"studio-film featured":"studio-film"}><div className="studio-film-frame"><video src={video.src} poster={video.poster||undefined} controls playsInline preload="metadata" /></div><div className="studio-film-info"><span>Film {String(index+1).padStart(2,"0")}</span><h3>{video.title}</h3><b>↗</b></div></motion.article>)}</div>{totalPages > 1 && <div className="studio-pagination">{Array.from({length: totalPages}, (_, i) => <button key={i} className={page === i+1 ? "is-active" : ""} onClick={() => setPage(i+1)}>{i+1}</button>)}</div>}</> : <div className="studio-empty studio-empty-dark">Motion work will appear here.</div>}
  </div></section>;
}
