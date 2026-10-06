"use client";

import { useEffect, useState } from "react";
import DirectUpload from "@/components/admin/DirectUpload";
import MediaPreviewModal from "@/components/admin/MediaPreviewModal";

type Item = { id:string; url:string; title:string|null; description:string|null; published:boolean };

export default function GalleryManager(){
 const [items,setItems]=useState<Item[]>([]); const [loading,setLoading]=useState(true); const [preview,setPreview]=useState<Item|null>(null);
 async function load(){setLoading(true); const r=await fetch('/api/admin/gallery',{cache:'no-store'}); if(r.ok)setItems((await r.json()).media||[]); setLoading(false)}
 useEffect(()=>{void load()},[]);
 async function remove(id:string){if(!confirm('Delete this image?'))return; await fetch('/api/admin/gallery/'+id,{method:'DELETE'}); load();}
 async function edit(item:Item){const title=prompt('Title',item.title||''); if(title===null)return; await fetch('/api/admin/gallery/'+item.id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,description:item.description||''})}); load();}
 async function toggle(item:Item){await fetch('/api/admin/gallery/'+item.id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({published:!item.published})});load();}
 if(loading)return <div className="p-6">Loading gallery...</div>;
 return <div className="space-y-6"><DirectUpload kind="image" multiple accept="image/jpeg,image/png,image/webp" onComplete={load}/><div className="grid gap-4 grid-cols-2 lg:grid-cols-4">{items.map(i=><article key={i.id} className="rounded-xl border p-3"><img onDoubleClick={()=>setPreview(i)} src={i.url} className="aspect-[4/5] w-full object-cover rounded-lg"/><div className="mt-3 text-sm">{i.title||'Untitled'}</div><div className="mt-3 flex gap-2 text-xs"><button onClick={()=>edit(i)}>Edit</button><button onClick={()=>toggle(i)}>{i.published?'Hide':'Publish'}</button><button onClick={()=>remove(i.id)}>Delete</button></div></article>)}</div></div>
}
