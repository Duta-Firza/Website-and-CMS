import { connectDB } from "@/lib/db";
import {
  AboutSubPage,
  type AboutSubPageSlug,
  type AboutSubPageStatus,
  type SectionMode,
} from "@/models";
import type { AboutSubPageFormValues } from "./about-sub-page-form";

const EMPTY_LOCALIZED = { id: "", en: "" };

const DEFAULT_FORM_VALUES: AboutSubPageFormValues = {
  status: "published",
  heroMode: "default",
  bodyMode: "default",
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

interface SubPageDoc {
  _id: string;
  status?: AboutSubPageStatus;
  heroMode?: SectionMode;
  bodyMode?: SectionMode;
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
  const subDoc = await AboutSubPage.findById(slug).lean<SubPageDoc | null>();

  if (!subDoc) return DEFAULT_FORM_VALUES;

  return {
    status: subDoc.status ?? "published",
    heroMode: subDoc.heroMode ?? "default",
    bodyMode: subDoc.bodyMode ?? "default",
    hero: {
      eyebrow: {
        id: subDoc.hero?.eyebrow?.id ?? "",
        en: subDoc.hero?.eyebrow?.en ?? "",
      },
      title: {
        id: subDoc.hero?.title?.id ?? "",
        en: subDoc.hero?.title?.en ?? "",
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
