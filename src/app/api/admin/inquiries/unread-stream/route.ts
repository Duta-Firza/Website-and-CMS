import { loadCurrentAdmin } from "@/lib/cms/access";
import { getUnreadInquiryCount } from "@/lib/cms/inquiries";
import { canAccess } from "@/lib/rbac";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const POLL_MS = 10_000;

/**
 * Server-Sent Events stream of the unread-inquiry count for the admin sidebar
 * badge. The MongoDB instance is single-node (no change streams), so we poll
 * the count on an interval and push only when it changes. The connection is
 * long-lived; on a self-hosted Node server (`next start`) that's fine.
 */
export async function GET(req: Request) {
  // Reading counts is allowed for viewers too, so this gates on scope only.
  const admin = await loadCurrentAdmin();
  if (!admin || !canAccess(admin, "inbox")) {
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
          // Re-authorize every tick, not just on connect: this connection can
          // outlive a deactivation by days otherwise. `loadCurrentAdmin` (not
          // the cached `getCurrentAdmin`) because React's cache is scoped to
          // the request — and this request lasts as long as the stream.
          const admin = await loadCurrentAdmin();
          if (!admin || !canAccess(admin, "inbox")) return close();

          const count = await getUnreadInquiryCount();
          if (count !== last) {
            last = count;
            send(count);
          } else {
            keepalive();
          }
        } catch {
          // Swallow transient DB errors — the next tick retries.
          keepalive();
        }
      };

      // Emit the current count immediately so the badge is accurate on connect.
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
