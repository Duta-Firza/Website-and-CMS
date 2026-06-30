import { auth } from "@/lib/auth";
import { getUnreadApplicationCount } from "@/lib/cms/applications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const POLL_MS = 10_000;

/**
 * Server-Sent Events stream of the unread-application count for the admin
 * sidebar badge. Mirrors the inquiries unread-stream: single-node MongoDB has no
 * change streams, so we poll and push only when the count changes.
 */
export async function GET(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || (role !== "super-admin" && role !== "editor")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      let last = -1;

      const send = (count: number) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ count })}\n\n`));
      };
      const keepalive = () => {
        controller.enqueue(encoder.encode(": keepalive\n\n"));
      };

      const tick = async () => {
        if (closed) return;
        try {
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
      const interval = setInterval(tick, POLL_MS);

      const close = () => {
        if (closed) return;
        closed = true;
        clearInterval(interval);
        try {
          controller.close();
        } catch {
          // already closed
        }
      };

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
