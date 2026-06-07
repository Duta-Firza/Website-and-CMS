import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { compress } from "@/lib/storage/compress";
import { uploadBuffer } from "@/lib/storage/gcs";

export const runtime = "nodejs";
export const maxDuration = 300;

const SIZE_LIMITS: Record<string, number> = {
  image: 20 * 1024 * 1024,
  video: 200 * 1024 * 1024,
  pdf: 50 * 1024 * 1024,
};

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "application/pdf",
]);

const SAFE_FOLDER = /^[a-z0-9][a-z0-9-/]{0,63}$/i;

function categoryFor(mime: string): "image" | "video" | "pdf" | null {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/pdf") return "pdf";
  return null;
}

export async function POST(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || (role !== "super-admin" && role !== "editor")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const folderRaw = String(form.get("folder") ?? "uploads");
  const folder = SAFE_FOLDER.test(folderRaw) ? folderRaw : "uploads";

  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: "Unsupported media type" }, { status: 415 });
  }
  const category = categoryFor(file.type);
  if (!category) {
    return NextResponse.json({ error: "Unsupported media type" }, { status: 415 });
  }
  if (file.size > SIZE_LIMITS[category]) {
    return NextResponse.json(
      { error: `File too large (max ${Math.round(SIZE_LIMITS[category] / 1024 / 1024)}MB)` },
      { status: 413 },
    );
  }

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const compressed = await compress(buf, file.type, file.name || `upload.${category}`);
    const { url } = await uploadBuffer(compressed.buffer, {
      folder,
      mime: compressed.mime,
      filename: compressed.filename,
    });
    return NextResponse.json({
      url,
      mime: compressed.mime,
      originalSize: compressed.originalSize,
      compressedSize: compressed.compressedSize,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    console.error("[upload] error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
