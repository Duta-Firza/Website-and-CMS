/**
 * Password gate for the /dev area (/devbooks + /devtools).
 *
 * EDGE-SAFE: this module must be importable from `src/proxy.ts` (Edge runtime),
 * so it uses only Web Crypto (`crypto.subtle`) and direct `process.env` reads —
 * no `next/headers`, no Node built-ins, no Mongoose. Cookie reading in Server
 * Components / Route Handlers lives in `dev-session.ts` (Node) instead.
 *
 * The session token carries an ABSOLUTE expiry inside a signed payload, so a
 * forgotten (or copied) cookie stops working after `exp` — the server rejects
 * it regardless of what the browser does. Rotating NEXTAUTH_SECRET invalidates
 * every outstanding dev session at once (kill-switch).
 */

export const DEV_COOKIE = "dev_auth";

const DEFAULT_SESSION_HOURS = 8;
const enc = new TextEncoder();
const dec = new TextDecoder();

interface DevPayload {
  iat: number;
  exp: number;
}

function getSecret(): string {
  // NEXTAUTH_SECRET is required (min 32 chars) by the app's env schema, so it is
  // always present at runtime. Empty string only as a last-resort fallback.
  return process.env.NEXTAUTH_SECRET ?? "";
}

export function getSessionHours(): number {
  const raw = process.env.DEVTOOLS_SESSION_HOURS;
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_SESSION_HOURS;
}

export function getSessionMaxAgeSeconds(): number {
  return Math.round(getSessionHours() * 3600);
}

// ── base64url helpers (available in both Edge + Node via btoa/atob) ──────────
function b64urlFromBytes(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlToBytes(b64: string): Uint8Array {
  const s = b64.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4 ? "=".repeat(4 - (s.length % 4)) : "";
  const bin = atob(s + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmac(secret: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return new Uint8Array(sig);
}

/** Length-independent constant-time-ish string compare. */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

/** Mint a signed session token whose `exp` is now + configured session hours. */
export async function signDevToken(): Promise<string> {
  const now = Date.now();
  const payload: DevPayload = { iat: now, exp: now + getSessionMaxAgeSeconds() * 1000 };
  const pB64 = b64urlFromBytes(enc.encode(JSON.stringify(payload)));
  const sig = await hmac(getSecret(), pB64);
  return `${pB64}.${b64urlFromBytes(sig)}`;
}

/** True only if the signature verifies AND the token has not expired. */
export async function verifyDevToken(token?: string | null): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const pB64 = token.slice(0, dot);
  const sigB64 = token.slice(dot + 1);
  const expected = b64urlFromBytes(await hmac(getSecret(), pB64));
  if (!constantTimeEqual(sigB64, expected)) return false;
  try {
    const payload = JSON.parse(dec.decode(b64urlToBytes(pB64))) as Partial<DevPayload>;
    if (typeof payload.exp !== "number") return false;
    return Date.now() < payload.exp;
  } catch {
    return false;
  }
}

/** Verify a login attempt against DEVTOOLS_PASSWORD. Unset password → deny all. */
export function verifyDevPassword(input: string): boolean {
  const pw = process.env.DEVTOOLS_PASSWORD ?? "";
  if (!pw) return false;
  return constantTimeEqual(input, pw);
}

/** Verify the collector's bearer token against DEVTOOLS_COLLECT_TOKEN. */
export function verifyCollectToken(input?: string | null): boolean {
  const t = process.env.DEVTOOLS_COLLECT_TOKEN ?? "";
  if (!t || !input) return false;
  return constantTimeEqual(input, t);
}
