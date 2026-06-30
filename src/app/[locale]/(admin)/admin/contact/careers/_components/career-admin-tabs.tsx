"use client";

import { useTranslations } from "next-intl";
import { useUrlTabState } from "@/components/admin/url-tabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { JobOpeningRow } from "../page";
import { CareerPageForm, type CareerPageFormValues } from "./career-page-form";
import { JobOpeningsManager } from "./job-openings-manager";

const TABS = ["content", "boards", "culture", "applyForm", "items"] as const;

export function CareerAdminTabs({
  pageInitial,
  openings,
  newHref,
  editBase,
}: {
  pageInitial: CareerPageFormValues;
  openings: JobOpeningRow[];
  newHref: string;
  editBase: string;
}) {
  const t = useTranslations("Admin");
  const [tab, setTab] = useUrlTabState<(typeof TABS)[number]>("content", TABS);

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as (typeof TABS)[number])} className="w-full">
      <TabsList className="flex flex-wrap md:w-fit">
        <TabsTrigger value="content">{t("tabs.content")}</TabsTrigger>
        <TabsTrigger value="boards">{t("tabs.boards")}</TabsTrigger>
        <TabsTrigger value="culture">{t("tabs.culture")}</TabsTrigger>
        <TabsTrigger value="applyForm">{t("tabs.applyForm")}</TabsTrigger>
        <TabsTrigger value="items">{t("tabs.openings")}</TabsTrigger>
      </TabsList>

      <div className="mt-6">
        {/* The page-config form spans the first three tabs (single atomic save). */}
        <CareerPageForm initial={pageInitial} activeTab={tab} />
        <TabsContent value="items" className="space-y-4">
          <JobOpeningsManager initial={openings} newHref={newHref} editBase={editBase} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
