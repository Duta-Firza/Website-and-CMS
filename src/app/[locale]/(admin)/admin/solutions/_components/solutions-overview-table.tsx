"use client";

import { ExternalLink, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { setSolutionPageStatus } from "@/lib/cms/actions";
import type { SolutionPageSlug, SolutionPageStatus } from "@/models/constants";
import type { SolutionPageOverviewRow } from "./load-solution-page";
import { StatusGroup } from "./status-group";

const ADMIN_PATH: Record<SolutionPageSlug, string> = {
  solutions: "/solutions/landing",
  trading: "/solutions/trading",
  "trading-partners": "/solutions/trading/partners",
  "trading-products": "/solutions/trading/products",
  manufacturing: "/solutions/manufacturing",
  epc: "/solutions/epc",
};

const PUBLIC_PATH: Record<SolutionPageSlug, string> = {
  solutions: "/solutions",
  trading: "/solutions/trading",
  "trading-partners": "/solutions/trading/partners",
  "trading-products": "/solutions/trading/products",
  manufacturing: "/solutions/manufacturing",
  epc: "/solutions/epc",
};

const LABEL_KEY: Record<SolutionPageSlug, string> = {
  solutions: "solutionsLanding",
  trading: "trading",
  "trading-partners": "tradingPartners",
  "trading-products": "tradingProducts",
  manufacturing: "manufacturing",
  epc: "epc",
};

export function SolutionsOverviewTable({ initial }: { initial: SolutionPageOverviewRow[] }) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Admin");
  const tNav = useTranslations("AdminNav");
  const [rows, setRows] = useState(initial);
  const [pending, setPending] = useState<SolutionPageSlug | null>(null);

  useEffect(() => {
    setRows(initial);
  }, [initial]);

  const dateFormat = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const handleChange = async (slug: SolutionPageSlug, next: SolutionPageStatus) => {
    const prev = rows;
    setRows((cur) => cur.map((r) => (r.slug === slug ? { ...r, status: next } : r)));
    setPending(slug);
    const result = await setSolutionPageStatus(slug, next);
    setPending(null);
    if (!result.ok) {
      setRows(prev);
      toast.error(result.error);
      return;
    }
    toast.success(t("status.toggleSaved"));
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t("helpers.solutionsOverviewIntro")}</p>
      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.title")}</TableHead>
              <TableHead className="w-md">{t("status.published")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("status.lastUpdated")}</TableHead>
              <TableHead className="w-32 text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.slug}>
                <TableCell className="font-medium">{tNav(LABEL_KEY[row.slug])}</TableCell>
                <TableCell>
                  <StatusGroup
                    size="sm"
                    value={row.status}
                    disabled={pending === row.slug}
                    onChange={(next) => handleChange(row.slug, next)}
                  />
                </TableCell>
                <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                  {row.updatedAt ? dateFormat.format(row.updatedAt) : t("status.neverUpdated")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Link
                      href={`/${locale}/admin${ADMIN_PATH[row.slug]}`}
                      className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                      aria-label={t("buttons.editContent")}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      href={`/${locale}${PUBLIC_PATH[row.slug]}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                      aria-label={t("buttons.viewPublic")}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
