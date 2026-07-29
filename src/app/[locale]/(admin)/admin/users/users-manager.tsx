"use client";

import { KeyRound, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminListToolbar } from "@/components/admin/admin-list-toolbar";
import { StatusToggle } from "@/components/admin/status-toggle";
import { TablePagination } from "@/components/admin/table-pagination";
import { useAdminListParams } from "@/components/admin/use-admin-list-params";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UserRow } from "@/lib/cms/admin-users";
import { deleteUser, toggleUserActive } from "@/lib/cms/user-actions";
import {
  ASSIGNABLE_ROLES,
  ResetPasswordDialog,
  UserFormDialog,
  useUserError,
} from "./user-dialogs";

interface Props {
  items: UserRow[];
  total: number;
  /** Drives the self-protection guards mirrored server-side. */
  currentUserId: string;
}

export function UsersManager({ items, total, currentUserId }: Props) {
  const router = useRouter();
  const t = useTranslations("Admin");
  const tu = useTranslations("Admin.users");
  const tNav = useTranslations("AdminNav");
  const showError = useUserError();
  const locale = useLocale();
  const lp = useAdminListParams("nameAsc");

  const [editing, setEditing] = useState<UserRow | "new" | null>(null);
  const [resetting, setResetting] = useState<UserRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const dateFormat = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    [locale],
  );

  const pageCount = Math.max(1, Math.ceil(total / lp.pageSize));
  const currentPage = Math.min(lp.page, pageCount);
  const pageStart = (currentPage - 1) * lp.pageSize;
  const filtered = lp.q !== "" || lp.filter !== "all" || lp.status !== "all";

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-48 flex-1">
          <AdminListToolbar
            params={lp}
            searchPlaceholder={tu("searchPlaceholder")}
            sortLabel={t("common.sortBy")}
            sortOptions={[
              { value: "nameAsc", label: t("sort.nameAsc") },
              { value: "nameDesc", label: t("sort.nameDesc") },
              { value: "newest", label: tu("sort.newest") },
              { value: "lastLogin", label: tu("sort.lastLogin") },
            ]}
            filterLabel={tu("fields.role")}
            filterOptions={[
              { value: "all", label: tu("filters.allRoles") },
              ...ASSIGNABLE_ROLES.map((r) => ({ value: r, label: tu(`roles.${r}`) })),
            ]}
            statusLabel={t("common.status")}
            statusOptions={[
              { value: "all", label: t("common.allStatuses") },
              { value: "active", label: t("common.active") },
              { value: "inactive", label: t("common.inactive") },
            ]}
          />
        </div>
        <Button onClick={() => setEditing("new")}>
          <Plus className="mr-2 h-4 w-4" />
          {t("add")}
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.name")}</TableHead>
              <TableHead className="w-32">{tu("fields.role")}</TableHead>
              <TableHead className="hidden md:table-cell">{tu("fields.scopes")}</TableHead>
              <TableHead className="hidden w-32 lg:table-cell">
                {tu("fields.lastLoginAt")}
              </TableHead>
              <TableHead className="w-20">{t("common.active")}</TableHead>
              <TableHead className="w-28 text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                  {filtered ? t("common.noResults") : tu("empty")}
                </TableCell>
              </TableRow>
            )}
            {items.map((u) => {
              const isSelf = u.id === currentUserId;
              return (
                <TableRow key={u.id}>
                  <TableCell className="max-w-56">
                    <span className="block truncate font-medium" title={u.name}>
                      {u.name}
                      {isSelf && (
                        <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                          {tu("you")}
                        </span>
                      )}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground" title={u.email}>
                      {u.email}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.role === "super-admin" ? "default" : "outline"}>
                      {tu(`roles.${u.role}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden max-w-xs text-xs text-muted-foreground md:table-cell">
                    {u.role === "super-admin" ? (
                      tu("scopesAllForSuperAdmin")
                    ) : u.scopes.length === 0 ? (
                      <span className="text-destructive">{tu("scopesNone")}</span>
                    ) : (
                      // Scope id == its AdminNav label key.
                      <span className="block truncate">
                        {u.scopes.map((s) => tNav(s)).join(", ")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                    {u.lastLoginAt
                      ? dateFormat.format(new Date(u.lastLoginAt))
                      : tu("neverLoggedIn")}
                  </TableCell>
                  <TableCell>
                    <StatusToggle
                      checked={u.isActive}
                      ariaLabel={t("common.active")}
                      disabled={isSelf}
                      onToggle={async (next) => {
                        const result = await toggleUserActive(u.id, next);
                        if (!result.ok) throw new Error(showError(result.error));
                        router.refresh();
                      }}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setResetting(u)}
                        aria-label={tu("resetPassword")}
                        title={tu("resetPassword")}
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setEditing(u)}
                        aria-label={t("edit")}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteId(u.id)}
                        aria-label={t("delete")}
                        disabled={isSelf}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {total > 0 && (
          <TablePagination
            page={currentPage}
            pageCount={pageCount}
            pageSize={lp.pageSize}
            total={total}
            rangeFrom={pageStart + 1}
            rangeTo={pageStart + items.length}
            onPage={(p) => lp.update({ page: p <= 1 ? null : p })}
            onPageSize={(n) => lp.update({ size: n === 10 ? null : n })}
          />
        )}
      </div>

      {editing && (
        <UserFormDialog
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}

      {resetting && (
        <ResetPasswordDialog
          user={resetting}
          onClose={() => setResetting(null)}
          onSaved={() => setResetting(null)}
        />
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>{tu("deleteHint")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={async () => {
                if (!deleteId) return;
                const result = await deleteUser(deleteId);
                if (result.ok) {
                  toast.success(tu("toasts.deleted"));
                  setDeleteId(null);
                  router.refresh();
                } else toast.error(showError(result.error));
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
