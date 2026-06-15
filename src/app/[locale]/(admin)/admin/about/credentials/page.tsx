import { getLocale, getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PreviewLink } from "@/components/admin/preview-link";
import { UrlTabs } from "@/components/admin/url-tabs";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { connectDB } from "@/lib/db";
import { Credential, type CredentialType } from "@/models";
import { AboutSubPageForm } from "../_components/about-sub-page-form";
import { loadAboutSubPageForAdmin } from "../_components/load-about-sub-page";
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
  const [credentials, meta, locale, t] = await Promise.all([
    loadCredentials(),
    loadAboutSubPageForAdmin("credentials"),
    getLocale(),
    getTranslations("Admin"),
  ]);
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("pages.credentials.title")}
        description={t("pages.credentials.description")}
        titleAction={
          <PreviewLink href={`/${locale}/about/credentials`} label={t("buttons.viewPublic")} />
        }
      />
      <UrlTabs
        defaultTab="content"
        validValues={["content", "certification", "acknowledgement"]}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 md:w-fit md:grid-cols-3">
          <TabsTrigger value="content">{t("tabs.content")}</TabsTrigger>
          <TabsTrigger value="certification">{t("tabs.certifications")}</TabsTrigger>
          <TabsTrigger value="acknowledgement">{t("tabs.acknowledgements")}</TabsTrigger>
        </TabsList>
        <TabsContent value="content" className="mt-6">
          <AboutSubPageForm slug="credentials" initial={meta} />
        </TabsContent>
        <CredentialsManager initial={credentials} />
      </UrlTabs>
    </div>
  );
}
