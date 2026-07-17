import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePageScope } from "@/lib/cms/access";
import { getUmamiConfig } from "@/lib/umami";

export default async function VisitorAnalyticsPage() {
  await requirePageScope("analytics");

  const t = await getTranslations("Admin.pages.visitorAnalytics");
  const { shareUrl } = getUmamiConfig();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("title")}
        description={t("description")}
        actions={
          shareUrl && (
            <Link
              href={shareUrl}
              target="_blank"
              rel="noreferrer noopener"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              {t("openInUmami")}
            </Link>
          )
        }
      />

      {shareUrl ? (
        <iframe
          src={shareUrl}
          title={t("title")}
          loading="lazy"
          className="h-[calc(100vh-13rem)] min-h-[32rem] w-full rounded-xl bg-card ring-1 ring-foreground/10"
        />
      ) : (
        <NotConfigured />
      )}
    </div>
  );
}

async function NotConfigured() {
  const t = await getTranslations("Admin.pages.visitorAnalytics");
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("notConfigured")}</CardTitle>
        <CardDescription>{t("notConfiguredDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <ol className="list-decimal space-y-2 pl-4 text-muted-foreground">
          <li>{t("setupStep1")}</li>
          <li>{t("setupStep2")}</li>
          <li>{t("setupStep3")}</li>
        </ol>
        <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs leading-relaxed">
          {'NEXT_PUBLIC_UMAMI_WEBSITE_ID="…"\nNEXT_PUBLIC_UMAMI_SHARE_URL="…"'}
        </pre>
        <p className="text-xs text-muted-foreground">{t("setupHint")}</p>
      </CardContent>
    </Card>
  );
}
