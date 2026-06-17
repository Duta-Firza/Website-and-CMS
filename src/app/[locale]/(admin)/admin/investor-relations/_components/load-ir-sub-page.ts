import { connectDB } from "@/lib/db";
import {
  IrSubPage,
  type IrSubPageSlug,
  type IrSubPageStatus,
  type SectionMode,
} from "@/models";
import type { IrSubPageFormValues } from "./ir-sub-page-form";

const EMPTY_LOCALIZED = { id: "", en: "" };

const DEFAULT_FORM_VALUES: IrSubPageFormValues = {
  status: "comingSoon",
  heroMode: "default",
  bodyMode: "disabled",
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
  status?: IrSubPageStatus;
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

export async function loadIrSubPageForAdmin(slug: IrSubPageSlug): Promise<IrSubPageFormValues> {
  await connectDB();
  const doc = await IrSubPage.findById(slug).lean<SubPageDoc | null>();

  if (!doc) return DEFAULT_FORM_VALUES;

  return {
    status: doc.status ?? "comingSoon",
    heroMode: doc.heroMode ?? "default",
    bodyMode: doc.bodyMode ?? "disabled",
    hero: {
      eyebrow: { id: doc.hero?.eyebrow?.id ?? "", en: doc.hero?.eyebrow?.en ?? "" },
      title: { id: doc.hero?.title?.id ?? "", en: doc.hero?.title?.en ?? "" },
      subtitle: { id: doc.hero?.subtitle?.id ?? "", en: doc.hero?.subtitle?.en ?? "" },
    },
    body: {
      heading: { id: doc.body?.heading?.id ?? "", en: doc.body?.heading?.en ?? "" },
      content: { id: doc.body?.content?.id ?? "", en: doc.body?.content?.en ?? "" },
    },
  };
}
