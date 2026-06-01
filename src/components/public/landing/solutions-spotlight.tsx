import { ArrowRight, Box, Factory, HardHat, Handshake, type LucideIcon, Wrench } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SolutionData } from "@/lib/cms/home";

// Whitelist of icons admins can pick from when editing a Solution via CMS.
const ICON_MAP: Record<string, LucideIcon> = {
  Handshake,
  Factory,
  Wrench,
  HardHat,
  Box,
};

export async function SolutionsSpotlight({ solutions }: { solutions: SolutionData[] }) {
  const t = await getTranslations("Landing");
  if (solutions.length === 0) return null;

  return (
    <section className="bg-background">
      <div className="container mx-auto px-4 py-20 md:py-24">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-brand-deep dark:text-foreground md:text-4xl">
            {t("ourSolutions")}
          </h2>
          <p className="mt-3 text-base text-muted-foreground">{t("ourSolutionsSubtitle")}</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {solutions.map((s) => {
            const Icon = ICON_MAP[s.iconName] ?? Box;
            return (
              <Card
                key={s.id}
                className="group/card flex h-full flex-col transition-all duration-300 hover:-translate-y-1 hover:border-brand-accent/30 hover:shadow-md"
              >
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-canvas text-brand-deep transition-colors group-hover/card:bg-brand-accent group-hover/card:text-white dark:bg-muted dark:text-foreground">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl text-brand-deep dark:text-foreground">
                    {s.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                  <Link
                    href={s.href}
                    className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-brand-deep transition-colors group-hover/card:text-brand-accent dark:text-foreground"
                  >
                    {t("learnMore")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/card:translate-x-1" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
