import { getLocale, getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PreviewLink } from "@/components/admin/preview-link";
import { connectDB } from "@/lib/db";
import { LeadershipMember, type LeadershipType } from "@/models";
import { AboutSubPageForm } from "../_components/about-sub-page-form";
import { AboutSubPageShell } from "../_components/about-sub-page-shell";
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
  const [members, meta, locale, t] = await Promise.all([
    loadMembers(),
    loadAboutSubPageForAdmin("leadership"),
    getLocale(),
    getTranslations("Admin"),
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
      <AboutSubPageShell
        itemsLabelKey="tabs.members"
        contentTab={<AboutSubPageForm slug="leadership" initial={meta} />}
        itemsTab={<LeadershipManager initial={members} />}
      />
    </div>
  );
}
