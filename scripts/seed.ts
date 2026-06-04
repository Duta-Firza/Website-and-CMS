/**
 * Idempotent seeder.
 *
 * `pnpm seed`                       → seed everything (default).
 * `pnpm seed customers`             → seed only the named target.
 * `pnpm seed customers partners`    → seed multiple targets, in the given order.
 *
 * Available targets: user, siteSettings, homeHero, stats, solutions,
 *                    partners, customers, projects, reachPoints.
 *
 * - Upserts singleton documents (SiteSettings, HomeHero) by their fixed _id.
 * - For collections without a natural unique field, clears and re-inserts.
 * - For Solutions, upserts by `key`.
 * - For Projects, upserts by `slug`.
 * - For the super-admin User, upserts by `email` and only sets `passwordHash` on insert.
 *
 * Required env vars (in .env.local):
 *   MONGODB_URI
 *   SEED_ADMIN_EMAIL
 *   SEED_ADMIN_PASSWORD
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import bcrypt from "bcryptjs";
import { config as loadEnv } from "dotenv";
import mongoose from "mongoose";

// Next.js convention: .env.local takes precedence over .env. The standalone
// seed script doesn't run through Next.js, so load these files explicitly.
loadEnv({ path: ".env.local", override: true });
loadEnv({ path: ".env" });

import {
  Customer,
  HOME_HERO_ID,
  HomeHero,
  Partner,
  Project,
  ReachPoint,
  SITE_SETTINGS_ID,
  SiteSettings,
  Solution,
  Stat,
  User,
} from "../src/models";

const FIXTURES_DIR = join(__dirname, "fixtures");

function readJson<T>(name: string): T {
  return JSON.parse(readFileSync(join(FIXTURES_DIR, name), "utf-8")) as T;
}

async function seedUser() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn("⚠ SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — skipping admin user");
    return 0;
  }
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`✓ Admin user already exists: ${email}`);
    return 1;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({
    email: email.toLowerCase(),
    passwordHash,
    name: "Super Admin",
    role: "super-admin",
    isActive: true,
  });
  console.log(`✓ Created admin user: ${email}`);
  return 1;
}

async function seedSiteSettings() {
  const data = readJson<Record<string, unknown>>("site-settings.json");
  await SiteSettings.findByIdAndUpdate(SITE_SETTINGS_ID, data, { upsert: true, new: true });
  return 1;
}

async function seedHomeHero() {
  const data = readJson<Record<string, unknown>>("home-hero.json");
  await HomeHero.findByIdAndUpdate(HOME_HERO_ID, data, { upsert: true, new: true });
  return 1;
}

async function seedStats() {
  const items = readJson<Record<string, unknown>[]>("stats.json");
  await Stat.deleteMany({});
  await Stat.insertMany(items);
  return items.length;
}

async function seedSolutions() {
  const items = readJson<Record<string, unknown>[]>("solutions.json");
  for (const item of items) {
    await Solution.findOneAndUpdate({ key: item.key }, item, { upsert: true });
  }
  return items.length;
}

async function seedPartners() {
  const items = readJson<Record<string, unknown>[]>("partners.json");
  await Partner.deleteMany({});
  await Partner.insertMany(items);
  return items.length;
}

async function seedCustomers() {
  const items = readJson<Record<string, unknown>[]>("customers.json");
  await Customer.deleteMany({});
  await Customer.insertMany(items);
  return items.length;
}

async function seedProjects() {
  const items = readJson<Record<string, unknown>[]>("projects.json");
  for (const item of items) {
    await Project.findOneAndUpdate({ slug: item.slug }, item, { upsert: true });
  }
  return items.length;
}

async function seedReachPoints() {
  const items = readJson<Record<string, unknown>[]>("reach-points.json");
  await ReachPoint.deleteMany({});
  await ReachPoint.insertMany(items);
  return items.length;
}

const SEEDERS = {
  user: seedUser,
  siteSettings: seedSiteSettings,
  homeHero: seedHomeHero,
  stats: seedStats,
  solutions: seedSolutions,
  partners: seedPartners,
  customers: seedCustomers,
  projects: seedProjects,
  reachPoints: seedReachPoints,
} as const;

type SeederName = keyof typeof SEEDERS;

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("✗ MONGODB_URI not set");
    process.exit(1);
  }

  // Resolve which seeders to run BEFORE connecting — a bad CLI arg should
  // fail fast without touching MongoDB.
  const args = process.argv.slice(2);
  const allNames = Object.keys(SEEDERS) as SeederName[];
  let targets: SeederName[];
  if (args.length === 0) {
    targets = allNames;
  } else {
    const invalid = args.filter((a) => !(allNames as readonly string[]).includes(a));
    if (invalid.length > 0) {
      console.error(`✗ Unknown seeder(s): ${invalid.join(", ")}`);
      console.error(`  Available: ${allNames.join(", ")}`);
      process.exit(1);
    }
    targets = args as SeederName[];
  }

  console.log("→ Connecting to MongoDB…");
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
  console.log("✓ Connected");

  try {
    const counts: Record<string, number> = {};
    for (const name of targets) {
      counts[name] = await SEEDERS[name]();
    }

    console.log("\n📦 Seed summary:");
    for (const [k, v] of Object.entries(counts)) {
      console.log(`   ${k}: ${v}`);
    }
    console.log("\n✓ Done.\n");
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((e) => {
  console.error("✗ Seed failed:", e);
  process.exit(1);
});
