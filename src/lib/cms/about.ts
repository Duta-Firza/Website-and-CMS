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
  vision: string;
  mission: string;
  values: AboutValueItem[];
  coreBusinessTitle: string;
  coreBusinessDescription: string;
  affiliatedBusinessTitle: string;
  affiliatedBusinessDescription: string;
  // Title overrides (empty string → caller should fall back to i18n)
  whoWeAreTitle: string;
  leadershipTitle: string;
  historyTitle: string;
  businessTitle: string;
  credentialsTitle: string;
  // Label overrides
  holdingStructureLabel: string;
  holdingGroupLabel: string;
  boardOfDirectorsLabel: string;
  boardOfCommissionersLabel: string;
  // Holding diagram divisions — when non-empty, replaces hardcoded epc/trading/manufacturing
  holdingDivisions: HoldingDivisionData[];
}

const EMPTY_ABOUT: AboutPageData = {
  intro: "",
  videoUrl: "",
  vision: "",
  mission: "",
  values: [],
  coreBusinessTitle: "",
  coreBusinessDescription: "",
  affiliatedBusinessTitle: "",
  affiliatedBusinessDescription: "",
  whoWeAreTitle: "",
  leadershipTitle: "",
  historyTitle: "",
  businessTitle: "",
  credentialsTitle: "",
  holdingStructureLabel: "",
  holdingGroupLabel: "",
  boardOfDirectorsLabel: "",
  boardOfCommissionersLabel: "",
  holdingDivisions: [],
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
        whoWeAreTitle: doc.whoWeAreTitle ?? EMPTY_LOCALIZED,
        leadershipTitle: doc.leadershipTitle ?? EMPTY_LOCALIZED,
        historyTitle: doc.historyTitle ?? EMPTY_LOCALIZED,
        businessTitle: doc.businessTitle ?? EMPTY_LOCALIZED,
        credentialsTitle: doc.credentialsTitle ?? EMPTY_LOCALIZED,
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

// ─── About sub-page metadata (status + hero + body) ─────────────────────────
export interface AboutSubPageMeta {
  status: AboutSubPageStatus;
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

// Slug → legacy AboutPage override field. The override predates the
// dedicated AboutSubPage doc; we keep reading from it so existing CMS content
// keeps showing until the editor saves a fresh AboutSubPage.
const LEGACY_TITLE_FIELD: Record<AboutSubPageSlug, string> = {
  "who-we-are": "whoWeAreTitle",
  leadership: "leadershipTitle",
  history: "historyTitle",
  business: "businessTitle",
  credentials: "credentialsTitle",
};

const EMPTY_META: AboutSubPageMeta = {
  status: "published",
  hero: { eyebrow: "", title: "", subtitle: "" },
  body: { heading: "", content: "" },
};

export async function getAboutSubPage(
  slug: AboutSubPageSlug,
  locale: Locale,
): Promise<AboutSubPageMeta> {
  await connectDB();
  const [subDoc, aboutDoc] = await Promise.all([
    AboutSubPage.findById(slug).lean<{
      _id?: string;
      status?: AboutSubPageStatus;
      hero?: { eyebrow?: unknown; title?: unknown; subtitle?: unknown };
      body?: { heading?: unknown; content?: unknown };
    } | null>(),
    AboutPage.findById(ABOUT_PAGE_ID)
      .select(`${LEGACY_TITLE_FIELD[slug]}`)
      .lean<Record<string, unknown> | null>(),
  ]);

  if (!subDoc) {
    const legacyTitle = aboutDoc?.[LEGACY_TITLE_FIELD[slug]] as
      | { id?: string; en?: string }
      | undefined;
    return {
      ...EMPTY_META,
      hero: {
        ...EMPTY_META.hero,
        title: localize(legacyTitle ?? { id: "", en: "" }, locale) as string,
      },
    };
  }

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

  // If the new doc's title is still blank, fall back to the legacy override.
  let title = localized.title;
  if (!title.trim()) {
    const legacyTitle = aboutDoc?.[LEGACY_TITLE_FIELD[slug]] as
      | { id?: string; en?: string }
      | undefined;
    if (legacyTitle) title = localize(legacyTitle, locale) as string;
  }

  return {
    status: subDoc.status ?? "published",
    hero: { eyebrow: localized.eyebrow, title, subtitle: localized.subtitle },
    body: { heading: localized.heading, content: localized.content },
  };
}
