import { connectDB } from "@/lib/db";
import { Inquiry } from "@/models";

/**
 * Count of unread inquiries — drives the sidebar Inbox badge. Read/unread is a
 * dedicated boolean on the Inquiry doc (independent of the follow-up `status`).
 * Used by the sidebar server component for the initial value and polled by the
 * SSE stream for live updates.
 */
export async function getUnreadInquiryCount(): Promise<number> {
  await connectDB();
  // Match the page's legacy coercion so the count is correct even before the
  // migration backfills `read`: a doc is unread when read===false, or when it
  // predates the field and its (legacy) status isn't "read"/"archived".
  return Inquiry.countDocuments({
    $or: [{ read: false }, { read: { $exists: false }, status: { $nin: ["read", "archived"] } }],
  });
}
