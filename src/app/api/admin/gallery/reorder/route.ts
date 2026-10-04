import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminForApi } from "@/lib/admin-api";

const reorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(500),
});

export async function PUT(request: Request) {
  const admin = await getAdminForApi();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = reorderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid gallery order." }, { status: 400 });
  }

  const ids = parsed.data.ids;

  if (new Set(ids).size !== ids.length) {
    return NextResponse.json({ error: "Duplicate gallery IDs." }, { status: 400 });
  }

  const media = await prisma.media.findMany({
    where: {
      id: { in: ids },
      type: "IMAGE",
    },
    select: { id: true },
  });

  if (media.length !== ids.length) {
    return NextResponse.json(
      { error: "The gallery contains an invalid image." },
      { status: 400 },
    );
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
  revalidatePath("/admin/gallery");

  return NextResponse.json({ success: true });
}
