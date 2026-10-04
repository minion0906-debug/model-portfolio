import { prisma } from "@/lib/prisma";

export type PublicVideo = {
  id: string;
  src: string;
  poster: string | null;
  title: string;
  description: string;
};

export async function getPublishedVideos(): Promise<PublicVideo[]> {
  try {
    const videos = await prisma.media.findMany({
      where: {
        type: "VIDEO",
        published: true,
      },
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
      },
    });

    return videos.map((video) => ({
      id: video.id,
      src: video.url,
      poster: video.thumbnail,
      title: video.title || "Untitled film",
      description: video.description || "",
    }));
  } catch {
    return [];
  }
}
