"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { UrlTabs } from "@/components/admin/url-tabs";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  /** i18n key under `Admin.tabs` for the items tab label. */
  itemsLabelKey: string;
  contentTab: ReactNode;
  itemsTab: ReactNode;
}

/**
 * Outer two-tab shell used by every About sub-page admin: Content (page-level
 * visibility/title/body metadata) and a slug-specific items tab containing the
 * existing manager. Keeps URL state on `?tab=content|items` so the inner manager
 * (which may use its own URL param key) doesn't collide.
 */
export function AboutSubPageShell({ itemsLabelKey, contentTab, itemsTab }: Props) {
  const t = useTranslations("Admin");
  return (
    <UrlTabs defaultTab="content" validValues={["content", "items"]} className="w-full">
      <TabsList className="grid grid-cols-2 md:w-fit md:grid-cols-2">
        <TabsTrigger value="content">{t("tabs.content")}</TabsTrigger>
        <TabsTrigger value="items">{t(itemsLabelKey)}</TabsTrigger>
      </TabsList>
      <TabsContent value="content" className="mt-6">
        {contentTab}
      </TabsContent>
      <TabsContent value="items" className="mt-6">
        {itemsTab}
      </TabsContent>
    </UrlTabs>
  );
}
