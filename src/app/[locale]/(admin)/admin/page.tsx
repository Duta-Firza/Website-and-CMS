import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  const t = useTranslations("Admin");
  const common = useTranslations("Common");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">{t("dashboard")}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{common("comingSoon")}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          CMS modules (pages, projects, partners, leadership, newsroom, credentials, media,
          inquiries, users) will be implemented in Week 2.
        </CardContent>
      </Card>
    </div>
  );
}
