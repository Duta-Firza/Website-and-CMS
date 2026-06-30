import { connectDB } from "@/lib/db";
import { Application } from "@/models";

/**
 * Count of unread job applications — drives the sidebar Inbox badge. `read` is a
 * dedicated boolean on the Application doc (independent of the hiring `status`).
 * Used by the sidebar server component for the initial value and polled by the
 * SSE stream for live updates.
 */
export async function getUnreadApplicationCount(): Promise<number> {
  await connectDB();
  return Application.countDocuments({ read: { $ne: true } });
}
