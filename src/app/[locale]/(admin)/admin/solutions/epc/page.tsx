import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { loadSolutionPageForAdmin } from "../_components/load-solution-page";
import { SolutionPageForm } from "../_components/solution-page-form";

export default async function EpcAdminPage() {
  const [page, locale] = await Promise.all([loadSolutionPageForAdmin("epc"), getLocale()]);
  const t = await getTranslations("Admin");
  return (
    <div className="space-y-8">
      <AdminPageHeader title={t("pages.epc.title")} description={t("pages.epc.description")} />
      <Card className="border-dashed bg-muted/40">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
          <p className="text-sm text-muted-foreground">{t("helpers.solutionsEpcDelegated")}</p>
          <Link
            href={`/${locale}/admin/projects`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            {t("buttons.manageInProjects")}
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </CardContent>
      </Card>
      <SolutionPageForm slug="epc" initial={page} />
    </div>
  );
}
