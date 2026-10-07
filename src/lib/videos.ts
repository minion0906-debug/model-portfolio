import { unstable_cache } from "next/cache";
import { prisma, logDatabaseError, withDatabaseRetry } from "@/lib/prisma";

export type PublicVideo = {
  id: string;
  src: string;
  poster: string | null;
  title: string;
  description: string;
};

const loadPublishedVideos = unstable_cache(
  async (): Promise<PublicVideo[]> => {
    try {
      const videos = await withDatabaseRetry(() => prisma.media.findMany({
        where: { type: "VIDEO", published: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        select: {
          id: true,
          url: true,
          thumbnail: true,
          title: true,
          description: true,
        },
      }));

      return videos.map((video) => ({
        id: video.id,
        src: video.url,
        poster: video.thumbnail,
        title: video.title || "Untitled film",
        description: video.description || "",
      }));
    } catch (error) {
      logDatabaseError("videos", error);
      return [];
    }
  },
  ["public-videos"],
  { revalidate: 60, tags: ["public-portfolio"] },
);

export function getPublishedVideos() {
  return loadPublishedVideos();
}
