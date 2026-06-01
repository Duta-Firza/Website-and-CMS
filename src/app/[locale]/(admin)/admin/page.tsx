import { Briefcase, Building2, Handshake, Sparkles } from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { connectDB } from "@/lib/db";
import { Customer, Partner, Project } from "@/models";

async function getDashboardMetrics() {
  await connectDB();
  const [partnersCount, projectsCount, customersCount] = await Promise.all([
    Partner.countDocuments({ isActive: true }),
    Project.countDocuments({ isPublished: true }),
    Customer.countDocuments({}),
  ]);
  return { partnersCount, projectsCount, customersCount };
}

export default async function AdminDashboardPage() {
  const locale = await getLocale();
  const t = await getTranslations("AdminNav");
  const tAdmin = await getTranslations("Admin");

  let metrics = { partnersCount: 0, projectsCount: 0, customersCount: 0 };
  try {
    metrics = await getDashboardMetrics();
  } catch {
    // DB not reachable — show zeros, page still renders
  }

  const base = `/${locale}/admin`;
  const quickLinks = [
    { href: `${base}/landing`, icon: Sparkles, label: t("landing") },
    { href: `${base}/partners`, icon: Handshake, label: t("partners") },
    { href: `${base}/projects`, icon: Briefcase, label: t("projects") },
    { href: `${base}/customers`, icon: Building2, label: t("customers") },
  ];

  return (
    <div className="space-y-8">
      <AdminPageHeader title={tAdmin("dashboard")} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard label={t("partners")} value={metrics.partnersCount} />
        <MetricCard label={t("projects")} value={metrics.projectsCount} />
        <MetricCard label={t("customers")} value={metrics.customersCount} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Quick actions
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {quickLinks.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg border bg-card p-4 transition hover:border-brand-accent/30 hover:shadow-sm"
            >
              <span className="rounded-md bg-muted p-2 text-foreground">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}
