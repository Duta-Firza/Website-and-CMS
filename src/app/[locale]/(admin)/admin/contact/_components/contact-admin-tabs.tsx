"use client";

import { useTranslations } from "next-intl";
import { useUrlTabState } from "@/components/admin/url-tabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactInfoForm, type ContactInfoFormValues } from "./contact-info-form";
import { ContactPageForm, type ContactPageFormValues } from "./contact-page-form";

// Order mirrors the public page: hero/intro → locations & map → contact info →
// contact form.
const TABS = ["content", "location", "info", "form"] as const;

export function ContactAdminTabs({
  pageInitial,
  infoInitial,
}: {
  pageInitial: ContactPageFormValues;
  infoInitial: ContactInfoFormValues;
}) {
  const t = useTranslations("Admin");
  const [tab, setTab] = useUrlTabState<(typeof TABS)[number]>("content", TABS);

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as (typeof TABS)[number])} className="w-full">
      <TabsList className="flex flex-wrap md:w-fit">
        <TabsTrigger value="content">{t("tabs.content")}</TabsTrigger>
        <TabsTrigger value="location">{t("tabs.location")}</TabsTrigger>
        <TabsTrigger value="info">{t("tabs.contactInfo")}</TabsTrigger>
        <TabsTrigger value="form">{t("tabs.form")}</TabsTrigger>
      </TabsList>

      <div className="mt-6">
        {/* The page-config form spans content / location / form (single atomic save). */}
        <ContactPageForm initial={pageInitial} activeTab={tab} />
        <TabsContent value="info" className="space-y-4">
          <ContactInfoForm initial={infoInitial} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
