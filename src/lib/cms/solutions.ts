import { cache } from "react";
import { connectDB } from "@/lib/db";
import "@/models/partner"; // ensure Partner model is registered for populate("partnerId")
import {
  Product,
  Project,
  SOLUTION_PAGE_SLUGS,
  SolutionPage,
  type SolutionPageSlug,
  type SolutionPageStatus,
} from "@/models";
import { type Locale, localize } from "./localize";

const EMPTY_LOCALIZED = { id: "", en: "" };

export interface SolutionPageData {
  slug: SolutionPageSlug;
  status: SolutionPageStatus;
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

type PartnerRef = { _id: unknown; name?: string; logoUrl?: string } | null | undefined;

interface ProductDocShape {
  _id: unknown;
  // new fields
  principles?: { partnerId?: PartnerRef; name?: string; logoUrl?: string }[];
  origin?: string;
  items?: { name?: unknown; photos?: string[] }[];
  // legacy fields
  partnerId?: PartnerRef;
  principleOverride?: { name?: string; logoUrl?: string; origin?: string };
  photos?: string[];
  // shared
  productType?: unknown;
  skuCount?: number;
  partnershipStart?: number | null;
  order?: number;
  isActive?: boolean;
}

export async function getPublishedProducts(locale: Locale): Promise<ProductData[]> {
  await connectDB();
  const docs = await Product.find({ isActive: true })
    .sort({ order: 1 })
    // Populate both the legacy single partnerId and the new principles[].partnerId
    // so getter doesn't issue a second round trip per row.
    .populate({ path: "partnerId", select: "name logoUrl" })
    .populate({ path: "principles.partnerId", select: "name logoUrl" })
    .lean<ProductDocShape[]>();

  return docs.map((d) => mapProductDoc(d, locale));
}

function mapProductDoc(d: ProductDocShape, locale: Locale): ProductData {
  // Principles: prefer the new array; fall back to legacy single principle.
  const principles: ProductPrincipleData[] = (() => {
    if (Array.isArray(d.principles) && d.principles.length > 0) {
      return d.principles.map((p) => {
        const partner = p.partnerId && typeof p.partnerId === "object" ? p.partnerId : null;
        return {
          partnerId: partner ? String(partner._id) : null,
          name: partner?.name ?? p.name ?? "",
          logoUrl: partner?.logoUrl ?? p.logoUrl ?? "",
        };
      });
    }
    const legacyPartner = d.partnerId && typeof d.partnerId === "object" ? d.partnerId : null;
    const override = d.principleOverride ?? {};
    if (legacyPartner || override.name || override.logoUrl) {
      return [
        {
          partnerId: legacyPartner ? String(legacyPartner._id) : null,
          name: legacyPartner?.name ?? override.name ?? "",
          logoUrl: legacyPartner?.logoUrl ?? override.logoUrl ?? "",
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
