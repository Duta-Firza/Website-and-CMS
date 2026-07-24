import { loadCurrentAdmin } from "@/lib/cms/access";
import { getUnreadApplicationCount } from "@/lib/cms/applications";
import { canAccess } from "@/lib/rbac";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const POLL_MS = 10_000;

/**
 * Server-Sent Events stream of the unread-application count for the admin
 * sidebar badge. Mirrors the inquiries unread-stream: single-node MongoDB has no
 * change streams, so we poll and push only when the count changes.
 */
export async function GET(req: Request) {
  // Reading counts is allowed for viewers too, so this gates on scope only.
  const admin = await loadCurrentAdmin();
  if (!admin || !canAccess(admin, "applications")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      let last = -1;
      let interval: ReturnType<typeof setInterval> | undefined;

      const send = (count: number) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ count })}\n\n`));
      };
      const keepalive = () => {
        controller.enqueue(encoder.encode(": keepalive\n\n"));
      };
      // Declared before `tick`, which closes the stream when access is revoked.
      const close = () => {
        if (closed) return;
        closed = true;
        if (interval) clearInterval(interval);
        try {
          controller.close();
        } catch {
          // already closed
        }
      };

      const tick = async () => {
        if (closed) return;
        try {
          // Re-authorize every tick — see the inquiries stream for why this
          // uses the uncached loader.
          const current = await loadCurrentAdmin();
          if (!current || !canAccess(current, "applications")) return close();

          const count = await getUnreadApplicationCount();
          if (count !== last) {
            last = count;
            send(count);
          } else {
            keepalive();
          }
        } catch {
          keepalive();
        }
      };

      await tick();
      interval = setInterval(tick, POLL_MS);

      req.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
