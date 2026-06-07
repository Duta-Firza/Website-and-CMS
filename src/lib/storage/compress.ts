import { exec } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export interface CompressResult {
  buffer: Buffer;
  mime: string;
  filename: string;
  originalSize: number;
  compressedSize: number;
}

/**
 * Compress an upload buffer in-place. For images we use sharp; for PDFs we
 * prefer the `gs` (ghostscript) binary when available and fall back to pdf-lib
 * metadata stripping; for video we shell out to a bundled ffmpeg binary. If
 * any pass fails or produces a larger output we keep the original.
 */
export async function compress(
  buf: Buffer,
  mime: string,
  filename: string,
): Promise<CompressResult> {
  const original = {
    buffer: buf,
    mime,
    filename,
    originalSize: buf.length,
    compressedSize: buf.length,
  };
  try {
    if (mime.startsWith("image/")) return await compressImage(original);
    if (mime.startsWith("video/")) return await compressVideo(original);
    if (mime === "application/pdf") return await compressPdf(original);
    return original;
  } catch (err) {
    console.warn("[compress] fallback to original:", err instanceof Error ? err.message : err);
    return original;
  }
}

async function compressImage(input: CompressResult): Promise<CompressResult> {
  const { default: sharp } = await import("sharp");
  const img = sharp(input.buffer, { failOn: "none" });
  const meta = await img.metadata();
  const resized = meta.width && meta.width > 2400 ? img.resize({ width: 2400 }) : img;

  let output: Buffer;
  let mime = input.mime;
  let filename = input.filename;

  if (input.mime === "image/png" && meta.hasAlpha) {
    output = await resized.png({ compressionLevel: 9, palette: true }).toBuffer();
  } else if (input.mime === "image/png") {
    output = await resized.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    mime = "image/jpeg";
    filename = filename.replace(/\.png$/i, ".jpg");
  } else if (input.mime === "image/webp") {
    output = await resized.webp({ quality: 82, effort: 4 }).toBuffer();
  } else {
    output = await resized.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    mime = "image/jpeg";
    filename = filename.replace(/\.(jpe?g|gif|bmp|tiff?)$/i, ".jpg");
  }

  if (output.length >= input.buffer.length) return input;
  return {
    buffer: output,
    mime,
    filename,
    originalSize: input.originalSize,
    compressedSize: output.length,
  };
}

async function compressVideo(input: CompressResult): Promise<CompressResult> {
  const ffmpegPath = (await import("ffmpeg-static")).default;
  if (!ffmpegPath || !existsSync(ffmpegPath)) {
    console.warn("[compress] ffmpeg-static binary missing, skipping video compress");
    return input;
  }
  const { default: ffmpeg } = await import("fluent-ffmpeg");
  ffmpeg.setFfmpegPath(ffmpegPath);

  const dir = mkdtempSync(join(tmpdir(), "df-upload-"));
  const inPath = join(dir, "in.mp4");
  const outPath = join(dir, "out.mp4");
  writeFileSync(inPath, input.buffer);

  try {
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inPath)
        .videoCodec("libx264")
        .audioCodec("aac")
        .audioBitrate("128k")
        .outputOptions(["-crf 23", "-preset slow", "-movflags +faststart"])
        .videoFilters("scale='min(1920,iw)':-2")
        .format("mp4")
        .on("end", () => resolve())
        .on("error", (err) => reject(err))
        .save(outPath);
    });
    const output = readFileSync(outPath);
    if (output.length >= input.buffer.length) return input;
    return {
      buffer: output,
      mime: "video/mp4",
      filename: input.filename.replace(/\.\w+$/, ".mp4"),
      originalSize: input.originalSize,
      compressedSize: output.length,
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

async function compressPdf(input: CompressResult): Promise<CompressResult> {
  const gsAvailable = await hasGhostscript();
  if (gsAvailable) {
    const dir = mkdtempSync(join(tmpdir(), "df-pdf-"));
    const inPath = join(dir, "in.pdf");
    const outPath = join(dir, "out.pdf");
    writeFileSync(inPath, input.buffer);
    try {
      await execAsync(
        `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outPath}" "${inPath}"`,
      );
      if (existsSync(outPath)) {
        const output = readFileSync(outPath);
        if (output.length < input.buffer.length) {
          return {
            buffer: output,
            mime: "application/pdf",
            filename: input.filename,
            originalSize: input.originalSize,
            compressedSize: output.length,
          };
        }
      }
    } catch (err) {
      console.warn("[compress] gs failed, falling back to pdf-lib:", err);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }

  // Fallback: strip metadata and dedupe object streams via pdf-lib
  try {
    const { PDFDocument } = await import("pdf-lib");
    const doc = await PDFDocument.load(input.buffer, { ignoreEncryption: true });
    doc.setTitle("");
    doc.setAuthor("");
    doc.setSubject("");
    doc.setKeywords([]);
    doc.setProducer("");
    doc.setCreator("");
    const output = Buffer.from(await doc.save({ useObjectStreams: true }));
    if (output.length < input.buffer.length) {
      return {
        buffer: output,
        mime: "application/pdf",
        filename: input.filename,
        originalSize: input.originalSize,
        compressedSize: output.length,
      };
    }
  } catch (err) {
    console.warn("[compress] pdf-lib failed:", err);
  }
  return input;
}

async function hasGhostscript(): Promise<boolean> {
  try {
    await execAsync("gs --version");
    return true;
  } catch {
    return false;
  }
}
