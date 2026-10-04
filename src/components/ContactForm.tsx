"use client";

import { FormEvent, useState } from "react";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

export default function ContactForm() {
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
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to send your message.");
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
    "w-full rounded-2xl border border-[#171412]/10 bg-[#f8f4f0] px-4 py-3 text-sm text-[#171412] outline-none transition placeholder:text-[#171412]/35 focus:border-[#b1875d] focus:bg-white";

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="text-[0.68rem] uppercase tracking-[0.22em] text-[#4c413b]">
          Name *
          <input
            required
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            className={`${inputClass} mt-2`}
            placeholder="Your name"
          />
        </label>

        <label className="text-[0.68rem] uppercase tracking-[0.22em] text-[#4c413b]">
          Email *
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            className={`${inputClass} mt-2`}
            placeholder="you@example.com"
          />
        </label>

        <label className="text-[0.68rem] uppercase tracking-[0.22em] text-[#4c413b] md:col-span-2">
          Phone
          <input
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            className={`${inputClass} mt-2`}
            placeholder="+1 555 000 0000"
          />
        </label>
      </div>

      <label className="block text-[0.68rem] uppercase tracking-[0.22em] text-[#4c413b]">
        Message *
        <textarea
          required
          minLength={5}
          value={form.message}
          onChange={(event) => update("message", event.target.value)}
          className={`${inputClass} mt-2 min-h-36 resize-y`}
          placeholder="Tell us what you have in mind."
        />
      </label>

      {status === "success" && (
        <div className="border border-black/10 bg-white px-4 py-3 text-sm text-neutral-700">
          Thanks — your message has been received.
        </div>
      )}

      {status === "error" && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="btn-primary w-fit disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
