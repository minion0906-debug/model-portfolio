"use client";

import { useEffect, useMemo, useState } from "react";
import DirectUpload from "@/components/admin/DirectUpload";

type Video = { id:string; title:string|null; url:string; thumbnail:string|null; published:boolean; createdAt:string };

export default function VideoManager() {
 const [videos,setVideos]=useState<Video[]>([]);
 const [query,setQuery]=useState("");
 const [filter,setFilter]=useState<"all"|"published"|"draft">("all");
 async function load(){const res=await fetch('/api/admin/videos',{cache:'no-store'}); if(res.ok) setVideos((await res.json()).videos||[]);}
 useEffect(()=>{load()},[]);
 async function remove(id:string){if(!confirm('Delete this video?')) return; await fetch(`/api/admin/videos/${id}`,{method:'DELETE'}); load();}
 const filtered=useMemo(()=>videos.filter(v=>{
   const match=(v.title||'').toLowerCase().includes(query.toLowerCase());
   const status=filter==='all'||(filter==='published'?v.published:!v.published);
   return match&&status;
 }),[videos,query,filter]);
 return <div className="space-y-6">
 <DirectUpload kind="video" accept="video/mp4,video/webm,video/quicktime" onComplete={load}/>
 <div className="flex flex-wrap gap-3"><input className="rounded border p-2" placeholder="Search videos" value={query} onChange={e=>setQuery(e.target.value)}/><select className="rounded border p-2" value={filter} onChange={e=>setFilter(e.target.value as any)}><option value="all">All</option><option value="published">Published</option><option value="draft">Draft</option></select></div>
 <div className="grid gap-5 md:grid-cols-3">{filtered.map(v=><div key={v.id} className="rounded-2xl border p-4 bg-white/80">{v.thumbnail ? <img src={v.thumbnail} className="h-40 w-full object-cover rounded-xl"/> : <video src={v.url} className="h-40 w-full rounded-xl" controls/>}<h3 className="mt-3 font-semibold">{v.title||'Untitled'}</h3><p className="text-sm">{v.published?'Published':'Hidden'}</p><button onClick={()=>remove(v.id)} className="mt-3 rounded bg-black px-3 py-2 text-white">Delete</button></div>)}</div>
 </div>
}
