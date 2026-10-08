import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

function mimeFor(url: string, type: "IMAGE" | "VIDEO") {
  const ext = path.extname(url).toLowerCase();
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
  };
  return map[ext] || (type === "IMAGE" ? "image/webp" : "video/mp4");
}

function parseRange(range: string | null, size: number) {
  if (!range) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!match) return null;
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2] || 0));
  const end = match[2] ? Number(match[2]) : size - 1;
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= size) return null;
  return { start, end: Math.min(end, size - 1) };
}

async function hasAccess(mediaId: string, priceCents: number) {
  if (priceCents <= 0) return true;
  const token = (await cookies()).get(`media_access_${mediaId}`)?.value;
  if (!token) return false;
  const payment = await prisma.payment.findFirst({
    where: { mediaId, accessToken: token, status: "COMPLETED" },
    select: { id: true },
  });
  return Boolean(payment);
}

export async function GET(request: Request, { params }: Context) {
  const { id } = await params;

  const media = await prisma.media.findFirst({
    where: { id, published: true },
    select: {
      id: true,
      type: true,
      url: true,
      priceCents: true,
      currency: true,
    },
  });

  if (!media) return NextResponse.json({ error: "Media not found." }, { status: 404 });

  const authorized = await hasAccess(media.id, media.priceCents);
  const url = new URL(request.url);

  if (url.searchParams.get("check") === "1") {
    return NextResponse.json({
      authorized,
      paid: media.priceCents > 0,
      priceCents: media.priceCents,
      currency: media.currency,
    });
  }

  if (!authorized) {
    return NextResponse.json({ error: "Purchase required." }, { status: 402 });
  }

  const contentType = mimeFor(media.url, media.type);
  const range = request.headers.get("range");

  if (media.url.startsWith("/uploads/")) {
    const relative = media.url.replace(/^\/+/, "");
    const absolute = path.resolve(process.cwd(), "public", relative);
    const publicRoot = path.resolve(process.cwd(), "public/uploads");
    if (!absolute.startsWith(publicRoot)) {
      return NextResponse.json({ error: "Invalid media path." }, { status: 400 });
    }

    try {
      const info = await stat(absolute);
      const parsedRange = parseRange(range, info.size);

      if (!parsedRange) {
        const stream = createReadStream(absolute);
        return new Response(Readable.toWeb(stream) as ReadableStream, {
          headers: {
            "Content-Type": contentType,
            "Content-Length": String(info.size),
            "Accept-Ranges": "bytes",
            "Cache-Control": "private, no-store",
          },
        });
      }

      const length = parsedRange.end - parsedRange.start + 1;
      const stream = createReadStream(absolute, {
        start: parsedRange.start,
        end: parsedRange.end,
      });

      return new Response(Readable.toWeb(stream) as ReadableStream, {
        status: 206,
        headers: {
          "Content-Type": contentType,
          "Content-Length": String(length),
          "Content-Range": `bytes ${parsedRange.start}-${parsedRange.end}/${info.size}`,
          "Accept-Ranges": "bytes",
          "Cache-Control": "private, no-store",
        },
      });
    } catch {
      return NextResponse.json({ error: "Media file is unavailable." }, { status: 404 });
    }
  }

  const upstream = await fetch(media.url, {
    headers: range ? { Range: range } : undefined,
    cache: "no-store",
  });

  if (!upstream.ok && upstream.status !== 206) {
    return NextResponse.json({ error: "Media file is unavailable." }, { status: 404 });
  }

  const headers = new Headers();
  headers.set("Content-Type", upstream.headers.get("content-type") || contentType);
  for (const name of ["content-length", "content-range", "accept-ranges"]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("Cache-Control", "private, no-store");

  return new Response(upstream.body, { status: upstream.status, headers });
}
