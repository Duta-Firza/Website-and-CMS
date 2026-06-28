"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { sendInquiryEmail } from "@/lib/email";
import {
  ABOUT_PAGE_ID,
  ABOUT_SUB_PAGE_SLUGS,
  ABOUT_SUB_PAGE_STATUSES,
  AboutPage,
  AboutSubPage,
  AffiliatedBusiness,
  CREDENTIAL_TYPES,
  Credential,
  Customer,
  HistoryEntry,
  HOME_HERO_ID,
  HomeHero,
  IR_SUB_PAGE_SLUGS,
  IR_SUB_PAGE_STATUSES,
  IrSubPage,
  INQUIRY_SOURCES,
  INQUIRY_STATUSES,
  Inquiry,
  LEADERSHIP_TYPES,
  LeadershipMember,
  Partner,
  PROJECT_CATEGORIES,
  Product,
  Project,
  Publication,
  ReachPoint,
  Report,
  SECTION_MODES,
  SITE_SETTINGS_ID,
  SiteSettings,
  SOLUTION_PAGE_SLUGS,
  SOLUTION_PAGE_STATUSES,
  Solution,
  SolutionPage,
  Stat,
} from "@/models";
import { STAT_ICONS } from "@/models/constants";

// ─── Shared ──────────────────────────────────────────────────────────────────
const localizedSchema = z.object({
  id: z.string().default(""),
  en: z.string().default(""),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  const role = (session.user as { role?: string }).role;
  if (role !== "super-admin" && role !== "editor") throw new Error("FORBIDDEN");
  return session.user;
}

function bust() {
  revalidatePath("/", "layout");
}

export type ActionResult<T = unknown> = { ok: true; data?: T } | { ok: false; error: string };

// ─── Hero ────────────────────────────────────────────────────────────────────
const heroSchema = z.object({
  eyebrow: localizedSchema,
  title: localizedSchema,
  subtitle: localizedSchema,
  ctaLabel: localizedSchema,
  ctaHref: z.string().min(1),
  secondaryCtaLabel: localizedSchema,
  secondaryCtaHref: z.string().default(""),
  backgroundImage: z.string().default(""),
  heroDecorations: z.boolean().default(true),
  partnersTitle: localizedSchema.default({ id: "", en: "" }),
  partnersSubtitle: localizedSchema.default({ id: "", en: "" }),
  solutionsTitle: localizedSchema.default({ id: "", en: "" }),
  solutionsSubtitle: localizedSchema.default({ id: "", en: "" }),
  projectsTitle: localizedSchema.default({ id: "", en: "" }),
  projectsSubtitle: localizedSchema.default({ id: "", en: "" }),
  reachTitle: localizedSchema.default({ id: "", en: "" }),
  reachSubtitle: localizedSchema.default({ id: "", en: "" }),
  customersTitle: localizedSchema.default({ id: "", en: "" }),
});

export async function updateHomeHero(input: z.infer<typeof heroSchema>): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = heroSchema.parse(input);
    await connectDB();
    await HomeHero.findByIdAndUpdate(HOME_HERO_ID, { $set: parsed }, { upsert: true, new: true, strict: false });
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

// ─── Stats ───────────────────────────────────────────────────────────────────
const statSchema = z.object({
  id: z.string().optional(),
  label: localizedSchema,
  prefix: z.string().default(""),
  value: z.number(),
  suffix: z.string().default(""),
  order: z.number().int().default(0),
  iconName: z.enum(STAT_ICONS).default("ChartBar"),
});

export async function upsertStat(input: z.infer<typeof statSchema>): Promise<ActionResult> {
  try {
    await requireAdmin();
    const { id, ...data } = statSchema.parse(input);
    await connectDB();
    if (id) await Stat.findByIdAndUpdate(id, data);
    else await Stat.create(data);
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function deleteStat(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();
    await Stat.findByIdAndDelete(id);
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

// ─── Partners ────────────────────────────────────────────────────────────────
const partnerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  logoUrl: z.string().min(1),
  summary: localizedSchema,
  websiteUrl: z.string().default(""),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  invertOnDark: z.boolean().default(false),
});

export async function upsertPartner(input: z.infer<typeof partnerSchema>): Promise<ActionResult> {
  try {
    await requireAdmin();
    const { id, ...data } = partnerSchema.parse(input);
    await connectDB();
    if (id) await Partner.findByIdAndUpdate(id, data);
    else await Partner.create(data);
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function deletePartner(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();
    await Partner.findByIdAndDelete(id);
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

// ─── Solutions ───────────────────────────────────────────────────────────────
const solutionSchema = z.object({
  id: z.string().optional(),
  key: z.string().min(1),
  title: localizedSchema,
  description: localizedSchema,
  iconName: z.string().min(1),
  href: z.string().min(1),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function upsertSolution(input: z.infer<typeof solutionSchema>): Promise<ActionResult> {
  try {
    await requireAdmin();
    const { id, ...data } = solutionSchema.parse(input);
    await connectDB();
    const opts = { strict: false } as const;
    if (id) await Solution.findByIdAndUpdate(id, { $set: data }, opts);
    else await Solution.findOneAndUpdate({ key: data.key }, { $set: data }, { ...opts, upsert: true });
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function deleteSolution(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();
    await Solution.findByIdAndDelete(id);
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function updateSolutionsLayout(input: {
  columnsPerRow: number;
}): Promise<ActionResult> {
  try {
    await requireAdmin();
    const columnsPerRow = Math.max(1, Math.min(6, Math.round(input.columnsPerRow)));
    await connectDB();
    // strict: false bypasses Mongoose schema cache so the field isn't stripped
    // if the model was compiled before solutionsColumnsPerRow was added to the schema.
    await HomeHero.updateOne(
      { _id: HOME_HERO_ID },
      { $set: { solutionsColumnsPerRow: columnsPerRow } },
      { upsert: true, strict: false },
    );
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

// ─── Projects ────────────────────────────────────────────────────────────────
const projectSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1),
  title: localizedSchema,
  summary: localizedSchema,
  image: z.string().min(1),
  client: z.string().default(""),
  year: z.number().int().optional(),
  category: z.enum(PROJECT_CATEGORIES),
  about: localizedSchema,
  scopeOfWork: localizedSchema,
  isHighlighted: z.boolean().default(false),
  highlightOrder: z.number().int().default(0),
  order: z.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export async function upsertProject(input: z.infer<typeof projectSchema>): Promise<ActionResult> {
  try {
    await requireAdmin();
    const { id, ...data } = projectSchema.parse(input);
    await connectDB();
    if (id) await Project.findByIdAndUpdate(id, data);
    else await Project.create(data);
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();
    await Project.findByIdAndDelete(id);
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

// ─── Customers ───────────────────────────────────────────────────────────────
const customerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  logoUrl: z.string().min(1),
  order: z.number().int().default(0),
  invertOnDark: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export async function upsertCustomer(input: z.infer<typeof customerSchema>): Promise<ActionResult> {
  try {
    await requireAdmin();
    const { id, ...data } = customerSchema.parse(input);
    await connectDB();
    if (id) await Customer.findByIdAndUpdate(id, data);
    else await Customer.create(data);
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();
    await Customer.findByIdAndDelete(id);
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function toggleCustomerActive(id: string, value: boolean): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();
    await Customer.findByIdAndUpdate(id, { isActive: value });
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

// ─── Reach Points ────────────────────────────────────────────────────────────
const reachPointSchema = z.object({
  id: z.string().optional(),
  city: z.string().min(1),
  province: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  order: z.number().int().default(0),
});

export async function upsertReachPoint(
  input: z.infer<typeof reachPointSchema>,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const { id, ...data } = reachPointSchema.parse(input);
    await connectDB();
    if (id) await ReachPoint.findByIdAndUpdate(id, data);
    else await ReachPoint.create(data);
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function deleteReachPoint(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();
    await ReachPoint.findByIdAndDelete(id);
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

// ─── Site Settings ───────────────────────────────────────────────────────────
const siteSettingsSchema = z.object({
  contactEmail: z.string().email(),
  salesEmail: z.string().email(),
  phoneNumber: z.string().min(1),
  addressHO: localizedSchema,
  addressFactory: localizedSchema,
  officeHours: localizedSchema,
  social: z.object({
    linkedin: z.string().default(""),
    instagram: z.string().default(""),
    youtube: z.string().default(""),
  }),
});

export async function updateSiteSettings(
  input: z.infer<typeof siteSettingsSchema>,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = siteSettingsSchema.parse(input);
    await connectDB();
    await SiteSettings.findByIdAndUpdate(SITE_SETTINGS_ID, parsed, { upsert: true, new: true });
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

// ─── About Page (singleton) ──────────────────────────────────────────────────
const aboutValueItemSchema = z.object({
  title: localizedSchema,
  description: localizedSchema,
});

const aboutPageSchema = z.object({
  intro: localizedSchema,
  videoUrl: z.string().default(""),
  videoAutoplay: z.boolean().default(false),
  vision: localizedSchema,
  mission: localizedSchema,
  values: z.array(aboutValueItemSchema).default([]),
});

export async function updateAboutPage(
  input: z.infer<typeof aboutPageSchema>,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = aboutPageSchema.parse(input);
    await connectDB();
    await AboutPage.findByIdAndUpdate(ABOUT_PAGE_ID, parsed, { upsert: true, new: true });
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function updateAboutValues(
  values: z.infer<typeof aboutValueItemSchema>[],
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = z.array(aboutValueItemSchema).parse(values);
    await connectDB();
    await AboutPage.findByIdAndUpdate(
      ABOUT_PAGE_ID,
      { values: parsed },
      { upsert: true, new: true },
    );
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

// ─── About Page — per-sub-page focused updates ───────────────────────────────
// These actions touch only the sub-page-specific fields on the AboutPage
// singleton, so the per-page admin tabs (leadership labels, business sections,
// holding diagram) can save without round-tripping the whole AboutForm payload.

const leadershipLabelFields = z.enum(["boardOfDirectorsLabel", "boardOfCommissionersLabel"]);

export async function updateLeadershipLabel(
  field: z.infer<typeof leadershipLabelFields>,
  value: z.infer<typeof localizedSchema>,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsedField = leadershipLabelFields.parse(field);
    const parsedValue = localizedSchema.parse(value);
    await connectDB();
    await AboutPage.findByIdAndUpdate(
      ABOUT_PAGE_ID,
      { [parsedField]: parsedValue },
      { upsert: true, new: true },
    );
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

const coreBusinessSchema = z.object({
  coreBusinessTitle: localizedSchema,
  coreBusinessDescription: localizedSchema,
});

export async function updateCoreBusinessSection(
  input: z.infer<typeof coreBusinessSchema>,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = coreBusinessSchema.parse(input);
    await connectDB();
    await AboutPage.findByIdAndUpdate(ABOUT_PAGE_ID, { $set: parsed }, { upsert: true, new: true });
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

const affiliatedHeaderSchema = z.object({
  affiliatedBusinessTitle: localizedSchema,
  affiliatedBusinessDescription: localizedSchema,
});

export async function updateAffiliatedBusinessSection(
  input: z.infer<typeof affiliatedHeaderSchema>,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = affiliatedHeaderSchema.parse(input);
    await connectDB();
    await AboutPage.findByIdAndUpdate(ABOUT_PAGE_ID, { $set: parsed }, { upsert: true, new: true });
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

const holdingDivisionSchema = z.object({
  key: z.string().min(1),
  label: localizedSchema,
});

const aboutHoldingSchema = z.object({
  holdingStructureLabel: localizedSchema,
  holdingGroupLabel: localizedSchema,
  holdingDivisions: z.array(holdingDivisionSchema).default([]),
});

export async function updateAboutHolding(
  input: z.infer<typeof aboutHoldingSchema>,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = aboutHoldingSchema.parse(input);
    await connectDB();
    await AboutPage.findByIdAndUpdate(ABOUT_PAGE_ID, { $set: parsed }, { upsert: true, new: true });
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

// ─── Leadership ──────────────────────────────────────────────────────────────
const leadershipSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  title: z.object({ id: z.string().min(1), en: z.string().min(1) }),
  bio: localizedSchema,
  photoUrl: z.string().default(""),
  type: z.enum(LEADERSHIP_TYPES),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function upsertLeadershipMember(
  input: z.infer<typeof leadershipSchema>,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const { id, ...data } = leadershipSchema.parse(input);
    await connectDB();
    if (id) await LeadershipMember.findByIdAndUpdate(id, data);
    else await LeadershipMember.create(data);
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function deleteLeadershipMember(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();
    await LeadershipMember.findByIdAndDelete(id);
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

// ─── History ─────────────────────────────────────────────────────────────────
const historyEntrySchema = z.object({
  id: z.string().optional(),
  year: z.string().min(1),
  title: z.object({ id: z.string().min(1), en: z.string().min(1) }),
  description: localizedSchema,
  imageUrl: z.string().default(""),
  order: z.number().int().default(0),
});

export async function upsertHistoryEntry(
  input: z.infer<typeof historyEntrySchema>,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const { id, ...data } = historyEntrySchema.parse(input);
    await connectDB();
    if (id) await HistoryEntry.findByIdAndUpdate(id, data);
    else await HistoryEntry.create(data);
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function deleteHistoryEntry(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();
    await HistoryEntry.findByIdAndDelete(id);
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

// ─── Affiliated Business ─────────────────────────────────────────────────────
const affiliatedBusinessSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  logoUrl: z.string().default(""),
  description: localizedSchema,
  websiteUrl: z.string().default(""),
  order: z.number().int().default(0),
});

export async function upsertAffiliatedBusiness(
  input: z.infer<typeof affiliatedBusinessSchema>,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const { id, ...data } = affiliatedBusinessSchema.parse(input);
    await connectDB();
    if (id) await AffiliatedBusiness.findByIdAndUpdate(id, data);
    else await AffiliatedBusiness.create(data);
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function deleteAffiliatedBusiness(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();
    await AffiliatedBusiness.findByIdAndDelete(id);
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

// ─── Credentials ─────────────────────────────────────────────────────────────
const credentialSchema = z.object({
  id: z.string().optional(),
  title: z.object({ id: z.string().min(1), en: z.string().min(1) }),
  description: localizedSchema,
  imageUrl: z.string().default(""),
  type: z.enum(CREDENTIAL_TYPES),
  issuer: z.string().default(""),
  year: z.number().int().optional(),
  order: z.number().int().default(0),
});

export async function upsertCredential(
  input: z.infer<typeof credentialSchema>,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const { id, ...data } = credentialSchema.parse(input);
    await connectDB();
    if (id) await Credential.findByIdAndUpdate(id, data);
    else await Credential.create(data);
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function deleteCredential(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();
    await Credential.findByIdAndDelete(id);
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

// ─── Reorder actions ─────────────────────────────────────────────────────────
const reorderSchema = z.array(z.string().min(1)).min(1);

async function reorderDocs<TDoc>(
  model: { findByIdAndUpdate: (id: string, update: Record<string, number>) => Promise<TDoc> },
  ids: string[],
  field: string = "order",
): Promise<void> {
  await connectDB();
  await Promise.all(ids.map((id, i) => model.findByIdAndUpdate(id, { [field]: i + 1 })));
}

export async function reorderStats(ids: string[]): Promise<ActionResult> {
  try {
    await requireAdmin();
    await reorderDocs(Stat, reorderSchema.parse(ids));
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function reorderReachPoints(ids: string[]): Promise<ActionResult> {
  try {
    await requireAdmin();
    await reorderDocs(ReachPoint, reorderSchema.parse(ids));
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function reorderPartners(ids: string[]): Promise<ActionResult> {
  try {
    await requireAdmin();
    await reorderDocs(Partner, reorderSchema.parse(ids));
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function reorderCustomers(ids: string[]): Promise<ActionResult> {
  try {
    await requireAdmin();
    await reorderDocs(Customer, reorderSchema.parse(ids));
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function reorderProjects(ids: string[]): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = reorderSchema.parse(ids);
    await connectDB();
    const docs = await Project.find({ _id: { $in: parsed } })
      .select("_id category")
      .lean<{ _id: unknown; category: string }[]>();
    const catById = new Map(docs.map((d) => [String(d._id), d.category]));
    const counters: Record<string, number> = {};
    await Promise.all(
      parsed.map((id) => {
        const cat = catById.get(id);
        if (!cat) return Promise.resolve();
        counters[cat] = (counters[cat] ?? 0) + 1;
        return Project.findByIdAndUpdate(id, { order: counters[cat] });
      }),
    );
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function reorderProjectHighlights(ids: string[]): Promise<ActionResult> {
  try {
    await requireAdmin();
    await reorderDocs(Project, reorderSchema.parse(ids), "highlightOrder");
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function reorderSolutions(ids: string[]): Promise<ActionResult> {
  try {
    await requireAdmin();
    await reorderDocs(Solution, reorderSchema.parse(ids));
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function reorderLeadership(ids: string[]): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = reorderSchema.parse(ids);
    await connectDB();
    const docs = await LeadershipMember.find({ _id: { $in: parsed } })
      .select("_id type")
      .lean<{ _id: unknown; type: string }[]>();
    const typeById = new Map(docs.map((d) => [String(d._id), d.type]));
    const counters: Record<string, number> = {};
    await Promise.all(
      parsed.map((id) => {
        const type = typeById.get(id);
        if (!type) return Promise.resolve();
        counters[type] = (counters[type] ?? 0) + 1;
        return LeadershipMember.findByIdAndUpdate(id, { order: counters[type] });
      }),
    );
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function reorderHistory(ids: string[]): Promise<ActionResult> {
  try {
    await requireAdmin();
    await reorderDocs(HistoryEntry, reorderSchema.parse(ids));
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function reorderAffiliatedBusinesses(ids: string[]): Promise<ActionResult> {
  try {
    await requireAdmin();
    await reorderDocs(AffiliatedBusiness, reorderSchema.parse(ids));
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function reorderCredentials(ids: string[]): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = reorderSchema.parse(ids);
    await connectDB();
    const docs = await Credential.find({ _id: { $in: parsed } })
      .select("_id type")
      .lean<{ _id: unknown; type: string }[]>();
    const typeById = new Map(docs.map((d) => [String(d._id), d.type]));
    const counters: Record<string, number> = {};
    await Promise.all(
      parsed.map((id) => {
        const type = typeById.get(id);
        if (!type) return Promise.resolve();
        counters[type] = (counters[type] ?? 0) + 1;
        return Credential.findByIdAndUpdate(id, { order: counters[type] });
      }),
    );
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

// ─── Status toggle actions ──────────────────────────────────────────────────
const toggleSchema = z.object({ id: z.string().min(1), value: z.boolean() });

export async function togglePartnerActive(id: string, value: boolean): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = toggleSchema.parse({ id, value });
    await connectDB();
    await Partner.findByIdAndUpdate(parsed.id, { isActive: parsed.value });
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function toggleLeadershipActive(id: string, value: boolean): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = toggleSchema.parse({ id, value });
    await connectDB();
    await LeadershipMember.findByIdAndUpdate(parsed.id, { isActive: parsed.value });
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function toggleProjectPublished(id: string, value: boolean): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = toggleSchema.parse({ id, value });
    await connectDB();
    await Project.findByIdAndUpdate(parsed.id, { isPublished: parsed.value });
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function toggleProjectHighlighted(id: string, value: boolean): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = toggleSchema.parse({ id, value });
    await connectDB();
    await Project.findByIdAndUpdate(parsed.id, { isHighlighted: parsed.value });
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

// ─── Solution Pages ─────────────────────────────────────────────────────────
const formFieldOptionSchema = z.object({
  value: z.string(),
  label: localizedSchema,
});

const formFieldSchema = z.object({
  key: z.string().min(1),
  label: localizedSchema,
  placeholder: localizedSchema,
  type: z.enum(["text", "email", "tel", "textarea", "number", "select"]),
  required: z.boolean().default(false),
  order: z.number().int().default(0),
  options: z.array(formFieldOptionSchema).default([]),
});

const formSettingsSchema = z.object({
  enabled: z.boolean().default(true),
  submitLabel: localizedSchema,
  successMessage: localizedSchema,
  fields: z.array(formFieldSchema).default([]),
});

const solutionPageContentSchema = z.object({
  heroMode: z.enum(SECTION_MODES).default("default"),
  bodyMode: z.enum(SECTION_MODES).default("default"),
  hero: z.object({
    eyebrow: localizedSchema,
    title: localizedSchema,
    subtitle: localizedSchema,
    backgroundImage: z.string().default(""),
  }),
  body: z.object({
    heading: localizedSchema,
    content: localizedSchema,
  }),
  inquiryFormEnabled: z.boolean().default(true),
  formSettings: formSettingsSchema.default({
    enabled: true,
    submitLabel: { id: "", en: "" },
    successMessage: { id: "", en: "" },
    fields: [],
  }),
  comingSoonMessage: localizedSchema,
  websiteLink: z
    .object({
      enabled: z.boolean().default(false),
      url: z.string().default(""),
      title: localizedSchema,
      description: localizedSchema,
      ctaLabel: localizedSchema,
    })
    .default({
      enabled: false,
      url: "",
      title: { id: "", en: "" },
      description: { id: "", en: "" },
      ctaLabel: { id: "", en: "" },
    }),
  status: z.enum(SOLUTION_PAGE_STATUSES),
});

export async function updateSolutionPage(
  slug: string,
  input: z.infer<typeof solutionPageContentSchema>,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsedSlug = z.enum(SOLUTION_PAGE_SLUGS).parse(slug);
    const parsed = solutionPageContentSchema.parse(input);
    await connectDB();
    await SolutionPage.findByIdAndUpdate(parsedSlug, parsed, { upsert: true, new: true });
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function setSolutionPageStatus(slug: string, status: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsedSlug = z.enum(SOLUTION_PAGE_SLUGS).parse(slug);
    const parsedStatus = z.enum(SOLUTION_PAGE_STATUSES).parse(status);
    await connectDB();
    await SolutionPage.findByIdAndUpdate(
      parsedSlug,
      { status: parsedStatus },
      { upsert: true, new: true },
    );
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

// ─── Trading Products WhatsApp config ────────────────────────────────────────
const tradingWhatsappSchema = z.object({
  number: z.string().default(""),
  template: localizedSchema,
});

export async function updateTradingWhatsapp(
  input: z.infer<typeof tradingWhatsappSchema>,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const { number, template } = tradingWhatsappSchema.parse(input);
    await connectDB();
    await SolutionPage.findByIdAndUpdate(
      "trading-products",
      { whatsappNumber: number, whatsappTemplate: template },
      { upsert: true, new: true },
    );
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

// ─── About Sub-Pages ────────────────────────────────────────────────────────
const aboutSubPageContentSchema = z.object({
  status: z.enum(ABOUT_SUB_PAGE_STATUSES),
  heroMode: z.enum(SECTION_MODES).default("default"),
  bodyMode: z.enum(SECTION_MODES).default("default"),
  hero: z.object({
    eyebrow: localizedSchema,
    title: localizedSchema,
    subtitle: localizedSchema,
  }),
  body: z.object({
    heading: localizedSchema,
    content: localizedSchema,
  }),
});

export async function updateAboutSubPage(
  slug: string,
  input: z.infer<typeof aboutSubPageContentSchema>,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsedSlug = z.enum(ABOUT_SUB_PAGE_SLUGS).parse(slug);
    const parsed = aboutSubPageContentSchema.parse(input);
    await connectDB();
    await AboutSubPage.findByIdAndUpdate(parsedSlug, parsed, { upsert: true, new: true });
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

// ─── Products ────────────────────────────────────────────────────────────────
const principleEntryZod = z.object({
  partnerId: z.string().nullable().default(null),
  name: z.string().default(""),
  logoUrl: z.string().default(""),
});

const productItemZod = z.object({
  name: localizedSchema,
  photos: z.array(z.string()).default([]),
});

const productSchema = z.object({
  id: z.string().optional(),
  principles: z.array(principleEntryZod).default([]),
  origin: z.string().default(""),
  productType: localizedSchema,
  skuCount: z.number().int().nonnegative().default(0),
  partnershipStart: z.number().int().nullable().default(null),
  whatsappTemplate: localizedSchema,
  items: z.array(productItemZod).default([]),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function upsertProduct(input: z.infer<typeof productSchema>): Promise<ActionResult> {
  try {
    await requireAdmin();
    const { id, ...data } = productSchema.parse(input);
    await connectDB();
    if (id) {
      // Clear legacy single-principle fields when writing the new shape so they
      // don't shadow the new principles[]/items[] in subsequent reads.
      await Product.findByIdAndUpdate(id, {
        ...data,
        partnerId: null,
        principleOverride: { name: "", logoUrl: "", origin: "" },
        photos: [],
      });
    } else {
      await Product.create(data);
    }
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();
    await Product.findByIdAndDelete(id);
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function reorderProducts(ids: string[]): Promise<ActionResult> {
  try {
    await requireAdmin();
    await reorderDocs(Product, reorderSchema.parse(ids));
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function toggleProductActive(id: string, value: boolean): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = toggleSchema.parse({ id, value });
    await connectDB();
    await Product.findByIdAndUpdate(parsed.id, { isActive: parsed.value });
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

// ─── Inquiry ─────────────────────────────────────────────────────────────────
const inquiryPayloadSchema = z.object({
  source: z.enum(INQUIRY_SOURCES),
  values: z.record(z.string(), z.string()),
});

/**
 * Public-facing — no requireAdmin. Persists the inquiry first; email send
 * runs after but failure is not fatal (DB is the source of truth).
 *
 * Accepts a flat `values` map keyed by field name. Known system keys
 * (firstName, email, etc.) land in their dedicated columns; anything else
 * ends up in `customFieldValues`.
 */
export async function submitInquiry(
  input: z.infer<typeof inquiryPayloadSchema>,
): Promise<ActionResult> {
  try {
    const parsed = inquiryPayloadSchema.parse(input);
    const { splitInquiryPayload, SYSTEM_FIELD_KEYS } = await import("./form-fields");
    const { system, custom } = splitInquiryPayload(parsed.values);
    if (!system.firstName?.trim()) {
      return { ok: false, error: "First name is required" };
    }
    if (!system.email?.trim()) {
      return { ok: false, error: "Email is required" };
    }
    if (!system.company?.trim()) {
      return { ok: false, error: "Company is required" };
    }
    if (!system.message?.trim()) {
      return { ok: false, error: "Message is required" };
    }
    const doc = {
      source: parsed.source,
      firstName: system.firstName.trim(),
      lastName: (system.lastName ?? "").trim(),
      email: system.email.trim(),
      company: system.company.trim(),
      phone: (system.phone ?? "").trim(),
      websiteUrl: (system.websiteUrl ?? "").trim(),
      country: (system.country ?? "").trim(),
      message: system.message.trim(),
      customFieldValues: custom,
    };
    // Touch SYSTEM_FIELD_KEYS to keep tree-shaker honest in case helper changes.
    void SYSTEM_FIELD_KEYS;
    await connectDB();
    await Inquiry.create(doc);
    try {
      const fullName = [doc.firstName, doc.lastName].filter(Boolean).join(" ");
      await sendInquiryEmail({
        name: fullName,
        company: doc.company,
        email: doc.email,
        phone: doc.phone || undefined,
        message: doc.message,
        source: parsed.source,
      });
    } catch (emailErr) {
      console.error("[inquiry] email send failed", emailErr);
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function updateInquiryStatus(
  id: string,
  status: string,
  notes?: string,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = z
      .object({
        id: z.string().min(1),
        status: z.enum(INQUIRY_STATUSES),
        notes: z.string().max(2000).optional(),
      })
      .parse({ id, status, notes });
    await connectDB();
    const update: Record<string, unknown> = { status: parsed.status };
    if (parsed.notes !== undefined) update.notes = parsed.notes;
    await Inquiry.findByIdAndUpdate(parsed.id, update);
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function deleteInquiry(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();
    await Inquiry.findByIdAndDelete(id);
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

/** Toggle an inquiry's read/unread flag (drives the sidebar unread badge). */
export async function setInquiryRead(id: string, read: boolean): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = z.object({ id: z.string().min(1), read: z.boolean() }).parse({ id, read });
    await connectDB();
    await Inquiry.findByIdAndUpdate(parsed.id, { read: parsed.read });
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

// ─── Investor Relations Sub-Pages ─────────────────────────────────────────────
const irSubPageContentSchema = z.object({
  status: z.enum(IR_SUB_PAGE_STATUSES),
  heroMode: z.enum(SECTION_MODES).default("default"),
  bodyMode: z.enum(SECTION_MODES).default("disabled"),
  hero: z.object({
    eyebrow: localizedSchema,
    title: localizedSchema,
    subtitle: localizedSchema,
  }),
  body: z.object({
    heading: localizedSchema,
    content: localizedSchema,
  }),
});

export async function updateIrSubPage(
  slug: string,
  input: z.infer<typeof irSubPageContentSchema>,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsedSlug = z.enum(IR_SUB_PAGE_SLUGS).parse(slug);
    const parsed = irSubPageContentSchema.parse(input);
    await connectDB();
    await IrSubPage.findByIdAndUpdate(parsedSlug, parsed, { upsert: true, new: true });
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

// ─── Publications ─────────────────────────────────────────────────────────────
const publicationSchema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  category: z.enum(["newsroom", "press-release"]),
  title: localizedSchema,
  summary: localizedSchema,
  body: localizedSchema,
  imageUrl: z.string().default(""),
  originalUrl: z.string().default(""),
  publishedAt: z.coerce.date(),
  isPublished: z.boolean().default(false),
  order: z.number().int().default(0),
});

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export async function upsertPublication(
  input: z.infer<typeof publicationSchema>,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await requireAdmin();
    const { id, slug, ...data } = publicationSchema.parse(input);
    await connectDB();
    const finalSlug = slug?.trim() || generateSlug(data.title.en || data.title.id);
    if (id) {
      await Publication.findByIdAndUpdate(id, { ...data, slug: finalSlug });
      bust();
      return { ok: true, data: { id, slug: finalSlug } };
    } else {
      const doc = await Publication.create({ ...data, slug: finalSlug });
      bust();
      return { ok: true, data: { id: String(doc._id), slug: finalSlug } };
    }
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function deletePublication(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();
    await Publication.findByIdAndDelete(id);
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function reorderPublications(ids: string[]): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();
    await Promise.all(ids.map((id, i) => Publication.findByIdAndUpdate(id, { order: i })));
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

// ─── Reports ──────────────────────────────────────────────────────────────────
const reportSchema = z.object({
  id: z.string().optional(),
  title: localizedSchema,
  type: z.enum(["annual", "financial"]),
  year: z.number().int().min(2000).max(2100),
  description: localizedSchema,
  fileUrl: z.string().min(1),
  publishedAt: z.coerce.date(),
  isPublished: z.boolean().default(true),
  order: z.number().int().default(0),
});

export async function upsertReport(input: z.infer<typeof reportSchema>): Promise<ActionResult> {
  try {
    await requireAdmin();
    const { id, ...data } = reportSchema.parse(input);
    await connectDB();
    if (id) await Report.findByIdAndUpdate(id, data);
    else await Report.create(data);
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function deleteReport(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();
    await Report.findByIdAndDelete(id);
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function reorderReports(ids: string[]): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();
    await Promise.all(ids.map((id, i) => Report.findByIdAndUpdate(id, { order: i })));
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

// ─── Company Profile URL ──────────────────────────────────────────────────────
export async function updateCompanyProfileUrl(url: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = z.string().parse(url);
    await connectDB();
    await SiteSettings.findByIdAndUpdate(
      SITE_SETTINGS_ID,
      { companyProfileUrl: parsed },
      { upsert: true },
    );
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function errorMessage(e: unknown): string {
  if (e instanceof z.ZodError) return e.issues.map((i) => i.message).join("; ");
  if (e instanceof Error) return e.message;
  return "Unknown error";
}
