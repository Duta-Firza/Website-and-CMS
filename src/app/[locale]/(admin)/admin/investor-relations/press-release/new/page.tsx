import { getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PublicationForm } from "../../newsroom/_components/publication-form";

const emptyPublication = {
  category: "press-release" as const,
  title: { id: "", en: "" },
  summary: { id: "", en: "" },
  body: { id: "", en: "" },
  imageUrl: "",
  originalUrl: "",
  publishedAt: new Date().toISOString().split("T")[0],
  isPublished: false,
  order: 0,
};

export default async function NewPressReleasePage() {
  const t = await getTranslations("Admin");

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("pages.newArticle")}
        description={t("pages.irPressRelease.description")}
      />
      <PublicationForm
        category="press-release"
        initial={emptyPublication}
        backHref="/admin/investor-relations/press-release?tab=items"
      />
    </div>
  );
}
