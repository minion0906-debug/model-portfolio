import VideoManager from "@/components/admin/VideoManager";

export default function AdminVideosPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-[#171412]/10 bg-[#fffdfb]/85 p-6 shadow-[0_20px_40px_rgba(17,14,12,0.04)] md:p-8">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#584e49]">Media</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl text-[#171412]">Videos</h1>
        <p className="mt-2 text-sm leading-7 text-[#584e49]">
          Upload large videos directly to object storage and keep the motion portfolio polished and current.
        </p>
      </div>
      <VideoManager />
    </div>
  );
}
