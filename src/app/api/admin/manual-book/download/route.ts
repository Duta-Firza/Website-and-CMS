import { loadCurrentAdmin } from "@/lib/cms/access";
import { getManualBookUrls } from "@/lib/cms/site-settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Same-origin download proxy for the manual-book PDFs. The `download` attribute
 * is ignored for cross-origin (GCS) links, so the browser just opens them.
 * This streams the GCS PDF back with Content-Disposition: attachment, forcing a
 * real download. Readable by any signed-in admin (incl. viewer) — same as the
 * /admin/manual-book page itself.
 */
export async function GET(req: Request) {
  const admin = await loadCurrentAdmin();
  if (!admin) return new Response("Unauthorized", { status: 401 });

  const lang = new URL(req.url).searchParams.get("lang") === "en" ? "en" : "id";
  const urls = await getManualBookUrls();
  const url = lang === "en" ? urls.en : urls.id;
  if (!url) return new Response("Not found", { status: 404 });

  const upstream = await fetch(url, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) return new Response("Upstream error", { status: 502 });

  return new Response(upstream.body, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="Manual-Book-${lang.toUpperCase()}.pdf"`,
      "cache-control": "private, no-store",
    },
  });
}
