import { getLocale, getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PreviewLink } from "@/components/admin/preview-link";
import { UrlTabs } from "@/components/admin/url-tabs";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { connectDB } from "@/lib/db";
import { Publication } from "@/models";
import { IrSubPageForm } from "../_components/ir-sub-page-form";
import { loadIrSubPageForAdmin } from "../_components/load-ir-sub-page";
import { PublicationsManager } from "./_components/publications-manager";

export interface PublicationRow {
  id: string;
  slug: string;
  title: { id: string; en: string };
  summary: { id: string; en: string };
  publishedAt: Date;
  isPublished: boolean;
  order: number;
}

async function loadPublications(category: string): Promise<PublicationRow[]> {
  await connectDB();
  const docs = await Publication.find({ category }).sort({ publishedAt: -1 }).lean();
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

export default async function NewsroomAdminPage() {
  const [meta, publications, locale, t] = await Promise.all([
    loadIrSubPageForAdmin("newsroom"),
    loadPublications("newsroom"),
    getLocale(),
    getTranslations("Admin"),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("pages.irNewsroom.title")}
        description={t("pages.irNewsroom.description")}
        titleAction={
          <PreviewLink
            href={`/${locale}/investor-relations/publications/newsroom`}
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
          <IrSubPageForm slug="newsroom" initial={meta} />
        </TabsContent>
        <TabsContent value="items" className="mt-6">
          <PublicationsManager
            initial={publications}
            newHref="/admin/investor-relations/newsroom/new"
            editBase="/admin/investor-relations/newsroom"
          />
        </TabsContent>
      </UrlTabs>
    </div>
  );
}
