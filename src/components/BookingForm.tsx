"use client";

import { FormEvent, useState } from "react";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  bookingType: "",
  preferredDate: "",
  location: "",
  budget: "",
  message: "",
};

export default function BookingForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");

  function update(key: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to submit your request.");
        setStatus("error");
        return;
      }

      setForm(initialForm);
      setStatus("success");
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  const inputClass =
    "w-full border-b border-white/25 bg-transparent px-0 py-3 text-sm outline-none transition placeholder:text-white/45 focus:border-white";

  return (
    <form onSubmit={submit} className="space-y-7">
      <div className="grid gap-7 md:grid-cols-2">
        <label className="text-xs uppercase tracking-[0.18em]">
          Name *
          <input required value={form.name} onChange={(e) => update("name", e.target.value)}
            className={inputClass} placeholder="Your name" />
        </label>

        <label className="text-xs uppercase tracking-[0.18em]">
          Email *
          <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
            className={inputClass} placeholder="you@example.com" />
        </label>

        <label className="text-xs uppercase tracking-[0.18em]">
          Phone
          <input value={form.phone} onChange={(e) => update("phone", e.target.value)}
            className={inputClass} placeholder="+1 555 000 0000" />
        </label>

        <label className="text-xs uppercase tracking-[0.18em]">
          Company / Brand
          <input value={form.company} onChange={(e) => update("company", e.target.value)}
            className={inputClass} placeholder="Company or agency" />
        </label>

        <label className="text-xs uppercase tracking-[0.18em]">
          Booking Type
          <select value={form.bookingType} onChange={(e) => update("bookingType", e.target.value)}
            className={`${inputClass} bg-transparent`}>
            <option value="" className="text-black">Select type</option>
            <option value="Editorial" className="text-black">Editorial</option>
            <option value="Campaign" className="text-black">Campaign</option>
            <option value="Commercial" className="text-black">Commercial</option>
            <option value="Beauty" className="text-black">Beauty</option>
            <option value="Lifestyle" className="text-black">Lifestyle</option>
            <option value="Event" className="text-black">Event</option>
            <option value="Other" className="text-black">Other</option>
          </select>
        </label>

        <label className="text-xs uppercase tracking-[0.18em]">
          Preferred Date
          <input type="date" value={form.preferredDate} onChange={(e) => update("preferredDate", e.target.value)}
            className={inputClass} />
        </label>

        <label className="text-xs uppercase tracking-[0.18em]">
          Location
          <input value={form.location} onChange={(e) => update("location", e.target.value)}
            className={inputClass} placeholder="City / production location" />
        </label>

        <label className="text-xs uppercase tracking-[0.18em]">
          Budget
          <input value={form.budget} onChange={(e) => update("budget", e.target.value)}
            className={inputClass} placeholder="e.g. $2,000–$5,000" />
        </label>
      </div>

      <label className="block text-xs uppercase tracking-[0.18em]">
        Project Details *
        <textarea required minLength={10} value={form.message}
          onChange={(e) => update("message", e.target.value)}
          className={`${inputClass} min-h-32 resize-y`}
          placeholder="Tell us about the project, usage, dates, deliverables and anything else we should know."
        />
      </label>

      {status === "success" && (
        <div className="border border-white/25 px-4 py-3 text-sm">
          Thanks — your booking request has been received. We’ll be in touch.
        </div>
      )}

      {status === "error" && (
        <div className="border border-red-300/40 px-4 py-3 text-sm text-red-100">{error}</div>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="bg-white px-6 py-4 text-xs uppercase tracking-[0.2em] text-black transition hover:bg-white/85 disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Send Booking Request"}
      </button>
    </form>
  );
}
