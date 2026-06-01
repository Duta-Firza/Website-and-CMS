import { Resend } from "resend";
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
  source: "trading" | "manufacturing" | "epc" | "contact";
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
