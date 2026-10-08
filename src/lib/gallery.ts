import { unstable_cache } from "next/cache";
import { prisma, logDatabaseError, withDatabaseRetry } from "@/lib/prisma";

export type PublicGalleryImage = {
  id: string;
  src: string;
  title: string;
  tag: string;
  priceCents: number;
  currency: string;
};

const loadPublishedGalleryImages = unstable_cache(
  async (): Promise<PublicGalleryImage[]> => {
    try {
      const media = await withDatabaseRetry(() => prisma.media.findMany({
        where: { type: "IMAGE", published: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        select: {
          id: true,
          url: true,
          thumbnail: true,
          title: true,
          priceCents: true,
          currency: true,
          tags: {
            select: { tag: { select: { name: true } } },
            take: 1,
          },
        },
      }));

      return media.map((item) => ({
        id: item.id,
        src: item.priceCents > 0 ? (item.thumbnail || "/paid-media-placeholder.svg") : (item.thumbnail || item.url),
        title: item.title || "Untitled",
        tag: item.tags[0]?.tag.name || "Portfolio",
        priceCents: item.priceCents,
        currency: item.currency,
      }));
    } catch (error) {
      logDatabaseError("gallery", error);
      return [];
    }
  },
  ["public-gallery"],
  { revalidate: 60, tags: ["public-portfolio"] },
);

export function getPublishedGalleryImages() {
  return loadPublishedGalleryImages();
}
