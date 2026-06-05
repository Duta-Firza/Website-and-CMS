"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { LocalizedField } from "@/components/admin/localized-field";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { deleteCredential, upsertCredential } from "@/lib/cms/actions";
import { CREDENTIAL_TYPES, type CredentialType } from "@/models/constants";
import type { CredentialRow } from "./page";

const schema = z.object({
  id: z.string().optional(),
  title: z.object({ id: z.string().min(1), en: z.string().min(1) }),
  description: z.object({ id: z.string(), en: z.string() }),
  imageUrl: z.string(),
  type: z.enum(CREDENTIAL_TYPES),
  issuer: z.string(),
  year: z.number().int().optional(),
  order: z.number().int(),
});

type FormValues = z.infer<typeof schema>;

const empty = (type: CredentialType = "certification"): FormValues => ({
  title: { id: "", en: "" },
  description: { id: "", en: "" },
  imageUrl: "",
  type,
  issuer: "",
  year: undefined,
  order: 0,
});

export function CredentialsManager({ initial }: { initial: CredentialRow[] }) {
  const router = useRouter();
  const t = useTranslations("Admin");
  const [activeType, setActiveType] = useState<CredentialType>("certification");
  const [editing, setEditing] = useState<FormValues | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(
    () => initial.filter((c) => c.type === activeType),
    [initial, activeType],
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={activeType} onValueChange={(v) => setActiveType(v as CredentialType)}>
          <TabsList>
            <TabsTrigger value="certification">Certifications</TabsTrigger>
            <TabsTrigger value="acknowledgement">Acknowledgements</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button onClick={() => setEditing(empty(activeType))}>
          <Plus className="mr-2 h-4 w-4" />
          {t("add")}
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Issuer</TableHead>
              <TableHead className="hidden w-20 md:table-cell">Year</TableHead>
              <TableHead className="w-16">Order</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                  No {activeType === "certification" ? "certifications" : "acknowledgements"} yet.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.title.id}</TableCell>
                <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                  {c.issuer || "—"}
                </TableCell>
                <TableCell className="hidden md:table-cell">{c.year ?? "—"}</TableCell>
                <TableCell>{c.order}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => setEditing({ ...c })}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(c.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editing && (
        <CredentialDialog
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
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
                const result = await deleteCredential(deleteId);
                if (result.ok) {
                  toast.success(t("saved"));
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

function CredentialDialog({
  initial,
  onClose,
  onSaved,
}: {
  initial: FormValues;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useTranslations("Admin");
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  });
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: FormValues) => {
    const result = await upsertCredential(values);
    if (result.ok) {
      toast.success(t("saved"));
      onSaved();
    } else toast.error(result.error);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial.id ? t("edit") : t("add")} Credential</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <LocalizedField label="Title" name="title" form={form} />
          <LocalizedField label="Description" name="description" form={form} multiline />
          <div className="space-y-2">
            <Label htmlFor="cr-img">Scan image URL</Label>
            <Input
              id="cr-img"
              {...register("imageUrl")}
              placeholder="https://… /credentials/iso-9001.jpg"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={watch("type")}
                onValueChange={(v) => setValue("type", v as CredentialType, { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CREDENTIAL_TYPES.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cr-issuer">Issuer</Label>
              <Input id="cr-issuer" {...register("issuer")} placeholder="TNV / SKK Migas / …" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cr-year">Year</Label>
              <Input id="cr-year" type="number" {...register("year", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cr-order">Order</Label>
              <Input id="cr-order" type="number" {...register("order", { valueAsNumber: true })} />
            </div>
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
