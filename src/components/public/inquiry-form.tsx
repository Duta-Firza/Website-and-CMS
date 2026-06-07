"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitInquiry } from "@/lib/cms/actions";
import type { InquirySource } from "@/models/constants";

const schema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().max(80),
  email: z.string().email().max(160),
  company: z.string().min(1).max(160),
  phone: z.string().max(40),
  websiteUrl: z.string().max(200),
  country: z.string().max(80),
  message: z.string().min(1).max(4000),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  source: InquirySource;
}

export function InquiryForm({ source }: Props) {
  const t = useTranslations("InquiryForm");
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      phone: "",
      websiteUrl: "",
      country: "",
      message: "",
    },
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = form;

  const submitLabel =
    source === "manufacturing"
      ? t("submitManufacturing")
      : source === "contact"
        ? t("submitContact")
        : t("submitTrading");

  const onSubmit = async (values: FormValues) => {
    const result = await submitInquiry({ source, ...values });
    if (!result.ok) {
      toast.error(result.error || t("errorToast"));
      return;
    }
    toast.success(t("successToast"));
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field
          id="iq-first"
          label={t("firstName")}
          required
          error={errors.firstName?.message}
          {...register("firstName")}
        />
        <Field id="iq-last" label={t("lastName")} {...register("lastName")} />
        <Field
          id="iq-email"
          type="email"
          label={t("email")}
          required
          error={errors.email?.message}
          {...register("email")}
        />
        <Field
          id="iq-company"
          label={t("company")}
          required
          error={errors.company?.message}
          {...register("company")}
        />
        <Field id="iq-phone" type="tel" label={t("phone")} {...register("phone")} />
        <Field id="iq-country" label={t("country")} {...register("country")} />
        <div className="md:col-span-2">
          <Field id="iq-web" label={t("websiteUrl")} {...register("websiteUrl")} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="iq-msg">
          {t("message")} <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="iq-msg"
          rows={5}
          placeholder={t("messagePlaceholder")}
          aria-invalid={Boolean(errors.message)}
          {...register("message")}
        />
        {errors.message && (
          <p className="text-xs text-destructive">{errors.message.message}</p>
        )}
      </div>
      <Button type="submit" variant="brand" size="lg" disabled={isSubmitting} className="w-full md:w-auto">
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSubmitting ? t("submitting") : submitLabel}
      </Button>
    </form>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
}

const Field = (props: FieldProps) => {
  const { id, label, required, error, ...rest } = props;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input id={id} aria-invalid={Boolean(error)} {...rest} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};
