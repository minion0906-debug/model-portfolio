"use client";

import { useMemo, useState } from "react";

type Message = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  read: boolean;
  createdAt: Date | string;
};

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function MessageManager({
  initialMessages,
}: {
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialMessages[0]?.id ?? null,
  );
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => {
    if (filter === "UNREAD") return messages.filter((message) => !message.read);
    if (filter === "READ") return messages.filter((message) => message.read);
    return messages;
  }, [messages, filter]);

  const selected =
    messages.find((message) => message.id === selectedId) ?? filtered[0] ?? null;

  async function setRead(message: Message, read: boolean) {
    const response = await fetch(`/api/admin/messages/${message.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read }),
    });

    if (!response.ok) {
      setNotice("Unable to update message.");
      return;
    }

    setMessages((current) =>
      current.map((item) =>
        item.id === message.id ? { ...item, read } : item,
      ),
    );
  }

  async function remove(message: Message) {
    if (!window.confirm("Delete this contact message permanently?")) return;

    const response = await fetch(`/api/admin/messages/${message.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setNotice("Unable to delete message.");
      return;
    }

    const next = messages.filter((item) => item.id !== message.id);
    setMessages(next);
    setSelectedId(next[0]?.id ?? null);
    setNotice("Message deleted.");
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
          CMS / Messages
        </p>
        <div className="mt-3 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-4xl">Contact messages</h1>
            <p className="mt-2 text-sm text-neutral-500">
              Review general inquiries and collaboration messages.
            </p>
          </div>
          <div className="text-sm text-neutral-500">
            {messages.filter((message) => !message.read).length} unread / {messages.length} total
          </div>
        </div>
      </div>

      {notice && (
        <div className="border border-black/10 bg-white px-4 py-3 text-sm">
          {notice}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {(["ALL", "UNREAD", "READ"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`border px-3 py-2 text-xs uppercase tracking-[0.12em] ${
              filter === item
                ? "border-black bg-black text-white"
                : "border-black/15"
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
              No messages in this filter.
            </div>
          ) : (
            filtered.map((message) => (
              <button
                key={message.id}
                type="button"
                onClick={() => setSelectedId(message.id)}
                className={`block w-full border bg-white p-4 text-left ${
                  selected?.id === message.id
                    ? "border-black"
                    : "border-black/10"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{message.name}</p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {message.email}
                    </p>
                  </div>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      message.read ? "bg-neutral-200" : "bg-black"
                    }`}
                    aria-label={message.read ? "Read" : "Unread"}
                  />
                </div>
                <p className="mt-3 line-clamp-2 text-xs leading-5 text-neutral-500">
                  {message.message}
                </p>
                <p className="mt-3 text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                  {formatDate(message.createdAt)}
                </p>
              </button>
            ))
          )}
        </div>

        {selected && (
          <article className="border border-black/10 bg-white p-5 md:p-7">
            <div className="flex flex-col justify-between gap-4 border-b border-black/10 pb-5 md:flex-row">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                  Message
                </p>
                <h2 className="mt-2 font-display text-3xl">{selected.name}</h2>
                <a
                  href={`mailto:${selected.email}`}
                  className="mt-2 block text-sm underline underline-offset-4"
                >
                  {selected.email}
                </a>
              </div>

              <button
                type="button"
                onClick={() => setRead(selected, !selected.read)}
                className="border border-black/15 px-4 py-2 text-xs uppercase tracking-[0.12em]"
              >
                {selected.read ? "Mark unread" : "Mark read"}
              </button>
            </div>

            <div className="grid gap-5 py-6 text-sm sm:grid-cols-2">
              <div>
                <span className="text-xs uppercase tracking-[0.15em] text-neutral-400">
                  Phone
                </span>
                <p className="mt-1">{selected.phone || "—"}</p>
              </div>
              <div>
                <span className="text-xs uppercase tracking-[0.15em] text-neutral-400">
                  Received
                </span>
                <p className="mt-1">{formatDate(selected.createdAt)}</p>
              </div>
            </div>

            <div className="border-t border-black/10 pt-6">
              <p className="text-xs uppercase tracking-[0.15em] text-neutral-400">
                Message
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-neutral-700">
                {selected.message}
              </p>
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              <a
                href={`mailto:${selected.email}`}
                className="bg-black px-4 py-2 text-xs uppercase tracking-[0.12em] text-white"
              >
                Reply by email
              </a>
              <button
                type="button"
                onClick={() => remove(selected)}
                className="border border-red-200 px-4 py-2 text-xs uppercase tracking-[0.12em] text-red-700"
              >
                Delete
              </button>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
