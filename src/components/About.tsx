import Image from "next/image";
import type { PublicSiteSettings } from "@/lib/site-settings";

type Props = {
  settings: PublicSiteSettings;
};

export default function About({ settings }: Props) {
  return (
    <section id="about" className="section-pad relative bg-[#f7f3ee]">
      <div className="container-page grid gap-12 md:grid-cols-[0.88fr_1.12fr] md:items-center">
        <div className="panel-surface relative overflow-hidden rounded-[2.4rem] border-[#171412]/10 bg-[#fffdfb]/60 p-3 shadow-[0_30px_80px_rgba(17,15,13,0.06)]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.8rem] bg-neutral-200">
            {settings.profileImage ? (
              <div className="relative h-full w-full">
                <Image
                  src={settings.profileImage}
                  alt={settings.name}
                  width={900}
                  height={1125}
                  className="h-full w-full object-cover grayscale-[0.08] contrast-[1.05]"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              </div>
            ) : (
              <div className="flex h-full items-end bg-[radial-gradient(circle_at_top,_rgba(184,141,94,0.18),transparent_38%),linear-gradient(180deg,#ece2d7,#d5c8be)] p-8 text-neutral-500">
                <span className="font-display text-4xl">Profile</span>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-2xl">
          <p className="section-kicker">About</p>
          <h2 className="mt-4 font-display text-5xl leading-none tracking-[-0.05em] text-[#171412] md:text-7xl">{settings.name}</h2>
          <div className="mt-6 h-px w-20 bg-[#171412]/10" />

          <div className="mt-8 rounded-[1.8rem] border border-[#171412]/10 bg-[#fffdfb]/75 p-5 shadow-[0_26px_60px_rgba(17,15,13,0.04)] md:p-6">
            <p className="text-[0.62rem] uppercase tracking-[0.28em] text-neutral-500">Creative direction</p>
            <p className="mt-4 text-base leading-8 text-[#2c2724] md:text-lg">
              {settings.bio || "Model, creative and editorial talent available for selected projects."}
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["Editorial", "Global campaigns"],
              ["Fashion", "Luxury styling"],
              ["Commercial", "Brand storytelling"],
            ].map(([label, detail]) => (
              <div key={label} className="rounded-[1.4rem] border border-[#171412]/10 bg-[#fffdfb]/70 p-4 shadow-[0_14px_28px_rgba(17,15,13,0.02)]">
                <p className="text-[0.62rem] uppercase tracking-[0.24em] text-neutral-500">{label}</p>
                <p className="mt-3 text-sm text-[#2c2724]">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
