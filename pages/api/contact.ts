import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";

type ContactResponse = {
  ok?: boolean;
  error?: string;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const rateLimitStore = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

const toEmail = process.env.CONTACT_TO_EMAIL || "vayiavs95@gmail.com";
const fromEmail =
  process.env.CONTACT_FROM_EMAIL || "Vayia Portfolio <onboarding@resend.dev>";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ContactResponse>,
) {
  if (req.method === "GET") {
    return res.redirect(307, "/");
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!resend) {
    return res.status(500).json({ error: "Missing RESEND_API_KEY" });
  }

  const {
    name = "",
    email = "",
    inquiryType = "",
    company = "",
    message = "",
    botField = "",
    submittedAt = 0,
  } = (req.body ?? {}) as Record<string, string>;

  if (String(botField).trim()) {
    return res.status(200).json({ ok: true });
  }

  const clientIp = getClientIp(req);
  if (!isAllowedRequest(clientIp)) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  const cleanName = String(name).trim();
  const cleanEmail = String(email).trim();
  const cleanInquiryType = String(inquiryType).trim();
  const cleanCompany = String(company).trim();
  const cleanMessage = String(message).trim();
  const submittedAtValue = Number(submittedAt);

  if (!cleanName || !cleanEmail || !cleanMessage) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (
    Number.isNaN(submittedAtValue) ||
    submittedAtValue <= 0 ||
    Date.now() - submittedAtValue < 2500
  ) {
    return res.status(400).json({ error: "Form submission rejected" });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(cleanEmail)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  if (
    cleanName.length > 80 ||
    cleanEmail.length > 160 ||
    cleanInquiryType.length > 120 ||
    cleanCompany.length > 160 ||
    cleanMessage.length > 4000
  ) {
    return res.status(400).json({ error: "Input too long" });
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
        <p><strong>Inquiry Type:</strong> ${escapeHtml(cleanInquiryType || "Not provided")}</p>
        <p><strong>Company / Team:</strong> ${escapeHtml(cleanCompany || "Not provided")}</p>
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

function getClientIp(req: NextApiRequest) {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string") {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }
  if (Array.isArray(forwardedFor)) {
    return forwardedFor[0]?.trim() || "unknown";
  }
  return req.socket.remoteAddress || "unknown";
}

function isAllowedRequest(clientIp: string) {
  const now = Date.now();
  const entry = rateLimitStore.get(clientIp);

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(clientIp, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  entry.count += 1;
  rateLimitStore.set(clientIp, entry);
  return true;
}
