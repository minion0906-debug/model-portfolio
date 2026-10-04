import Image from "next/image";
import type { PublicSiteSettings } from "@/lib/site-settings";

type Props = {
  settings: PublicSiteSettings;
};

export default function About({ settings }: Props) {
  return (
    <section id="about" className="section-pad">
      <div className="container-page grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-center">
        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-200">
          {settings.profileImage ? (
            <Image src={settings.profileImage} alt={settings.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 40vw" />
          ) : (
            <div className="flex h-full items-end p-8 text-neutral-400">
              <span className="font-display text-4xl">Profile</span>
            </div>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">About</p>
          <h2 className="mt-4 font-display text-5xl md:text-7xl">{settings.name}</h2>
          <p className="mt-8 max-w-2xl whitespace-pre-line text-base leading-8 text-neutral-600">
            {settings.bio || "Model, creative and editorial talent available for selected projects."}
          </p>
        </div>
      </div>
    </section>
  );
}
