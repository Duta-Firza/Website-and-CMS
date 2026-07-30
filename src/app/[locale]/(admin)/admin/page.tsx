import { getLocale, getTranslations } from "next-intl/server";
import { buildAdminNav } from "@/components/admin/admin-nav-data";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requirePageScope } from "@/lib/cms/access";
import { type DashboardData, EMPTY_DASHBOARD, getDashboardData } from "@/lib/cms/dashboard";
import type { Locale } from "@/lib/cms/localize";
import { ContentGroupCard } from "./_components/content-group-card";
import { InboxCard } from "./_components/inbox-card";

export default async function AdminDashboardPage() {
  // Ungated (`null`) so every admin has a landing page — this only resolves the
  // current user, whose scopes then filter what the overview shows.
  const admin = await requirePageScope(null);
  const locale = (await getLocale()) as Locale;
  const [tNav, tAdmin, t] = await Promise.all([
    getTranslations("AdminNav"),
    getTranslations("Admin"),
    getTranslations("AdminDashboard"),
  ]);

  // Every query fails together when Mongo is unreachable, so one catch is enough
  // to keep the page rendering.
  let data: DashboardData = EMPTY_DASHBOARD;
  try {
    data = await getDashboardData(locale);
  } catch {
    // DB not reachable — render the shell with empty metrics.
  }

  // Sections come from the sidebar itself, so the dashboard can't drift out of
  // sync with the nav the way the old hand-written link list did. Passing
  // `access` keeps it from advertising sections this admin can't open.
  const nav = buildAdminNav(locale, { role: admin.role, scopes: admin.scopes });
  const inboxItems = nav.sections.flatMap((s) =>
    s.key === "inbox" ? s.groups.flatMap((g) => g.items) : [],
  );
  const contentGroups = nav.sections.find((s) => s.key === "content")?.groups ?? [];

  const dateFormat = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-8">
      <AdminPageHeader title={tAdmin("dashboard")} description={t("description")} />

      {/* Each section is dropped entirely when the viewer's scopes filter it
          away, so a heading never sits above an empty grid. */}
      {inboxItems.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {tNav("sectionInbox")}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {inboxItems.map((item) => (
              <InboxCard
                key={item.labelKey}
                item={item}
                metric={data.inbox[item.labelKey]}
                dateFormat={dateFormat}
              />
            ))}
          </div>
        </section>
      )}

      {contentGroups.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {tNav("sectionContent")}
          </h2>
          {/* items-start: groups run 1–6 rows, so cards shouldn't stretch to match. */}
          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
            {contentGroups.map((group) => (
              <ContentGroupCard
                key={group.key}
                group={group}
                metrics={data.content}
                dateFormat={dateFormat}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
