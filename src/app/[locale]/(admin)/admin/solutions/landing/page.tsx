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
  const t = await getTranslations("Admin");
  const tLanding = await getTranslations("Landing");
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("pages.solutionsLanding.title")}
        description={t("pages.solutionsLanding.description")}
      />
      <SolutionPageForm
        slug="solutions"
        initial={page}
        additionalTabs={[
          {
            value: "cards",
            label: tLanding("ourSolutions"),
            content: (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {cards.map((c) => (
                  <SolutionForm key={c.key} initial={c} />
                ))}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
