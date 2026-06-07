import { cache } from "react";
import { connectDB } from "@/lib/db";
import "@/models/partner"; // ensure Partner model is registered for populate("partnerId")
import {
  Product,
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

export interface ProductData {
  id: string;
  partnerId: string | null;
  principle: {
    name: string;
    logoUrl: string;
    origin: string;
  };
  productType: string;
  skuCount: number;
  partnershipStart: number | null;
  photos: string[];
  order: number;
  isActive: boolean;
}

export async function getPublishedProducts(locale: Locale): Promise<ProductData[]> {
  await connectDB();
  const docs = await Product.find({ isActive: true })
    .sort({ order: 1 })
    .populate({ path: "partnerId", select: "name logoUrl" })
    .lean<
      {
        _id: unknown;
        partnerId?: { _id: unknown; name?: string; logoUrl?: string } | null;
        principleOverride?: { name?: string; logoUrl?: string; origin?: string };
        productType?: unknown;
        skuCount?: number;
        partnershipStart?: number | null;
        photos?: string[];
        order?: number;
        isActive?: boolean;
      }[]
    >();
  return docs.map((d) => {
    const partner = d.partnerId && typeof d.partnerId === "object" ? d.partnerId : null;
    const override = d.principleOverride ?? {};
    return localize(
      {
        id: String(d._id),
        partnerId: partner ? String(partner._id) : null,
        principle: {
          name: partner?.name ?? override.name ?? "",
          logoUrl: partner?.logoUrl ?? override.logoUrl ?? "",
          origin: override.origin ?? "",
        },
        productType: d.productType ?? EMPTY_LOCALIZED,
        skuCount: d.skuCount ?? 0,
        partnershipStart: d.partnershipStart ?? null,
        photos: Array.isArray(d.photos) ? d.photos : [],
        order: d.order ?? 0,
        isActive: d.isActive ?? true,
      },
      locale,
    ) as unknown as ProductData;
  });
}
