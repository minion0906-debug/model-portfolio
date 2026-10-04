import { NextResponse } from "next/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireAdmin } from "@/lib/admin-api";
import { createUploadKey, validateDirectUpload } from "@/lib/media-upload";

export const runtime = "nodejs";

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

function publicUrl(key: string) {
  const base = process.env.S3_PUBLIC_URL?.replace(/\/$/, "");
  if (!base) throw new Error("S3_PUBLIC_URL is not configured.");
  return `${base}/${key}`;
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (process.env.MEDIA_STORAGE !== "s3") {
    return NextResponse.json(
      { error: "Direct uploads require MEDIA_STORAGE=s3." },
      { status: 400 },
    );
  }

  if (
    !process.env.S3_BUCKET ||
    !process.env.S3_REGION ||
    !process.env.S3_ENDPOINT ||
    !process.env.S3_ACCESS_KEY_ID ||
    !process.env.S3_SECRET_ACCESS_KEY ||
    !process.env.S3_PUBLIC_URL
  ) {
    return NextResponse.json(
      { error: "Object storage is not fully configured." },
      { status: 500 },
    );
  }

  try {
    const input = validateDirectUpload(await request.json());
    const key = createUploadKey(input.filename, input.kind);

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      ContentType: input.contentType,
      CacheControl: "public, max-age=31536000, immutable",
    });

    const uploadUrl = await getSignedUrl(getClient(), command, { expiresIn: 600 });

    return NextResponse.json({
      uploadUrl,
      key,
      url: publicUrl(key),
      expiresIn: 600,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid upload request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
