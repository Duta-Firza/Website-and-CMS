import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import { Storage } from "@google-cloud/storage";

let cached: { storage: Storage; bucket: string } | null = null;

function getClient(): { storage: Storage; bucket: string } {
  if (cached) return cached;
  const bucket = process.env.GCS_BUCKET;
  if (!bucket) throw new Error("GCS_BUCKET env not set");

  const projectId = process.env.GCS_PROJECT_ID;
  const credsB64 = process.env.GCS_CREDENTIALS_JSON;
  const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  // Prefer inline base64 JSON when explicitly set (useful for serverless
  // platforms where mounting a file isn't an option). Otherwise fall back to
  // a key file path, or let the library use Application Default Credentials.
  let storage: Storage;
  if (credsB64?.trim()) {
    let credentials: Record<string, unknown>;
    try {
      credentials = JSON.parse(Buffer.from(credsB64, "base64").toString("utf8"));
    } catch {
      throw new Error("GCS_CREDENTIALS_JSON is not valid base64 JSON");
    }
    storage = new Storage({ projectId, credentials });
  } else if (keyFilename?.trim()) {
    storage = new Storage({ projectId, keyFilename });
  } else {
    storage = new Storage({ projectId });
  }

  cached = { storage, bucket };
  return cached;
}

function sanitizeFilename(name: string): string {
  const base = name.normalize("NFKD").replace(/\p{Diacritic}/gu, "");
  return base.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

export interface UploadResult {
  url: string;
  objectName: string;
}

function rootPrefix(): string {
  const raw = (process.env.GCS_FOLDER ?? "").trim();
  if (!raw) return "";
  return `${raw.replace(/^\/+|\/+$/g, "")}/`;
}

export async function uploadBuffer(
  buffer: Buffer,
  opts: { folder: string; mime: string; filename: string },
): Promise<UploadResult> {
  const { storage, bucket } = getClient();
  const ext = extname(opts.filename) || ".bin";
  const safe = sanitizeFilename(opts.filename.replace(ext, ""));
  const objectName = `${rootPrefix()}${opts.folder}/${randomUUID()}-${safe}${ext}`;
  const file = storage.bucket(bucket).file(objectName);
  await file.save(buffer, {
    contentType: opts.mime,
    resumable: false,
    metadata: {
      cacheControl: "public, max-age=31536000, immutable",
      contentType: opts.mime,
    },
  });
  const base = process.env.GCS_PUBLIC_URL_BASE ?? `https://storage.googleapis.com/${bucket}`;
  return { url: `${base.replace(/\/$/, "")}/${objectName}`, objectName };
}
