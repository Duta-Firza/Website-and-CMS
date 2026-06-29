import { connectDB } from "@/lib/db";
import { Project, type ProjectCategory } from "@/models";
import type { AdminListParams, PaginateResult } from "./list-params";

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

function mapProject(d: Record<string, unknown>): ProjectRow {
  // biome-ignore lint/suspicious/noExplicitAny: lean() doc shape is validated against the schema elsewhere
  const x = d as any;
  return {
    id: String(x._id),
    slug: x.slug,
    title: { id: x.title.id, en: x.title.en },
    summary: { id: x.summary.id, en: x.summary.en },
    image: x.image,
    client: x.client ?? "",
    year: x.year,
    category: x.category as ProjectCategory,
    about: { id: x.about?.id ?? "", en: x.about?.en ?? "" },
    scopeOfWork: { id: x.scopeOfWork?.id ?? "", en: x.scopeOfWork?.en ?? "" },
    isHighlighted: x.isHighlighted ?? false,
    highlightOrder: x.highlightOrder ?? 0,
    order: x.order ?? 0,
    isPublished: x.isPublished ?? true,
  };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Server-side projects query: filter / sort / pagination run in MongoDB
 * (`countDocuments` + `skip`/`limit`), so only the requested page is read for
 * the table. A lightweight `_id`/`slug` projection is read separately to back
 * drag-reorder reconstruction and slug de-duplication in the create dialog.
 */
export async function loadAdminProjects(
  params: AdminListParams,
  locale: string,
): Promise<PaginateResult<ProjectRow> & { allSlugs: string[] }> {
  await connectDB();

  // biome-ignore lint/suspicious/noExplicitAny: Mongoose filter shape is built dynamically
  const filter: Record<string, any> = {};
  if (params.filter !== "all") filter.category = params.filter;
  if (params.status === "published") filter.isPublished = { $ne: false };
  else if (params.status === "unpublished") filter.isPublished = false;
  if (params.q) {
    const rx = new RegExp(escapeRegExp(params.q), "i");
    filter.$or = [
      { "title.id": rx },
      { "title.en": rx },
      { "summary.id": rx },
      { "summary.en": rx },
      { client: rx },
      { slug: rx },
    ];
  }

  const titleField = `title.${locale === "en" ? "en" : "id"}`;
  const sortByTitle = params.sort === "titleAsc" || params.sort === "titleDesc";
  let sort: Record<string, 1 | -1>;
  switch (params.sort) {
    case "titleAsc":
      sort = { [titleField]: 1, _id: 1 };
      break;
    case "titleDesc":
      sort = { [titleField]: -1, _id: 1 };
      break;
    case "yearNewest":
      sort = { year: -1, order: 1 };
      break;
    case "yearOldest":
      sort = { year: 1, order: 1 };
      break;
    default:
      sort = { order: 1 };
  }

  const total = await Project.countDocuments(filter);
  const pageCount = Math.max(1, Math.ceil(total / params.pageSize));
  const page = Math.min(params.page, pageCount);
  const skip = (page - 1) * params.pageSize;

  let query = Project.find(filter).sort(sort).skip(skip).limit(params.pageSize);
  // Case-insensitive alphabetical ordering for the title sorts.
  if (sortByTitle) query = query.collation({ locale: "en", strength: 2 });
  const docs = await query.lean();
  const items = docs.map((d) => mapProject(d as Record<string, unknown>));

  // Full canonical-order id/slug index (tiny projection) for reorder + dedup.
  const index = await Project.find({}, { slug: 1 })
    .sort({ order: 1 })
    .lean<{ _id: unknown; slug: string }[]>();

  return {
    items,
    total,
    allIds: index.map((d) => String(d._id)),
    allSlugs: index.map((d) => d.slug),
  };
}
