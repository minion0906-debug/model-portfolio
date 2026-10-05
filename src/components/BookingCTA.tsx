"use client";

import { useState } from "react";

type Props = {
  acceptingBookings?: boolean;
  contactEmail?: string | null;
};

export default function BookingCTA({ acceptingBookings = true, contactEmail }: Props) {
  const [status, setStatus] = useState("");

  if (!acceptingBookings) {
    return (
      <section id="booking" className="bg-[#111110] px-5 py-24 text-white">
        <div className="container-page max-w-5xl rounded-[2.4rem] border border-[#f7f3ee]/10 bg-[radial-gradient(circle_at_top,_rgba(184,141,94,0.2),transparent_32%),#141311] p-7 shadow-[0_30px_80px_rgba(17,15,13,0.18)] md:p-10">
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/55">Bookings</p>
          <h2 className="mt-4 font-display text-5xl text-[#f7f3ee] md:text-7xl">Currently unavailable.</h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/65">
            New booking requests are temporarily closed. Please check back later
            {contactEmail ? ` or contact ${contactEmail} for general inquiries.` : "."}
          </p>
        </div>
      </section>
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Sending…");

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    setStatus(response.ok ? "Request received. Thank you." : result.error || "Something went wrong.");

    if (response.ok) form.reset();
  }

  return (
    <section id="booking" className="bg-[#0f0d0c] px-5 py-24 text-white md:py-28">
      <div className="container-page grid gap-14 rounded-[2.4rem] border border-[#f7f3ee]/10 bg-[radial-gradient(circle_at_top,_rgba(184,141,94,0.18),transparent_35%),#111111] p-6 shadow-[0_30px_80px_rgba(17,15,13,0.15)] md:p-10 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="flex flex-col justify-between">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/55">Bookings</p>
            <h2 className="mt-4 font-display text-5xl text-[#f7f3ee] md:text-7xl">Let&apos;s create.</h2>
            <p className="mt-6 max-w-md text-base leading-7 text-white/65">
              Tell me about your project, dates, location and creative direction.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {[
              ["Editorial", "Campaigns"],
              ["Commercial", "Brand work"],
              ["Fashion", "Editorial"],
            ].map(([title, subtitle]) => (
              <div key={title} className="rounded-[1.2rem] border border-white/10 bg-white/4 p-4 backdrop-blur-sm">
                <div className="text-[0.58rem] uppercase tracking-[0.24em] text-white/50">{title}</div>
                <div className="mt-2 text-lg text-[#f7f3ee]">{subtitle}</div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="grid gap-4 rounded-[1.7rem] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.18)] md:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-xs uppercase tracking-[0.2em] text-white/55">
              <span className="mb-2 block">Name</span>
              <input name="name" required placeholder="Name" className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[#d9b77d]" />
            </label>
            <label className="block text-xs uppercase tracking-[0.2em] text-white/55">
              <span className="mb-2 block">Email</span>
              <input name="email" required type="email" placeholder="Email" className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[#d9b77d]" />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-xs uppercase tracking-[0.2em] text-white/55">
              <span className="mb-2 block">Phone</span>
              <input name="phone" placeholder="Phone" className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[#d9b77d]" />
            </label>
            <label className="block text-xs uppercase tracking-[0.2em] text-white/55">
              <span className="mb-2 block">Company</span>
              <input name="company" placeholder="Company / Brand" className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[#d9b77d]" />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-xs uppercase tracking-[0.2em] text-white/55">
              <span className="mb-2 block">Booking type</span>
              <input name="bookingType" placeholder="Booking type" className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[#d9b77d]" />
            </label>
            <label className="block text-xs uppercase tracking-[0.2em] text-white/55">
              <span className="mb-2 block">Preferred date</span>
              <input name="preferredDate" type="date" className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[#d9b77d]" />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-xs uppercase tracking-[0.2em] text-white/55">
              <span className="mb-2 block">Location</span>
              <input name="location" placeholder="Location" className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[#d9b77d]" />
            </label>
            <label className="block text-xs uppercase tracking-[0.2em] text-white/55">
              <span className="mb-2 block">Budget</span>
              <input name="budget" placeholder="Budget" className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[#d9b77d]" />
            </label>
          </div>
          <label className="block text-xs uppercase tracking-[0.2em] text-white/55">
            <span className="mb-2 block">Usage rights</span>
            <input name="usageRights" placeholder="Usage rights / campaign scope" className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[#d9b77d]" />
          </label>
          <label className="block text-xs uppercase tracking-[0.2em] text-white/55">
            <span className="mb-2 block">Project details</span>
            <textarea name="message" required rows={6} placeholder="Project details" className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[#d9b77d]" />
          </label>
          <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <button className="btn-primary w-fit bg-white text-black hover:bg-[#f1efe9]">Send booking request</button>
            {status && <p className="text-sm text-white/60">{status}</p>}
          </div>
        </form>
      </div>
    </section>
  );
}
