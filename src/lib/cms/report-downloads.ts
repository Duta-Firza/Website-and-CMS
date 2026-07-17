import { connectDB } from "@/lib/db";
import { ReportDownload } from "@/models";

/**
 * Matches report leads that haven't been read. `read` is a dedicated boolean on
 * the ReportDownload doc (independent of the `action` the lead came from), and
 * `$ne: true` rather than `false` so docs predating the field still count as
 * unread. Exported so the admin page and the dashboard filter identically.
 */
export const UNREAD_REPORT_DOWNLOAD_QUERY = { read: { $ne: true } } as const;

/** Count of unread report leads — drives the dashboard Download Reports card. */
export async function getUnreadReportDownloadCount(): Promise<number> {
  await connectDB();
  return ReportDownload.countDocuments(UNREAD_REPORT_DOWNLOAD_QUERY);
}
