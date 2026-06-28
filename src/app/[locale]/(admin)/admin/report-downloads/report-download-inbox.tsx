"use client";

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Inbox,
  Mail,
  MailOpen,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteReportLead, setReportLeadRead } from "@/lib/cms/actions";
import { cn } from "@/lib/utils";
import { REPORT_DOWNLOAD_ACTIONS, type ReportDownloadAction } from "@/models/constants";
import type { ReportLeadRow } from "./page";

const FILTER_TABS = ["all", "unread", ...REPORT_DOWNLOAD_ACTIONS] as const;
type FilterTab = (typeof FILTER_TABS)[number];
const TYPE_FILTERS = ["all", "annual", "financial"] as const;
type TypeFilter = (typeof TYPE_FILTERS)[number];
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

const ACTION_COLOR: Record<ReportDownloadAction, string> = {
  download: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  view: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
};

export function ReportDownloadInbox({ initial }: { initial: ReportLeadRow[] }) {
  const router = useRouter();
  const t = useTranslations("Admin");
  const locale = useLocale();
  const [rows, setRows] = useState(initial);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState(1);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setRows(initial);
  }, [initial]);

  const changeFilter = (v: FilterTab) => {
    setFilter(v);
    setPage(1);
  };
  const changeTypeFilter = (v: TypeFilter) => {
    setTypeFilter(v);
    setPage(1);
  };
  const changeSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };
  const changePageSize = (n: number) => {
    setPageSize(n);
    setPage(1);
  };

  const dateFormat = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [locale],
  );

  const actionLabel = (a: ReportDownloadAction) => t(`reportLeads.action_${a}` as never);
  const unreadCount = rows.filter((r) => !r.read).length;

  const q = search.trim().toLowerCase();
  const filtered = rows.filter((r) => {
    if (filter === "unread") {
      if (r.read) return false;
    } else if (filter !== "all" && r.action !== filter) {
      return false;
    }
    if (typeFilter !== "all" && r.reportType !== typeFilter) return false;
    if (q && !`${r.company} ${r.fullName} ${r.email} ${r.reportTitle}`.toLowerCase().includes(q)) {
      return false;
    }
    return true;
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * pageSize;
  const paged = filtered.slice(pageStart, pageStart + pageSize);

  const activeRow = rows.find((r) => r.id === activeId) ?? null;

  const patchRow = (id: string, patch: Partial<ReportLeadRow>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const openRow = (row: ReportLeadRow) => {
    setActiveId(row.id);
    if (!row.read) {
      patchRow(row.id, { read: true });
      void setReportLeadRead(row.id, true);
    }
  };

  const toggleRead = (row: ReportLeadRow) => {
    const next = !row.read;
    patchRow(row.id, { read: next });
    void setReportLeadRead(row.id, next);
  };

  const tabLabel = (tab: FilterTab) =>
    tab === "all"
      ? t("reportLeads.filterAll")
      : tab === "unread"
        ? t("tabs.inquiriesUnread")
        : actionLabel(tab);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-1">
          {FILTER_TABS.map((tab) => {
            const active = filter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => changeFilter(tab)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-accent text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {tabLabel(tab)}
                {tab === "unread" && unreadCount > 0 && (
                  <span
                    className={cn(
                      "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none",
                      active ? "bg-white/25 text-white" : "bg-brand-accent text-white",
                    )}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(e) => changeSearch(e.target.value)}
              placeholder={t("reportLeads.searchPlaceholder")}
              aria-label={t("common.search")}
              className="h-9 w-full pl-8 sm:w-64"
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => changeTypeFilter(v as TypeFilter)}>
            <SelectTrigger className="h-9 w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_FILTERS.map((tp) => (
                <SelectItem key={tp} value={tp}>
                  {tp === "all" ? t("reportLeads.allTypes") : t(`reportLeads.type_${tp}` as never)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => router.refresh()}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            {t("buttons.refresh")}
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[22rem_1fr]">
        {/* List pane */}
        <div
          className={cn(
            "flex flex-col gap-3 lg:max-h-[calc(100vh-13rem)]",
            activeId && "max-lg:hidden",
          )}
        >
          <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto lg:pr-1">
            {filtered.length === 0 && (
              <p className="rounded-lg border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                {t("reportLeads.empty")}
              </p>
            )}
            {paged.map((r) => {
              const selected = r.id === activeId;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => openRow(r)}
                  className={cn(
                    "flex w-full flex-col gap-1.5 rounded-lg border bg-card p-3 text-left transition-colors",
                    selected
                      ? "border-brand-accent/40 bg-brand-accent/5 ring-1 ring-brand-accent/20"
                      : "hover:border-border hover:bg-muted/40",
                  )}
                >
                  <div className="flex items-center gap-2">
                    {!r.read && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-brand-accent" aria-hidden />
                    )}
                    <span
                      className={cn(
                        "flex-1 truncate text-sm",
                        r.read ? "font-medium text-foreground" : "font-semibold text-foreground",
                      )}
                    >
                      {r.fullName || r.company || r.email || "—"}
                    </span>
                    <Badge className={cn("shrink-0 gap-1 text-[10px]", ACTION_COLOR[r.action])}>
                      {r.action === "download" ? (
                        <Download className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                      {actionLabel(r.action)}
                    </Badge>
                  </div>
                  <span className="truncate text-xs text-muted-foreground">
                    {r.company ? `${r.company} · ` : ""}
                    {r.email}
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-1 truncate text-[11px] text-muted-foreground">
                      <FileText className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        {r.reportTitle || "—"}
                        {r.reportYear ? ` · ${r.reportYear}` : ""}
                      </span>
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {dateFormat.format(new Date(r.createdAt))}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          {filtered.length > 0 && (
            <LeadPagination
              page={currentPage}
              pageCount={pageCount}
              pageSize={pageSize}
              rangeFrom={pageStart + 1}
              rangeTo={pageStart + paged.length}
              total={filtered.length}
              onPage={setPage}
              onPageSize={changePageSize}
              t={t}
            />
          )}
        </div>

        {/* Detail pane */}
        <div
          className={cn(
            "rounded-lg border bg-card lg:max-h-[calc(100vh-13rem)] lg:overflow-y-auto",
            !activeId && "hidden lg:block",
          )}
        >
          {activeRow ? (
            <LeadDetail
              key={activeRow.id}
              lead={activeRow}
              t={t}
              dateFormat={dateFormat}
              actionLabel={actionLabel}
              onBack={() => setActiveId(null)}
              onToggleRead={() => toggleRead(activeRow)}
              onDelete={() => setDeleteId(activeRow.id)}
            />
          ) : (
            <div className="flex h-full min-h-64 flex-col items-center justify-center gap-2 p-8 text-center">
              <Inbox className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">{t("reportLeads.selectLead")}</p>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>{t("alertDelete")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={async () => {
                if (!deleteId) return;
                const result = await deleteReportLead(deleteId);
                if (result.ok) {
                  toast.success(t("saved"));
                  setRows((prev) => prev.filter((x) => x.id !== deleteId));
                  if (activeId === deleteId) setActiveId(null);
                  setDeleteId(null);
                  router.refresh();
                } else toast.error(result.error);
              }}
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function LeadDetail({
  lead,
  t,
  dateFormat,
  actionLabel,
  onBack,
  onToggleRead,
  onDelete,
}: {
  lead: ReportLeadRow;
  t: ReturnType<typeof useTranslations>;
  dateFormat: Intl.DateTimeFormat;
  actionLabel: (a: ReportDownloadAction) => string;
  onBack: () => void;
  onToggleRead: () => void;
  onDelete: () => void;
}) {
  const mailto = `mailto:${lead.email}`;
  return (
    <div className="space-y-6 p-5 md:p-6">
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon-sm" className="lg:hidden" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-semibold text-foreground">
              {lead.fullName || lead.company || lead.email || "—"}
            </h2>
            <Badge className={cn("gap-1 text-[10px]", ACTION_COLOR[lead.action])}>
              {lead.action === "download" ? (
                <Download className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
              {actionLabel(lead.action)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("fields.inquiryReceivedAt")}: {dateFormat.format(new Date(lead.createdAt))}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleRead}
          title={lead.read ? t("buttons.markUnread") : t("buttons.markRead")}
        >
          {lead.read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
        </Button>
      </div>

      {/* Report */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("reportLeads.report")}
        </h3>
        <div className="flex items-center gap-2 rounded-md border bg-muted/30 p-3 text-sm">
          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="font-medium">{lead.reportTitle || "—"}</span>
          {lead.reportYear && <span className="text-muted-foreground">· {lead.reportYear}</span>}
          {lead.reportType && (
            <Badge variant="secondary" className="ml-auto text-[10px] capitalize">
              {t(`tabs.${lead.reportType}` as never)}
            </Badge>
          )}
        </div>
      </section>

      {/* Contact */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("groups.inquiryMeta")}
        </h3>
        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <MetaRow label={t("common.name")} value={lead.fullName || "—"} />
          <MetaRow
            label={t("fields.inquiryEmail")}
            value={
              lead.email ? (
                <a className="text-brand-accent hover:underline" href={`mailto:${lead.email}`}>
                  {lead.email}
                </a>
              ) : (
                "—"
              )
            }
          />
          <MetaRow label={t("fields.inquiryPhone")} value={lead.phone || "—"} />
          <MetaRow label={t("reportLeads.company")} value={lead.company || "—"} />
          {lead.customFields.map((f) => (
            <MetaRow key={f.key} label={f.key} value={f.value || "—"} />
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2 border-t pt-4">
        {lead.email && (
          <a href={mailto} className={buttonVariants({ variant: "brand" })}>
            <Mail className="mr-1.5 h-3.5 w-3.5" />
            {t("buttons.replyEmail")}
          </a>
        )}
        <Button
          type="button"
          variant="ghost"
          className="ml-auto text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          {t("delete")}
        </Button>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="wrap-break-word text-sm">{value}</p>
    </div>
  );
}

function LeadPagination({
  page,
  pageCount,
  pageSize,
  rangeFrom,
  rangeTo,
  total,
  onPage,
  onPageSize,
  t,
}: {
  page: number;
  pageCount: number;
  pageSize: number;
  rangeFrom: number;
  rangeTo: number;
  total: number;
  onPage: (p: number) => void;
  onPageSize: (n: number) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
      <span>{t("common.showing", { from: rangeFrom, to: rangeTo, total })}</span>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          aria-label={t("common.prevPage")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Select value={String(page)} onValueChange={(v) => onPage(Number(v))}>
          <SelectTrigger className="h-8 w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
              <SelectItem key={p} value={String(p)}>
                {t("common.page", { n: p })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page >= pageCount}
          onClick={() => onPage(page + 1)}
          aria-label={t("common.nextPage")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-1 items-center justify-between gap-2 text-right ">
        <label htmlFor="rl-page-size" className="text-xs text-muted-foreground">
          {t("reportLeads.itemsPerPage")}
        </label>
        <Select value={String(pageSize)} onValueChange={(v) => onPageSize(Number(v))}>
          <SelectTrigger id="rl-page-size" className="h-8 w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {t("common.perPage", { count: n })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
