"use client";

import { useRef, useState } from "react";

type Props = {
  kind: "image" | "video";
  multiple?: boolean;
  accept: string;
  onComplete?: () => void;
};

export default function DirectUpload({
  kind,
  multiple = false,
  accept,
  onComplete,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");

  async function uploadFile(file: File) {
    setStatus(`Preparing ${file.name}…`);

    const presignResponse = await fetch("/api/admin/uploads/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        kind,
        size: file.size,
      }),
    });

    const presign = await presignResponse.json();

    if (!presignResponse.ok) {
      // Development/local fallback: use the existing server upload pipeline
      // when S3 direct uploads are not configured.
      if (presign.error?.includes("MEDIA_STORAGE=s3")) {
        const form = new FormData();
        if (kind === "video") {
          form.append("video", file);
        } else {
          form.append("files", file);
        }

        const fallbackResponse = await fetch(
          kind === "video" ? "/api/admin/videos/upload" : "/api/admin/gallery/upload",
          { method: "POST", body: form },
        );

        const fallback = await fallbackResponse.json();
        if (!fallbackResponse.ok) {
          throw new Error(fallback.error || "Unable to upload file.");
        }
        return;
      }

      throw new Error(presign.error || "Unable to prepare upload.");
    }

    setStatus(`Uploading ${file.name}…`);

    const uploadResponse = await fetch(presign.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Storage upload failed for ${file.name}.`);
    }

    setStatus(`Finalizing ${file.name}…`);

    const completeResponse = await fetch("/api/admin/uploads/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        kind,
        size: file.size,
        key: presign.key,
      }),
    });

    const complete = await completeResponse.json();

    if (!completeResponse.ok) {
      throw new Error(complete.error || "Unable to finalize upload.");
    }
  }

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setStatus("");

    try {
      for (const file of files) {
        await uploadFile(file);
      }
      setStatus(`${files.length} upload${files.length === 1 ? "" : "s"} complete.`);
      onComplete?.();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-[1.75rem] border border-[#171412]/10 bg-[#fffdfb]/85 p-5 shadow-[0_20px_40px_rgba(17,14,12,0.04)] md:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#584e49]">Quick upload</p>
          <h3 className="mt-2 font-display text-3xl text-[#171412]">
            {kind === "video" ? "Video library" : "Portfolio images"}
          </h3>
        </div>
        <span className="rounded-full border border-[#171412]/10 bg-[#f5efe9] px-3 py-1 text-[9px] uppercase tracking-[0.18em] text-[#171412]">
          {kind === "video" ? "Video" : "Image"}
        </span>
      </div>

      <label className="mt-6 flex cursor-pointer items-center justify-between gap-3 rounded-[1.25rem] border border-dashed border-[#171412]/20 bg-[#f8f4f0] px-4 py-4 transition hover:border-[#171412]/35 hover:bg-[#f3eee8]">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={uploading}
          onChange={handleChange}
          className="sr-only"
        />
        <span className="text-sm text-[#171412]">
          {uploading ? "Uploading…" : `Select ${kind === "video" ? "video files" : "images"}`}
        </span>
        <span className="rounded-full bg-[#171412] px-3 py-1.5 text-[9px] uppercase tracking-[0.18em] text-white">
          {uploading ? "Busy" : "Add"}
        </span>
      </label>

      <p className="mt-3 text-xs leading-6 text-[#584e49]">
        {kind === "video"
          ? "Direct upload supports MP4, WebM and MOV up to 500MB."
          : "Direct upload supports JPG, PNG and WebP up to 10MB."}
      </p>
      {status && <p className="mt-3 text-sm text-[#171412]">{status}</p>}
    </div>
  );
}
