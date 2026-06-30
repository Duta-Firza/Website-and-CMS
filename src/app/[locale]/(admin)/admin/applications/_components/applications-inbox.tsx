"use client";

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Mail,
  MailOpen,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { deleteApplication, setApplicationRead, updateApplicationStatus } from "@/lib/cms/actions";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/lib/cms/list-query";
import { cn } from "@/lib/utils";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/models/constants";
import type { ApplicationRow } from "../page";

const STATUS_TABS = ["all", "unread", ...APPLICATION_STATUSES] as const;

const STATUS_COLOR: Record<ApplicationStatus, string> = {
  new: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  reviewing: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  shortlisted: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  rejected: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  hired: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
};

export function ApplicationsInbox({
  rows: serverRows,
  total,
  unreadCount,
  q: serverQ,
  status,
  page,
  pageSize,
}: {
  rows: ApplicationRow[];
  total: number;
  unreadCount: number;
  q: string;
  status: string;
  page: number;
  pageSize: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("Admin");
  const locale = useLocale();

  const [rows, setRows] = useState(serverRows);
  useEffect(() => {
    setRows(serverRows);
  }, [serverRows]);
  const [unread, setUnread] = useState(unreadCount);
  useEffect(() => {
    setUnread(unreadCount);
  }, [unreadCount]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [term, setTerm] = useState(serverQ);
  const focusedRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!focusedRef.current) setTerm(serverQ);
  }, [serverQ]);

  const pushParams = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") params.delete(k);
      else params.set(k, v);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const onSearchChange = (value: string) => {
    setTerm(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => pushParams({ q: value.trim() || null, page: null }),
      350,
    );
  };
  const flushSearch = () => {
    focusedRef.current = false;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (term.trim() !== serverQ) pushParams({ q: term.trim() || null, page: null });
  };
  const goToPage = (p: number) => pushParams({ page: p <= 1 ? null : String(p) });
  const changePageSize = (n: number) =>
    pushParams({ pageSize: n === DEFAULT_PAGE_SIZE ? null : String(n), page: null });

  const dateFormat = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [locale],
  );

  const statusLabel = (s: ApplicationStatus) => t(`applicationStatus.${s}` as never);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const rangeFrom = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeTo = (page - 1) * pageSize + rows.length;

  const activeRow = rows.find((r) => r.id === activeId) ?? null;

  const patchRow = (id: string, patch: Partial<ApplicationRow>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const openRow = (row: ApplicationRow) => {
    setActiveId(row.id);
    if (!row.read) {
      patchRow(row.id, { read: true });
      setUnread((u) => Math.max(0, u - 1));
      void setApplicationRead(row.id, true);
    }
  };

  const toggleRead = (row: ApplicationRow) => {
    const next = !row.read;
    patchRow(row.id, { read: next });
    setUnread((u) => (next ? Math.max(0, u - 1) : u + 1));
    void setApplicationRead(row.id, next);
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
            const active = status === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => pushParams({ status: tab === "all" ? null : tab, page: null })}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-accent text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {label}
                {tab === "unread" && unread > 0 && (
                  <span
                    className={cn(
                      "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none",
                      active ? "bg-white/25 text-white" : "bg-brand-accent text-white",
                    )}
                  >
                    {unread}
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
              value={term}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => {
                focusedRef.current = true;
              }}
              onBlur={flushSearch}
              placeholder={t("pages.applications.searchPlaceholder")}
              aria-label={t("common.search")}
              className="h-9 w-full pl-8 sm:w-64"
            />
          </div>
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
            {rows.length === 0 && (
              <p className="rounded-lg border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                {t("empty.applications")}
              </p>
            )}
            {rows.map((r) => {
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
                      {fullName || r.email}
                    </span>
                    <Badge className={cn("shrink-0 text-[10px]", STATUS_COLOR[r.status])}>
                      {statusLabel(r.status)}
                    </Badge>
                  </div>
                  <span className="truncate text-xs text-muted-foreground">
                    {r.jobTitle || "—"}
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[11px] text-muted-foreground">{r.email}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {dateFormat.format(new Date(r.createdAt))}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          {total > 0 && (
            <ApplicationPagination
              page={page}
              pageCount={pageCount}
              pageSize={pageSize}
              rangeFrom={rangeFrom}
              rangeTo={rangeTo}
              total={total}
              onPage={goToPage}
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
            <ApplicationDetail
              key={activeRow.id}
              app={activeRow}
              t={t}
              dateFormat={dateFormat}
              statusLabel={statusLabel}
              onBack={() => setActiveId(null)}
              onToggleRead={() => toggleRead(activeRow)}
              onPatch={(patch) => patchRow(activeRow.id, patch)}
              onDelete={() => setDeleteId(activeRow.id)}
            />
          ) : (
            <div className="flex h-full min-h-64 flex-col items-center justify-center gap-2 p-8 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">{t("empty.selectApplication")}</p>
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
                const result = await deleteApplication(deleteId);
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

function ApplicationDetail({
  app,
  t,
  dateFormat,
  statusLabel,
  onBack,
  onToggleRead,
  onPatch,
  onDelete,
}: {
  app: ApplicationRow;
  t: ReturnType<typeof useTranslations>;
  dateFormat: Intl.DateTimeFormat;
  statusLabel: (s: ApplicationStatus) => string;
  onBack: () => void;
  onToggleRead: () => void;
  onPatch: (patch: Partial<ApplicationRow>) => void;
  onDelete: () => void;
}) {
  const [notes, setNotes] = useState(app.notes);
  const [savingStatus, setSavingStatus] = useState<ApplicationStatus | null>(null);
  const [savingNotes, setSavingNotes] = useState(false);

  const fullName = [app.firstName, app.lastName].filter(Boolean).join(" ");
  const mailto = `mailto:${app.email}?subject=Re: ${encodeURIComponent(
    `Application for ${app.jobTitle}`,
  )}`;

  const changeStatus = async (next: ApplicationStatus) => {
    if (next === app.status) return;
    setSavingStatus(next);
    const prev = app.status;
    onPatch({ status: next });
    const result = await updateApplicationStatus(app.id, next, notes);
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
    const result = await updateApplicationStatus(app.id, app.status, notes);
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
            <h2 className="truncate text-lg font-semibold text-foreground">
              {fullName || app.email}
            </h2>
            <Badge className={cn("text-[10px]", STATUS_COLOR[app.status])}>
              {statusLabel(app.status)}
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{app.jobTitle}</p>
          <p className="text-xs text-muted-foreground">
            {t("fields.inquiryReceivedAt")}: {dateFormat.format(new Date(app.createdAt))}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleRead}
          title={app.read ? t("buttons.markUnread") : t("buttons.markRead")}
        >
          {app.read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
        </Button>
      </div>

      {/* Pipeline status */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("groups.updateStatus")}
        </h3>
        <div className="flex flex-wrap gap-2">
          {APPLICATION_STATUSES.map((s) => {
            const active = app.status === s;
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

      {/* CV */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("applicationsInbox.cv")}
        </h3>
        {app.cvUrl ? (
          <a
            href={app.cvUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm font-medium text-brand-accent hover:underline"
          >
            <Download className="h-4 w-4" />
            {app.cvFileName || t("applicationsInbox.downloadCv")}
          </a>
        ) : (
          <p className="text-sm text-muted-foreground">—</p>
        )}
      </section>

      {/* Meta */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("groups.inquiryMeta")}
        </h3>
        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <MetaRow label={t("common.name")} value={fullName || "—"} />
          <MetaRow
            label={t("fields.inquiryEmail")}
            value={
              <a className="text-brand-accent hover:underline" href={`mailto:${app.email}`}>
                {app.email}
              </a>
            }
          />
          <MetaRow label={t("fields.inquiryPhone")} value={app.phone || "—"} />
          <MetaRow label={t("careerPage.jobItem")} value={app.jobTitle || "—"} />
          {app.customFields.map((f) => (
            <MetaRow key={f.key} label={f.key} value={f.value || "—"} />
          ))}
        </div>
      </section>

      {/* Internal notes */}
      <section className="space-y-2">
        <Label htmlFor="ap-notes">{t("fields.adminNotes")}</Label>
        <Textarea id="ap-notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
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

function ApplicationPagination({
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
      <div className="flex flex-1 items-center justify-between gap-2 text-right">
        <span className="text-xs text-muted-foreground">{t("reportLeads.itemsPerPage")}</span>
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
