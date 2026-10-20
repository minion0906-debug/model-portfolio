import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminForApi } from "@/lib/admin-api";
import { revalidatePublicPortfolio } from "@/lib/public-cache";
import { revalidatePath } from "next/cache";

const schema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(500),
  action: z.enum(["publish", "hide", "category"]),
  category: z.string().trim().max(60).optional(),
});

export async function POST(request: Request) {
  const admin = await getAdminForApi();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Choose at least one image and a valid action." }, { status: 400 });
  const { ids, action, category } = parsed.data;
  if (action === "category" && category === undefined) {
    return NextResponse.json({ error: "A category is required." }, { status: 400 });
  }

  const data = action === "publish" ? { published: true }
    : action === "hide" ? { published: false }
    : { category: category || null };
  const result = await prisma.media.updateMany({ where: { id: { in: ids }, type: "IMAGE" }, data });
  revalidatePath("/");
  revalidatePath("/admin/gallery");
  revalidatePublicPortfolio();
  return NextResponse.json({ success: true, updated: result.count });
}
