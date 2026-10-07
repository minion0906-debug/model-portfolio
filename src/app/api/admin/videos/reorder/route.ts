import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePublicPortfolio } from "@/lib/public-cache";
import { getAdminForApi } from "@/lib/admin-api";

const reorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(500),
});

export async function PUT(request: Request) {
  const admin = await getAdminForApi();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = reorderSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid video order." }, { status: 400 });
  }

  const ids = parsed.data.ids;

  if (new Set(ids).size !== ids.length) {
    return NextResponse.json({ error: "Duplicate video IDs." }, { status: 400 });
  }

  const videos = await prisma.media.findMany({
    where: {
      id: { in: ids },
      type: "VIDEO",
    },
    select: { id: true },
  });

  if (videos.length !== ids.length) {
    return NextResponse.json({ error: "Invalid video in order." }, { status: 400 });
  }

  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.media.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  revalidatePath("/");
  revalidatePublicPortfolio();
  revalidatePath("/admin/videos");

  return NextResponse.json({ success: true });
}
