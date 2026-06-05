import { AdminPageHeader } from "@/components/admin/page-header";
import { connectDB } from "@/lib/db";
import { Credential, type CredentialType } from "@/models";
import { CredentialsManager } from "./credentials-manager";

export interface CredentialRow {
  id: string;
  title: { id: string; en: string };
  description: { id: string; en: string };
  imageUrl: string;
  type: CredentialType;
  issuer: string;
  year: number | undefined;
  order: number;
}

async function loadCredentials(): Promise<CredentialRow[]> {
  await connectDB();
  const docs = await Credential.find().sort({ type: 1, order: 1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    title: { id: d.title.id, en: d.title.en },
    description: { id: d.description?.id ?? "", en: d.description?.en ?? "" },
    imageUrl: d.imageUrl ?? "",
    type: d.type as CredentialType,
    issuer: d.issuer ?? "",
    year: d.year,
    order: d.order ?? 0,
  }));
}

export default async function CredentialsAdminPage() {
  const credentials = await loadCredentials();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Credentials"
        description="Certifications and acknowledgements shown on /about/credentials."
      />
      <CredentialsManager initial={credentials} />
    </div>
  );
}
