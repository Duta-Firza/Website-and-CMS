import { getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { connectDB } from "@/lib/db";
import { Project, type ProjectCategory } from "@/models";
import { ProjectsManager } from "./projects-manager";

export interface ProjectRow {
  id: string;
  slug: string;
  title: { id: string; en: string };
  summary: { id: string; en: string };
  image: string;
  client: string;
  year: number | undefined;
  category: ProjectCategory;
  about: { id: string; en: string };
  scopeOfWork: { id: string; en: string };
  isHighlighted: boolean;
  highlightOrder: number;
  order: number;
  isPublished: boolean;
}

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

export default async function ProjectsAdminPage() {
  const projects = await loadProjects();
  const t = await getTranslations("Admin.pages.projects");
  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("title")} description={t("description")} />
      <ProjectsManager initial={projects} />
    </div>
  );
}
