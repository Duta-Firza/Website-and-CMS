import { connectDB } from "@/lib/db";
import {
  IrSubPage,
  type IrSubPageSlug,
  type IrSubPageStatus,
  Publication,
  type PublicationCategory,
  Report,
  type ReportType,
  type SectionMode,
  SITE_SETTINGS_ID,
  SiteSettings,
} from "@/models";
import type { FormField, FormSettings } from "./form-fields";
import { type Locale, localize } from "./localize";
import { DEFAULT_REPORT_DOWNLOAD_FORM_SETTINGS } from "./report-download-form";
import type { LocalizedFormField, LocalizedFormSettings } from "./solutions";

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

export async function getPublication(
  slug: string,
  locale: Locale,
): Promise<PublicationData | null> {
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
  thumbnailUrl: string;
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
      thumbnailUrl: d.thumbnailUrl ?? "",
      publishedAt: d.publishedAt,
      isPublished: d.isPublished ?? true,
      order: d.order ?? 0,
    };
  });

  return { items, total, totalPages };
}

// ─── Report Download Gate form settings ───────────────────────────────────────

function pickLoc(field: { id?: string; en?: string } | undefined, locale: Locale): string {
  if (!field) return "";
  const primary = locale === "en" ? field.en : field.id;
  if (primary?.trim()) return primary;
  const fallback = locale === "en" ? field.id : field.en;
  return fallback ?? "";
}

/** Localized report download/view gate form config for the public reports page. */
export async function getReportDownloadFormSettings(
  locale: Locale,
): Promise<LocalizedFormSettings> {
  await connectDB();
  const doc = await IrSubPage.findById("reports")
    .select("formSettings")
    .lean<{ formSettings?: Partial<FormSettings> } | null>();
  const raw = doc?.formSettings ?? {};
  const rawFields =
    Array.isArray(raw.fields) && raw.fields.length > 0
      ? (raw.fields as FormField[])
      : DEFAULT_REPORT_DOWNLOAD_FORM_SETTINGS.fields;
  const fields: LocalizedFormField[] = [...rawFields]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((f) => ({
      key: f.key,
      label: pickLoc(f.label, locale),
      placeholder: pickLoc(f.placeholder, locale),
      type: f.type ?? "text",
      required: Boolean(f.required),
      order: f.order ?? 0,
      options: (f.options ?? []).map((o) => ({
        value: o.value,
        label: pickLoc(o.label, locale),
      })),
    }));
  return {
    enabled: raw.enabled ?? DEFAULT_REPORT_DOWNLOAD_FORM_SETTINGS.enabled,
    submitLabel:
      pickLoc(raw.submitLabel, locale) ||
      pickLoc(DEFAULT_REPORT_DOWNLOAD_FORM_SETTINGS.submitLabel, locale),
    successMessage:
      pickLoc(raw.successMessage, locale) ||
      pickLoc(DEFAULT_REPORT_DOWNLOAD_FORM_SETTINGS.successMessage, locale),
    fields,
  };
}

// ─── Company Profile URL ──────────────────────────────────────────────────────

export async function getCompanyProfileUrl(): Promise<string> {
  await connectDB();
  const doc = await SiteSettings.findById(SITE_SETTINGS_ID).select("companyProfileUrl").lean<{
    companyProfileUrl?: string;
  } | null>();
  return doc?.companyProfileUrl ?? "";
}
