import { connectDB } from "@/lib/db";
import { CONTACT_PAGE_ID, ContactPage } from "@/models";
import type { PageStatus, SectionMode } from "@/models/constants";
import { DEFAULT_FORM_FIELDS, type FormField, type FormSettings } from "./form-fields";
import { type Locale, localize, pickLocale } from "./localize";
import type { LocalizedFormField, LocalizedFormSettings } from "./solutions";

const EMPTY_LOCALIZED = { id: "", en: "" };

/** Contact form starts from a contact-appropriate subset of the shared fields. */
const CONTACT_FIELD_KEYS = ["firstName", "lastName", "email", "company", "phone", "message"];
export const DEFAULT_CONTACT_FORM_FIELDS: FormField[] = DEFAULT_FORM_FIELDS.filter((f) =>
  CONTACT_FIELD_KEYS.includes(f.key),
);

export interface ContactPageData {
  status: PageStatus;
  heroMode: SectionMode;
  bodyMode: SectionMode;
  hero: { eyebrow: string; title: string; subtitle: string };
  body: { heading: string; content: string };
  office: { mapEmbedUrl: string; directionsUrl: string };
  factory: { mapEmbedUrl: string; directionsUrl: string };
  showMap: boolean;
  showFactory: boolean;
  showOfficeHours: boolean;
  showSocial: boolean;
  showDepartmentContacts: boolean;
  showCompanyProfile: boolean;
  showGetDirections: boolean;
  form: LocalizedFormSettings;
}

interface RawContactDoc {
  status?: PageStatus;
  heroMode?: SectionMode;
  bodyMode?: SectionMode;
  hero?: { eyebrow?: unknown; title?: unknown; subtitle?: unknown };
  body?: { heading?: unknown; content?: unknown };
  office?: { mapEmbedUrl?: string; directionsUrl?: string };
  factory?: { mapEmbedUrl?: string; directionsUrl?: string };
  showMap?: boolean;
  showFactory?: boolean;
  showOfficeHours?: boolean;
  showSocial?: boolean;
  showDepartmentContacts?: boolean;
  showCompanyProfile?: boolean;
  showGetDirections?: boolean;
  formSettings?: Partial<FormSettings>;
}

function localizeForm(
  raw: Partial<FormSettings> | undefined,
  locale: Locale,
): LocalizedFormSettings {
  const rawFields =
    Array.isArray(raw?.fields) && raw.fields.length > 0
      ? (raw.fields as FormField[])
      : DEFAULT_CONTACT_FORM_FIELDS;
  const fields: LocalizedFormField[] = [...rawFields]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((f) => ({
      key: f.key,
      label: pickLocale(f.label, locale),
      placeholder: pickLocale(f.placeholder, locale),
      type: f.type ?? "text",
      required: Boolean(f.required),
      order: f.order ?? 0,
      options: (f.options ?? []).map((o) => ({
        value: o.value,
        label: pickLocale(o.label, locale),
      })),
    }));
  return {
    enabled: raw?.enabled ?? true,
    submitLabel:
      pickLocale(raw?.submitLabel, locale) || (locale === "en" ? "Send Message" : "Kirim Pesan"),
    successMessage:
      pickLocale(raw?.successMessage, locale) ||
      (locale === "en"
        ? "Thank you, we'll be in touch shortly."
        : "Terima kasih, kami akan menghubungi Anda segera."),
    fields,
  };
}

export async function getContactPage(locale: Locale): Promise<ContactPageData> {
  await connectDB();
  const doc = await ContactPage.findById(CONTACT_PAGE_ID).lean<RawContactDoc | null>();
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
    },
    locale,
  ) as unknown as {
    hero: { eyebrow: string; title: string; subtitle: string };
    body: { heading: string; content: string };
  };
  return {
    status: doc?.status ?? "published",
    heroMode: doc?.heroMode ?? "default",
    bodyMode: doc?.bodyMode ?? "disabled",
    hero: localized.hero,
    body: localized.body,
    office: {
      mapEmbedUrl: doc?.office?.mapEmbedUrl ?? "",
      directionsUrl: doc?.office?.directionsUrl ?? "",
    },
    factory: {
      mapEmbedUrl: doc?.factory?.mapEmbedUrl ?? "",
      directionsUrl: doc?.factory?.directionsUrl ?? "",
    },
    showMap: doc?.showMap ?? true,
    showFactory: doc?.showFactory ?? true,
    showOfficeHours: doc?.showOfficeHours ?? true,
    showSocial: doc?.showSocial ?? true,
    showDepartmentContacts: doc?.showDepartmentContacts ?? true,
    showCompanyProfile: doc?.showCompanyProfile ?? true,
    showGetDirections: doc?.showGetDirections ?? true,
    form: localizeForm(doc?.formSettings, locale),
  };
}
