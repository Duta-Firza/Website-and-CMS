"use client";

import { ExternalLink, Loader2, Trash2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { deleteInquiry, updateInquiryStatus } from "@/lib/cms/actions";
import { cn } from "@/lib/utils";
import { INQUIRY_SOURCES, INQUIRY_STATUSES, type InquiryStatus } from "@/models/constants";
import type { InquiryRow } from "./page";

const SOURCE_FILTERS = ["all", ...INQUIRY_SOURCES] as const;
type SourceFilter = (typeof SOURCE_FILTERS)[number];
const STATUS_FILTERS = ["all", ...INQUIRY_STATUSES] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const SOURCE_COLOR: Record<string, string> = {
  trading: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  manufacturing: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  epc: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  contact: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
};

const STATUS_COLOR: Record<InquiryStatus, string> = {
  new: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  read: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
  archived: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
};

export function InquiryInbox({ initial }: { initial: InquiryRow[] }) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Admin");
  const tNav = useTranslations("AdminNav");
  const [rows, setRows] = useState(initial);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [activeRow, setActiveRow] = useState<InquiryRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setRows(initial);
  }, [initial]);

  const dateFormat = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [locale],
  );

  const filtered = rows.filter((r) => {
    if (sourceFilter !== "all" && r.source !== sourceFilter) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    return true;
  });

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={sourceFilter} onValueChange={(v) => setSourceFilter(v as SourceFilter)}>
          <TabsList>
            <TabsTrigger value="all">{t("tabs.inquiriesAll")}</TabsTrigger>
            <TabsTrigger value="trading">{tNav("trading")}</TabsTrigger>
            <TabsTrigger value="manufacturing">{tNav("manufacturing")}</TabsTrigger>
            <TabsTrigger value="epc">{tNav("epc")}</TabsTrigger>
            <TabsTrigger value="contact">{tNav("contactInfo")}</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="ml-auto flex items-center gap-2">
          <Label htmlFor="status-filter" className="text-xs text-muted-foreground">
            {t("common.type")}
          </Label>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger id="status-filter" className="h-9 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("tabs.inquiriesAll")}</SelectItem>
              <SelectItem value="new">{t("tabs.inquiriesNew")}</SelectItem>
              <SelectItem value="read">{t("tabs.inquiriesRead")}</SelectItem>
              <SelectItem value="archived">{t("tabs.inquiriesArchived")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden md:table-cell">
                {t("fields.inquiryReceivedAt")}
              </TableHead>
              <TableHead>{t("fields.inquirySource")}</TableHead>
              <TableHead>{t("fields.inquiryCompany")}</TableHead>
              <TableHead className="hidden lg:table-cell">{t("fields.inquiryEmail")}</TableHead>
              <TableHead className="w-28">{t("common.type")}</TableHead>
              <TableHead className="w-24 text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                  {t("empty.inquiries")}
                </TableCell>
              </TableRow>
            )}
            {filtered.map((r) => (
              <TableRow
                key={r.id}
                className="cursor-pointer hover:bg-muted/40"
                onClick={() => setActiveRow(r)}
              >
                <TableCell className="hidden whitespace-nowrap text-xs text-muted-foreground md:table-cell">
                  {dateFormat.format(new Date(r.createdAt))}
                </TableCell>
                <TableCell>
                  <Badge className={cn("text-[10px] uppercase", SOURCE_COLOR[r.source])}>
                    {r.source}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-48 font-medium">
                  <span className="block truncate" title={r.company}>
                    {r.company}
                  </span>
                </TableCell>
                <TableCell className="hidden max-w-xs text-sm text-muted-foreground lg:table-cell">
                  <span className="block truncate" title={r.email}>
                    {r.email}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={cn("text-[10px] uppercase", STATUS_COLOR[r.status])}>
                    {t(`tabs.inquiries${capitalize(r.status)}` as never)}
                  </Badge>
                </TableCell>
                <TableCell
                  className="text-right"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setDeleteId(r.id)}
                    aria-label={t("delete")}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {activeRow && (
        <InquiryDetailDialog
          inquiry={activeRow}
          onClose={() => setActiveRow(null)}
          onSaved={(updated) => {
            setRows((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
            setActiveRow(null);
            router.refresh();
          }}
        />
      )}

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

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function InquiryDetailDialog({
  inquiry,
  onClose,
  onSaved,
}: {
  inquiry: InquiryRow;
  onClose: () => void;
  onSaved: (updated: InquiryRow) => void;
}) {
  const t = useTranslations("Admin");
  const [status, setStatus] = useState<InquiryStatus>(inquiry.status);
  const [notes, setNotes] = useState(inquiry.notes);
  const [saving, setSaving] = useState(false);

  const fullName = [inquiry.firstName, inquiry.lastName].filter(Boolean).join(" ");

  const handleSave = async () => {
    setSaving(true);
    const result = await updateInquiryStatus(inquiry.id, status, notes);
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(t("saved"));
    onSaved({ ...inquiry, status, notes });
  };

  const mailto = `mailto:${inquiry.email}?subject=Re: ${encodeURIComponent(
    `[${inquiry.source.toUpperCase()}] inquiry from ${inquiry.company}`,
  )}`;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t("nouns.inquiry")} · {inquiry.company}
          </DialogTitle>
        </DialogHeader>

        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("groups.inquiryMeta")}
          </h3>
          <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            <MetaRow
              label={t("fields.inquiryReceivedAt")}
              value={new Date(inquiry.createdAt).toLocaleString()}
            />
            <MetaRow label={t("fields.inquirySource")} value={inquiry.source} />
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

        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("fields.inquiryMessage")}
          </h3>
          <p className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm">
            {inquiry.message}
          </p>
        </section>

        <section className="space-y-2">
          <Label htmlFor="inq-status">{t("common.type")}</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as InquiryStatus)}>
            <SelectTrigger id="inq-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">{t("tabs.inquiriesNew")}</SelectItem>
              <SelectItem value="read">{t("tabs.inquiriesRead")}</SelectItem>
              <SelectItem value="archived">{t("tabs.inquiriesArchived")}</SelectItem>
            </SelectContent>
          </Select>
        </section>

        <section className="space-y-2">
          <Label htmlFor="inq-notes">{t("fields.adminNotes")}</Label>
          <Textarea
            id="inq-notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </section>

        <DialogFooter className="gap-2 sm:gap-2">
          <a href={mailto} className={buttonVariants({ variant: "outline" })}>
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
            {t("buttons.replyEmail")}
          </a>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
