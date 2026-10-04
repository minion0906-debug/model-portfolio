"use client";

import { useMemo, useState } from "react";

type Booking = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  bookingType: string | null;
  preferredDate: Date | string | null;
  location: string | null;
  budget: string | null;
  message: string;
  status: string;
  createdAt: Date | string;
};

const statuses = ["NEW", "REVIEWING", "ACCEPTED", "DECLINED", "COMPLETED", "CANCELLED"];

function formatDate(value: Date | string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}

export default function BookingManager({ initialBookings }: { initialBookings: Booking[] }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [filter, setFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(initialBookings[0]?.id ?? "");
  const [message, setMessage] = useState("");

  const filtered = useMemo(
    () => filter === "ALL" ? bookings : bookings.filter((booking) => booking.status === filter),
    [bookings, filter],
  );

  const selected = bookings.find((booking) => booking.id === selectedId) ?? filtered[0];

  async function updateStatus(id: string, status: string) {
    const response = await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      setMessage("Unable to update booking.");
      return;
    }

    setBookings((current) =>
      current.map((booking) => booking.id === id ? { ...booking, status } : booking),
    );
    setMessage("Booking status updated.");
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this booking request permanently?")) return;

    const response = await fetch(`/api/admin/bookings/${id}`, { method: "DELETE" });

    if (!response.ok) {
      setMessage("Unable to delete booking.");
      return;
    }

    const next = bookings.filter((booking) => booking.id !== id);
    setBookings(next);
    setSelectedId(next[0]?.id ?? "");
    setMessage("Booking deleted.");
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">CMS / Bookings</p>
        <div className="mt-3 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-4xl">Booking requests</h1>
            <p className="mt-2 text-sm text-neutral-500">
              Review inquiries and move each request through the booking workflow.
            </p>
          </div>
          <span className="text-sm text-neutral-500">{bookings.length} total</span>
        </div>
      </div>

      {message && <div className="border border-black/10 bg-white px-4 py-3 text-sm">{message}</div>}

      <div className="flex flex-wrap gap-2">
        {["ALL", ...statuses].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`border px-3 py-2 text-xs uppercase tracking-[0.12em] ${
              filter === item ? "border-black bg-black text-white" : "border-black/15"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.5fr]">
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="border border-dashed border-black/20 bg-white p-8 text-sm text-neutral-500">
              No booking requests in this filter.
            </div>
          ) : filtered.map((booking) => (
            <button
              key={booking.id}
              type="button"
              onClick={() => setSelectedId(booking.id)}
              className={`block w-full border bg-white p-4 text-left ${
                selected?.id === booking.id ? "border-black" : "border-black/10"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{booking.name}</p>
                  <p className="mt-1 text-xs text-neutral-500">{booking.email}</p>
                </div>
                <span className="text-[10px] uppercase tracking-[0.12em] text-neutral-500">
                  {booking.status}
                </span>
              </div>
              <p className="mt-3 text-xs text-neutral-400">{formatDate(booking.createdAt)}</p>
            </button>
          ))}
        </div>

        {selected ? (
          <article className="border border-black/10 bg-white p-5 md:p-7">
            <div className="flex flex-col justify-between gap-4 border-b border-black/10 pb-5 md:flex-row">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Request</p>
                <h2 className="mt-2 font-display text-3xl">{selected.name}</h2>
              </div>
              <select
                value={selected.status}
                onChange={(e) => updateStatus(selected.id, e.target.value)}
                className="border border-black/15 px-3 py-2 text-xs uppercase tracking-[0.12em]"
              >
                {statuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </div>

            <div className="grid gap-5 py-6 text-sm sm:grid-cols-2">
              <div><span className="text-xs uppercase tracking-[0.15em] text-neutral-400">Email</span><p className="mt-1">{selected.email}</p></div>
              <div><span className="text-xs uppercase tracking-[0.15em] text-neutral-400">Phone</span><p className="mt-1">{selected.phone || "—"}</p></div>
              <div><span className="text-xs uppercase tracking-[0.15em] text-neutral-400">Company</span><p className="mt-1">{selected.company || "—"}</p></div>
              <div><span className="text-xs uppercase tracking-[0.15em] text-neutral-400">Booking Type</span><p className="mt-1">{selected.bookingType || "—"}</p></div>
              <div><span className="text-xs uppercase tracking-[0.15em] text-neutral-400">Preferred Date</span><p className="mt-1">{formatDate(selected.preferredDate)}</p></div>
              <div><span className="text-xs uppercase tracking-[0.15em] text-neutral-400">Location</span><p className="mt-1">{selected.location || "—"}</p></div>
              <div><span className="text-xs uppercase tracking-[0.15em] text-neutral-400">Budget</span><p className="mt-1">{selected.budget || "—"}</p></div>
              <div><span className="text-xs uppercase tracking-[0.15em] text-neutral-400">Received</span><p className="mt-1">{formatDate(selected.createdAt)}</p></div>
            </div>

            <div className="border-t border-black/10 pt-6">
              <p className="text-xs uppercase tracking-[0.15em] text-neutral-400">Project Details</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-neutral-700">{selected.message}</p>
            </div>

            <button
              type="button"
              onClick={() => remove(selected.id)}
              className="mt-7 border border-red-200 px-4 py-2 text-xs uppercase tracking-[0.12em] text-red-700"
            >
              Delete request
            </button>
          </article>
        ) : null}
      </div>
    </div>
  );
}
