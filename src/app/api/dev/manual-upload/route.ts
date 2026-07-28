import { NextResponse } from "next/server";
import { setManualBookUrl } from "@/lib/cms/site-settings";
import { requireDevSession } from "@/lib/devtools/dev-session";
import { compress } from "@/lib/storage/compress";
import { uploadBuffer } from "@/lib/storage/gcs";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

/**
 * Dev-gated upload of the final manual-book PDF (ID/EN) to GCS. Uploading from
 * /devbooks (password-gated), not the admin session — so this can't reuse
 * /api/upload (which requires an admin). Stores the URL in SiteSettings, which
 * /admin/manual-book reads. This is what makes the admin view a snapshot: it
 * only changes when a new PDF is uploaded here.
 */
export async function POST(req: Request) {
  const denied = await requireDevSession();
  if (denied) return denied;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const lang = String(form.get("lang") ?? "");
  if (lang !== "id" && lang !== "en") {
    return NextResponse.json({ error: "Invalid lang (id|en)" }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF is allowed" }, { status: 415 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 413 });
  }

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const compressed = await compress(buf, file.type, file.name || `manual-${lang}.pdf`);
    const { url } = await uploadBuffer(compressed.buffer, {
      folder: "manual-book",
      mime: compressed.mime,
      filename: compressed.filename,
    });
    await setManualBookUrl(lang, url);
    return NextResponse.json({ ok: true, url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    console.error("[manual-upload] error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
