export async function sendMagicLink(email: string, link: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== "production") return { delivered: false, developmentLink: link };
    throw new Error("Email delivery is not configured. Set RESEND_API_KEY and RESEND_FROM.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Your secure purchase library link",
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto"><h2>Your purchase library</h2><p>Use the button below to securely access your purchases.</p><p><a href="${link}" style="display:inline-block;background:#111;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none">Open purchase library</a></p><p style="color:#777;font-size:12px">This link expires in 15 minutes and can only be used once.</p></div>`,
    }),
  });
  if (!response.ok) throw new Error(`Email delivery failed (${response.status}).`);
  return { delivered: true };
}
