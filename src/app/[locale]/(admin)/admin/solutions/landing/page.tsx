import { getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { connectDB } from "@/lib/db";
import { SOLUTION_KEYS, Solution, type SolutionKey } from "@/models";
import { loadSolutionPageForAdmin } from "../_components/load-solution-page";
import { SolutionPageForm } from "../_components/solution-page-form";
import { SolutionForm } from "./solution-card-form";

async function loadSolutionCards() {
  await connectDB();
  const docs = await Solution.find().sort({ order: 1 }).lean();
  const byKey = new Map<SolutionKey, (typeof docs)[number]>();
  for (const d of docs) byKey.set(d.key as SolutionKey, d);
  return SOLUTION_KEYS.map((key, idx) => {
    const doc = byKey.get(key);
    return {
      id: doc ? String(doc._id) : undefined,
      key,
      title: doc?.title ?? { id: "", en: "" },
      description: doc?.description ?? { id: "", en: "" },
      iconName: doc?.iconName ?? defaultIcon(key),
      href: doc?.href ?? `/id/solutions/${key}`,
      order: doc?.order ?? idx,
    };
  });
}

function defaultIcon(key: SolutionKey): string {
  if (key === "trading") return "Handshake";
  if (key === "manufacturing") return "Factory";
  return "HardHat";
}

export default async function SolutionsLandingAdminPage() {
  const [page, cards] = await Promise.all([
    loadSolutionPageForAdmin("solutions"),
    loadSolutionCards(),
  ]);
  const t = await getTranslations("Admin.pages.solutionsLanding");
  return (
    <div className="space-y-8">
      <AdminPageHeader title={t("title")} description={t("description")} />
      <SolutionPageForm slug="solutions" initial={page} />
      <SolutionCardsSection cards={cards} />
    </div>
  );
}

async function SolutionCardsSection({
  cards,
}: {
  cards: Awaited<ReturnType<typeof loadSolutionCards>>;
}) {
  const t = await getTranslations("Landing");
  return (
    <section className="space-y-3">
      <div className="border-b pb-2">
        <h2 className="text-lg font-semibold tracking-tight text-brand-deep dark:text-foreground">
          {t("ourSolutions")}
        </h2>
        <p className="text-sm text-muted-foreground">{t("ourSolutionsSubtitle")}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {cards.map((c) => (
          <SolutionForm key={c.key} initial={c} />
        ))}
      </div>
    </section>
  );
}
