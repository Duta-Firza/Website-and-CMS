"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changeMyPassword } from "@/lib/cms/user-actions";

/** Mirrors the server rule in user-actions.ts. */
const MIN_PASSWORD = 12;

const schema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(MIN_PASSWORD),
    confirmPassword: z.string().min(1),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { path: ["confirmPassword"] });

type Values = z.infer<typeof schema>;

/**
 * Self-service password change — the only way a non-super-admin can rotate
 * their own credentials.
 */
export function ChangePasswordDialog({ onClose }: { onClose: () => void }) {
  const t = useTranslations("Admin");
  const tu = useTranslations("Admin.users");
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (values: Values) => {
    const result = await changeMyPassword(values);
    if (result.ok) {
      toast.success(tu("toasts.passwordChanged"));
      onClose();
      return;
    }
    toast.error(
      result.error === "CURRENT_PASSWORD_WRONG"
        ? tu("errors.CURRENT_PASSWORD_WRONG")
        : result.error === "PASSWORD_MISMATCH"
          ? tu("errors.PASSWORD_MISMATCH")
          : result.error,
    );
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{tu("changeMyPassword")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cp-current">{tu("fields.currentPassword")}</Label>
            <Input id="cp-current" type="password" {...register("currentPassword")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cp-new">{tu("fields.newPassword")}</Label>
            <Input id="cp-new" type="password" {...register("newPassword")} />
            <p className="text-xs text-muted-foreground">{tu("passwordHint")}</p>
            {errors.newPassword && (
              <p className="text-xs text-destructive">{errors.newPassword.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cp-confirm">{tu("fields.confirmPassword")}</Label>
            <Input id="cp-confirm" type="password" {...register("confirmPassword")} />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{tu("errors.PASSWORD_MISMATCH")}</p>
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
