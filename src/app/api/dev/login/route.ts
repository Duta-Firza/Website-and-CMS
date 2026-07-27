import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  DEV_COOKIE,
  getSessionMaxAgeSeconds,
  signDevToken,
  verifyDevPassword,
} from "@/lib/devtools/dev-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sets the shared /dev session cookie after verifying the password against
 * DEVTOOLS_PASSWORD. Accepts JSON `{ password }` or a form field `password`.
 */
export async function POST(req: Request) {
  let password = "";
  const contentType = req.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      const body = (await req.json()) as { password?: unknown };
      password = typeof body.password === "string" ? body.password : "";
    } else {
      const form = await req.formData();
      password = String(form.get("password") ?? "");
    }
  } catch {
    password = "";
  }

  if (!verifyDevPassword(password)) {
    // Uniform delay-free denial; message intentionally generic.
    return NextResponse.json({ ok: false, error: "INVALID" }, { status: 401 });
  }

  const token = await signDevToken();
  const store = await cookies();
  store.set(DEV_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getSessionMaxAgeSeconds(),
  });

  return NextResponse.json({ ok: true });
}
