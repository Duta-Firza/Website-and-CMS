import { getLocale, getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PreviewLink } from "@/components/admin/preview-link";
import { connectDB } from "@/lib/db";
import { HistoryEntry } from "@/models";
import { AboutSubPageForm } from "../_components/about-sub-page-form";
import { AboutSubPageShell } from "../_components/about-sub-page-shell";
import { loadAboutSubPageForAdmin } from "../_components/load-about-sub-page";
import { HistoryManager } from "./history-manager";

export interface HistoryRow {
  id: string;
  year: string;
  title: { id: string; en: string };
  description: { id: string; en: string };
  imageUrl: string;
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
    imageUrl: d.imageUrl ?? "",
    order: d.order ?? 0,
  }));
}

export default async function HistoryAdminPage() {
  const [entries, meta, locale, t] = await Promise.all([
    loadEntries(),
    loadAboutSubPageForAdmin("history"),
    getLocale(),
    getTranslations("Admin"),
  ]);
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("pages.history.title")}
        description={t("pages.history.description")}
        titleAction={
          <PreviewLink href={`/${locale}/about/history`} label={t("buttons.viewPublic")} />
        }
      />
      <AboutSubPageShell
        itemsLabelKey="tabs.milestones"
        contentTab={<AboutSubPageForm slug="history" initial={meta} />}
        itemsTab={<HistoryManager initial={entries} />}
      />
    </div>
  );
}
