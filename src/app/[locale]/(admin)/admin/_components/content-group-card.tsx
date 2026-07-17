import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { AdminNavGroup } from "@/components/admin/admin-nav-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContentMetric } from "@/lib/cms/dashboard";
import { cn } from "@/lib/utils";
import type { PageStatus } from "@/models/constants";

/** Same palette the Solutions status picker uses, so the two agree on sight. */
const STATUS_CLASS: Record<PageStatus, string> = {
  published: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  comingSoon: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  hidden: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

interface Props {
  group: AdminNavGroup;
  metrics: Record<string, ContentMetric | undefined>;
  dateFormat: Intl.DateTimeFormat;
}

export async function ContentGroupCard({ group, metrics, dateFormat }: Props) {
  const tNav = await getTranslations("AdminNav");
  const tStatus = await getTranslations("Admin.status");
  const GroupIcon = group.icon;

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <GroupIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
          {tNav(group.titleKey)}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        <ul>
          {group.items.map((item) => {
            const metric = metrics[item.labelKey];
            const label = tNav(item.labelKey);

            const value = (
              <>
                {metric?.count !== undefined && (
                  <span className="text-sm font-semibold tabular-nums">{metric.count}</span>
                )}
                {metric?.status ? (
                  <Badge variant="ghost" className={cn(STATUS_CLASS[metric.status])}>
                    {tStatus(metric.status)}
                  </Badge>
                ) : (
                  // Rows with no status (Landing) fall back to a timestamp so
                  // they don't render as a bare label.
                  metric?.updatedAt !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      {metric.updatedAt
                        ? `${tStatus("lastUpdated")} ${dateFormat.format(new Date(metric.updatedAt))}`
                        : tStatus("neverUpdated")}
                    </span>
                  )
                )}
              </>
            );

            if (item.comingSoon) {
              return (
                <li
                  key={item.labelKey}
                  className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground/60"
                >
                  <span className="flex-1 truncate">{label}</span>
                  <span className="rounded bg-muted px-1 text-[10px] font-medium uppercase tracking-wider">
                    {tNav("comingSoon")}
                  </span>
                </li>
              );
            }

            return (
              <li key={item.labelKey}>
                <Link
                  href={item.href}
                  className="group/row flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted/60"
                >
                  <span className="flex-1 truncate">{label}</span>
                  {value}
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/row:opacity-100" />
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
