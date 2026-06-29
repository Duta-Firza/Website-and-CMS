import { getLocale, getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PreviewLink } from "@/components/admin/preview-link";
import { connectDB } from "@/lib/db";
import { JobOpening } from "@/models";
import type { JobEmploymentType } from "@/models/constants";
import { CareerAdminTabs } from "./_components/career-admin-tabs";
import { loadCareerPageForAdmin } from "./_components/load-career-page";

export interface JobOpeningRow {
  id: string;
  title: { id: string; en: string };
  department: string;
  location: string;
  employmentType: JobEmploymentType;
  isPublished: boolean;
  order: number;
}

async function loadJobOpenings(): Promise<JobOpeningRow[]> {
  await connectDB();
  const docs = await JobOpening.find().sort({ order: 1, postedAt: -1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    title: { id: d.title?.id ?? "", en: d.title?.en ?? "" },
    department: d.department ?? "",
    location: d.location ?? "",
    employmentType: (d.employmentType ?? "fullTime") as JobEmploymentType,
    isPublished: d.isPublished ?? false,
    order: d.order ?? 0,
  }));
}

export default async function CareersAdminPage() {
  const [content, openings, locale, t] = await Promise.all([
    loadCareerPageForAdmin(),
    loadJobOpenings(),
    getLocale(),
    getTranslations("Admin"),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("pages.careers.title")}
        description={t("pages.careers.description")}
        titleAction={
          <PreviewLink href={`/${locale}/contact/careers`} label={t("buttons.viewPublic")} />
        }
      />
      <CareerAdminTabs
        pageInitial={content}
        openings={openings}
        newHref="/admin/contact/careers/openings/new"
        editBase="/admin/contact/careers/openings"
      />
    </div>
  );
}
