"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { pickLocalized } from "@/components/admin/localized-text";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteJobOpening } from "@/lib/cms/actions";
import type { JobOpeningRow } from "../page";

interface Props {
  initial: JobOpeningRow[];
  newHref: string;
  editBase: string;
}

export function JobOpeningsManager({ initial, newHref, editBase }: Props) {
  const t = useTranslations("Admin");
  const tc = useTranslations("Careers");
  const locale = useLocale();
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <>
      <div className="flex items-center justify-end">
        <Link href={newHref} className={buttonVariants({ variant: "default" })}>
          <Plus className="mr-2 h-4 w-4" />
          {t("add")}
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.title")}</TableHead>
              <TableHead className="w-32">{tc("employmentType")}</TableHead>
              <TableHead className="w-32">{t("common.city")}</TableHead>
              <TableHead className="w-24">{t("common.published")}</TableHead>
              <TableHead className="w-24 text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initial.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                  {t("empty.jobOpenings")}
                </TableCell>
              </TableRow>
            )}
            {initial.map((job) => (
              <TableRow key={job.id}>
                <TableCell>
                  <p className="truncate font-medium">{pickLocalized(job.title, locale)}</p>
                  {job.department && (
                    <p className="truncate text-xs text-muted-foreground">{job.department}</p>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {tc(`empType.${job.employmentType}`)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {job.location || "—"}
                </TableCell>
                <TableCell>
                  {job.isPublished ? (
                    <Badge variant="default" className="text-xs">
                      {t("status.published")}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      {t("status.hidden")}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Link
                      href={`${editBase}/${job.id}`}
                      className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(job.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={async () => {
                if (!deleteId) return;
                const result = await deleteJobOpening(deleteId);
                if (result.ok) {
                  toast.success(t("saved"));
                  setDeleteId(null);
                  router.refresh();
                } else {
                  toast.error(result.error);
                }
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
