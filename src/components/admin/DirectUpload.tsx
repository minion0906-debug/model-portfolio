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
    <div className="rounded-2xl border border-dashed border-black/15 bg-white p-5">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={uploading}
        onChange={handleChange}
        className="block w-full text-sm"
      />
      <p className="mt-3 text-xs text-neutral-500">
        {kind === "video"
          ? "Direct upload supports MP4, WebM and MOV up to 500MB."
          : "Direct upload supports JPG, PNG and WebP up to 10MB."}
      </p>
      {status && <p className="mt-3 text-sm text-neutral-600">{status}</p>}
    </div>
  );
}
