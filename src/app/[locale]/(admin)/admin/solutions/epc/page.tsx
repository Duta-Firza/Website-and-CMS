import { getLocale, getTranslations } from "next-intl/server";
import type { ProjectRow } from "@/app/[locale]/(admin)/admin/projects/page";
import { ProjectsManager } from "@/app/[locale]/(admin)/admin/projects/projects-manager";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PreviewLink } from "@/components/admin/preview-link";
import { connectDB } from "@/lib/db";
import { Project, type ProjectCategory } from "@/models";
import { loadSolutionPageForAdmin } from "../_components/load-solution-page";
import { SolutionPageForm } from "../_components/solution-page-form";

async function loadProjects(): Promise<ProjectRow[]> {
  await connectDB();
  const docs = await Project.find().sort({ order: 1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    slug: d.slug,
    title: { id: d.title.id, en: d.title.en },
    summary: { id: d.summary.id, en: d.summary.en },
    image: d.image,
    client: d.client ?? "",
    year: d.year,
    category: d.category as ProjectCategory,
    about: { id: d.about?.id ?? "", en: d.about?.en ?? "" },
    scopeOfWork: { id: d.scopeOfWork?.id ?? "", en: d.scopeOfWork?.en ?? "" },
    isHighlighted: d.isHighlighted ?? false,
    highlightOrder: d.highlightOrder ?? 0,
    order: d.order ?? 0,
    isPublished: d.isPublished ?? true,
  }));
}

export default async function EpcAdminPage() {
  const [page, projects, locale, t] = await Promise.all([
    loadSolutionPageForAdmin("epc"),
    loadProjects(),
    getLocale(),
    getTranslations("Admin"),
  ]);
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
            content: <ProjectsManager initial={projects} />,
          },
        ]}
      />
    </div>
  );
}
