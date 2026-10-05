import SettingsManager from "@/components/admin/SettingsManager";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-[#171412]/10 bg-[#141210] p-6 text-white shadow-[0_30px_80px_rgba(17,16,15,0.28)] md:p-8">
        <p className="text-[10px] uppercase tracking-[0.34em] text-[#d7b98c]">Configuration</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Site settings</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-white/75">
          Manage the public profile, contact details, social links and booking availability.
        </p>
      </div>

      <SettingsManager />
    </div>
  );
}
