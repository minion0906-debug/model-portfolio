import GalleryManager from "@/components/admin/GalleryManager";

export default function AdminGalleryPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">Media</p>
        <h1 className="mt-2 font-display text-4xl">Gallery</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Upload images directly to production object storage.
        </p>
      </div>
      <GalleryManager />
    </div>
  );
}
