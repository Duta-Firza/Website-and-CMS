"use client";

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { deleteInquiry, setInquiryRead, updateInquiryStatus } from "@/lib/cms/actions";
import { cn } from "@/lib/utils";
import { INQUIRY_SOURCES, INQUIRY_STATUSES, type InquiryStatus } from "@/models/constants";
import type { InquiryRow } from "./page";

const SOURCE_FILTERS = ["all", ...INQUIRY_SOURCES] as const;
type SourceFilter = (typeof SOURCE_FILTERS)[number];
const STATUS_TABS = ["all", "unread", ...INQUIRY_STATUSES] as const;
type StatusTab = (typeof STATUS_TABS)[number];
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

const SOURCE_COLOR: Record<string, string> = {
  trading: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  manufacturing: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  epc: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  technology: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300",
  contact: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
};

const STATUS_COLOR: Record<InquiryStatus, string> = {
  new: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  inProgress: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  resolved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  archived: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function InquiryInbox({ initial }: { initial: InquiryRow[] }) {
  const router = useRouter();
  const t = useTranslations("Admin");
  const tNav = useTranslations("AdminNav");
  const locale = useLocale();
  const [rows, setRows] = useState(initial);
  const [statusFilter, setStatusFilter] = useState<StatusTab>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState(1);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setRows(initial);
  }, [initial]);

  // Any change to the result set sends the list back to the first page.
  const changeStatusFilter = (v: StatusTab) => {
    setStatusFilter(v);
    setPage(1);
  };
  const changeSourceFilter = (v: SourceFilter) => {
    setSourceFilter(v);
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

  const statusLabel = (s: InquiryStatus) => t(`tabs.inquiries${capitalize(s)}` as never);
  const sourceLabel = (s: string) => (s === "contact" ? tNav("contactInfo") : tNav(s));

  const unreadCount = rows.filter((r) => !r.read).length;

  const q = search.trim().toLowerCase();
  const filtered = rows.filter((r) => {
    if (sourceFilter !== "all" && r.source !== sourceFilter) return false;
    if (statusFilter === "unread") {
      if (r.read) return false;
    } else if (statusFilter !== "all" && r.status !== statusFilter) {
      return false;
    }
    if (
      q &&
      !`${r.company} ${r.firstName} ${r.lastName} ${r.email} ${r.message}`.toLowerCase().includes(q)
    ) {
      return false;
    }
    return true;
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * pageSize;
  const paged = filtered.slice(pageStart, pageStart + pageSize);

  const activeRow = rows.find((r) => r.id === activeId) ?? null;

  const patchRow = (id: string, patch: Partial<InquiryRow>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const openRow = (row: InquiryRow) => {
    setActiveId(row.id);
    if (!row.read) {
      patchRow(row.id, { read: true });
      void setInquiryRead(row.id, true);
    }
  };

  const toggleRead = (row: InquiryRow) => {
    const next = !row.read;
    patchRow(row.id, { read: next });
    void setInquiryRead(row.id, next);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-1">
          {STATUS_TABS.map((tab) => {
            const label =
              tab === "all"
                ? t("tabs.inquiriesAll")
                : tab === "unread"
                  ? t("tabs.inquiriesUnread")
                  : statusLabel(tab);
            const active = statusFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => changeStatusFilter(tab)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-accent text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {label}
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
              placeholder={t("common.searchInquiries")}
              aria-label={t("common.search")}
              className="h-9 w-full pl-8 sm:w-60"
            />
          </div>
          <Select value={sourceFilter} onValueChange={(v) => changeSourceFilter(v as SourceFilter)}>
            <SelectTrigger className="h-9 w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SOURCE_FILTERS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "all" ? t("fields.inquirySource") : sourceLabel(s)}
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
                {t("empty.inquiries")}
              </p>
            )}
            {paged.map((r) => {
              const selected = r.id === activeId;
              const fullName = [r.firstName, r.lastName].filter(Boolean).join(" ");
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
                      {r.company}
                    </span>
                    <Badge className={cn("shrink-0 text-[10px]", STATUS_COLOR[r.status])}>
                      {statusLabel(r.status)}
                    </Badge>
                  </div>
                  <span className="truncate text-xs text-muted-foreground">
                    {fullName} · {r.email}
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <Badge className={cn("text-[10px] uppercase", SOURCE_COLOR[r.source])}>
                      {sourceLabel(r.source)}
                    </Badge>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {dateFormat.format(new Date(r.createdAt))}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          {filtered.length > 0 && (
            <InquiryPagination
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
            <InquiryDetail
              key={activeRow.id}
              inquiry={activeRow}
              t={t}
              dateFormat={dateFormat}
              statusLabel={statusLabel}
              sourceLabel={sourceLabel}
              onBack={() => setActiveId(null)}
              onToggleRead={() => toggleRead(activeRow)}
              onPatch={(patch) => patchRow(activeRow.id, patch)}
              onDelete={() => setDeleteId(activeRow.id)}
            />
          ) : (
            <div className="flex h-full min-h-64 flex-col items-center justify-center gap-2 p-8 text-center">
              <Mail className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">{t("empty.selectInquiry")}</p>
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
                const result = await deleteInquiry(deleteId);
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

function InquiryDetail({
  inquiry,
  t,
  dateFormat,
  statusLabel,
  sourceLabel,
  onBack,
  onToggleRead,
  onPatch,
  onDelete,
}: {
  inquiry: InquiryRow;
  t: ReturnType<typeof useTranslations>;
  dateFormat: Intl.DateTimeFormat;
  statusLabel: (s: InquiryStatus) => string;
  sourceLabel: (s: string) => string;
  onBack: () => void;
  onToggleRead: () => void;
  onPatch: (patch: Partial<InquiryRow>) => void;
  onDelete: () => void;
}) {
  const [notes, setNotes] = useState(inquiry.notes);
  const [savingStatus, setSavingStatus] = useState<InquiryStatus | null>(null);
  const [savingNotes, setSavingNotes] = useState(false);

  const fullName = [inquiry.firstName, inquiry.lastName].filter(Boolean).join(" ");
  const mailto = `mailto:${inquiry.email}?subject=Re: ${encodeURIComponent(
    `[${inquiry.source.toUpperCase()}] inquiry from ${inquiry.company}`,
  )}`;

  const changeStatus = async (next: InquiryStatus) => {
    if (next === inquiry.status) return;
    setSavingStatus(next);
    const prev = inquiry.status;
    onPatch({ status: next });
    const result = await updateInquiryStatus(inquiry.id, next, notes);
    setSavingStatus(null);
    if (!result.ok) {
      onPatch({ status: prev });
      toast.error(result.error);
    } else {
      toast.success(t("saved"));
    }
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    const result = await updateInquiryStatus(inquiry.id, inquiry.status, notes);
    setSavingNotes(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    onPatch({ notes });
    toast.success(t("saved"));
  };

  return (
    <div className="space-y-6 p-5 md:p-6">
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon-sm" className="lg:hidden" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-semibold text-foreground">{inquiry.company}</h2>
            <Badge className={cn("text-[10px]", STATUS_COLOR[inquiry.status])}>
              {statusLabel(inquiry.status)}
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {fullName} · {sourceLabel(inquiry.source)}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("fields.inquiryReceivedAt")}: {dateFormat.format(new Date(inquiry.createdAt))}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleRead}
          title={inquiry.read ? t("buttons.markUnread") : t("buttons.markRead")}
        >
          {inquiry.read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
        </Button>
      </div>

      {/* Workflow status */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("groups.updateStatus")}
        </h3>
        <div className="flex flex-wrap gap-2">
          {INQUIRY_STATUSES.map((s) => {
            const active = inquiry.status === s;
            return (
              <button
                key={s}
                type="button"
                disabled={savingStatus !== null}
                onClick={() => changeStatus(s)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60",
                  active
                    ? cn(STATUS_COLOR[s], "border-transparent")
                    : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {savingStatus === s && <Loader2 className="h-3 w-3 animate-spin" />}
                {statusLabel(s)}
              </button>
            );
          })}
        </div>
      </section>

      {/* Meta */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("groups.inquiryMeta")}
        </h3>
        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <MetaRow label={t("fields.inquirySource")} value={sourceLabel(inquiry.source)} />
          <MetaRow label={t("common.name")} value={fullName} />
          <MetaRow
            label={t("fields.inquiryEmail")}
            value={
              <a className="text-brand-accent hover:underline" href={`mailto:${inquiry.email}`}>
                {inquiry.email}
              </a>
            }
          />
          <MetaRow label={t("fields.inquiryPhone")} value={inquiry.phone || "—"} />
          <MetaRow label={t("fields.inquiryCountry")} value={inquiry.country || "—"} />
          {inquiry.websiteUrl && (
            <MetaRow
              label={t("fields.inquiryWebsiteUrl")}
              value={
                <a
                  className="text-brand-accent hover:underline"
                  href={inquiry.websiteUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {inquiry.websiteUrl}
                </a>
              }
            />
          )}
        </div>
      </section>

      {/* Message */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("fields.inquiryMessage")}
        </h3>
        <p className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm">
          {inquiry.message}
        </p>
      </section>

      {/* Internal notes */}
      <section className="space-y-2">
        <Label htmlFor="inq-notes">{t("fields.adminNotes")}</Label>
        <Textarea
          id="inq-notes"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={saveNotes}
            disabled={savingNotes}
          >
            {savingNotes && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            {t("save")}
          </Button>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2 border-t pt-4">
        <a href={mailto} className={buttonVariants({ variant: "brand" })}>
          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
          {t("buttons.replyEmail")}
        </a>
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
      <p className="break-words text-sm">{value}</p>
    </div>
  );
}

function InquiryPagination({
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
        <label htmlFor="inq-page-size" className="text-xs text-muted-foreground">
          {t("reportLeads.itemsPerPage")}
        </label>
        <Select value={String(pageSize)} onValueChange={(v) => onPageSize(Number(v))}>
          <SelectTrigger className="h-8 w-28">
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
