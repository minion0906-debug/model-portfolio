"use client";

import { useState } from "react";
import DirectUpload from "@/components/admin/DirectUpload";

export default function VideoManager() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-8">
      <DirectUpload
        key={refreshKey}
        kind="video"
        accept="video/mp4,video/webm,video/quicktime"
        onComplete={() => setRefreshKey((value) => value + 1)}
      />
      <p className="text-sm text-neutral-500">
        Videos upload directly from the browser to object storage. Existing video
        management remains available below in the current CMS.
      </p>
    </div>
  );
}
