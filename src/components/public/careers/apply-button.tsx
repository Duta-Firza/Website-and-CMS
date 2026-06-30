"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import type { LocalizedFormSettings } from "@/lib/cms/solutions";
import type { JobApplyMode } from "@/models/constants";
import { ApplicationDialog } from "./application-form";

interface Props {
  job: {
    id: string;
    title: string;
    applyMode: JobApplyMode;
    applyUrl: string;
    applyEmail: string;
  };
  applyForm: LocalizedFormSettings;
}

export function ApplyButton({ job, applyForm }: Props) {
  const t = useTranslations("Careers");
  const [open, setOpen] = useState(false);
  const cls = buttonVariants({ variant: "brand", className: "shrink-0" });

  if (job.applyMode === "url") {
    if (!job.applyUrl) return null;
    return (
      <Link href={job.applyUrl} target="_blank" rel="noreferrer noopener" className={cls}>
        {t("apply")}
        <ArrowRight className="ml-1.5 h-4 w-4" />
      </Link>
    );
  }

  if (job.applyMode === "email") {
    if (!job.applyEmail) return null;
    const href = `mailto:${job.applyEmail}?subject=${encodeURIComponent(
      t("applyEmailSubject", { title: job.title }),
    )}`;
    return (
      <a href={href} className={cls}>
        {t("apply")}
        <ArrowRight className="ml-1.5 h-4 w-4" />
      </a>
    );
  }

  // applyMode === "form" — in-app application dialog.
  if (!applyForm.enabled) return null;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={cls}>
        {t("apply")}
        <ArrowRight className="ml-1.5 h-4 w-4" />
      </button>
      <ApplicationDialog
        jobOpeningId={job.id}
        jobTitle={job.title}
        form={applyForm}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
