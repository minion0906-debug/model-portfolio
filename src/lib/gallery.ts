import { prisma } from "@/lib/prisma";

export type PublicGalleryImage = {
  id: string;
  src: string;
  title: string;
  tag: string;
};

export async function getPublishedGalleryImages(): Promise<PublicGalleryImage[]> {
  try {
    const media = await prisma.media.findMany({
      where: {
        type: "IMAGE",
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
        tags: {
          select: {
            tag: {
              select: {
                name: true,
              },
            },
          },
          take: 1,
        },
      },
    });

    return media.map((item) => ({
      id: item.id,
      src: item.thumbnail || item.url,
      title: item.title || "Untitled",
      tag: item.tags[0]?.tag.name || "Portfolio",
    }));
  } catch {
    return [];
  }
}
