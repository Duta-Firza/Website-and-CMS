import { getLocale, getTranslations } from "next-intl/server";
import { ProjectsManager } from "@/app/[locale]/(admin)/admin/projects/projects-manager";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PreviewLink } from "@/components/admin/preview-link";
import { loadAdminProjects } from "@/lib/cms/admin-projects";
import { parseAdminListParams } from "@/lib/cms/list-params";
import { loadSolutionPageForAdmin } from "../_components/load-solution-page";
import { SolutionPageForm } from "../_components/solution-page-form";

export default async function EpcAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [page, sp, locale, t] = await Promise.all([
    loadSolutionPageForAdmin("epc"),
    searchParams,
    getLocale(),
    getTranslations("Admin"),
  ]);
  const params = parseAdminListParams(sp, "manual");
  const projects = await loadAdminProjects(params, locale);
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("pages.epc.title")}
        description={t("pages.epc.description")}
        titleAction={
          <PreviewLink href={`/${locale}/solutions/epc`} label={t("buttons.viewPublic")} />
        }
      />
      <SolutionPageForm
        slug="epc"
        initial={page}
        additionalTabs={[
          {
            value: "projects",
            label: t("nouns.project"),
            content: (
              <ProjectsManager
                items={projects.items}
                total={projects.total}
                allIds={projects.allIds}
                allSlugs={projects.allSlugs}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
