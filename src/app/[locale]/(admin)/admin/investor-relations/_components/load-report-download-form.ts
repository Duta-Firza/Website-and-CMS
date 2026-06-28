import type { FormSettings } from "@/lib/cms/form-fields";
import {
  DEFAULT_REPORT_DOWNLOAD_FORM_SETTINGS,
  ensureReportDownloadSystemFields,
} from "@/lib/cms/report-download-form";
import { connectDB } from "@/lib/db";
import { IrSubPage } from "@/models";

/** Load the report download/view gate form config (raw, both locales) for the admin editor. */
export async function loadReportDownloadFormSettings(): Promise<FormSettings> {
  await connectDB();
  const doc = await IrSubPage.findById("reports")
    .select("formSettings")
    .lean<{ formSettings?: Partial<FormSettings> } | null>();
  const raw = doc?.formSettings;
  if (!raw || !Array.isArray(raw.fields) || raw.fields.length === 0) {
    return DEFAULT_REPORT_DOWNLOAD_FORM_SETTINGS;
  }
  const fields = ensureReportDownloadSystemFields(
    raw.fields.map((f) => ({
      key: f.key,
      label: { id: f.label?.id ?? "", en: f.label?.en ?? "" },
      placeholder: { id: f.placeholder?.id ?? "", en: f.placeholder?.en ?? "" },
      type: f.type ?? "text",
      required: Boolean(f.required),
      order: f.order ?? 0,
      options: (f.options ?? []).map((o) => ({
        value: o.value,
        label: { id: o.label?.id ?? "", en: o.label?.en ?? "" },
      })),
    })),
  );
  return {
    enabled: raw.enabled ?? true,
    submitLabel: { id: raw.submitLabel?.id ?? "", en: raw.submitLabel?.en ?? "" },
    successMessage: { id: raw.successMessage?.id ?? "", en: raw.successMessage?.en ?? "" },
    fields,
  };
}
