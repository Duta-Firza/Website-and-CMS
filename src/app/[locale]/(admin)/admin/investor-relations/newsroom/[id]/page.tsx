import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { connectDB } from "@/lib/db";
import { Publication } from "@/models";
import { PublicationForm } from "../_components/publication-form";

interface PageParams {
  id: string;
}

async function loadPublication(id: string) {
  await connectDB();
  const doc = await Publication.findById(id).lean();
  if (!doc) return null;
  return {
    id: String(doc._id),
    slug: doc.slug,
    category: doc.category as "newsroom",
    title: { id: doc.title?.id ?? "", en: doc.title?.en ?? "" },
    summary: { id: doc.summary?.id ?? "", en: doc.summary?.en ?? "" },
    body: { id: doc.body?.id ?? "", en: doc.body?.en ?? "" },
    imageUrl: doc.imageUrl ?? "",
    originalUrl: doc.originalUrl ?? "",
    publishedAt: doc.publishedAt.toISOString().split("T")[0],
    isPublished: doc.isPublished ?? false,
    order: doc.order ?? 0,
  };
}

export default async function EditNewsroomArticlePage({ params }: { params: Promise<PageParams> }) {
  const { id } = await params;
  const [publication, t] = await Promise.all([loadPublication(id), getTranslations("Admin")]);

  if (!publication) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("pages.editArticle")}
        description={t("pages.irNewsroom.description")}
      />
      <PublicationForm
        category="newsroom"
        initial={publication}
        backHref="/admin/investor-relations/newsroom?tab=items"
      />
    </div>
  );
}
