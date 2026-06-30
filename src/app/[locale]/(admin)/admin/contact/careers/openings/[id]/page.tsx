import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { connectDB } from "@/lib/db";
import { JobOpening } from "@/models";
import type { JobApplyMode, JobEmploymentType } from "@/models/constants";
import { JobOpeningForm } from "../../_components/job-opening-form";

interface PageParams {
  id: string;
}

async function loadJobOpening(id: string) {
  await connectDB();
  const doc = await JobOpening.findById(id).lean();
  if (!doc) return null;
  return {
    id: String(doc._id),
    title: { id: doc.title?.id ?? "", en: doc.title?.en ?? "" },
    department: doc.department ?? "",
    location: doc.location ?? "",
    employmentType: (doc.employmentType ?? "fullTime") as JobEmploymentType,
    applyMode: (doc.applyMode ?? "form") as JobApplyMode,
    applyUrl: doc.applyUrl ?? "",
    applyEmail: doc.applyEmail ?? "",
    summary: { id: doc.summary?.id ?? "", en: doc.summary?.en ?? "" },
    description: { id: doc.description?.id ?? "", en: doc.description?.en ?? "" },
    isPublished: doc.isPublished ?? false,
    order: doc.order ?? 0,
    postedAt: doc.postedAt.toISOString().split("T")[0],
  };
}

export default async function EditJobOpeningPage({ params }: { params: Promise<PageParams> }) {
  const { id } = await params;
  const [job, t] = await Promise.all([loadJobOpening(id), getTranslations("Admin")]);

  if (!job) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("pages.editJob")} description={t("pages.careers.description")} />
      <JobOpeningForm initial={job} backHref="/admin/contact/careers?tab=items" />
    </div>
  );
}
