"use client";

import { useEffect, useState } from "react";
import DirectUpload from "@/components/admin/DirectUpload";

type Video = { id:string; title:string|null; url:string; thumbnail:string|null; published:boolean; createdAt:string };

export default function VideoManager() {
  const [videos,setVideos]=useState<Video[]>([]);
  const [refreshKey,setRefreshKey]=useState(0);

  async function load(){
    const res=await fetch('/api/admin/videos');
    if(res.ok) setVideos((await res.json()).videos);
  }

  useEffect(()=>{load()},[refreshKey]);

  async function remove(id:string){
    if(!confirm('Delete this video?')) return;
    await fetch(`/api/admin/videos/${id}`,{method:'DELETE'});
    setRefreshKey(v=>v+1);
  }

  return <div className="space-y-6">
    <DirectUpload key={refreshKey} kind="video" accept="video/mp4,video/webm,video/quicktime" onComplete={()=>setRefreshKey(v=>v+1)}/>
    <div className="grid gap-5 md:grid-cols-3">
      {videos.map(v=><div key={v.id} className="rounded-2xl border p-4 bg-white/80">
        {v.thumbnail ? <img src={v.thumbnail} className="h-40 w-full object-cover rounded-xl"/> : <video src={v.url} className="h-40 w-full rounded-xl" controls/>}
        <h3 className="mt-3 font-semibold">{v.title}</h3>
        <p className="text-sm">{v.published?'Published':'Hidden'}</p>
        <button onClick={()=>remove(v.id)} className="mt-3 rounded bg-black px-3 py-2 text-white">Delete</button>
      </div>)}
    </div>
  </div>
}
