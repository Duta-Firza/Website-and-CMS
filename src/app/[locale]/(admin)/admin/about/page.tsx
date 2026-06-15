import { getLocale, getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PreviewLink } from "@/components/admin/preview-link";
import { UrlTabs } from "@/components/admin/url-tabs";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { connectDB } from "@/lib/db";
import { ABOUT_PAGE_ID, AboutPage } from "@/models";
import { AboutSubPageForm } from "./_components/about-sub-page-form";
import { loadAboutSubPageForAdmin } from "./_components/load-about-sub-page";
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
}

const empty = (): AboutFormValues => ({
  intro: { id: "", en: "" },
  videoUrl: "",
  vision: { id: "", en: "" },
  mission: { id: "", en: "" },
  values: [],
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
  };
}

export default async function AboutAdminPage() {
  const [initial, meta, locale, t] = await Promise.all([
    loadAbout(),
    loadAboutSubPageForAdmin("who-we-are"),
    getLocale(),
    getTranslations("Admin"),
  ]);
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("pages.about.title")}
        description={t("pages.about.description")}
        titleAction={<PreviewLink href={`/${locale}/about`} label={t("buttons.viewPublic")} />}
      />
      <UrlTabs defaultTab="content" validValues={["content", "who", "values"]} className="w-full">
        <TabsList className="grid grid-cols-3 md:flex md:w-fit">
          <TabsTrigger value="content">{t("tabs.content")}</TabsTrigger>
          <TabsTrigger value="who">{t("tabs.whoWeAre")}</TabsTrigger>
          <TabsTrigger value="values">{t("tabs.values")}</TabsTrigger>
        </TabsList>
        <TabsContent value="content" className="mt-6">
          <AboutSubPageForm slug="who-we-are" initial={meta} />
        </TabsContent>
        <AboutForm initial={initial} />
      </UrlTabs>
    </div>
  );
}
