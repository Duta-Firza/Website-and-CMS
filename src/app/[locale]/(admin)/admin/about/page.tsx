import { AdminPageHeader } from "@/components/admin/page-header";
import { connectDB } from "@/lib/db";
import { ABOUT_PAGE_ID, AboutPage } from "@/models";
import { AboutForm } from "./about-form";

export interface AboutFormValues {
  intro: { id: string; en: string };
  videoUrl: string;
  vision: { id: string; en: string };
  mission: { id: string; en: string };
  values: {
    title: { id: string; en: string };
    description: { id: string; en: string };
  }[];
  coreBusinessTitle: { id: string; en: string };
  coreBusinessDescription: { id: string; en: string };
  affiliatedBusinessTitle: { id: string; en: string };
  affiliatedBusinessDescription: { id: string; en: string };
}

const empty = (): AboutFormValues => ({
  intro: { id: "", en: "" },
  videoUrl: "",
  vision: { id: "", en: "" },
  mission: { id: "", en: "" },
  values: [],
  coreBusinessTitle: { id: "", en: "" },
  coreBusinessDescription: { id: "", en: "" },
  affiliatedBusinessTitle: { id: "", en: "" },
  affiliatedBusinessDescription: { id: "", en: "" },
});

function pickLocalized(field: unknown): { id: string; en: string } {
  if (field && typeof field === "object") {
    const f = field as { id?: unknown; en?: unknown };
    return {
      id: typeof f.id === "string" ? f.id : "",
      en: typeof f.en === "string" ? f.en : "",
    };
  }
  return { id: "", en: "" };
}

async function loadAbout(): Promise<AboutFormValues> {
  await connectDB();
  const doc = await AboutPage.findById(ABOUT_PAGE_ID).lean();
  if (!doc) return empty();
  const base = empty();
  return {
    intro: pickLocalized(doc.intro),
    videoUrl: doc.videoUrl ?? "",
    vision: pickLocalized(doc.vision),
    mission: pickLocalized(doc.mission),
    values: Array.isArray(doc.values)
      ? doc.values.map((v: { title?: unknown; description?: unknown }) => ({
          title: pickLocalized(v.title),
          description: pickLocalized(v.description),
        }))
      : base.values,
    coreBusinessTitle: pickLocalized(doc.coreBusinessTitle),
    coreBusinessDescription: pickLocalized(doc.coreBusinessDescription),
    affiliatedBusinessTitle: pickLocalized(doc.affiliatedBusinessTitle),
    affiliatedBusinessDescription: pickLocalized(doc.affiliatedBusinessDescription),
  };
}

export default async function AboutAdminPage() {
  const initial = await loadAbout();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="About Page"
        description="Content for /about (Who We Are) and intro text for /about/business."
      />
      <AboutForm initial={initial} />
    </div>
  );
}
