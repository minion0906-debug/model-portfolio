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
    "w-full border-b border-black/15 bg-transparent px-0 py-3 text-sm outline-none transition placeholder:text-black/35 focus:border-black";

  return (
    <form onSubmit={submit} className="space-y-7">
      <div className="grid gap-7 md:grid-cols-2">
        <label className="text-xs uppercase tracking-[0.18em]">
          Name *
          <input
            required
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            className={inputClass}
            placeholder="Your name"
          />
        </label>

        <label className="text-xs uppercase tracking-[0.18em]">
          Email *
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            className={inputClass}
            placeholder="you@example.com"
          />
        </label>

        <label className="text-xs uppercase tracking-[0.18em] md:col-span-2">
          Phone
          <input
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            className={inputClass}
            placeholder="+1 555 000 0000"
          />
        </label>
      </div>

      <label className="block text-xs uppercase tracking-[0.18em]">
        Message *
        <textarea
          required
          minLength={5}
          value={form.message}
          onChange={(event) => update("message", event.target.value)}
          className={`${inputClass} min-h-36 resize-y`}
          placeholder="Tell us what you have in mind."
        />
      </label>

      {status === "success" && (
        <div className="border border-black/10 bg-white px-4 py-3 text-sm">
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
        className="bg-black px-6 py-4 text-xs uppercase tracking-[0.2em] text-white transition hover:bg-black/80 disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
