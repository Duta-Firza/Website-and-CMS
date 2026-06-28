import { exec } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execAsync = promisify(exec);

async function hasGhostscript(): Promise<boolean> {
  try {
    await execAsync("gs --version");
    return true;
  } catch {
    return false;
  }
}

/**
 * Render the first page of a PDF to a JPEG thumbnail (max 800px wide) using the
 * `gs` (ghostscript) binary — the same one used for PDF compression in
 * `compress.ts` — followed by sharp for resize/optimize. Returns `null` when
 * ghostscript is unavailable or rendering fails, so callers can fall back to a
 * default placeholder.
 */
export async function renderPdfFirstPage(pdfBuffer: Buffer): Promise<Buffer | null> {
  if (!(await hasGhostscript())) return null;

  const dir = mkdtempSync(join(tmpdir(), "df-pdf-thumb-"));
  const inPath = join(dir, "in.pdf");
  const outPath = join(dir, "out.jpg");
  writeFileSync(inPath, pdfBuffer);
  try {
    await execAsync(
      `gs -sDEVICE=jpeg -dFirstPage=1 -dLastPage=1 -r150 -dJPEGQ=90 -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outPath}" "${inPath}"`,
    );
    if (!existsSync(outPath)) return null;
    const rendered = readFileSync(outPath);
    const { default: sharp } = await import("sharp");
    return await sharp(rendered)
      .resize({ width: 800, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
  } catch (err) {
    console.warn("[pdf-thumbnail] render failed:", err instanceof Error ? err.message : err);
    return null;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
