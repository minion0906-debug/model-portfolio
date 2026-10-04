import VideoManager from "@/components/admin/VideoManager";

export default function AdminVideosPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">Media</p>
        <h1 className="mt-2 font-display text-4xl">Videos</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Upload large videos directly to object storage.
        </p>
      </div>
      <VideoManager />
    </div>
  );
}
