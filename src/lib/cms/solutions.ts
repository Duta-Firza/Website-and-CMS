import { cache } from "react";
import { connectDB } from "@/lib/db";
import {
  Partner,
  Product,
  Project,
  type SectionMode,
  SOLUTION_PAGE_SLUGS,
  SolutionPage,
  type SolutionPageSlug,
  type SolutionPageStatus,
} from "@/models";
import { DEFAULT_FORM_SETTINGS, type FormField, type FormSettings } from "./form-fields";
import { type Locale, localize } from "./localize";

const EMPTY_LOCALIZED = { id: "", en: "" };

export interface SolutionPageData {
  slug: SolutionPageSlug;
  status: SolutionPageStatus;
  heroMode: SectionMode;
  bodyMode: SectionMode;
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    backgroundImage: string;
  };
  body: {
    heading: string;
    content: string;
  };
  inquiryFormEnabled: boolean;
  comingSoonMessage: string;
}

function emptyPage(slug: SolutionPageSlug): SolutionPageData {
  return {
    slug,
    status: "comingSoon",
    heroMode: "default",
    bodyMode: "default",
    hero: { eyebrow: "", title: "", subtitle: "", backgroundImage: "" },
    body: { heading: "", content: "" },
    inquiryFormEnabled: true,
    comingSoonMessage: "",
  };
}

export async function getSolutionPage(
  slug: SolutionPageSlug,
  locale: Locale,
): Promise<SolutionPageData> {
  await connectDB();
  const doc = await SolutionPage.findById(slug).lean<{
    _id: string;
    status: SolutionPageStatus;
    heroMode?: SectionMode;
    bodyMode?: SectionMode;
    hero?: { eyebrow?: unknown; title?: unknown; subtitle?: unknown; backgroundImage?: string };
    body?: { heading?: unknown; content?: unknown };
    inquiryFormEnabled?: boolean;
    comingSoonMessage?: unknown;
  } | null>();
  if (!doc) return emptyPage(slug);
  const localized = localize(
    {
      hero: {
        eyebrow: doc.hero?.eyebrow ?? EMPTY_LOCALIZED,
        title: doc.hero?.title ?? EMPTY_LOCALIZED,
        subtitle: doc.hero?.subtitle ?? EMPTY_LOCALIZED,
      },
      body: {
        heading: doc.body?.heading ?? EMPTY_LOCALIZED,
        content: doc.body?.content ?? EMPTY_LOCALIZED,
      },
      comingSoonMessage: doc.comingSoonMessage ?? EMPTY_LOCALIZED,
    },
    locale,
  ) as unknown as {
    hero: { eyebrow: string; title: string; subtitle: string };
    body: { heading: string; content: string };
    comingSoonMessage: string;
  };
  return {
    slug,
    status: doc.status ?? "comingSoon",
    heroMode: doc.heroMode ?? "default",
    bodyMode: doc.bodyMode ?? "default",
    hero: {
      ...localized.hero,
      backgroundImage: doc.hero?.backgroundImage ?? "",
    },
    body: localized.body,
    inquiryFormEnabled: doc.inquiryFormEnabled ?? true,
    comingSoonMessage: localized.comingSoonMessage,
  };
}

export type SolutionPageVisibilityMap = Record<SolutionPageSlug, SolutionPageStatus>;

/**
 * Single batch read of status for every solutions page. Wrapped in React `cache`
 * so the public layout + every solutions page render in one request share one
 * DB round-trip.
 */
export interface LocalizedFormField {
  key: string;
  label: string;
  placeholder: string;
  type: FormField["type"];
  required: boolean;
  order: number;
  options: { value: string; label: string }[];
}

export interface LocalizedFormSettings {
  enabled: boolean;
  submitLabel: string;
  successMessage: string;
  fields: LocalizedFormField[];
}

function pickLocale(field: { id?: string; en?: string } | undefined, locale: Locale): string {
  if (!field) return "";
  const primary = locale === "en" ? field.en : field.id;
  if (primary?.trim()) return primary;
  const fallback = locale === "en" ? field.id : field.en;
  return fallback ?? "";
}

export async function getSolutionPageFormSettings(
  slug: SolutionPageSlug,
  locale: Locale,
): Promise<LocalizedFormSettings> {
  await connectDB();
  const doc = await SolutionPage.findById(slug)
    .select("formSettings inquiryFormEnabled")
    .lean<{ formSettings?: Partial<FormSettings>; inquiryFormEnabled?: boolean } | null>();
  const raw = doc?.formSettings ?? {};
  const fallbackEnabled = doc?.inquiryFormEnabled ?? true;
  const rawFields =
    Array.isArray(raw.fields) && raw.fields.length > 0
      ? (raw.fields as FormField[])
      : DEFAULT_FORM_SETTINGS.fields;
  const fields: LocalizedFormField[] = [...rawFields]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((f) => ({
      key: f.key,
      label: pickLocale(f.label, locale),
      placeholder: pickLocale(f.placeholder, locale),
      type: f.type ?? "text",
      required: Boolean(f.required),
      order: f.order ?? 0,
      options: (f.options ?? []).map((o) => ({
        value: o.value,
        label: pickLocale(o.label, locale),
      })),
    }));
  return {
    enabled: raw.enabled ?? fallbackEnabled,
    submitLabel:
      pickLocale(raw.submitLabel, locale) || pickLocale(DEFAULT_FORM_SETTINGS.submitLabel, locale),
    successMessage:
      pickLocale(raw.successMessage, locale) ||
      pickLocale(DEFAULT_FORM_SETTINGS.successMessage, locale),
    fields,
  };
}

export const getSolutionPageVisibilityMap = cache(async (): Promise<SolutionPageVisibilityMap> => {
  await connectDB();
  const docs = await SolutionPage.find({ _id: { $in: SOLUTION_PAGE_SLUGS } })
    .select("_id status")
    .lean<{ _id: SolutionPageSlug; status: SolutionPageStatus }[]>();
  const map = Object.fromEntries(
    SOLUTION_PAGE_SLUGS.map((s) => [s, "comingSoon"]),
  ) as SolutionPageVisibilityMap;
  for (const d of docs) {
    map[d._id] = d.status ?? "comingSoon";
  }
  return map;
});

export interface ProductPrincipleData {
  partnerId: string | null;
  name: string;
  logoUrl: string;
}

export interface ProductItemData {
  name: string;
  photos: string[];
}

export interface ProductData {
  id: string;
  principles: ProductPrincipleData[];
  origin: string;
  productType: string;
  skuCount: number;
  partnershipStart: number | null;
  items: ProductItemData[];
  order: number;
  isActive: boolean;
}

interface RawProductDoc {
  _id: unknown;
  // new fields
  principles?: { partnerId?: unknown; name?: string; logoUrl?: string }[];
  origin?: string;
  items?: { name?: unknown; photos?: string[] }[];
  // legacy fields
  partnerId?: unknown;
  principleOverride?: { name?: string; logoUrl?: string; origin?: string };
  photos?: string[];
  // shared
  productType?: unknown;
  skuCount?: number;
  partnershipStart?: number | null;
  order?: number;
  isActive?: boolean;
}

type PartnerLookup = Map<string, { name: string; logoUrl: string }>;

export async function getPublishedProducts(locale: Locale): Promise<ProductData[]> {
  await connectDB();
  // Single read of all active products; partners are joined in a second
  // round-trip rather than via populate() so the query doesn't depend on
  // Mongoose strict-populate or HMR-cached schema state.
  const docs = await Product.find({ isActive: true }).sort({ order: 1 }).lean<RawProductDoc[]>();

  const partnerIds = new Set<string>();
  for (const d of docs) {
    if (d.partnerId) partnerIds.add(String(d.partnerId));
    for (const p of d.principles ?? []) {
      if (p.partnerId) partnerIds.add(String(p.partnerId));
    }
  }
  const partnerDocs = partnerIds.size
    ? await Partner.find({ _id: { $in: [...partnerIds] } })
        .select("_id name logoUrl")
        .lean<{ _id: unknown; name?: string; logoUrl?: string }[]>()
    : [];
  const partners: PartnerLookup = new Map(
    partnerDocs.map((p) => [String(p._id), { name: p.name ?? "", logoUrl: p.logoUrl ?? "" }]),
  );

  return docs.map((d) => mapProductDoc(d, partners, locale));
}

function mapProductDoc(d: RawProductDoc, partners: PartnerLookup, locale: Locale): ProductData {
  // Principles: prefer the new array; fall back to legacy single principle.
  const principles: ProductPrincipleData[] = (() => {
    if (Array.isArray(d.principles) && d.principles.length > 0) {
      return d.principles.map((p) => {
        const partner = p.partnerId ? partners.get(String(p.partnerId)) : undefined;
        return {
          partnerId: p.partnerId ? String(p.partnerId) : null,
          name: partner?.name || p.name || "",
          logoUrl: partner?.logoUrl || p.logoUrl || "",
        };
      });
    }
    const legacyPartner = d.partnerId ? partners.get(String(d.partnerId)) : undefined;
    const override = d.principleOverride ?? {};
    if (d.partnerId || override.name || override.logoUrl) {
      return [
        {
          partnerId: d.partnerId ? String(d.partnerId) : null,
          name: legacyPartner?.name || override.name || "",
          logoUrl: legacyPartner?.logoUrl || override.logoUrl || "",
        },
      ];
    }
    return [];
  })();

  // Items: prefer the new array; fall back to wrapping legacy photos[] as a
  // single unnamed item.
  const rawItems: ProductItemData[] = (() => {
    if (Array.isArray(d.items) && d.items.length > 0) {
      return d.items.map((it) => ({
        // localized name — pass through localize() below
        name: (it.name ?? EMPTY_LOCALIZED) as unknown as string,
        photos: Array.isArray(it.photos) ? it.photos : [],
      }));
    }
    if (Array.isArray(d.photos) && d.photos.length > 0) {
      return [{ name: "" as unknown as string, photos: d.photos }];
    }
    return [];
  })();

  const origin = d.origin || d.principleOverride?.origin || "";

  return localize(
    {
      id: String(d._id),
      principles,
      origin,
      productType: d.productType ?? EMPTY_LOCALIZED,
      skuCount: d.skuCount ?? 0,
      partnershipStart: d.partnershipStart ?? null,
      items: rawItems,
      order: d.order ?? 0,
      isActive: d.isActive ?? true,
    },
    locale,
  ) as unknown as ProductData;
}

export interface EpcProjectData {
  id: string;
  slug: string;
  title: string;
  summary: string;
  image: string;
  client: string;
  year: number | undefined;
}

export async function getPublishedEpcProjects(locale: Locale): Promise<EpcProjectData[]> {
  await connectDB();
  const docs = await Project.find({ category: "epc", isPublished: true }).sort({ order: 1 }).lean();
  return docs.map((d) =>
    localize(
      {
        id: String(d._id),
        slug: d.slug,
        title: d.title,
        summary: d.summary,
        image: d.image,
        client: d.client ?? "",
        year: d.year,
      },
      locale,
    ),
  );
}
