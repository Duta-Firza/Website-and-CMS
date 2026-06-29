import { connectDB } from "@/lib/db";
import {
  ABOUT_PAGE_ID,
  AboutPage,
  AboutSubPage,
  type AboutSubPageSlug,
  type AboutSubPageStatus,
  AffiliatedBusiness,
  Credential,
  type CredentialType,
  HistoryEntry,
  LeadershipMember,
  type LeadershipType,
  type SectionMode,
} from "@/models";
import { type Locale, localize } from "./localize";

export interface AboutValueItem {
  title: string;
  description: string;
}

export interface HoldingDivisionData {
  key: string;
  label: string;
}

export interface AboutPageData {
  intro: string;
  videoUrl: string;
  videoAutoplay: boolean;
  vision: string;
  mission: string;
  values: AboutValueItem[];
  // /about/business sections
  coreBusinessTitle: string;
  coreBusinessDescription: string;
  affiliatedBusinessTitle: string;
  affiliatedBusinessDescription: string;
  holdingStructureLabel: string;
  holdingGroupLabel: string;
  holdingDivisions: HoldingDivisionData[];
  // /about/leadership section labels
  boardOfDirectorsLabel: string;
  boardOfCommissionersLabel: string;
}

const EMPTY_ABOUT: AboutPageData = {
  intro: "",
  videoUrl: "",
  videoAutoplay: false,
  vision: "",
  mission: "",
  values: [],
  coreBusinessTitle: "",
  coreBusinessDescription: "",
  affiliatedBusinessTitle: "",
  affiliatedBusinessDescription: "",
  holdingStructureLabel: "",
  holdingGroupLabel: "",
  holdingDivisions: [],
  boardOfDirectorsLabel: "",
  boardOfCommissionersLabel: "",
};

const EMPTY_LOCALIZED = { id: "", en: "" };

export async function getAboutPage(locale: Locale): Promise<AboutPageData> {
  await connectDB();
  const doc = await AboutPage.findById(ABOUT_PAGE_ID).lean();
  if (!doc) return EMPTY_ABOUT;
  const divisions = Array.isArray(doc.holdingDivisions)
    ? doc.holdingDivisions.map((d: { key?: string; label?: unknown }) => ({
        key: d.key ?? "",
        label: d.label ?? EMPTY_LOCALIZED,
      }))
    : [];
  return {
    ...localize(
      {
        intro: doc.intro ?? EMPTY_LOCALIZED,
        videoUrl: doc.videoUrl ?? "",
        videoAutoplay: doc.videoAutoplay ?? false,
        vision: doc.vision ?? EMPTY_LOCALIZED,
        mission: doc.mission ?? EMPTY_LOCALIZED,
        values: Array.isArray(doc.values)
          ? doc.values.map((v: { title?: unknown; description?: unknown }) => ({
              title: v.title ?? EMPTY_LOCALIZED,
              description: v.description ?? EMPTY_LOCALIZED,
            }))
          : [],
        coreBusinessTitle: doc.coreBusinessTitle ?? EMPTY_LOCALIZED,
        coreBusinessDescription: doc.coreBusinessDescription ?? EMPTY_LOCALIZED,
        affiliatedBusinessTitle: doc.affiliatedBusinessTitle ?? EMPTY_LOCALIZED,
        affiliatedBusinessDescription: doc.affiliatedBusinessDescription ?? EMPTY_LOCALIZED,
        holdingStructureLabel: doc.holdingStructureLabel ?? EMPTY_LOCALIZED,
        holdingGroupLabel: doc.holdingGroupLabel ?? EMPTY_LOCALIZED,
        boardOfDirectorsLabel: doc.boardOfDirectorsLabel ?? EMPTY_LOCALIZED,
        boardOfCommissionersLabel: doc.boardOfCommissionersLabel ?? EMPTY_LOCALIZED,
      },
      locale,
    ),
    holdingDivisions: divisions.map((d: { key: string; label: unknown }) => ({
      key: d.key,
      label: localize(d.label, locale),
    })),
  };
}

export interface LeadershipMemberData {
  id: string;
  name: string;
  title: string;
  bio: string;
  photoUrl: string;
  type: LeadershipType;
  order: number;
}

export async function getLeadership(
  locale: Locale,
  type?: LeadershipType,
): Promise<LeadershipMemberData[]> {
  await connectDB();
  const query: Record<string, unknown> = { isActive: true };
  if (type) query.type = type;
  const docs = await LeadershipMember.find(query).sort({ order: 1 }).lean();
  return docs.map((d) =>
    localize(
      {
        id: String(d._id),
        name: d.name,
        title: d.title,
        bio: d.bio ?? { id: "", en: "" },
        photoUrl: d.photoUrl ?? "",
        type: d.type as LeadershipType,
        order: d.order ?? 0,
      },
      locale,
    ),
  );
}

export interface HistoryEntryData {
  id: string;
  year: string;
  title: string;
  description: string;
  imageUrl: string;
  order: number;
}

export async function getHistory(locale: Locale): Promise<HistoryEntryData[]> {
  await connectDB();
  const docs = await HistoryEntry.find().sort({ order: 1 }).lean();
  return docs.map((d) =>
    localize(
      {
        id: String(d._id),
        year: d.year,
        title: d.title,
        description: d.description ?? { id: "", en: "" },
        imageUrl: d.imageUrl ?? "",
        order: d.order ?? 0,
      },
      locale,
    ),
  );
}

export interface AffiliatedBusinessData {
  id: string;
  name: string;
  logoUrl: string;
  description: string;
  websiteUrl: string;
  order: number;
}

export async function getAffiliatedBusinesses(locale: Locale): Promise<AffiliatedBusinessData[]> {
  await connectDB();
  const docs = await AffiliatedBusiness.find().sort({ order: 1 }).lean();
  return docs.map((d) =>
    localize(
      {
        id: String(d._id),
        name: d.name,
        logoUrl: d.logoUrl ?? "",
        description: d.description ?? { id: "", en: "" },
        websiteUrl: d.websiteUrl ?? "",
        order: d.order ?? 0,
      },
      locale,
    ),
  );
}

export interface CredentialData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  type: CredentialType;
  issuer: string;
  year: number | undefined;
  order: number;
}

export async function getCredentials(
  locale: Locale,
  type?: CredentialType,
): Promise<CredentialData[]> {
  await connectDB();
  const query: Record<string, unknown> = {};
  if (type) query.type = type;
  const docs = await Credential.find(query).sort({ order: 1 }).lean();
  return docs.map((d) =>
    localize(
      {
        id: String(d._id),
        title: d.title,
        description: d.description ?? { id: "", en: "" },
        imageUrl: d.imageUrl ?? "",
        type: d.type as CredentialType,
        issuer: d.issuer ?? "",
        year: d.year,
        order: d.order ?? 0,
      },
      locale,
    ),
  );
}

// ─── About sub-page metadata (status + hero + body + modes) ─────────────────
export interface AboutSubPageMeta {
  status: AboutSubPageStatus;
  heroMode: SectionMode;
  bodyMode: SectionMode;
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };
  body: {
    heading: string;
    content: string;
  };
}

const EMPTY_META: AboutSubPageMeta = {
  status: "published",
  heroMode: "default",
  bodyMode: "default",
  hero: { eyebrow: "", title: "", subtitle: "" },
  body: { heading: "", content: "" },
};

export async function getAboutSubPage(
  slug: AboutSubPageSlug,
  locale: Locale,
): Promise<AboutSubPageMeta> {
  await connectDB();
  const subDoc = await AboutSubPage.findById(slug).lean<{
    _id?: string;
    status?: AboutSubPageStatus;
    heroMode?: SectionMode;
    bodyMode?: SectionMode;
    hero?: { eyebrow?: unknown; title?: unknown; subtitle?: unknown };
    body?: { heading?: unknown; content?: unknown };
  } | null>();

  if (!subDoc) return EMPTY_META;

  const localized = localize(
    {
      eyebrow: subDoc.hero?.eyebrow ?? { id: "", en: "" },
      title: subDoc.hero?.title ?? { id: "", en: "" },
      subtitle: subDoc.hero?.subtitle ?? { id: "", en: "" },
      heading: subDoc.body?.heading ?? { id: "", en: "" },
      content: subDoc.body?.content ?? { id: "", en: "" },
    },
    locale,
  ) as {
    eyebrow: string;
    title: string;
    subtitle: string;
    heading: string;
    content: string;
  };

  return {
    status: subDoc.status ?? "published",
    heroMode: subDoc.heroMode ?? "default",
    bodyMode: subDoc.bodyMode ?? "default",
    hero: {
      eyebrow: localized.eyebrow,
      title: localized.title,
      subtitle: localized.subtitle,
    },
    body: { heading: localized.heading, content: localized.content },
  };
}
