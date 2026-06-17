import { getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PublicationForm } from "../_components/publication-form";

const emptyPublication = {
  category: "newsroom" as const,
  title: { id: "", en: "" },
  summary: { id: "", en: "" },
  body: { id: "", en: "" },
  imageUrl: "",
  originalUrl: "",
  publishedAt: new Date().toISOString().split("T")[0],
  isPublished: false,
  order: 0,
};

export default async function NewNewsroomArticlePage() {
  const t = await getTranslations("Admin");

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("pages.newArticle")}
        description={t("pages.irNewsroom.description")}
      />
      <PublicationForm
        category="newsroom"
        initial={emptyPublication}
        backHref="/admin/investor-relations/newsroom?tab=items"
      />
    </div>
  );
}
