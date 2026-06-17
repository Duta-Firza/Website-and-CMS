import { connectDB } from "@/lib/db";
import {
  type IrSubPageSlug,
  type IrSubPageStatus,
  IrSubPage,
  Publication,
  type PublicationCategory,
  Report,
  type ReportType,
  SITE_SETTINGS_ID,
  type SectionMode,
  SiteSettings,
} from "@/models";
import { type Locale, localize } from "./localize";

// ─── IrSubPage meta ──────────────────────────────────────────────────────────

export interface IrSubPageMeta {
  status: IrSubPageStatus;
  heroMode: SectionMode;
  bodyMode: SectionMode;
  hero: { eyebrow: string; title: string; subtitle: string };
  body: { heading: string; content: string };
}

const EMPTY_META: IrSubPageMeta = {
  status: "comingSoon",
  heroMode: "default",
  bodyMode: "disabled",
  hero: { eyebrow: "", title: "", subtitle: "" },
  body: { heading: "", content: "" },
};

export async function getIrSubPage(slug: IrSubPageSlug, locale: Locale): Promise<IrSubPageMeta> {
  await connectDB();
  const doc = await IrSubPage.findById(slug).lean<{
    status?: IrSubPageStatus;
    heroMode?: SectionMode;
    bodyMode?: SectionMode;
    hero?: { eyebrow?: unknown; title?: unknown; subtitle?: unknown };
    body?: { heading?: unknown; content?: unknown };
  } | null>();

  if (!doc) return EMPTY_META;

  const localized = localize(
    {
      eyebrow: doc.hero?.eyebrow ?? { id: "", en: "" },
      title: doc.hero?.title ?? { id: "", en: "" },
      subtitle: doc.hero?.subtitle ?? { id: "", en: "" },
      heading: doc.body?.heading ?? { id: "", en: "" },
      content: doc.body?.content ?? { id: "", en: "" },
    },
    locale,
  ) as { eyebrow: string; title: string; subtitle: string; heading: string; content: string };

  return {
    status: doc.status ?? "comingSoon",
    heroMode: doc.heroMode ?? "default",
    bodyMode: doc.bodyMode ?? "disabled",
    hero: { eyebrow: localized.eyebrow, title: localized.title, subtitle: localized.subtitle },
    body: { heading: localized.heading, content: localized.content },
  };
}

// ─── Publications ─────────────────────────────────────────────────────────────

export interface PublicationData {
  id: string;
  slug: string;
  category: PublicationCategory;
  title: string;
  summary: string;
  body: string;
  imageUrl: string;
  originalUrl: string;
  publishedAt: Date;
  isPublished: boolean;
  order: number;
}

export interface PaginatedPublications {
  items: PublicationData[];
  total: number;
  totalPages: number;
}

export async function getPublications(
  locale: Locale,
  category: PublicationCategory,
  publishedOnly = true,
  pagination?: { page: number; limit: number },
): Promise<PaginatedPublications> {
  await connectDB();
  const query: Record<string, unknown> = { category };
  if (publishedOnly) query.isPublished = true;

  const total = await Publication.countDocuments(query);

  let dbQuery = Publication.find(query).sort({ publishedAt: -1, order: 1 });

  let totalPages = 1;
  if (pagination) {
    const { page, limit } = pagination;
    totalPages = Math.max(1, Math.ceil(total / limit));
    dbQuery = dbQuery.skip((page - 1) * limit).limit(limit) as typeof dbQuery;
  }

  const docs = await dbQuery.lean();

  const items = docs.map((d) => {
    const loc = localize(
      {
        title: d.title ?? { id: "", en: "" },
        summary: d.summary ?? { id: "", en: "" },
        body: d.body ?? { id: "", en: "" },
      },
      locale,
    ) as { title: string; summary: string; body: string };

    return {
      id: String(d._id),
      slug: d.slug,
      category: d.category as PublicationCategory,
      title: loc.title,
      summary: loc.summary,
      body: loc.body,
      imageUrl: d.imageUrl ?? "",
      originalUrl: d.originalUrl ?? "",
      publishedAt: d.publishedAt,
      isPublished: d.isPublished ?? false,
      order: d.order ?? 0,
    };
  });

  return { items, total, totalPages };
}

export async function getPublication(slug: string, locale: Locale): Promise<PublicationData | null> {
  await connectDB();
  const d = await Publication.findOne({ slug, isPublished: true }).lean();
  if (!d) return null;

  const loc = localize(
    {
      title: d.title ?? { id: "", en: "" },
      summary: d.summary ?? { id: "", en: "" },
      body: d.body ?? { id: "", en: "" },
    },
    locale,
  ) as { title: string; summary: string; body: string };

  return {
    id: String(d._id),
    slug: d.slug,
    category: d.category as PublicationCategory,
    title: loc.title,
    summary: loc.summary,
    body: loc.body,
    imageUrl: d.imageUrl ?? "",
    originalUrl: d.originalUrl ?? "",
    publishedAt: d.publishedAt,
    isPublished: d.isPublished ?? false,
    order: d.order ?? 0,
  };
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export interface ReportData {
  id: string;
  title: string;
  type: ReportType;
  year: number;
  description: string;
  fileUrl: string;
  publishedAt: Date;
  isPublished: boolean;
  order: number;
}

export interface PaginatedReports {
  items: ReportData[];
  total: number;
  totalPages: number;
}

export async function getReports(
  locale: Locale,
  type?: ReportType,
  publishedOnly = true,
  pagination?: { page: number; limit: number },
): Promise<PaginatedReports> {
  await connectDB();
  const query: Record<string, unknown> = {};
  if (type) query.type = type;
  if (publishedOnly) query.isPublished = true;

  const total = await Report.countDocuments(query);

  let dbQuery = Report.find(query).sort({ year: -1, order: 1 });

  let totalPages = 1;
  if (pagination) {
    const { page, limit } = pagination;
    totalPages = Math.max(1, Math.ceil(total / limit));
    dbQuery = dbQuery.skip((page - 1) * limit).limit(limit) as typeof dbQuery;
  }

  const docs = await dbQuery.lean();

  const items = docs.map((d) => {
    const loc = localize(
      {
        title: d.title ?? { id: "", en: "" },
        description: d.description ?? { id: "", en: "" },
      },
      locale,
    ) as { title: string; description: string };

    return {
      id: String(d._id),
      title: loc.title,
      type: d.type as ReportType,
      year: d.year,
      description: loc.description,
      fileUrl: d.fileUrl,
      publishedAt: d.publishedAt,
      isPublished: d.isPublished ?? true,
      order: d.order ?? 0,
    };
  });

  return { items, total, totalPages };
}

// ─── Company Profile URL ──────────────────────────────────────────────────────

export async function getCompanyProfileUrl(): Promise<string> {
  await connectDB();
  const doc = await SiteSettings.findById(SITE_SETTINGS_ID).select("companyProfileUrl").lean<{
    companyProfileUrl?: string;
  } | null>();
  return doc?.companyProfileUrl ?? "";
}
