import { getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { SOLUTION_PAGE_SLUGS } from "@/models";
import { loadSolutionPagesForOverview } from "./_components/load-solution-page";
import { SolutionsOverviewTable } from "./_components/solutions-overview-table";

export default async function SolutionsOverviewPage() {
  const rows = await loadSolutionPagesForOverview(SOLUTION_PAGE_SLUGS);
  const t = await getTranslations("Admin.pages.solutionsOverview");
  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("title")} description={t("description")} />
      <SolutionsOverviewTable initial={rows} />
    </div>
  );
}
