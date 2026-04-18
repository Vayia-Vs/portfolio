import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";

type ContactResponse = {
  ok?: boolean;
  error?: string;
};

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const toEmail = process.env.CONTACT_TO_EMAIL || "vayiavs95@gmail.com";
const fromEmail =
  process.env.CONTACT_FROM_EMAIL || "Vayia Portfolio <onboarding@resend.dev>";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ContactResponse>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!resend) {
    return res.status(500).json({ error: "Missing RESEND_API_KEY" });
  }

  const {
    name = "",
    email = "",
    message = "",
    botField = "",
  } = (req.body ?? {}) as Record<string, string>;

  if (String(botField).trim()) {
    return res.status(200).json({ ok: true });
  }

  const cleanName = String(name).trim();
  const cleanEmail = String(email).trim();
  const cleanMessage = String(message).trim();

  if (!cleanName || !cleanEmail || !cleanMessage) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(cleanEmail)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: cleanEmail,
      subject: `Portfolio contact from ${cleanName}`,
      html: `
        <h2>New portfolio contact</h2>
        <p><strong>Name:</strong> ${escapeHtml(cleanName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(cleanEmail)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(cleanMessage).replace(/\n/g, "<br />")}</p>
      `,
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Failed to send email" });
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
