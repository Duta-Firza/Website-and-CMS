import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { loadSolutionPageForAdmin } from "../../_components/load-solution-page";
import { SolutionPageForm } from "../../_components/solution-page-form";

export default async function TradingPartnersAdminPage() {
  const [page, locale] = await Promise.all([
    loadSolutionPageForAdmin("trading-partners"),
    getLocale(),
  ]);
  const t = await getTranslations("Admin");
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={t("pages.tradingPartners.title")}
        description={t("pages.tradingPartners.description")}
      />
      <Card className="border-dashed bg-muted/40">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
          <p className="text-sm text-muted-foreground">{t("helpers.solutionsPartnersDelegated")}</p>
          <Link
            href={`/${locale}/admin/partners`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            {t("buttons.manageInPartners")}
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </CardContent>
      </Card>
      <SolutionPageForm slug="trading-partners" initial={page} />
    </div>
  );
}
