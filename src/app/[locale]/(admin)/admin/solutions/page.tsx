import { AdminPageHeader } from "@/components/admin/page-header";
import { connectDB } from "@/lib/db";
import { SOLUTION_KEYS, Solution, type SolutionKey } from "@/models";
import { SolutionForm } from "./solution-form";

async function loadSolutions() {
  await connectDB();
  const docs = await Solution.find().sort({ order: 1 }).lean();
  const byKey = new Map<SolutionKey, (typeof docs)[number]>();
  for (const d of docs) byKey.set(d.key as SolutionKey, d);

  // Ensure all 3 known keys exist with defaults so admin can edit before seed
  return SOLUTION_KEYS.map((key, idx) => {
    const doc = byKey.get(key);
    return {
      id: doc ? String(doc._id) : undefined,
      key,
      title: doc?.title ?? { id: "", en: "" },
      description: doc?.description ?? { id: "", en: "" },
      iconName: doc?.iconName ?? defaultIcon(key),
      href: doc?.href ?? `/${"id"}/solutions/${key}`,
      order: doc?.order ?? idx,
    };
  });
}

function defaultIcon(key: SolutionKey): string {
  if (key === "trading") return "Handshake";
  if (key === "manufacturing") return "Factory";
  return "HardHat";
}

export default async function SolutionsAdminPage() {
  const solutions = await loadSolutions();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Solutions"
        description="The three solution cards displayed on the homepage. Click Save on each card to persist changes."
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {solutions.map((s) => (
          <SolutionForm key={s.key} initial={s} />
        ))}
      </div>
    </div>
  );
}
