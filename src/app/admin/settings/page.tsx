import SettingsManager from "@/components/admin/SettingsManager";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
          Configuration
        </p>
        <h1 className="mt-2 font-display text-4xl">Site Settings</h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-500">
          Manage the public profile, contact details, social links and booking availability.
        </p>
      </div>

      <SettingsManager />
    </div>
  );
}
