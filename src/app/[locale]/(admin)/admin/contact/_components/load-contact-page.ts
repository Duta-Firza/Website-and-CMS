import { DEFAULT_CONTACT_FORM_FIELDS } from "@/lib/cms/contact";
import { DEFAULT_FORM_SETTINGS, type FormSettings } from "@/lib/cms/form-fields";
import { connectDB } from "@/lib/db";
import { CONTACT_PAGE_ID, ContactPage } from "@/models";
import type { PageStatus, SectionMode } from "@/models/constants";
import type { ContactPageFormValues } from "./contact-page-form";

const EMPTY = { id: "", en: "" };

const DEFAULT_VALUES: ContactPageFormValues = {
  status: "published",
  heroMode: "default",
  bodyMode: "disabled",
  hero: { eyebrow: EMPTY, title: EMPTY, subtitle: EMPTY },
  body: { heading: EMPTY, content: EMPTY },
  office: { mapEmbedUrl: "", directionsUrl: "" },
  factory: { mapEmbedUrl: "", directionsUrl: "" },
  showMap: true,
  showFactory: true,
  showOfficeHours: true,
  showGetDirections: true,
  formSettings: {
    enabled: true,
    submitLabel: { id: "Kirim Pesan", en: "Send Message" },
    successMessage: DEFAULT_FORM_SETTINGS.successMessage,
    fields: DEFAULT_CONTACT_FORM_FIELDS,
  },
};

interface RawDoc {
  status?: PageStatus;
  heroMode?: SectionMode;
  bodyMode?: SectionMode;
  hero?: {
    eyebrow?: { id?: string; en?: string };
    title?: { id?: string; en?: string };
    subtitle?: { id?: string; en?: string };
  };
  body?: { heading?: { id?: string; en?: string }; content?: { id?: string; en?: string } };
  office?: { mapEmbedUrl?: string; directionsUrl?: string };
  factory?: { mapEmbedUrl?: string; directionsUrl?: string };
  showMap?: boolean;
  showFactory?: boolean;
  showOfficeHours?: boolean;
  showGetDirections?: boolean;
  formSettings?: Partial<FormSettings>;
}

const loc = (v?: { id?: string; en?: string }) => ({ id: v?.id ?? "", en: v?.en ?? "" });

export async function loadContactPageForAdmin(): Promise<ContactPageFormValues> {
  await connectDB();
  const doc = await ContactPage.findById(CONTACT_PAGE_ID).lean<RawDoc | null>();
  if (!doc) return DEFAULT_VALUES;

  const fs = doc.formSettings;
  const fields =
    Array.isArray(fs?.fields) && fs.fields.length > 0 ? fs.fields : DEFAULT_CONTACT_FORM_FIELDS;

  return {
    status: doc.status ?? "published",
    heroMode: doc.heroMode ?? "default",
    bodyMode: doc.bodyMode ?? "disabled",
    hero: {
      eyebrow: loc(doc.hero?.eyebrow),
      title: loc(doc.hero?.title),
      subtitle: loc(doc.hero?.subtitle),
    },
    body: { heading: loc(doc.body?.heading), content: loc(doc.body?.content) },
    office: {
      mapEmbedUrl: doc.office?.mapEmbedUrl ?? "",
      directionsUrl: doc.office?.directionsUrl ?? "",
    },
    factory: {
      mapEmbedUrl: doc.factory?.mapEmbedUrl ?? "",
      directionsUrl: doc.factory?.directionsUrl ?? "",
    },
    showMap: doc.showMap ?? true,
    showFactory: doc.showFactory ?? true,
    showOfficeHours: doc.showOfficeHours ?? true,
    showGetDirections: doc.showGetDirections ?? true,
    formSettings: {
      enabled: fs?.enabled ?? true,
      submitLabel: loc(fs?.submitLabel),
      successMessage: loc(fs?.successMessage),
      fields: fields as FormSettings["fields"],
    },
  };
}
