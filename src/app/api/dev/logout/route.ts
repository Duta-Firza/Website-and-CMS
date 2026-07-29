import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { DEV_COOKIE } from "@/lib/devtools/dev-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Clears the /dev session cookie. */
export async function POST() {
  const store = await cookies();
  store.set(DEV_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return NextResponse.json({ ok: true });
}
