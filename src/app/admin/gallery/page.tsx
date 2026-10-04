import { prisma } from "@/lib/prisma";
import GalleryManager, {
  type AdminGalleryItem,
} from "@/components/admin/GalleryManager";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const media = await prisma.media.findMany({
    where: { type: "IMAGE" },
    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      url: true,
      thumbnail: true,
      title: true,
      description: true,
      published: true,
      sortOrder: true,
      size: true,
      createdAt: true,
    },
  });

  const items: AdminGalleryItem[] = media.map((item) => ({
    id: item.id,
    src: item.thumbnail || item.url,
    title: item.title || "",
    description: item.description || "",
    published: item.published,
    sortOrder: item.sortOrder,
    size: item.size,
    createdAt: item.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
          Content
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">Gallery</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
          Upload, organize and publish the images that appear on the public portfolio.
        </p>
      </div>

      <GalleryManager initialItems={items} />
    </div>
  );
}
