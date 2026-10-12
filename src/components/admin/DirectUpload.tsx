"use client";

import { useRef, useState } from "react";

type Props = {
  kind: "image" | "video";
  multiple?: boolean;
  accept: string;
  onComplete?: () => void;
};

type UploadResult = { name: string; ok: boolean; message: string };

async function readJson(response: Response): Promise<Record<string, any>> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { error: text.slice(0, 300) || `Request failed (${response.status}).` };
  }
}

function putFileWithProgress(url: string, file: File, onProgress: (percent: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Storage returned HTTP ${xhr.status}. Check bucket CORS and storage permissions.`));
      }
    };
    xhr.onerror = () => reject(new Error(
      "Could not reach object storage. This is commonly a bucket CORS or endpoint configuration issue. Allow PUT from your Vercel site origin and allow the Content-Type header."
    ));
    xhr.onabort = () => reject(new Error("Upload cancelled."));
    xhr.send(file);
  });
}

export default function DirectUpload({ kind, multiple = false, accept, onComplete }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<UploadResult[]>([]);

  async function uploadFile(file: File, index: number, total: number) {
    setStatus(`Preparing ${file.name} (${index + 1}/${total})…`);
    setProgress(0);

    const presignResponse = await fetch("/api/admin/uploads/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, contentType: file.type, kind, size: file.size }),
    });
    const presign = await readJson(presignResponse);

    if (!presignResponse.ok) {
      if (presign.error?.includes("MEDIA_STORAGE=s3")) {
        throw new Error("Uploads on Vercel require S3-compatible object storage. Set MEDIA_STORAGE=s3 and configure S3_BUCKET, S3_REGION, S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, and S3_PUBLIC_URL in Vercel, then redeploy.");
      }
      if (presignResponse.status === 401) {
        throw new Error("Admin session expired. Sign in to the admin dashboard again, then retry.");
      }
      throw new Error(presign.error || `Could not prepare upload (HTTP ${presignResponse.status}).`);
    }

    if (!presign.uploadUrl || !presign.key) {
      throw new Error("Upload service returned an incomplete response. Check the Vercel function logs.");
    }

    setStatus(`Uploading ${file.name} (${index + 1}/${total})…`);
    await putFileWithProgress(presign.uploadUrl, file, setProgress);

    setStatus(`Saving ${file.name} to the portfolio…`);
    const completeResponse = await fetch("/api/admin/uploads/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name, contentType: file.type, kind, size: file.size, key: presign.key,
      }),
    });
    const complete = await readJson(completeResponse);

    if (!completeResponse.ok) {
      if (completeResponse.status === 401) {
        throw new Error("Admin session expired before the upload could be saved. Sign in again; the file may already exist in storage.");
      }
      throw new Error(complete.error || `File uploaded but could not be saved to the gallery (HTTP ${completeResponse.status}). Check database connectivity and Vercel logs.`);
    }
  }

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setStatus("");
    setResults([]);
    const nextResults: UploadResult[] = [];
    let succeeded = 0;

    try {
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        try {
          await uploadFile(file, index, files.length);
          succeeded++;
          nextResults.push({ name: file.name, ok: true, message: "Uploaded and saved." });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Upload failed.";
          nextResults.push({ name: file.name, ok: false, message });
        }
        setResults([...nextResults]);
      }

      if (succeeded > 0) onComplete?.();
      const failed = files.length - succeeded;
      setStatus(failed === 0
        ? `${succeeded} upload${succeeded === 1 ? "" : "s"} complete.`
        : `${succeeded} succeeded, ${failed} failed. See details below.`);
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
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} disabled={uploading}
          onChange={handleChange} className="sr-only" />
        <span className="text-sm text-[#171412]">
          {uploading ? "Uploading…" : `Select ${kind === "video" ? "video files" : "images"}`}
        </span>
        <span className="rounded-full bg-[#171412] px-3 py-1.5 text-[9px] uppercase tracking-[0.18em] text-white">
          {uploading ? "Busy" : "Add"}
        </span>
      </label>

      <p className="mt-3 text-xs leading-6 text-[#584e49]">
        {kind === "video"
          ? "MP4, WebM and MOV up to 500MB. Large files upload directly to object storage."
          : "JPG, PNG and WebP up to 10MB. Images upload directly to object storage."}
      </p>
      {uploading && (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e8e0d8]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <div className="h-full rounded-full bg-[#171412] transition-[width]" style={{ width: `${progress}%` }} />
        </div>
      )}
      {status && <p className="mt-3 text-sm text-[#171412]" role="status">{status}</p>}
      {results.length > 0 && (
        <ul className="mt-3 space-y-2 text-xs leading-5" aria-label="Upload results">
          {results.map((result, index) => (
            <li key={`${result.name}-${index}`} className={result.ok ? "text-green-800" : "text-red-700"}>
              <strong>{result.ok ? "✓" : "✕"} {result.name}:</strong> {result.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
