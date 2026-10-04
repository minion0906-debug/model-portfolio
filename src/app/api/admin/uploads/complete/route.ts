import { NextResponse } from "next/server";
import { HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-api";
import { directUploadSchema } from "@/lib/media-upload";

export const runtime = "nodejs";

const bodySchema = directUploadSchema.extend({
  key: directUploadSchema.shape.filename.transform(() => ""),
});

function getClient() {
  return new S3Client({
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
    },
  });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (process.env.MEDIA_STORAGE !== "s3") {
    return NextResponse.json({ error: "Direct uploads require S3 storage." }, { status: 400 });
  }

  try {
    const raw = await request.json();
    const input = directUploadSchema.parse(raw);
    const key = typeof raw.key === "string" ? raw.key : "";

    if (!key) {
      return NextResponse.json({ error: "Upload key is required." }, { status: 400 });
    }

    const folder =
      input.kind === "image"
        ? "gallery/"
        : input.kind === "video"
          ? "videos/"
          : "video-thumbnails/";

    if (!key.startsWith(folder)) {
      return NextResponse.json({ error: "Invalid upload key." }, { status: 400 });
    }

    const head = await getClient().send(
      new HeadObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
      }),
    );

    const actualSize = Number(head.ContentLength || 0);
    if (!actualSize || actualSize > input.size || actualSize > input.size + 1024 * 1024) {
      return NextResponse.json({ error: "Uploaded file size could not be verified." }, { status: 400 });
    }

    const baseUrl = process.env.S3_PUBLIC_URL?.replace(/\/$/, "");
    if (!baseUrl) throw new Error("S3_PUBLIC_URL is not configured.");

    const url = `${baseUrl}/${key}`;

    if (input.kind === "image") {
      const media = await prisma.media.create({
        data: {
          type: "IMAGE",
          title: input.filename.replace(/\.[^/.]+$/, ""),
          url,
          size: actualSize,
          published: false,
        },
      });

      return NextResponse.json({ media }, { status: 201 });
    }

    if (input.kind === "video") {
      const media = await prisma.media.create({
        data: {
          type: "VIDEO",
          title: input.filename.replace(/\.[^/.]+$/, ""),
          url,
          size: actualSize,
          published: false,
        },
      });

      return NextResponse.json({ media }, { status: 201 });
    }

    return NextResponse.json({ url }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to complete upload." }, { status: 400 });
  }
}
