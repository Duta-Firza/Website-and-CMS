import { getLocale, getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { loadAdminProjects } from "@/lib/cms/admin-projects";
import { parseAdminListParams } from "@/lib/cms/list-params";
import { ProjectsManager } from "./projects-manager";

export type { ProjectRow } from "@/lib/cms/admin-projects";

export default async function ProjectsAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [sp, locale, t] = await Promise.all([
    searchParams,
    getLocale(),
    getTranslations("Admin.pages.projects"),
  ]);
  const params = parseAdminListParams(sp, "manual");
  const { items, total, allIds, allSlugs } = await loadAdminProjects(params, locale);
  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("title")} description={t("description")} />
      <ProjectsManager items={items} total={total} allIds={allIds} allSlugs={allSlugs} />
    </div>
  );
}
