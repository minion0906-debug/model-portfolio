"use client";

import { useEffect, useMemo, useState } from "react";
import DirectUpload from "@/components/admin/DirectUpload";

type Item = { id:string; url:string; title:string|null; description:string|null; published:boolean };

export default function GalleryManager(){
 const [items,setItems]=useState<Item[]>([]);
 const [loading,setLoading]=useState(true);
 const [query,setQuery]=useState("");
 const [filter,setFilter]=useState<"all"|"published"|"draft">("all");
 const [selected,setSelected]=useState<string[]>([]);
 function toggleSelect(id:string){setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);}
 async function bulkPublish(published:boolean){await Promise.all(selected.map(id=>fetch(`/api/admin/gallery/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({published})})));setSelected([]);load();}
 async function load(){setLoading(true); const r=await fetch('/api/admin/gallery',{cache:'no-store'}); if(r.ok)setItems((await r.json()).media||[]); setLoading(false)}
 useEffect(()=>{void load()},[]);
 async function remove(id:string){if(!confirm('Delete this image?'))return; await fetch('/api/admin/gallery/'+id,{method:'DELETE'}); load();}
 async function edit(item:Item){const title=prompt('Title',item.title||''); if(title===null)return; await fetch('/api/admin/gallery/'+item.id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,description:item.description||''})}); load();}
 async function toggle(item:Item){await fetch('/api/admin/gallery/'+item.id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({published:!item.published})});load();}
 const filtered=useMemo(()=>items.filter(i=>{
   const match=(i.title||'').toLowerCase().includes(query.toLowerCase());
   const status=filter==='all'||(filter==='published'?i.published:!i.published);
   return match&&status;
 }),[items,query,filter]);
 if(loading)return <div className="p-6">Loading gallery...</div>;
 return <div className="space-y-6">
 <DirectUpload kind="image" multiple accept="image/jpeg,image/png,image/webp" onComplete={load}/>
 <div className="flex flex-wrap gap-3"><button className="rounded border px-3" onClick={()=>bulkPublish(true)}>Publish Selected</button><button className="rounded border px-3" onClick={()=>bulkPublish(false)}>Hide Selected</button>
  <input className="rounded border p-2" placeholder="Search images" value={query} onChange={e=>setQuery(e.target.value)}/>
  <select className="rounded border p-2" value={filter} onChange={e=>setFilter(e.target.value as any)}><option value="all">All</option><option value="published">Published</option><option value="draft">Draft</option></select>
 </div>
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{filtered.map(i=><article key={i.id} className="rounded-xl border p-3"><input type="checkbox" checked={selected.includes(i.id)} onChange={()=>toggleSelect(i.id)}/><img src={i.url} className="aspect-[4/5] w-full object-cover rounded-lg"/><div className="mt-3 text-sm">{i.title||'Untitled'}</div><div className="mt-3 flex gap-2 text-xs"><button onClick={()=>edit(i)}>Edit</button><button onClick={()=>toggle(i)}>{i.published?'Hide':'Publish'}</button><button onClick={()=>remove(i.id)}>Delete</button></div></article>)}</div></div>
}
