import { connectDB } from "@/lib/db";
import { CAREER_PAGE_ID, CareerPage, JobOpening } from "@/models";
import type { LocalizedString } from "@/models/_shared";
import type { JobEmploymentType, PageStatus, SectionMode } from "@/models/constants";
import { type Locale, localize, pickLocale } from "./localize";

const EMPTY_LOCALIZED = { id: "", en: "" };

interface RawJobBoard {
  key?: string;
  label?: LocalizedString;
  url?: string;
  enabled?: boolean;
}

/** Seed boards shown in the admin editor (and as fallbacks) before any are saved. */
export const DEFAULT_JOB_BOARDS: RawJobBoard[] = [
  { key: "linkedin", label: { id: "LinkedIn", en: "LinkedIn" }, url: "", enabled: true },
  { key: "seek", label: { id: "Seek", en: "Seek" }, url: "", enabled: true },
  { key: "jobstreet", label: { id: "Jobstreet", en: "Jobstreet" }, url: "", enabled: true },
];

export interface JobBoardLink {
  key: string;
  label: string;
  url: string;
}

export interface BenefitItem {
  icon: string;
  title: string;
  description: string;
}

export interface CareerPageData {
  status: PageStatus;
  heroMode: SectionMode;
  bodyMode: SectionMode;
  hero: { eyebrow: string; title: string; subtitle: string };
  body: { heading: string; content: string };
  showJobBoards: boolean;
  jobBoards: JobBoardLink[];
  whyJoinMode: SectionMode;
  whyJoin: { heading: string; content: string };
  showBenefits: boolean;
  benefits: BenefitItem[];
  showOpenings: boolean;
}

interface RawCareerDoc {
  status?: PageStatus;
  heroMode?: SectionMode;
  bodyMode?: SectionMode;
  hero?: { eyebrow?: unknown; title?: unknown; subtitle?: unknown };
  body?: { heading?: unknown; content?: unknown };
  showJobBoards?: boolean;
  jobBoards?: RawJobBoard[];
  whyJoinMode?: SectionMode;
  whyJoin?: { heading?: unknown; content?: unknown };
  showBenefits?: boolean;
  benefits?: { icon?: string; title?: LocalizedString; description?: LocalizedString }[];
  showOpenings?: boolean;
}

export async function getCareerPage(locale: Locale): Promise<CareerPageData> {
  await connectDB();
  const doc = await CareerPage.findById(CAREER_PAGE_ID).lean<RawCareerDoc | null>();

  const localized = localize(
    {
      hero: {
        eyebrow: doc?.hero?.eyebrow ?? EMPTY_LOCALIZED,
        title: doc?.hero?.title ?? EMPTY_LOCALIZED,
        subtitle: doc?.hero?.subtitle ?? EMPTY_LOCALIZED,
      },
      body: {
        heading: doc?.body?.heading ?? EMPTY_LOCALIZED,
        content: doc?.body?.content ?? EMPTY_LOCALIZED,
      },
      whyJoin: {
        heading: doc?.whyJoin?.heading ?? EMPTY_LOCALIZED,
        content: doc?.whyJoin?.content ?? EMPTY_LOCALIZED,
      },
    },
    locale,
  ) as unknown as {
    hero: { eyebrow: string; title: string; subtitle: string };
    body: { heading: string; content: string };
    whyJoin: { heading: string; content: string };
  };

  const rawBoards = doc?.jobBoards?.length ? doc.jobBoards : DEFAULT_JOB_BOARDS;
  const jobBoards: JobBoardLink[] = rawBoards
    .filter((b) => b.enabled !== false)
    .map((b) => ({
      key: b.key ?? "",
      label: pickLocale(b.label, locale),
      url: b.url ?? "",
    }));

  const benefits: BenefitItem[] = (doc?.benefits ?? []).map((b) => ({
    icon: b.icon ?? "Award",
    title: pickLocale(b.title, locale),
    description: pickLocale(b.description, locale),
  }));

  return {
    status: doc?.status ?? "published",
    heroMode: doc?.heroMode ?? "default",
    bodyMode: doc?.bodyMode ?? "disabled",
    hero: localized.hero,
    body: localized.body,
    showJobBoards: doc?.showJobBoards ?? true,
    jobBoards,
    whyJoinMode: doc?.whyJoinMode ?? "disabled",
    whyJoin: localized.whyJoin,
    showBenefits: doc?.showBenefits ?? true,
    benefits,
    showOpenings: doc?.showOpenings ?? true,
  };
}

export interface JobOpeningData {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: JobEmploymentType;
  applyUrl: string;
  summary: string;
  description: string;
  postedAt: Date;
}

export async function getPublishedJobOpenings(locale: Locale): Promise<JobOpeningData[]> {
  await connectDB();
  const docs = await JobOpening.find({ isPublished: true }).sort({ order: 1, postedAt: -1 }).lean();
  return docs.map((d) =>
    localize(
      {
        id: String(d._id),
        title: d.title,
        department: d.department ?? "",
        location: d.location ?? "",
        employmentType: (d.employmentType ?? "fullTime") as JobEmploymentType,
        applyUrl: d.applyUrl ?? "",
        summary: d.summary ?? EMPTY_LOCALIZED,
        description: d.description ?? EMPTY_LOCALIZED,
        postedAt: d.postedAt,
      },
      locale,
    ),
  );
}
