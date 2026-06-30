import { Resend } from "resend";
import type { InquirySource } from "@/models/constants";
import { env } from "./env";

let _client: Resend | null = null;

function client(): Resend {
  if (!_client) _client = new Resend(env.RESEND_API_KEY);
  return _client;
}

interface InquiryPayload {
  name: string;
  company: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  source: InquirySource;
}

export async function sendInquiryEmail(payload: InquiryPayload) {
  const to = payload.source === "contact" ? env.CONTACT_TO_EMAIL : env.INQUIRY_TO_EMAIL;
  const subject =
    payload.subject ?? `[${payload.source.toUpperCase()}] Inquiry from ${payload.company}`;

  return client().emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    replyTo: payload.email,
    subject,
    text: [
      `Name: ${payload.name}`,
      `Company: ${payload.company}`,
      `Email: ${payload.email}`,
      payload.phone ? `Phone: ${payload.phone}` : null,
      "",
      "Message:",
      payload.message,
    ]
      .filter(Boolean)
      .join("\n"),
  });
}

interface ApplicationPayload {
  name: string;
  email: string;
  phone?: string;
  jobTitle: string;
  cvUrl: string;
  cvFileName?: string;
}

export async function sendApplicationEmail(payload: ApplicationPayload) {
  // Dedicated recipient if configured, otherwise reuse the inquiry inbox.
  const to = env.APPLICATIONS_TO_EMAIL || env.INQUIRY_TO_EMAIL;

  return client().emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    replyTo: payload.email,
    subject: `[CAREER] Application: ${payload.jobTitle} — ${payload.name}`,
    text: [
      `Position: ${payload.jobTitle}`,
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      payload.phone ? `Phone: ${payload.phone}` : null,
      "",
      `CV${payload.cvFileName ? ` (${payload.cvFileName})` : ""}: ${payload.cvUrl}`,
    ]
      .filter(Boolean)
      .join("\n"),
  });
}
