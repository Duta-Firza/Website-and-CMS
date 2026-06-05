"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import {
  ABOUT_PAGE_ID,
  AboutPage,
  AffiliatedBusiness,
  CREDENTIAL_TYPES,
  Credential,
  Customer,
  HistoryEntry,
  HOME_HERO_ID,
  HomeHero,
  LEADERSHIP_TYPES,
  LeadershipMember,
  Partner,
  PROJECT_CATEGORIES,
  Project,
  ReachPoint,
  SITE_SETTINGS_ID,
  SiteSettings,
  SOLUTION_KEYS,
  Solution,
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
  backgroundImage: z.string().min(1),
});

export async function updateHomeHero(input: z.infer<typeof heroSchema>): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = heroSchema.parse(input);
    await connectDB();
    await HomeHero.findByIdAndUpdate(HOME_HERO_ID, parsed, { upsert: true, new: true });
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
  key: z.enum(SOLUTION_KEYS),
  title: localizedSchema,
  description: localizedSchema,
  iconName: z.string().min(1),
  href: z.string().min(1),
  order: z.number().int().default(0),
});

export async function upsertSolution(input: z.infer<typeof solutionSchema>): Promise<ActionResult> {
  try {
    await requireAdmin();
    const { id, ...data } = solutionSchema.parse(input);
    await connectDB();
    if (id) await Solution.findByIdAndUpdate(id, data);
    else await Solution.findOneAndUpdate({ key: data.key }, data, { upsert: true });
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
  vision: localizedSchema,
  mission: localizedSchema,
  values: z.array(aboutValueItemSchema).default([]),
  coreBusinessTitle: localizedSchema,
  coreBusinessDescription: localizedSchema,
  affiliatedBusinessTitle: localizedSchema,
  affiliatedBusinessDescription: localizedSchema,
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
function errorMessage(e: unknown): string {
  if (e instanceof z.ZodError) return e.issues.map((i) => i.message).join("; ");
  if (e instanceof Error) return e.message;
  return "Unknown error";
}
