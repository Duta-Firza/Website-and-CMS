"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { UserRow } from "@/lib/cms/admin-users";
import { createUser, resetUserPassword, updateUser } from "@/lib/cms/user-actions";
import { SCOPE_LABEL_KEYS } from "@/lib/rbac";
import { ADMIN_SCOPES, type AdminScope, type UserRole } from "@/models/constants";

/**
 * `viewer` is deliberately omitted: the server already rejects it for every
 * write, but the admin UI still shows editing controls it can't use. Add it back
 * once the read-only surface lands.
 */
export const ASSIGNABLE_ROLES = ["super-admin", "editor"] as const satisfies readonly UserRole[];

/** Error codes the actions return; anything else is a zod message shown as-is. */
const ERROR_CODES = new Set([
  "EMAIL_TAKEN",
  "LAST_SUPER_ADMIN",
  "CANNOT_DELETE_SELF",
  "CANNOT_DEACTIVATE_SELF",
  "CANNOT_DEMOTE_SELF",
  "CURRENT_PASSWORD_WRONG",
  "PASSWORD_MISMATCH",
  "NOT_FOUND",
  "UNAUTHORIZED",
  "FORBIDDEN",
]);

export function useUserError() {
  const t = useTranslations("Admin.users.errors");
  return (code: string) => (ERROR_CODES.has(code) ? t(code) : code);
}

/** Mirrors the server rule in user-actions.ts. */
const MIN_PASSWORD = 12;

interface FormValues {
  name: string;
  email: string;
  role: (typeof ASSIGNABLE_ROLES)[number];
  scopes: AdminScope[];
  isActive: boolean;
  /** Only collected on create; edit uses the separate reset dialog. */
  password: string;
}

const schemaFor = (isEdit: boolean) =>
  z.object({
    name: z.string().min(1),
    email: z.string().email(),
    role: z.enum(ASSIGNABLE_ROLES),
    scopes: z.array(z.enum(ADMIN_SCOPES)),
    isActive: z.boolean(),
    password: isEdit ? z.string() : z.string().min(MIN_PASSWORD),
  });

export function UserFormDialog({
  initial,
  onClose,
  onSaved,
}: {
  /** null = create. */
  initial: UserRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useTranslations("Admin");
  const tu = useTranslations("Admin.users");
  const tNav = useTranslations("AdminNav");
  const showError = useUserError();
  const isEdit = initial !== null;

  const schema = useMemo(() => schemaFor(isEdit), [isEdit]);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          name: initial.name,
          email: initial.email,
          // A legacy `viewer` would otherwise have no radio selected.
          role: initial.role === "viewer" ? "editor" : initial.role,
          scopes: initial.scopes,
          isActive: initial.isActive,
          password: "",
        }
      : { name: "", email: "", role: "editor", scopes: [], isActive: true, password: "" },
  });
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting, errors },
  } = form;

  const role = watch("role");
  const scopes = watch("scopes");
  const isSuperAdmin = role === "super-admin";

  const toggleScope = (scope: AdminScope, on: boolean) => {
    setValue("scopes", on ? [...scopes, scope] : scopes.filter((s) => s !== scope), {
      shouldDirty: true,
    });
  };

  const onSubmit = async (values: FormValues) => {
    const result = isEdit
      ? await updateUser({
          id: initial.id,
          name: values.name,
          email: values.email,
          role: values.role,
          scopes: values.scopes,
          isActive: values.isActive,
        })
      : await createUser(values);
    if (result.ok) {
      toast.success(isEdit ? tu("toasts.updated") : tu("toasts.created"));
      onSaved();
    } else toast.error(showError(result.error));
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("edit") : t("add")} {t("nouns.user")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="u-name">{t("common.name")}</Label>
            <Input id="u-name" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="u-email">{t("email")}</Label>
            <Input id="u-email" type="email" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="u-password">{t("password")}</Label>
              <Input id="u-password" type="password" {...register("password")} />
              <p className="text-xs text-muted-foreground">{tu("passwordHint")}</p>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>{tu("fields.role")}</Label>
            <div className="grid gap-2">
              {ASSIGNABLE_ROLES.map((r) => (
                <label
                  key={r}
                  htmlFor={`u-role-${r}`}
                  className="flex cursor-pointer items-start gap-2 rounded-md border p-2 text-sm"
                >
                  <input
                    id={`u-role-${r}`}
                    type="radio"
                    value={r}
                    checked={role === r}
                    onChange={() => setValue("role", r, { shouldDirty: true })}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="block font-medium">{tu(`roles.${r}`)}</span>
                    <span className="block text-xs text-muted-foreground">
                      {tu(`roleHints.${r}`)}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{tu("fields.scopes")}</Label>
            {isSuperAdmin ? (
              <p className="text-xs text-muted-foreground">{tu("scopesAllForSuperAdmin")}</p>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">{tu("scopesHint")}</p>
                <div className="grid grid-cols-2 gap-2">
                  {ADMIN_SCOPES.map((s) => (
                    <label
                      key={s}
                      htmlFor={`u-scope-${s}`}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <Checkbox
                        id={`u-scope-${s}`}
                        checked={scopes.includes(s)}
                        onCheckedChange={(v) => toggleScope(s, v)}
                      />
                      {tNav(SCOPE_LABEL_KEYS[s])}
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="u-active"
              checked={watch("isActive")}
              onCheckedChange={(v) => setValue("isActive", v, { shouldDirty: true })}
            />
            <Label htmlFor="u-active">{t("common.active")}</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const resetFormSchema = z.object({ password: z.string().min(MIN_PASSWORD) });
type ResetValues = z.infer<typeof resetFormSchema>;

export function ResetPasswordDialog({
  user,
  onClose,
  onSaved,
}: {
  user: UserRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useTranslations("Admin");
  const tu = useTranslations("Admin.users");
  const showError = useUserError();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetFormSchema),
    defaultValues: { password: "" },
  });

  const onSubmit = async (values: ResetValues) => {
    const result = await resetUserPassword({ id: user.id, password: values.password });
    if (result.ok) {
      toast.success(tu("toasts.passwordReset"));
      onSaved();
    } else toast.error(showError(result.error));
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{tu("resetPassword")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {tu("resetPasswordFor", { name: user.name })}
          </p>
          <div className="space-y-2">
            <Label htmlFor="u-newpass">{tu("fields.newPassword")}</Label>
            <Input id="u-newpass" type="password" {...register("password")} />
            <p className="text-xs text-muted-foreground">{tu("passwordHint")}</p>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
