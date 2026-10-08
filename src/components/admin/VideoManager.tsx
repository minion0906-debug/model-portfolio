"use client";

import { useEffect, useState } from "react";
import DirectUpload from "@/components/admin/DirectUpload";
import MediaPreviewModal from "@/components/admin/MediaPreviewModal";

type Video = {
  id: string;
  title: string | null;
  description?: string | null;
  url: string;
  thumbnail: string | null;
  published: boolean;
  createdAt: string;
  priceCents: number;
  currency: string;
};

export default function VideoManager() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/videos", { cache: "no-store" });
    if (res.ok) {
      setVideos((await res.json()).videos || []);
    }
  }

  useEffect(() => {
    void load();
  }, [refreshKey]);

  async function remove(id: string) {
    if (!confirm("Delete this video?")) return;

    const res = await fetch(`/api/admin/videos/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPreviewIndex(null);
      setRefreshKey((value) => value + 1);
    }
  }

  async function togglePublished(video: Video) {
    setTogglingId(video.id);

    try {
      const res = await fetch(`/api/admin/videos/${video.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !video.published }),
      });

      if (!res.ok) {
        throw new Error("Unable to update video visibility.");
      }

      setVideos((current) =>
        current.map((item) =>
          item.id === video.id ? { ...item, published: !video.published } : item,
        ),
      );
    } catch (error) {
      console.error(error);
      alert("Could not change video visibility. Please try again.");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <DirectUpload
        key={refreshKey}
        kind="video"
        accept="video/mp4,video/webm,video/quicktime"
        onComplete={() => setRefreshKey((value) => value + 1)}
      />

      <section className="admin-video-tiles">
        {videos.length ? (
          <div className="studio-motion-grid">
            {videos.map((video, index) => (
              <article key={video.id} className={`studio-film admin-media-tile ${index === 0 ? "featured" : ""}`}>
                <button
                  type="button"
                  onClick={() => setPreviewIndex(index)}
                  className="studio-film-frame block w-full cursor-zoom-in border-0 p-0 text-left"
                  aria-label={`Open ${video.title || "video"} preview`}
                >
                  <video
                    src={video.url}
                    poster={video.thumbnail || undefined}
                    controls
                    playsInline
                    preload="metadata"
                  />
                </button>
                <div className="studio-film-info">
                  <span>Film {String(index + 1).padStart(2, "0")}</span>
                  <h3>{video.title || "Untitled film"}</h3>
                  <b>↗</b>
                </div>
                <div className="admin-media-actions admin-media-actions-dark">
                  <span className="admin-media-price">{video.priceCents > 0 ? `${video.currency} ${(video.priceCents / 100).toFixed(2)}` : "Free"}</span><span className={`admin-media-status ${video.published ? "is-published" : "is-hidden"}`}>
                    {video.published ? "Published" : "Hidden"}
                  </span>
                  <button type="button" onClick={() => void togglePublished(video)} disabled={togglingId === video.id}>
                    {togglingId === video.id ? "Updating…" : video.published ? "Hide" : "Publish"}
                  </button>
                  <button type="button" onClick={() => setPreviewIndex(index)}>Edit</button>
                  <button type="button" onClick={() => void remove(video.id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="studio-empty studio-empty-dark">No videos uploaded yet.</div>
        )}
      </section>

      {previewIndex !== null && videos[previewIndex] && (
        <MediaPreviewModal
          item={videos[previewIndex]}
          items={videos}
          kind="video"
          onClose={() => setPreviewIndex(null)}
          onSaved={() => {
            setPreviewIndex(null);
            setRefreshKey((value) => value + 1);
          }}
          onPrevious={() => setPreviewIndex((index) => (index === null ? null : (index - 1 + videos.length) % videos.length))}
          onNext={() => setPreviewIndex((index) => (index === null ? null : (index + 1) % videos.length))}
        />
      )}
    </div>
  );
}
