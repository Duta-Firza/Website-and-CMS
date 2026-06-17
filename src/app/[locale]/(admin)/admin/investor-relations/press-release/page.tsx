import { getLocale, getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PreviewLink } from "@/components/admin/preview-link";
import { UrlTabs } from "@/components/admin/url-tabs";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { connectDB } from "@/lib/db";
import { Publication } from "@/models";
import { IrSubPageForm } from "../_components/ir-sub-page-form";
import { loadIrSubPageForAdmin } from "../_components/load-ir-sub-page";
import type { PublicationRow } from "../newsroom/page";
import { PublicationsManager } from "../newsroom/_components/publications-manager";

async function loadPublications(): Promise<PublicationRow[]> {
  await connectDB();
  const docs = await Publication.find({ category: "press-release" })
    .sort({ publishedAt: -1 })
    .lean();
  return docs.map((d) => ({
    id: String(d._id),
    slug: d.slug,
    title: { id: d.title?.id ?? "", en: d.title?.en ?? "" },
    summary: { id: d.summary?.id ?? "", en: d.summary?.en ?? "" },
    publishedAt: d.publishedAt,
    isPublished: d.isPublished ?? false,
    order: d.order ?? 0,
  }));
}

export default async function PressReleaseAdminPage() {
  const [meta, publications, locale, t] = await Promise.all([
    loadIrSubPageForAdmin("press-release"),
    loadPublications(),
    getLocale(),
    getTranslations("Admin"),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("pages.irPressRelease.title")}
        description={t("pages.irPressRelease.description")}
        titleAction={
          <PreviewLink
            href={`/${locale}/investor-relations/publications/press-release`}
            label={t("buttons.viewPublic")}
          />
        }
      />
      <UrlTabs defaultTab="content" validValues={["content", "items"]} className="w-full">
        <TabsList className="grid grid-cols-2 md:w-fit">
          <TabsTrigger value="content">{t("tabs.content")}</TabsTrigger>
          <TabsTrigger value="items">{t("tabs.items")}</TabsTrigger>
        </TabsList>
        <TabsContent value="content" className="mt-6">
          <IrSubPageForm slug="press-release" initial={meta} />
        </TabsContent>
        <TabsContent value="items" className="mt-6">
          <PublicationsManager
            initial={publications}
            newHref="/admin/investor-relations/press-release/new"
            editBase="/admin/investor-relations/press-release"
          />
        </TabsContent>
      </UrlTabs>
    </div>
  );
}
