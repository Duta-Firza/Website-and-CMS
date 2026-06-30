import { DEFAULT_APPLICATION_FORM_SETTINGS, type FormSettings } from "@/lib/cms/application-form";
import { DEFAULT_JOB_BOARDS } from "@/lib/cms/careers";
import { connectDB } from "@/lib/db";
import { CAREER_PAGE_ID, CareerPage } from "@/models";
import type { LocalizedString } from "@/models/_shared";
import type { PageStatus, SectionMode } from "@/models/constants";
import type { CareerPageFormValues } from "./career-page-form";

const loc = (v?: { id?: string; en?: string }) => ({ id: v?.id ?? "", en: v?.en ?? "" });

const seededBoards = () =>
  DEFAULT_JOB_BOARDS.map((b) => ({
    key: b.key ?? "",
    label: loc(b.label),
    url: b.url ?? "",
    logoUrl: b.logoUrl ?? "",
    enabled: b.enabled ?? true,
  }));

type RawField = {
  key?: string;
  label?: LocalizedString;
  placeholder?: LocalizedString;
  type?: string;
  required?: boolean;
  order?: number;
  options?: { value?: string; label?: LocalizedString }[];
};

const normField = (f: RawField): CareerPageFormValues["formSettings"]["fields"][number] => ({
  key: f.key ?? "",
  label: loc(f.label),
  placeholder: loc(f.placeholder),
  type: (f.type ?? "text") as CareerPageFormValues["formSettings"]["fields"][number]["type"],
  required: Boolean(f.required),
  order: f.order ?? 0,
  options: (f.options ?? []).map((o) => ({ value: o.value ?? "", label: loc(o.label) })),
});

interface RawDoc {
  status?: PageStatus;
  heroMode?: SectionMode;
  bodyMode?: SectionMode;
  hero?: { eyebrow?: LocalizedString; title?: LocalizedString; subtitle?: LocalizedString };
  body?: { heading?: LocalizedString; content?: LocalizedString };
  showJobBoards?: boolean;
  jobBoards?: {
    key?: string;
    label?: LocalizedString;
    url?: string;
    logoUrl?: string;
    enabled?: boolean;
  }[];
  whyJoinMode?: SectionMode;
  whyJoin?: { heading?: LocalizedString; content?: LocalizedString };
  showBenefits?: boolean;
  benefits?: { icon?: string; title?: LocalizedString; description?: LocalizedString }[];
  showOpenings?: boolean;
  applicationForm?: Partial<FormSettings> & { fields?: RawField[] };
}

export async function loadCareerPageForAdmin(): Promise<CareerPageFormValues> {
  await connectDB();
  const doc = await CareerPage.findById(CAREER_PAGE_ID).lean<RawDoc | null>();

  const af = doc?.applicationForm;
  const hasFields = Array.isArray(af?.fields) && af.fields.length > 0;

  return {
    status: doc?.status ?? "published",
    heroMode: doc?.heroMode ?? "default",
    bodyMode: doc?.bodyMode ?? "disabled",
    hero: {
      eyebrow: loc(doc?.hero?.eyebrow),
      title: loc(doc?.hero?.title),
      subtitle: loc(doc?.hero?.subtitle),
    },
    body: { heading: loc(doc?.body?.heading), content: loc(doc?.body?.content) },
    showJobBoards: doc?.showJobBoards ?? true,
    jobBoards: doc?.jobBoards?.length
      ? doc.jobBoards.map((b) => ({
          key: b.key ?? "",
          label: loc(b.label),
          url: b.url ?? "",
          logoUrl: b.logoUrl ?? "",
          enabled: b.enabled ?? true,
        }))
      : seededBoards(),
    whyJoinMode: doc?.whyJoinMode ?? "disabled",
    whyJoin: { heading: loc(doc?.whyJoin?.heading), content: loc(doc?.whyJoin?.content) },
    showBenefits: doc?.showBenefits ?? true,
    benefits: (doc?.benefits ?? []).map((b) => ({
      icon: b.icon ?? "Award",
      title: loc(b.title),
      description: loc(b.description),
    })),
    showOpenings: doc?.showOpenings ?? true,
    formSettings: hasFields
      ? {
          enabled: af?.enabled ?? true,
          submitLabel: loc(af?.submitLabel),
          successMessage: loc(af?.successMessage),
          fields: (af?.fields ?? []).map(normField),
        }
      : DEFAULT_APPLICATION_FORM_SETTINGS,
  };
}
