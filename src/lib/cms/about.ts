import { connectDB } from "@/lib/db";
import {
  ABOUT_PAGE_ID,
  AboutPage,
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
};

export async function getAboutPage(locale: Locale): Promise<AboutPageData> {
  await connectDB();
  const doc = await AboutPage.findById(ABOUT_PAGE_ID).lean();
  if (!doc) return EMPTY_ABOUT;
  return localize(
    {
      intro: doc.intro ?? { id: "", en: "" },
      videoUrl: doc.videoUrl ?? "",
      vision: doc.vision ?? { id: "", en: "" },
      mission: doc.mission ?? { id: "", en: "" },
      values: Array.isArray(doc.values)
        ? doc.values.map((v: { title?: unknown; description?: unknown }) => ({
            title: v.title ?? { id: "", en: "" },
            description: v.description ?? { id: "", en: "" },
          }))
        : [],
      coreBusinessTitle: doc.coreBusinessTitle ?? { id: "", en: "" },
      coreBusinessDescription: doc.coreBusinessDescription ?? { id: "", en: "" },
      affiliatedBusinessTitle: doc.affiliatedBusinessTitle ?? { id: "", en: "" },
      affiliatedBusinessDescription: doc.affiliatedBusinessDescription ?? { id: "", en: "" },
    },
    locale,
  );
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
