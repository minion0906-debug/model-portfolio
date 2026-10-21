type NotificationField = { label: string; value: string | null | undefined };

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char] as string);
}

function renderEmail(title: string, intro: string, fields: NotificationField[], message: string) {
  const rows = fields
    .filter((field) => field.value)
    .map((field) => `<tr><td style="padding:8px 12px;color:#666;vertical-align:top">${escapeHtml(field.label)}</td><td style="padding:8px 12px;white-space:pre-wrap">${escapeHtml(field.value || "")}</td></tr>`)
    .join("");
  return `<div style="font-family:Arial,sans-serif;color:#191715;max-width:640px;margin:auto;line-height:1.6"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(intro)}</p><table style="border-collapse:collapse;width:100%;background:#faf9f7">${rows}</table><h3>Message</h3><p style="white-space:pre-wrap;background:#faf9f7;padding:16px">${escapeHtml(message)}</p><p style="font-size:12px;color:#777">Automated notification from your model portfolio website.</p></div>`;
}

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[email-notification:development] Would send "${subject}" to ${to}`);
      return false;
    }
    throw new Error("Email notifications are not configured. Set RESEND_API_KEY and RESEND_FROM.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, html }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Resend rejected notification (${response.status}).`);
  return true;
}

async function sendBestEffort(to: string | null | undefined, subject: string, html: string) {
  if (!to) return;
  try {
    await sendEmail(to, subject, html);
  } catch (error) {
    // The form submission is already persisted; email outages must not lose the request.
    console.error("Email notification failed:", error instanceof Error ? error.message : "Unknown error");
  }
}

export async function notifyNewBooking(input: {
  name: string; email: string; phone?: string | null; company?: string | null;
  bookingType?: string | null; preferredDate?: Date | null; location?: string | null;
  budget?: string | null; usageRights?: string | null; message: string;
  notifyEmail?: string | null; siteName?: string;
}) {
  const fields: NotificationField[] = [
    { label: "Name", value: input.name }, { label: "Email", value: input.email },
    { label: "Phone", value: input.phone }, { label: "Company", value: input.company },
    { label: "Project type", value: input.bookingType },
    { label: "Preferred date", value: input.preferredDate?.toISOString().slice(0, 10) },
    { label: "Location", value: input.location }, { label: "Budget", value: input.budget },
    { label: "Usage rights", value: input.usageRights },
  ];
  await Promise.all([
    sendBestEffort(input.notifyEmail, `New booking request — ${input.name}`, renderEmail("New booking request", `A new booking request was submitted on ${input.siteName || "your portfolio website"}.`, fields, input.message)),
    sendBestEffort(input.email, `We received your booking request — ${input.siteName || "Model Portfolio"}`, renderEmail("Thank you for your inquiry", `Hi ${input.name}, we received your booking request and will review the details. This is a receipt confirmation, not a booking confirmation.`, fields.filter((field) => field.label !== "Budget" && field.label !== "Usage rights"), input.message)),
  ]);
}

export async function notifyNewContact(input: {
  name: string; email: string; phone?: string | null; message: string;
  notifyEmail?: string | null; siteName?: string;
}) {
  const fields: NotificationField[] = [
    { label: "Name", value: input.name }, { label: "Email", value: input.email },
    { label: "Phone", value: input.phone },
  ];
  await Promise.all([
    sendBestEffort(input.notifyEmail, `New contact message — ${input.name}`, renderEmail("New contact message", `A visitor contacted ${input.siteName || "your portfolio website"}.`, fields, input.message)),
    sendBestEffort(input.email, `We received your message — ${input.siteName || "Model Portfolio"}`, renderEmail("Thank you for reaching out", `Hi ${input.name}, your message has been received. We will get back to you as soon as possible.`, fields, input.message)),
  ]);
}
