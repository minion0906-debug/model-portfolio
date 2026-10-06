"use client";

import { useEffect, useState } from "react";
import DirectUpload from "@/components/admin/DirectUpload";
import MediaPreviewModal from "@/components/admin/MediaPreviewModal";

type Video = {
  id: string;
  title: string | null;
  url: string;
  thumbnail: string | null;
  published: boolean;
  createdAt: string;
};

export default function VideoManager() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [preview, setPreview] = useState<Video | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  async function load() {
    const res = await fetch("/api/admin/videos");
    if (res.ok) {
      setVideos((await res.json()).videos);
    }
  }

  useEffect(() => {
    load();
  }, [refreshKey]);

  async function remove(id: string) {
    if (!confirm("Delete this video?")) return;

    await fetch(`/api/admin/videos/${id}`, { method: "DELETE" });
    setRefreshKey((value) => value + 1);
  }

  return (
    <div className="space-y-6">
      <DirectUpload
        key={refreshKey}
        kind="video"
        accept="video/mp4,video/webm,video/quicktime"
        onComplete={() => setRefreshKey((value) => value + 1)}
      />

      <div className="grid gap-5 grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <div key={video.id} className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
            {video.thumbnail ? (
              <img
                onDoubleClick={() => setPreview(video)}
                src={video.thumbnail}
                alt={video.title ?? "Video thumbnail"}
                className="h-40 w-full rounded-xl object-cover"
              />
            ) : (
              <video
                onDoubleClick={() => setPreview(video)}
                src={video.url}
                className="h-40 w-full rounded-xl object-cover"
              />
            )}

            <h3 className="mt-3 font-semibold text-slate-900">{video.title}</h3>
            <p className="text-sm text-slate-600">{video.published ? "Published" : "Hidden"}</p>

            <button
              type="button"
              onClick={() => remove(video.id)}
              className="mt-3 rounded bg-black px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {preview && (
        <MediaPreviewModal
          item={preview}
          kind="video"
          onClose={() => setPreview(null)}
          onSaved={() => {
            setPreview(null);
            setRefreshKey((value) => value + 1);
          }}
        />
      )}
    </div>
  );
}
