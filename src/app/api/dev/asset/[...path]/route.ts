import { readFile } from "node:fs/promises";
import path from "node:path";
import { requireDevSession } from "@/lib/devtools/dev-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Book assets live OUTSIDE /public so they are never served unauthenticated.
const ROOT = path.join(process.cwd(), "content", "devbooks");

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const denied = await requireDevSession();
  if (denied) return denied;

  const { path: segments } = await ctx.params;
  const rel = (segments ?? []).join("/");
  const abs = path.normalize(path.join(ROOT, rel));

  // Contain within ROOT (block ../ traversal).
  if (abs !== ROOT && !abs.startsWith(ROOT + path.sep)) {
    return new Response("Not found", { status: 404 });
  }
  const type = TYPES[path.extname(abs).toLowerCase()];
  if (!type) return new Response("Not found", { status: 404 });

  try {
    const buf = await readFile(abs);
    return new Response(new Uint8Array(buf), {
      headers: { "content-type": type, "cache-control": "private, max-age=300" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
