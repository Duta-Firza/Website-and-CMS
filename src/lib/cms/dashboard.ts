import { connectDB } from "@/lib/db";
import {
  AboutSubPage,
  type AboutSubPageSlug,
  AffiliatedBusiness,
  Application,
  CAREER_PAGE_ID,
  CareerPage,
  CONTACT_PAGE_ID,
  ContactPage,
  Credential,
  HistoryEntry,
  HOME_HERO_ID,
  HomeHero,
  Inquiry,
  IrSubPage,
  type IrSubPageSlug,
  JobOpening,
  LeadershipMember,
  type LocalizedString,
  Partner,
  Product,
  Publication,
  Report,
  ReportDownload,
  SolutionPage,
  type SolutionPageSlug,
} from "@/models";
import type { PageStatus } from "@/models/constants";
import { getUnreadApplicationCount } from "./applications";
import { getUnreadInquiryCount } from "./inquiries";
import { type Locale, pickLocale } from "./localize";
import { getUnreadReportDownloadCount } from "./report-downloads";

/**
 * Overview data for the admin dashboard, keyed by `AdminNavItem.labelKey` so the
 * page can walk `buildAdminNav()` and look each row up. `status` and `count` are
 * independent: most rows have both, page-only rows have just a status, and
 * `landing` (HomeHero carries no status) has only `updatedAt`.
 */
export interface ContentMetric {
  status?: PageStatus;
  count?: number;
  /** ISO. Rendered only when there's no status to show. */
  updatedAt?: string;
}

export interface InboxEntry {
  id: string;
  name: string;
  detail: string;
  read: boolean;
  /** ISO. */
  createdAt: string;
}

export interface InboxMetric {
  unread: number;
  recent: InboxEntry[];
}

export interface DashboardData {
  // `| undefined` is explicit: this repo runs strict but without
  // noUncheckedIndexedAccess, so a bare Record would lie about nav items that
  // have no metric yet.
  content: Record<string, ContentMetric | undefined>;
  inbox: Record<string, InboxMetric | undefined>;
}

export const EMPTY_DASHBOARD: DashboardData = { content: {}, inbox: {} };

const RECENT_LIMIT = 5;

/** labelKey -> page slug, for the rows where the two differ. */
const ABOUT_SLUGS: Record<string, AboutSubPageSlug> = {
  about: "who-we-are",
  leadership: "leadership",
  history: "history",
  business: "business",
  credentials: "credentials",
};

const SOLUTION_SLUGS: Record<string, SolutionPageSlug> = {
  trading: "trading",
  tradingPartners: "trading-partners",
  tradingProducts: "trading-products",
  manufacturing: "manufacturing",
  epc: "epc",
  technology: "technology",
};

const IR_SLUGS: Record<string, IrSubPageSlug> = {
  stocks: "stocks",
  reports: "reports",
  publications: "publications",
  pressRelease: "press-release",
  newsroom: "newsroom",
  companyProfile: "company-profile",
};

/**
 * Status to assume when a page doc predates the `status` field. The CMS loaders
 * disagree on this by family — about/contact/careers read a missing status as
 * "published" (src/lib/cms/about.ts, contact.ts, careers.ts) while solutions and
 * IR read it as "comingSoon" (solutions.ts, investor-relations.ts). Mirror them
 * exactly, or a row here contradicts the page it links to.
 */
const ABOUT_FALLBACK: PageStatus = "published";
const SOLUTION_FALLBACK: PageStatus = "comingSoon";
const IR_FALLBACK: PageStatus = "comingSoon";

/** Slug-keyed page collections store the slug in `_id`. */
interface PageDoc {
  _id: string;
  status?: PageStatus;
  updatedAt?: Date;
}

const PAGE_PROJECTION = { status: 1, updatedAt: 1 } as const;

function bySlug(docs: PageDoc[]): Map<string, PageDoc> {
  return new Map(docs.map((d) => [String(d._id), d]));
}

/**
 * Mirrors the legacy coercion in getUnreadInquiryCount so a row's unread dot
 * agrees with the count on the same card: docs predating the `read` field are
 * read only if their legacy status said so.
 */
function inquiryRead(doc: { read?: boolean; status?: string }): boolean {
  if (typeof doc.read === "boolean") return doc.read;
  return doc.status === "read" || doc.status === "archived";
}

function fullName(first?: string, last?: string): string {
  return [first, last].filter(Boolean).join(" ").trim();
}

export async function getDashboardData(locale: Locale): Promise<DashboardData> {
  await connectDB();

  const [
    aboutPages,
    solutionPages,
    irPages,
    contactPage,
    careerPage,
    homeHero,
    leadershipCount,
    historyCount,
    businessCount,
    credentialCount,
    partnerCount,
    productCount,
    reportCount,
    jobCount,
    publicationGroups,
    inquiryUnread,
    applicationUnread,
    reportDownloadUnread,
    recentInquiries,
    recentApplications,
    recentReportDownloads,
  ] = await Promise.all([
    // One query per slug-keyed collection rather than one findById per slug.
    AboutSubPage.find({}, PAGE_PROJECTION).lean<PageDoc[]>(),
    SolutionPage.find({}, PAGE_PROJECTION).lean<PageDoc[]>(),
    IrSubPage.find({}, PAGE_PROJECTION).lean<PageDoc[]>(),
    ContactPage.findById(CONTACT_PAGE_ID, PAGE_PROJECTION).lean<PageDoc | null>(),
    CareerPage.findById(CAREER_PAGE_ID, PAGE_PROJECTION).lean<PageDoc | null>(),
    HomeHero.findById(HOME_HERO_ID, { updatedAt: 1 }).lean<PageDoc | null>(),

    // Unfiltered, to match what the linked admin pages list.
    LeadershipMember.countDocuments({}),
    HistoryEntry.countDocuments({}),
    AffiliatedBusiness.countDocuments({}),
    Credential.countDocuments({}),
    Partner.countDocuments({}),
    Product.countDocuments({}),
    Report.countDocuments({}),
    JobOpening.countDocuments({}),
    // Newsroom and press releases share a collection; group instead of 2 counts.
    Publication.aggregate<{ _id: string; n: number }>([
      { $group: { _id: "$category", n: { $sum: 1 } } },
    ]),

    // The sidebar counts these again in the same request. Don't "fix" that with
    // React.cache: the unread-stream SSE route re-polls getUnreadInquiryCount on
    // an interval inside one long-lived request, and a per-request cache would
    // freeze the count and stall the sidebar badge for good.
    getUnreadInquiryCount(),
    getUnreadApplicationCount(),
    getUnreadReportDownloadCount(),

    Inquiry.find({}, { firstName: 1, lastName: 1, company: 1, read: 1, status: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .limit(RECENT_LIMIT)
      .lean<
        {
          _id: unknown;
          firstName?: string;
          lastName?: string;
          company?: string;
          read?: boolean;
          status?: string;
          createdAt: Date;
        }[]
      >(),
    Application.find({}, { firstName: 1, lastName: 1, jobTitle: 1, read: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .limit(RECENT_LIMIT)
      .lean<
        {
          _id: unknown;
          firstName?: string;
          lastName?: string;
          jobTitle?: LocalizedString;
          read?: boolean;
          createdAt: Date;
        }[]
      >(),
    ReportDownload.find({}, { fullName: 1, reportTitle: 1, read: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .limit(RECENT_LIMIT)
      .lean<
        {
          _id: unknown;
          fullName?: string;
          reportTitle?: LocalizedString;
          read?: boolean;
          createdAt: Date;
        }[]
      >(),
  ]);

  const aboutMap = bySlug(aboutPages);
  const solutionMap = bySlug(solutionPages);
  const irMap = bySlug(irPages);

  // Extra slugs exist that aren't nav rows (e.g. SolutionPage "solutions"), so
  // index by slug rather than trusting array order.
  const pages: Record<string, { status: PageStatus; updatedAt?: Date } | undefined> = {};
  const put = (labelKey: string, doc: PageDoc | null | undefined, fallback: PageStatus) => {
    pages[labelKey] = { status: doc?.status ?? fallback, updatedAt: doc?.updatedAt };
  };

  for (const [labelKey, slug] of Object.entries(ABOUT_SLUGS)) {
    put(labelKey, aboutMap.get(slug), ABOUT_FALLBACK);
  }
  for (const [labelKey, slug] of Object.entries(SOLUTION_SLUGS)) {
    put(labelKey, solutionMap.get(slug), SOLUTION_FALLBACK);
  }
  for (const [labelKey, slug] of Object.entries(IR_SLUGS)) {
    put(labelKey, irMap.get(slug), IR_FALLBACK);
  }
  put("contactInfo", contactPage, "published");
  put("careers", careerPage, "published");

  // Categories with no documents are absent from the aggregate.
  const publicationCounts = new Map(publicationGroups.map((g) => [g._id, g.n]));

  const counts: Record<string, number> = {
    leadership: leadershipCount,
    history: historyCount,
    business: businessCount,
    credentials: credentialCount,
    tradingPartners: partnerCount,
    tradingProducts: productCount,
    reports: reportCount,
    careers: jobCount,
    newsroom: publicationCounts.get("newsroom") ?? 0,
    pressRelease: publicationCounts.get("press-release") ?? 0,
  };

  const content: Record<string, ContentMetric | undefined> = {};
  for (const labelKey of new Set([...Object.keys(pages), ...Object.keys(counts)])) {
    const page = pages[labelKey];
    content[labelKey] = {
      status: page?.status,
      count: counts[labelKey],
      updatedAt: page?.updatedAt?.toISOString(),
    };
  }
  // HomeHero has no status, so this row shows a timestamp instead.
  content.landing = { updatedAt: homeHero?.updatedAt?.toISOString() };

  const inbox: Record<string, InboxMetric | undefined> = {
    inquiries: {
      unread: inquiryUnread,
      recent: recentInquiries.map((d) => ({
        id: String(d._id),
        name: fullName(d.firstName, d.lastName),
        detail: d.company ?? "",
        read: inquiryRead(d),
        createdAt: d.createdAt.toISOString(),
      })),
    },
    applications: {
      unread: applicationUnread,
      recent: recentApplications.map((d) => ({
        id: String(d._id),
        name: fullName(d.firstName, d.lastName),
        detail: pickLocale(d.jobTitle, locale),
        read: d.read === true,
        createdAt: d.createdAt.toISOString(),
      })),
    },
    reportDownloads: {
      unread: reportDownloadUnread,
      recent: recentReportDownloads.map((d) => ({
        id: String(d._id),
        name: d.fullName ?? "",
        detail: pickLocale(d.reportTitle, locale),
        read: d.read === true,
        createdAt: d.createdAt.toISOString(),
      })),
    },
  };

  return { content, inbox };
}
