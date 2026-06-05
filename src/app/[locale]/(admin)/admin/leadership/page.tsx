import { AdminPageHeader } from "@/components/admin/page-header";
import { connectDB } from "@/lib/db";
import { LeadershipMember, type LeadershipType } from "@/models";
import { LeadershipManager } from "./leadership-manager";

export interface LeadershipRow {
  id: string;
  name: string;
  title: { id: string; en: string };
  bio: { id: string; en: string };
  photoUrl: string;
  type: LeadershipType;
  order: number;
  isActive: boolean;
}

async function loadMembers(): Promise<LeadershipRow[]> {
  await connectDB();
  const docs = await LeadershipMember.find().sort({ type: 1, order: 1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    name: d.name,
    title: { id: d.title.id, en: d.title.en },
    bio: { id: d.bio?.id ?? "", en: d.bio?.en ?? "" },
    photoUrl: d.photoUrl ?? "",
    type: d.type as LeadershipType,
    order: d.order ?? 0,
    isActive: d.isActive ?? true,
  }));
}

export default async function LeadershipAdminPage() {
  const members = await loadMembers();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Leadership"
        description="Board of Directors and Board of Commissioners shown on /about/leadership."
      />
      <LeadershipManager initial={members} />
    </div>
  );
}
