import { NextResponse } from "next/server";
import { z } from "zod";
import { INQUIRY_SOURCES } from "@/models/constants";

const schema = z.object({
  name: z.string().min(1).max(120),
  company: z.string().min(1).max(160),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  subject: z.string().max(200).optional(),
  message: z.string().min(10).max(4000),
  source: z.enum(INQUIRY_SOURCES),
  // honeypot — must be empty
  website: z.string().max(0).optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  // TODO Week 5: persist to Mongo + sendInquiryEmail(parsed.data) via Resend
  return NextResponse.json({ ok: true });
}
