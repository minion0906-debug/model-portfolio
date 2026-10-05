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
      <section id="booking" className="px-5 py-24 text-[#171412]">
        <div className="container-page max-w-5xl rounded-[2.4rem] border border-[#171412]/10 bg-[radial-gradient(circle_at_top,_rgba(184,141,94,0.2),transparent_32%),#f9f5f0] p-7 shadow-[0_30px_80px_rgba(17,15,13,0.08)] md:p-10">
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#584e49]">Bookings</p>
          <h2 className="mt-4 font-display text-5xl text-[#171412] md:text-7xl">Currently unavailable.</h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-[#4c413b]">
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
    <section id="booking" className="px-5 py-24 text-[#171412] md:py-28">
      <div className="container-page grid gap-14 rounded-[2.4rem] border border-[#171412]/10 bg-[radial-gradient(circle_at_top,_rgba(184,141,94,0.14),transparent_35%),#f9f5f0] p-6 shadow-[0_30px_80px_rgba(17,15,13,0.08)] md:p-10 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="flex flex-col justify-between">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#584e49]">Bookings</p>
            <h2 className="mt-4 font-display text-5xl text-[#171412] md:text-7xl">Let&apos;s create.</h2>
            <p className="mt-6 max-w-md text-base leading-7 text-[#4c413b]">
              Tell me about your project, dates, location and creative direction.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {[
              ["Editorial", "Campaigns"],
              ["Commercial", "Brand work"],
              ["Fashion", "Editorial"],
            ].map(([title, subtitle]) => (
              <div key={title} className="rounded-[1.2rem] border border-[#171412]/10 bg-white/60 p-4 shadow-[0_12px_30px_rgba(17,15,13,0.03)]">
                <div className="text-[0.58rem] uppercase tracking-[0.24em] text-[#584e49]">{title}</div>
                <div className="mt-2 text-lg text-[#171412]">{subtitle}</div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="grid gap-4 rounded-[1.7rem] border border-[#171412]/10 bg-white/65 p-4 shadow-[0_24px_80px_rgba(17,15,13,0.06)] md:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-xs uppercase tracking-[0.2em] text-[#4c413b]">
              <span className="mb-2 block">Name</span>
              <input name="name" required placeholder="Name" className="w-full rounded-2xl border border-[#171412]/10 bg-[#f8f4f0] px-4 py-3 text-sm text-[#171412] placeholder:text-[#171412]/35 outline-none transition focus:border-[#b1875d] focus:bg-white" />
            </label>
            <label className="block text-xs uppercase tracking-[0.2em] text-[#4c413b]">
              <span className="mb-2 block">Email</span>
              <input name="email" required type="email" placeholder="Email" className="w-full rounded-2xl border border-[#171412]/10 bg-[#f8f4f0] px-4 py-3 text-sm text-[#171412] placeholder:text-[#171412]/35 outline-none transition focus:border-[#b1875d] focus:bg-white" />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-xs uppercase tracking-[0.2em] text-[#4c413b]">
              <span className="mb-2 block">Phone</span>
              <input name="phone" placeholder="Phone" className="w-full rounded-2xl border border-[#171412]/10 bg-[#f8f4f0] px-4 py-3 text-sm text-[#171412] placeholder:text-[#171412]/35 outline-none transition focus:border-[#b1875d] focus:bg-white" />
            </label>
            <label className="block text-xs uppercase tracking-[0.2em] text-[#4c413b]">
              <span className="mb-2 block">Company</span>
              <input name="company" placeholder="Company / Brand" className="w-full rounded-2xl border border-[#171412]/10 bg-[#f8f4f0] px-4 py-3 text-sm text-[#171412] placeholder:text-[#171412]/35 outline-none transition focus:border-[#b1875d] focus:bg-white" />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-xs uppercase tracking-[0.2em] text-[#4c413b]">
              <span className="mb-2 block">Booking type</span>
              <input name="bookingType" placeholder="Booking type" className="w-full rounded-2xl border border-[#171412]/10 bg-[#f8f4f0] px-4 py-3 text-sm text-[#171412] placeholder:text-[#171412]/35 outline-none transition focus:border-[#b1875d] focus:bg-white" />
            </label>
            <label className="block text-xs uppercase tracking-[0.2em] text-[#4c413b]">
              <span className="mb-2 block">Preferred date</span>
              <input name="preferredDate" type="date" className="w-full rounded-2xl border border-[#171412]/10 bg-[#f8f4f0] px-4 py-3 text-sm text-[#171412] placeholder:text-[#171412]/35 outline-none transition focus:border-[#b1875d] focus:bg-white" />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-xs uppercase tracking-[0.2em] text-[#4c413b]">
              <span className="mb-2 block">Location</span>
              <input name="location" placeholder="Location" className="w-full rounded-2xl border border-[#171412]/10 bg-[#f8f4f0] px-4 py-3 text-sm text-[#171412] placeholder:text-[#171412]/35 outline-none transition focus:border-[#b1875d] focus:bg-white" />
            </label>
            <label className="block text-xs uppercase tracking-[0.2em] text-[#4c413b]">
              <span className="mb-2 block">Budget</span>
              <input name="budget" placeholder="Budget" className="w-full rounded-2xl border border-[#171412]/10 bg-[#f8f4f0] px-4 py-3 text-sm text-[#171412] placeholder:text-[#171412]/35 outline-none transition focus:border-[#b1875d] focus:bg-white" />
            </label>
          </div>
          <label className="block text-xs uppercase tracking-[0.2em] text-[#4c413b]">
            <span className="mb-2 block">Usage rights</span>
            <input name="usageRights" placeholder="Usage rights / campaign scope" className="w-full rounded-2xl border border-[#171412]/10 bg-[#f8f4f0] px-4 py-3 text-sm text-[#171412] placeholder:text-[#171412]/35 outline-none transition focus:border-[#b1875d] focus:bg-white" />
          </label>
          <label className="block text-xs uppercase tracking-[0.2em] text-[#4c413b]">
            <span className="mb-2 block">Project details</span>
            <textarea name="message" required rows={6} placeholder="Project details" className="w-full rounded-2xl border border-[#171412]/10 bg-[#f8f4f0] px-4 py-3 text-sm text-[#171412] placeholder:text-[#171412]/35 outline-none transition focus:border-[#b1875d] focus:bg-white" />
          </label>
          <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <button className="btn-primary w-fit bg-[#171412] text-[#f7f3ee] hover:bg-[#2d2925]">Send booking request</button>
            {status && <p className="text-sm text-[#4c413b]">{status}</p>}
          </div>
        </form>
      </div>
    </section>
  );
}
