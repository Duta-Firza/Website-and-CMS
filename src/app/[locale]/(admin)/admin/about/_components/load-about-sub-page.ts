import { connectDB } from "@/lib/db";
import {
  ABOUT_PAGE_ID,
  AboutPage,
  AboutSubPage,
  type AboutSubPageSlug,
  type AboutSubPageStatus,
} from "@/models";
import type { AboutSubPageFormValues } from "./about-sub-page-form";

const EMPTY_LOCALIZED = { id: "", en: "" };

const DEFAULT_FORM_VALUES: AboutSubPageFormValues = {
  status: "published",
  hero: {
    eyebrow: EMPTY_LOCALIZED,
    title: EMPTY_LOCALIZED,
    subtitle: EMPTY_LOCALIZED,
  },
  body: {
    heading: EMPTY_LOCALIZED,
    content: EMPTY_LOCALIZED,
  },
};

// Map slug → legacy override field on AboutPage. Empty values get filled in
// from there so existing admin content keeps showing until the editor touches
// the new AboutSubPage doc.
const LEGACY_TITLE_FIELD: Record<AboutSubPageSlug, keyof LegacyAboutDoc> = {
  "who-we-are": "whoWeAreTitle",
  leadership: "leadershipTitle",
  history: "historyTitle",
  business: "businessTitle",
  credentials: "credentialsTitle",
};

interface LegacyAboutDoc {
  whoWeAreTitle?: { id?: string; en?: string };
  leadershipTitle?: { id?: string; en?: string };
  historyTitle?: { id?: string; en?: string };
  businessTitle?: { id?: string; en?: string };
  credentialsTitle?: { id?: string; en?: string };
}

interface SubPageDoc {
  _id: string;
  status?: AboutSubPageStatus;
  hero?: {
    eyebrow?: { id?: string; en?: string };
    title?: { id?: string; en?: string };
    subtitle?: { id?: string; en?: string };
  };
  body?: {
    heading?: { id?: string; en?: string };
    content?: { id?: string; en?: string };
  };
}

export async function loadAboutSubPageForAdmin(
  slug: AboutSubPageSlug,
): Promise<AboutSubPageFormValues> {
  await connectDB();
  const [subDoc, aboutDoc] = await Promise.all([
    AboutSubPage.findById(slug).lean<SubPageDoc | null>(),
    AboutPage.findById(ABOUT_PAGE_ID).lean<LegacyAboutDoc | null>(),
  ]);

  const legacyTitle = aboutDoc?.[LEGACY_TITLE_FIELD[slug]];
  const heroTitle = subDoc?.hero?.title;
  const titleHasContent = Boolean(heroTitle?.id?.trim() || heroTitle?.en?.trim());

  if (!subDoc) {
    return {
      ...DEFAULT_FORM_VALUES,
      hero: {
        ...DEFAULT_FORM_VALUES.hero,
        title: {
          id: legacyTitle?.id ?? "",
          en: legacyTitle?.en ?? "",
        },
      },
    };
  }

  return {
    status: subDoc.status ?? "published",
    hero: {
      eyebrow: {
        id: subDoc.hero?.eyebrow?.id ?? "",
        en: subDoc.hero?.eyebrow?.en ?? "",
      },
      title: {
        id: (titleHasContent ? heroTitle?.id : legacyTitle?.id) ?? "",
        en: (titleHasContent ? heroTitle?.en : legacyTitle?.en) ?? "",
      },
      subtitle: {
        id: subDoc.hero?.subtitle?.id ?? "",
        en: subDoc.hero?.subtitle?.en ?? "",
      },
    },
    body: {
      heading: {
        id: subDoc.body?.heading?.id ?? "",
        en: subDoc.body?.heading?.en ?? "",
      },
      content: {
        id: subDoc.body?.content?.id ?? "",
        en: subDoc.body?.content?.en ?? "",
      },
    },
  };
}
