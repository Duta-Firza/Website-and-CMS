import { getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { JobOpeningForm } from "../../_components/job-opening-form";

const emptyJob = {
  title: { id: "", en: "" },
  department: "",
  location: "",
  employmentType: "fullTime" as const,
  applyUrl: "",
  summary: { id: "", en: "" },
  description: { id: "", en: "" },
  isPublished: false,
  order: 0,
  postedAt: new Date().toISOString().split("T")[0],
};

export default async function NewJobOpeningPage() {
  const t = await getTranslations("Admin");

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("pages.newJob")} description={t("pages.careers.description")} />
      <JobOpeningForm initial={emptyJob} backHref="/admin/contact/careers?tab=items" />
    </div>
  );
}
