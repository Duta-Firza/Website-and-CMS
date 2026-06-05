import { AdminPageHeader } from "@/components/admin/page-header";
import { connectDB } from "@/lib/db";
import { HistoryEntry } from "@/models";
import { HistoryManager } from "./history-manager";

export interface HistoryRow {
  id: string;
  year: string;
  title: { id: string; en: string };
  description: { id: string; en: string };
  order: number;
}

async function loadEntries(): Promise<HistoryRow[]> {
  await connectDB();
  const docs = await HistoryEntry.find().sort({ order: 1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    year: d.year,
    title: { id: d.title.id, en: d.title.en },
    description: { id: d.description?.id ?? "", en: d.description?.en ?? "" },
    order: d.order ?? 0,
  }));
}

export default async function HistoryAdminPage() {
  const entries = await loadEntries();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="History"
        description="Milestones shown on /about/history. Order controls timeline sequence."
      />
      <HistoryManager initial={entries} />
    </div>
  );
}
