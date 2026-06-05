import { AdminPageHeader } from "@/components/admin/page-header";
import { connectDB } from "@/lib/db";
import { AffiliatedBusiness } from "@/models";
import { BusinessManager } from "./business-manager";

export interface AffiliatedBusinessRow {
  id: string;
  name: string;
  logoUrl: string;
  description: { id: string; en: string };
  websiteUrl: string;
  order: number;
}

async function loadBusinesses(): Promise<AffiliatedBusinessRow[]> {
  await connectDB();
  const docs = await AffiliatedBusiness.find().sort({ order: 1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    name: d.name,
    logoUrl: d.logoUrl ?? "",
    description: { id: d.description?.id ?? "", en: d.description?.en ?? "" },
    websiteUrl: d.websiteUrl ?? "",
    order: d.order ?? 0,
  }));
}

export default async function BusinessAdminPage() {
  const businesses = await loadBusinesses();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Affiliated Businesses"
        description="Subsidiary / sister companies shown on /about/business."
      />
      <BusinessManager initial={businesses} />
    </div>
  );
}
