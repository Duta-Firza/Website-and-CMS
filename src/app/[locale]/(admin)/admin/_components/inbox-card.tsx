import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { AdminNavItem } from "@/components/admin/admin-nav-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { InboxMetric } from "@/lib/cms/dashboard";

interface Props {
  item: AdminNavItem;
  metric: InboxMetric | undefined;
  dateFormat: Intl.DateTimeFormat;
}

export async function InboxCard({ item, metric, dateFormat }: Props) {
  const tNav = await getTranslations("AdminNav");
  const t = await getTranslations("AdminDashboard");
  const Icon = item.icon;
  const unread = metric?.unread ?? 0;
  const recent = metric?.recent ?? [];

  return (
    <Card className="flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 truncate">{tNav(item.labelKey)}</span>
          {unread > 0 ? (
            <Badge className="bg-brand-accent text-white">{t("unread", { count: unread })}</Badge>
          ) : (
            <span className="text-xs font-normal text-muted-foreground">{t("allRead")}</span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 px-2">
        {recent.length === 0 ? (
          <p className="px-2 py-2 text-sm text-muted-foreground">{t("emptyInbox")}</p>
        ) : (
          <ul>
            {recent.map((entry) => (
              <li key={entry.id} className="flex items-start gap-2 rounded-md px-2 py-2">
                <span
                  aria-hidden
                  className={
                    entry.read
                      ? "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-transparent"
                      : "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-accent"
                  }
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{entry.name}</span>
                  {entry.detail && (
                    <span className="block truncate text-xs text-muted-foreground">
                      {entry.detail}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {dateFormat.format(new Date(entry.createdAt))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <CardFooter>
        <Link
          href={item.href}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-accent hover:underline"
        >
          {t("seeAll")}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}
