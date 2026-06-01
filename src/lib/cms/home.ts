import { connectDB } from "@/lib/db";
import {
  Customer,
  HOME_HERO_ID,
  HomeHero,
  Partner,
  Project,
  ReachPoint,
  Solution,
  Stat,
} from "@/models";
import { type Locale, localize } from "./localize";

export interface HeroData {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  backgroundImage: string;
}

export async function getHomeHero(locale: Locale): Promise<HeroData> {
  await connectDB();
  const doc = await HomeHero.findById(HOME_HERO_ID).lean();
  if (!doc) {
    return {
      title: "",
      subtitle: "",
      ctaLabel: "",
      ctaHref: "/contact",
      backgroundImage: "/images/landing/hero-placeholder.jpg",
    };
  }
  return localize(
    {
      title: doc.title,
      subtitle: doc.subtitle,
      ctaLabel: doc.ctaLabel,
      ctaHref: doc.ctaHref,
      backgroundImage: doc.backgroundImage,
    },
    locale,
  );
}

export interface StatData {
  id: string;
  label: string;
  prefix: string;
  value: number;
  suffix: string;
  order: number;
}

export async function getStats(locale: Locale): Promise<StatData[]> {
  await connectDB();
  const docs = await Stat.find().sort({ order: 1 }).lean();
  return docs.map((d) =>
    localize(
      {
        id: String(d._id),
        label: d.label,
        prefix: d.prefix ?? "",
        value: d.value,
        suffix: d.suffix ?? "",
        order: d.order,
      },
      locale,
    ),
  );
}

export interface PartnerData {
  id: string;
  name: string;
  logoUrl: string;
  summary: string;
  websiteUrl: string;
  invertOnDark: boolean;
}

export async function getActivePartners(locale: Locale): Promise<PartnerData[]> {
  await connectDB();
  const docs = await Partner.find({ isActive: true }).sort({ order: 1 }).lean();
  return docs.map((d) =>
    localize(
      {
        id: String(d._id),
        name: d.name,
        logoUrl: d.logoUrl,
        summary: d.summary,
        websiteUrl: d.websiteUrl ?? "",
        invertOnDark: d.invertOnDark ?? false,
      },
      locale,
    ),
  );
}

export interface SolutionData {
  id: string;
  key: string;
  title: string;
  description: string;
  iconName: string;
  href: string;
  order: number;
}

export async function getSolutions(locale: Locale): Promise<SolutionData[]> {
  await connectDB();
  const docs = await Solution.find().sort({ order: 1 }).lean();
  return docs.map((d) =>
    localize(
      {
        id: String(d._id),
        key: d.key,
        title: d.title,
        description: d.description,
        iconName: d.iconName,
        href: d.href,
        order: d.order,
      },
      locale,
    ),
  );
}

export interface ProjectHighlightData {
  id: string;
  slug: string;
  title: string;
  summary: string;
  image: string;
  client: string;
  year: number | undefined;
  category: string;
}

export async function getHighlightedProjects(
  locale: Locale,
  limit = 4,
): Promise<ProjectHighlightData[]> {
  await connectDB();
  const docs = await Project.find({ isHighlighted: true, isPublished: true })
    .sort({ highlightOrder: 1 })
    .limit(limit)
    .lean();
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
        category: d.category,
      },
      locale,
    ),
  );
}

export interface CustomerData {
  id: string;
  name: string;
  logoUrl: string;
  invertOnDark: boolean;
}

export async function getCustomers(): Promise<CustomerData[]> {
  await connectDB();
  const docs = await Customer.find().sort({ order: 1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    name: d.name,
    logoUrl: d.logoUrl,
    invertOnDark: d.invertOnDark ?? false,
  }));
}

export interface ReachPointData {
  id: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
}

export async function getReachPoints(): Promise<ReachPointData[]> {
  await connectDB();
  const docs = await ReachPoint.find().sort({ order: 1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    city: d.city,
    province: d.province,
    latitude: d.latitude,
    longitude: d.longitude,
  }));
}
