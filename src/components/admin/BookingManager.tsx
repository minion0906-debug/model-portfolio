"use client";

import { useEffect, useMemo, useState } from "react";

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
  internalNotes: string | null;
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
  const [internalNotes, setInternalNotes] = useState(initialBookings[0]?.internalNotes ?? "");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = useMemo(
    () => filter === "ALL" ? bookings : bookings.filter((booking) => booking.status === filter),
    [bookings, filter],
  );

  useEffect(() => {
    setPage((current) => Math.min(current, Math.max(1, Math.ceil(filtered.length / pageSize))));
  }, [filtered.length]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pagedBookings = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const selected = bookings.find((booking) => booking.id === selectedId) ?? filtered[0];
  useEffect(() => {
    setInternalNotes(selected?.internalNotes ?? "");
  }, [selected?.id, selected?.internalNotes]);

  const calendarItems = useMemo(() => filtered
    .filter((booking) => booking.preferredDate)
    .sort((a, b) => new Date(a.preferredDate!).getTime() - new Date(b.preferredDate!).getTime()), [filtered]);

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

  async function saveNotes(id: string) {
    const response = await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ internalNotes }),
    });
    if (!response.ok) {
      setMessage("Unable to save internal notes.");
      return;
    }
    setBookings((current) => current.map((booking) => booking.id === id ? { ...booking, internalNotes } : booking));
    setMessage("Internal notes saved.");
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
    setPage((current) => Math.min(current, Math.max(1, Math.ceil(next.length / pageSize))));
    setMessage("Booking deleted.");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-[#171412]/10 bg-[#141210] p-6 text-white shadow-[0_30px_80px_rgba(17,16,15,0.28)] md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.34em] text-[#d7b98c]">Client enquiries</p>
            <h1 className="mt-2 font-display text-4xl md:text-5xl">Booking requests</h1>
          </div>
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[9px] uppercase tracking-[0.18em] text-white/80">
            {bookings.length} total
          </span>
        </div>
      </div>

      {message && (
        <div className="rounded-2xl border border-[#171412]/10 bg-[#fffdfb]/85 px-4 py-3 text-sm text-[#171412] shadow-[0_20px_40px_rgba(17,14,12,0.04)]">
          {message}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
        {["ALL", ...statuses].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => { setFilter(item); setPage(1); }}
            className={`rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.18em] transition ${
              filter === item ? "border-[#171412] bg-[#171412] text-white" : "border-[#171412]/10 bg-[#fffdfb]/70 text-[#171412] hover:bg-white"
            }`}
          >
            {item}
          </button>
        ))}
        </div>
        <div className="flex gap-2 rounded-full border border-[#171412]/10 bg-white p-1">
          <button type="button" onClick={() => setView("list")} className={`rounded-full px-3 py-2 text-[10px] uppercase tracking-[0.15em] ${view === "list" ? "bg-[#171412] text-white" : "text-[#584e49]"}`}>List</button>
          <button type="button" onClick={() => setView("calendar")} className={`rounded-full px-3 py-2 text-[10px] uppercase tracking-[0.15em] ${view === "calendar" ? "bg-[#171412] text-white" : "text-[#584e49]"}`}>Calendar</button>
        </div>
      </div>

      {view === "calendar" && (
        <section className="rounded-[1.5rem] border border-[#171412]/10 bg-[#fffdfb]/90 p-5 shadow-[0_20px_40px_rgba(17,14,12,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-2xl text-[#171412]">Scheduled requests</h2>
            <p className="text-xs text-[#7a6e67]">Sorted by preferred date</p>
          </div>
          {calendarItems.length === 0 ? <p className="mt-4 text-sm text-[#584e49]">No requests have a preferred date yet.</p> : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {calendarItems.map((booking) => (
                <button key={booking.id} type="button" onClick={() => { setSelectedId(booking.id); setView("list"); }} className="rounded-2xl border border-[#171412]/10 bg-white p-4 text-left transition hover:border-[#171412]/40">
                  <p className="text-xs font-semibold text-[#8b6d4e]">{formatDate(booking.preferredDate)}</p>
                  <p className="mt-2 font-medium text-[#171412]">{booking.name}</p>
                  <p className="mt-1 text-xs text-[#584e49]">{booking.bookingType || "Booking request"} · {booking.status}</p>
                  <p className="mt-2 text-xs text-[#7a6e67]">{booking.location || "Location not specified"}</p>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {view === "list" && <div className="grid gap-5 lg:grid-cols-[0.9fr_1.5fr]">
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-[#171412]/20 bg-[#fffdfb]/80 p-8 text-sm text-[#584e49] shadow-[0_20px_40px_rgba(17,14,12,0.04)]">
              No booking requests in this filter.
            </div>
          ) : pagedBookings.map((booking) => (
            <button
              key={booking.id}
              type="button"
              onClick={() => setSelectedId(booking.id)}
              className={`block w-full rounded-[1.5rem] border bg-[#fffdfb]/85 p-4 text-left shadow-[0_18px_40px_rgba(17,14,12,0.04)] transition ${
                selected?.id === booking.id ? "border-[#171412]" : "border-[#171412]/10 hover:border-[#171412]/25"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-[#171412]">{booking.name}</p>
                  <p className="mt-1 text-xs text-[#584e49]">{booking.email}</p>
                </div>
                <span className="rounded-full bg-[#f5efe9] px-2 py-1 text-[9px] uppercase tracking-[0.18em] text-[#171412]">
                  {booking.status}
                </span>
              </div>
              <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-[#7a6e67]">{formatDate(booking.createdAt)}</p>
            </button>
          ))}

          {filtered.length > pageSize && (
            <div className="flex items-center justify-between rounded-[1rem] border border-[#171412]/10 bg-white px-4 py-3">
              <p className="text-xs text-[#584e49]">Page {currentPage} of {pageCount}</p>
              <div className="flex gap-2">
                <button type="button" disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-full border border-[#171412]/10 px-3 py-2 text-xs disabled:opacity-40">Previous</button>
                <button type="button" disabled={currentPage === pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))} className="rounded-full border border-[#171412]/10 px-3 py-2 text-xs disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>

        {selected ? (
          <article className="rounded-[1.75rem] border border-[#171412]/10 bg-[#fffdfb]/90 p-5 shadow-[0_20px_40px_rgba(17,14,12,0.04)] md:p-7">
            <div className="flex flex-col justify-between gap-4 border-b border-[#171412]/10 pb-5 md:flex-row md:items-center">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#584e49]">Request</p>
                <h2 className="mt-2 font-display text-3xl text-[#171412]">{selected.name}</h2>
              </div>
              <select
                value={selected.status}
                onChange={(e) => updateStatus(selected.id, e.target.value)}
                className="rounded-full border border-[#171412]/10 bg-white px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-[#171412] outline-none"
              >
                {statuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </div>

            <div className="grid gap-5 py-6 text-sm sm:grid-cols-2">
              <div><span className="text-[10px] uppercase tracking-[0.18em] text-[#7a6e67]">Email</span><p className="mt-1 text-[#171412]">{selected.email}</p></div>
              <div><span className="text-[10px] uppercase tracking-[0.18em] text-[#7a6e67]">Phone</span><p className="mt-1 text-[#171412]">{selected.phone || "—"}</p></div>
              <div><span className="text-[10px] uppercase tracking-[0.18em] text-[#7a6e67]">Company</span><p className="mt-1 text-[#171412]">{selected.company || "—"}</p></div>
              <div><span className="text-[10px] uppercase tracking-[0.18em] text-[#7a6e67]">Booking Type</span><p className="mt-1 text-[#171412]">{selected.bookingType || "—"}</p></div>
              <div><span className="text-[10px] uppercase tracking-[0.18em] text-[#7a6e67]">Preferred Date</span><p className="mt-1 text-[#171412]">{formatDate(selected.preferredDate)}</p></div>
              <div><span className="text-[10px] uppercase tracking-[0.18em] text-[#7a6e67]">Location</span><p className="mt-1 text-[#171412]">{selected.location || "—"}</p></div>
              <div><span className="text-[10px] uppercase tracking-[0.18em] text-[#7a6e67]">Budget</span><p className="mt-1 text-[#171412]">{selected.budget || "—"}</p></div>
              <div><span className="text-[10px] uppercase tracking-[0.18em] text-[#7a6e67]">Received</span><p className="mt-1 text-[#171412]">{formatDate(selected.createdAt)}</p></div>
            </div>

            <div className="border-t border-[#171412]/10 pt-6">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#7a6e67]">Project Details</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#584e49]">{selected.message}</p>
            </div>

            <div className="mt-6 border-t border-[#171412]/10 pt-6">
              <label htmlFor="booking-internal-notes" className="text-[10px] uppercase tracking-[0.18em] text-[#7a6e67]">Internal notes (admin only)</label>
              <textarea
                id="booking-internal-notes"
                value={internalNotes}
                onChange={(event) => setInternalNotes(event.target.value)}
                maxLength={10000}
                rows={4}
                placeholder="Add follow-up reminders, call notes, or next steps…"
                className="mt-3 w-full rounded-2xl border border-[#171412]/10 bg-white p-4 text-sm leading-6 text-[#171412] outline-none focus:border-[#8b6d4e]"
              />
              <button type="button" onClick={() => saveNotes(selected.id)} className="mt-3 rounded-full bg-[#171412] px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-white transition hover:bg-[#3a302a]">Save internal notes</button>
            </div>

            <button
              type="button"
              onClick={() => remove(selected.id)}
              className="mt-7 rounded-full border border-[#c96d5b]/30 bg-[#fef4f2] px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-[#8d3f35] transition hover:bg-[#fce9e5]"
            >
              Delete request
            </button>
          </article>
        ) : null}
      </div>}
    </div>
  );
}
