import { NextResponse } from "next/server";
import { uploadBuffer } from "@/lib/storage/gcs";

export const runtime = "nodejs";
export const maxDuration = 60;

// Public CV upload for job applications — PDF only, kept small. Unlike the admin
// `/api/upload`, this is unauthenticated (visitors apply without an account), so
// it is deliberately narrow: one MIME type + a tight size cap.
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are accepted" }, { status: 415 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 413 });
  }

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const { url } = await uploadBuffer(buf, {
      folder: "applications",
      mime: "application/pdf",
      filename: file.name || "cv.pdf",
    });
    return NextResponse.json({ url, filename: file.name || "cv.pdf" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    console.error("[apply-upload] error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
