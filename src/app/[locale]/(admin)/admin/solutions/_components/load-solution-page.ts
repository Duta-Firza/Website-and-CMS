import { DEFAULT_FORM_SETTINGS, type FormField, type FormSettings } from "@/lib/cms/form-fields";
import { connectDB } from "@/lib/db";
import {
  type SectionMode,
  SolutionPage,
  type SolutionPageSlug,
  type SolutionPageStatus,
} from "@/models";
import type { SolutionPageFormValues } from "./solution-page-form";

const EMPTY_LOCALIZED = { id: "", en: "" };

const DEFAULT_FORM_VALUES: SolutionPageFormValues = {
  status: "comingSoon",
  heroMode: "default",
  bodyMode: "default",
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
  formSettings: DEFAULT_FORM_SETTINGS,
  comingSoonMessage: EMPTY_LOCALIZED,
};

function normalizeFormSettings(raw: unknown, legacyEnabled?: boolean): FormSettings {
  const data = (raw ?? {}) as Partial<FormSettings>;
  const fields: FormField[] =
    Array.isArray(data.fields) && data.fields.length > 0
      ? (data.fields as FormField[]).map((f) => ({
          key: f.key,
          label: { id: f.label?.id ?? "", en: f.label?.en ?? "" },
          placeholder: { id: f.placeholder?.id ?? "", en: f.placeholder?.en ?? "" },
          type: f.type ?? "text",
          required: Boolean(f.required),
          order: f.order ?? 0,
          options: Array.isArray(f.options) ? f.options : [],
        }))
      : DEFAULT_FORM_SETTINGS.fields;
  return {
    enabled: data.enabled ?? legacyEnabled ?? true,
    submitLabel: {
      id: data.submitLabel?.id ?? DEFAULT_FORM_SETTINGS.submitLabel.id,
      en: data.submitLabel?.en ?? DEFAULT_FORM_SETTINGS.submitLabel.en,
    },
    successMessage: {
      id: data.successMessage?.id ?? DEFAULT_FORM_SETTINGS.successMessage.id,
      en: data.successMessage?.en ?? DEFAULT_FORM_SETTINGS.successMessage.en,
    },
    fields,
  };
}

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
    heroMode?: SectionMode;
    bodyMode?: SectionMode;
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
    formSettings?: unknown;
    comingSoonMessage?: { id?: string; en?: string };
    updatedAt?: Date;
  } | null>();
  if (!doc) return DEFAULT_FORM_VALUES;
  const legacyEnabled = doc.inquiryFormEnabled ?? true;
  const formSettings = normalizeFormSettings(doc.formSettings, legacyEnabled);
  return {
    status: doc.status ?? "comingSoon",
    heroMode: doc.heroMode ?? "default",
    bodyMode: doc.bodyMode ?? "default",
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
    inquiryFormEnabled: legacyEnabled,
    formSettings,
    comingSoonMessage: {
      id: doc.comingSoonMessage?.id ?? "",
      en: doc.comingSoonMessage?.en ?? "",
    },
  };
}
