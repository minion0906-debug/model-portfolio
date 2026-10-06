"use client";
import {useState} from "react";

type Props={item:any; kind:"image"|"video"; onClose:()=>void; onSaved:()=>void};
export default function MediaPreviewModal({item,kind,onClose,onSaved}:Props){
 const [title,setTitle]=useState(item.title||"");
 const [description,setDescription]=useState(item.description||"");
 async function save(){
  await fetch(`/api/admin/${kind==='image'?'gallery':'videos'}/${item.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,description})});
  onSaved();
 }
 return <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
  <div className="max-w-5xl w-full bg-white rounded-xl p-4 overflow-auto max-h-screen">
   {kind==='image'?<img src={item.url} className="max-h-[70vh] w-full object-contain"/>:<video src={item.url} controls className="max-h-[70vh] w-full"/>}
   <input className="border p-2 w-full mt-3" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Name"/>
   <textarea className="border p-2 w-full mt-2" value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description"/>
   <div className="flex gap-2 mt-3"><button onClick={save}>Save</button><button onClick={onClose}>Close</button></div>
  </div>
 </div>
}
