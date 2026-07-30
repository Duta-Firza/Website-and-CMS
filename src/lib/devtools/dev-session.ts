/**
 * Server-side (Node) helpers for reading the /dev session cookie inside Server
 * Components and Route Handlers. Kept separate from `dev-auth.ts` because this
 * imports `next/headers` / `next/navigation`, which must NOT be pulled into the
 * Edge proxy bundle. The proxy verifies the cookie itself via `verifyDevToken`.
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEV_COOKIE, verifyDevToken } from "./dev-auth";

/** True when the current request carries a valid, unexpired dev session. */
export async function isDevAuthed(): Promise<boolean> {
  const store = await cookies();
  return verifyDevToken(store.get(DEV_COOKIE)?.value);
}

/**
 * Guard for /dev pages. The proxy already gates these routes; this is
 * defence-in-depth (and the source of truth if the proxy is ever bypassed).
 */
export async function assertDevSession(fromPath?: string): Promise<void> {
  if (await isDevAuthed()) return;
  const from = fromPath ? `?from=${encodeURIComponent(fromPath)}` : "";
  redirect(`/devlogin${from}`);
}

/** Guard for /dev Route Handlers (returns a 401 Response instead of redirect). */
export async function requireDevSession(): Promise<Response | null> {
  if (await isDevAuthed()) return null;
  return new Response("Unauthorized", { status: 401 });
}
