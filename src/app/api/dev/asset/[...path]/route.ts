import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { requireDevSession } from "@/lib/devtools/dev-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Book assets live OUTSIDE /public so they are never served unauthenticated.
const ROOT = path.join(process.cwd(), "content", "devbooks");
const MAX_UPLOAD = 10 * 1024 * 1024; // 10 MB

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

// Uploads/deletes are restricted to book image folders with safe filenames.
const WRITABLE = /^manual\/images\/[A-Za-z0-9._-]+\.(jpg|jpeg|png|webp)$/;

function resolveWithin(segments: string[] | undefined): string | null {
  const rel = (segments ?? []).join("/");
  const abs = path.normalize(path.join(ROOT, rel));
  if (abs !== ROOT && !abs.startsWith(ROOT + path.sep)) return null;
  return abs;
}

export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const denied = await requireDevSession();
  if (denied) return denied;

  const abs = resolveWithin((await ctx.params).path);
  if (!abs) return new Response("Not found", { status: 404 });
  const type = TYPES[path.extname(abs).toLowerCase()];
  if (!type) return new Response("Not found", { status: 404 });

  try {
    const buf = await readFile(abs);
    return new Response(new Uint8Array(buf), {
      // no-store so a freshly uploaded/replaced image shows immediately.
      headers: { "content-type": type, "cache-control": "no-store" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

/** Upload / replace a book image (raw image body). */
export async function POST(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const denied = await requireDevSession();
  if (denied) return denied;

  const segments = (await ctx.params).path ?? [];
  const rel = segments.join("/");
  if (!WRITABLE.test(rel)) return new Response("Forbidden path", { status: 400 });
  const abs = resolveWithin(segments);
  if (!abs) return new Response("Not found", { status: 404 });

  const buf = Buffer.from(await req.arrayBuffer());
  if (buf.byteLength === 0) return new Response("Empty body", { status: 400 });
  if (buf.byteLength > MAX_UPLOAD) return new Response("Too large", { status: 413 });

  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, buf);
  return Response.json({ ok: true, size: buf.byteLength });
}

/** Delete a book image. */
export async function DELETE(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const denied = await requireDevSession();
  if (denied) return denied;

  const segments = (await ctx.params).path ?? [];
  if (!WRITABLE.test(segments.join("/"))) return new Response("Forbidden path", { status: 400 });
  const abs = resolveWithin(segments);
  if (!abs) return new Response("Not found", { status: 404 });

  try {
    await unlink(abs);
  } catch {
    // already gone — treat as success
  }
  return Response.json({ ok: true });
}
