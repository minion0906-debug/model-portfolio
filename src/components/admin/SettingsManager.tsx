"use client";

import { useEffect, useState } from "react";

type ImageOption = {
  id: string;
  url: string;
  title: string;
};

type Settings = {
  name: string;
  bio: string;
  profileImage: string;
  location: string;
  height: string;
  clothingSize: string;
  shoeSize: string;
  languages: string;
  specialties: string;
  email: string;
  phone: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  acceptingBookings: boolean;
};

const emptySettings: Settings = {
  name: "",
  bio: "",
  profileImage: "",
  location: "",
  height: "",
  clothingSize: "",
  shoeSize: "",
  languages: "",
  specialties: "",
  email: "",
  phone: "",
  instagram: "",
  tiktok: "",
  youtube: "",
  acceptingBookings: true,
};

export default function SettingsManager() {
  const [settings, setSettings] = useState<Settings>(emptySettings);
  const [images, setImages] = useState<ImageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const response = await fetch("/api/admin/settings", { cache: "no-store" });
    const data = await response.json();

    if (response.ok) {
      setSettings({
        name: data.settings.name || "",
        bio: data.settings.bio || "",
        profileImage: data.settings.profileImage || "",
        location: data.settings.location || "",
        height: data.settings.height || "",
        clothingSize: data.settings.clothingSize || "",
        shoeSize: data.settings.shoeSize || "",
        languages: data.settings.languages || "",
        specialties: data.settings.specialties || "",
        email: data.settings.email || "",
        phone: data.settings.phone || "",
        instagram: data.settings.instagram || "",
        tiktok: data.settings.tiktok || "",
        youtube: data.settings.youtube || "",
        acceptingBookings: Boolean(data.settings.acceptingBookings),
      });
      setImages(data.images || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Unable to save settings.");
      setSaving(false);
      return;
    }

    setSettings({
      name: data.settings.name || "",
      bio: data.settings.bio || "",
      profileImage: data.settings.profileImage || "",
      location: data.settings.location || "",
      height: data.settings.height || "",
      clothingSize: data.settings.clothingSize || "",
      shoeSize: data.settings.shoeSize || "",
      languages: data.settings.languages || "",
      specialties: data.settings.specialties || "",
      email: data.settings.email || "",
      phone: data.settings.phone || "",
      instagram: data.settings.instagram || "",
      tiktok: data.settings.tiktok || "",
      youtube: data.settings.youtube || "",
      acceptingBookings: Boolean(data.settings.acceptingBookings),
    });
    setMessage("Settings saved.");
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="rounded-[1.75rem] border border-[#171412]/10 bg-[#fffdfb]/80 p-8 text-sm text-[#584e49] shadow-[0_20px_40px_rgba(17,14,12,0.04)]">
        Loading settings…
      </div>
    );
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <section className="rounded-[1.75rem] border border-[#171412]/10 bg-[#fffdfb]/85 p-6 shadow-[0_20px_40px_rgba(17,14,12,0.04)] md:p-8">
        <h2 className="font-display text-3xl text-[#171412]">Profile</h2>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.18em] text-[#584e49]">Name</span>
            <input
              value={settings.name}
              onChange={(e) => update("name", e.target.value)}
              className="mt-2 w-full rounded-[1rem] border border-[#171412]/10 bg-white px-4 py-3 text-[#171412] outline-none transition focus:border-[#171412]/30"
              required
            />
          </label>

          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.18em] text-[#584e49]">Profile image</span>
            <select
              value={settings.profileImage}
              onChange={(e) => update("profileImage", e.target.value)}
              className="mt-2 w-full rounded-[1rem] border border-[#171412]/10 bg-white px-4 py-3 text-[#171412] outline-none transition focus:border-[#171412]/30"
            >
              <option value="">No profile image</option>
              {images.map((image) => (
                <option key={image.id} value={image.url}>
                  {image.title}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-[#584e49]">Uses a published gallery image.</p>
          </label>

          <label className="block md:col-span-2">
            <span className="text-[10px] uppercase tracking-[0.18em] text-[#584e49]">Bio</span>
            <textarea
              value={settings.bio}
              onChange={(e) => update("bio", e.target.value)}
              rows={6}
              className="mt-2 w-full rounded-[1rem] border border-[#171412]/10 bg-white px-4 py-3 text-[#171412] outline-none transition focus:border-[#171412]/30"
              placeholder="Short public profile biography"
            />
          </label>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[#171412]/10 bg-[#fffdfb]/85 p-6 shadow-[0_20px_40px_rgba(17,14,12,0.04)] md:p-8">
        <h2 className="font-display text-3xl text-[#171412]">Profile Details</h2>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {[
            ["location", "Location", "US, Las Vegas"],
            ["height", "Height", "5'10\" / 178 cm"],
            ["clothingSize", "Clothing Size", "US 4 / EU 34"],
            ["shoeSize", "Shoe Size", "US 8 / EU 39"],
            ["languages", "Languages", "English"],
            ["specialties", "Specialties", "Editorial, beauty, commercial"],
          ].map(([key, label, placeholder]) => (
            <label key={key} className="block">
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#584e49]">{label}</span>
              <input
                value={settings[key as keyof Settings] as string}
                onChange={(e) => update(key as keyof Settings, e.target.value as never)}
                placeholder={placeholder}
                className="mt-2 w-full rounded-[1rem] border border-[#171412]/10 bg-white px-4 py-3 text-[#171412] outline-none transition focus:border-[#171412]/30"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[#171412]/10 bg-[#fffdfb]/85 p-6 shadow-[0_20px_40px_rgba(17,14,12,0.04)] md:p-8">
        <h2 className="font-display text-3xl text-[#171412]">Contact & Socials</h2>
        <p className="mt-2 text-sm text-[#584e49]">Use full URLs for social profiles.</p>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {[
            ["email", "Email", "you@example.com"],
            ["phone", "Phone", "+1 555 000 0000"],
            ["instagram", "Instagram URL", "https://instagram.com/..."],
            ["tiktok", "TikTok URL", "https://tiktok.com/@..."],
            ["youtube", "YouTube URL", "https://youtube.com/..."],
          ].map(([key, label, placeholder]) => (
            <label key={key} className="block">
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#584e49]">{label}</span>
              <input
                type={key === "email" ? "email" : "url"}
                value={settings[key as keyof Settings] as string}
                onChange={(e) => update(key as keyof Settings, e.target.value as never)}
                placeholder={placeholder}
                className="mt-2 w-full rounded-[1rem] border border-[#171412]/10 bg-white px-4 py-3 text-[#171412] outline-none transition focus:border-[#171412]/30"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[#171412]/10 bg-[#fffdfb]/85 p-6 shadow-[0_20px_40px_rgba(17,14,12,0.04)] md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-3xl text-[#171412]">Booking Availability</h2>
            <p className="mt-2 text-sm text-[#584e49]">
              When disabled, new public booking requests are rejected.
            </p>
          </div>

          <button
            type="button"
            onClick={() => update("acceptingBookings", !settings.acceptingBookings)}
            className={`rounded-full px-5 py-3 text-sm font-medium transition ${
              settings.acceptingBookings ? "bg-[#171412] text-white" : "bg-[#efe7df] text-[#171412]"
            }`}
          >
            {settings.acceptingBookings ? "Accepting bookings" : "Bookings closed"}
          </button>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button
          disabled={saving}
          className="rounded-full bg-[#171412] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
        {message && <p className="text-sm text-[#584e49]">{message}</p>}
      </div>
    </form>
  );
}
