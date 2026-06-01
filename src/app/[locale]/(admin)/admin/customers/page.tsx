import { AdminPageHeader } from "@/components/admin/page-header";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models";
import { CustomersManager } from "./customers-manager";

export interface CustomerRow {
  id: string;
  name: string;
  logoUrl: string;
  order: number;
  invertOnDark: boolean;
}

async function loadCustomers(): Promise<CustomerRow[]> {
  await connectDB();
  const docs = await Customer.find().sort({ order: 1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    name: d.name,
    logoUrl: d.logoUrl,
    order: d.order ?? 0,
    invertOnDark: d.invertOnDark ?? false,
  }));
}

export default async function CustomersAdminPage() {
  const customers = await loadCustomers();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Customers"
        description="Logos for the trusted-customers carousel on the homepage."
      />
      <CustomersManager initial={customers} />
    </div>
  );
}
