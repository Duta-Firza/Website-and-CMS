"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Locale } from "@/lib/cms/localize";
import type { EpcProjectData } from "@/lib/cms/solutions";

interface Props {
  projects: EpcProjectData[];
  locale: Locale;
  tabsAriaLabel: string;
  viewDetailLabel: string;
}

export function EpcProjectTabs({ projects, locale, tabsAriaLabel, viewDetailLabel }: Props) {
  const t = useTranslations("Projects");
  const [activeSlug, setActiveSlug] = useState(projects[0]?.slug ?? "");

  if (projects.length === 0) return null;

  return (
    <Tabs value={activeSlug} onValueChange={setActiveSlug} aria-label={tabsAriaLabel}>
      <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
        {projects.map((p) => (
          <TabsTrigger
            key={p.slug}
            value={p.slug}
            className="data-[state=active]:bg-brand-accent data-[state=active]:text-white rounded-md border bg-muted/30 px-3 py-1.5 text-xs font-medium"
          >
            {p.title}
          </TabsTrigger>
        ))}
      </TabsList>
      {projects.map((p) => (
        <TabsContent key={p.slug} value={p.slug} className="mt-0">
          <article className="grid grid-cols-1 gap-6 rounded-2xl border bg-card p-5 md:grid-cols-2 md:p-8">
            <div className="relative aspect-16/9 overflow-hidden rounded-lg bg-muted">
              <Image
                src={p.image}
                alt={p.title}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold tracking-tight text-brand-deep dark:text-foreground">
                  {p.title}
                </h3>
                {p.summary && (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {p.summary}
                  </p>
                )}
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {p.client && (
                  <div>
                    <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {t("client")}
                    </dt>
                    <dd className="font-medium">{p.client}</dd>
                  </div>
                )}
                {p.year && (
                  <div>
                    <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {t("year")}
                    </dt>
                    <dd className="font-medium">{p.year}</dd>
                  </div>
                )}
              </dl>
              <div className="mt-auto">
                <Link
                  href={`/${locale}/solutions/epc/${p.slug}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-brand-accent hover:underline"
                >
                  {viewDetailLabel}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </article>
        </TabsContent>
      ))}
    </Tabs>
  );
}
