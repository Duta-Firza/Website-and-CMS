import { connectDB } from "@/lib/db";
import { SolutionPage, type SolutionPageSlug, type SolutionPageStatus } from "@/models";
import type { SolutionPageFormValues } from "./solution-page-form";

const EMPTY_LOCALIZED = { id: "", en: "" };

const DEFAULT_FORM_VALUES: SolutionPageFormValues = {
  status: "comingSoon",
  hero: {
    eyebrow: EMPTY_LOCALIZED,
    title: EMPTY_LOCALIZED,
    subtitle: EMPTY_LOCALIZED,
    backgroundImage: "",
  },
  body: {
    heading: EMPTY_LOCALIZED,
    content: EMPTY_LOCALIZED,
  },
  inquiryFormEnabled: true,
  comingSoonMessage: EMPTY_LOCALIZED,
};

/**
 * Server-side loader: return raw (un-localized) SolutionPage doc as form values,
 * or default scaffold if the document doesn't exist yet.
 */
export async function loadSolutionPageForAdmin(
  slug: SolutionPageSlug,
): Promise<SolutionPageFormValues> {
  await connectDB();
  const doc = await SolutionPage.findById(slug).lean<{
    _id: string;
    status?: SolutionPageStatus;
    hero?: {
      eyebrow?: { id?: string; en?: string };
      title?: { id?: string; en?: string };
      subtitle?: { id?: string; en?: string };
      backgroundImage?: string;
    };
    body?: {
      heading?: { id?: string; en?: string };
      content?: { id?: string; en?: string };
    };
    inquiryFormEnabled?: boolean;
    comingSoonMessage?: { id?: string; en?: string };
    updatedAt?: Date;
  } | null>();
  if (!doc) return DEFAULT_FORM_VALUES;
  return {
    status: doc.status ?? "comingSoon",
    hero: {
      eyebrow: {
        id: doc.hero?.eyebrow?.id ?? "",
        en: doc.hero?.eyebrow?.en ?? "",
      },
      title: {
        id: doc.hero?.title?.id ?? "",
        en: doc.hero?.title?.en ?? "",
      },
      subtitle: {
        id: doc.hero?.subtitle?.id ?? "",
        en: doc.hero?.subtitle?.en ?? "",
      },
      backgroundImage: doc.hero?.backgroundImage ?? "",
    },
    body: {
      heading: {
        id: doc.body?.heading?.id ?? "",
        en: doc.body?.heading?.en ?? "",
      },
      content: {
        id: doc.body?.content?.id ?? "",
        en: doc.body?.content?.en ?? "",
      },
    },
    inquiryFormEnabled: doc.inquiryFormEnabled ?? true,
    comingSoonMessage: {
      id: doc.comingSoonMessage?.id ?? "",
      en: doc.comingSoonMessage?.en ?? "",
    },
  };
}
