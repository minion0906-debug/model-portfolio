"use client";

import { useState } from "react";
import DirectUpload from "@/components/admin/DirectUpload";

export default function VideoManager() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-[#171412]/10 bg-[#141210] p-6 text-white shadow-[0_30px_80px_rgba(17,16,15,0.28)] md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.34em] text-[#d7b98c]">Motion portfolio</p>
            <h2 className="mt-2 font-display text-4xl md:text-5xl">Video manager</h2>
          </div>
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[9px] uppercase tracking-[0.18em] text-white/80">
            Direct upload
          </span>
        </div>
      </div>

      <DirectUpload
        key={refreshKey}
        kind="video"
        accept="video/mp4,video/webm,video/quicktime"
        onComplete={() => setRefreshKey((value) => value + 1)}
      />

      <div className="rounded-[1.75rem] border border-[#171412]/10 bg-[#fffdfb]/85 p-6 shadow-[0_20px_40px_rgba(17,14,12,0.04)]">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#584e49]">Upload notes</p>
        <p className="mt-3 text-sm leading-7 text-[#584e49]">
          Videos upload directly from the browser to object storage. Existing video management remains available below in the current CMS.
        </p>
      </div>
    </div>
  );
}
