import { getLocale, getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PreviewLink } from "@/components/admin/preview-link";
import { UrlTabs } from "@/components/admin/url-tabs";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { connectDB } from "@/lib/db";
import { LeadershipMember, type LeadershipType } from "@/models";
import { AboutSubPageForm } from "../_components/about-sub-page-form";
import { loadAboutSubPageForAdmin } from "../_components/load-about-sub-page";
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
  const [members, meta, locale, t, tAbout] = await Promise.all([
    loadMembers(),
    loadAboutSubPageForAdmin("leadership"),
    getLocale(),
    getTranslations("Admin"),
    getTranslations("About"),
  ]);
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("pages.leadership.title")}
        description={t("pages.leadership.description")}
        titleAction={
          <PreviewLink href={`/${locale}/about/leadership`} label={t("buttons.viewPublic")} />
        }
      />
      <UrlTabs
        defaultTab="content"
        validValues={["content", "director", "commissioner"]}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 md:w-fit md:grid-cols-3">
          <TabsTrigger value="content">{t("tabs.content")}</TabsTrigger>
          <TabsTrigger value="director">{tAbout("boardOfDirectors")}</TabsTrigger>
          <TabsTrigger value="commissioner">{tAbout("boardOfCommissioners")}</TabsTrigger>
        </TabsList>
        <TabsContent value="content" className="mt-6">
          <AboutSubPageForm slug="leadership" initial={meta} />
        </TabsContent>
        <LeadershipManager initial={members} />
      </UrlTabs>
    </div>
  );
}
