/**
 * Idempotent seeder. Run with `pnpm seed`.
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
import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
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

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("✗ MONGODB_URI not set");
    process.exit(1);
  }

  console.log("→ Connecting to MongoDB…");
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
  console.log("✓ Connected");

  try {
    const counts = {
      user: await seedUser(),
      siteSettings: await seedSiteSettings(),
      homeHero: await seedHomeHero(),
      stats: await seedStats(),
      solutions: await seedSolutions(),
      partners: await seedPartners(),
      customers: await seedCustomers(),
      projects: await seedProjects(),
      reachPoints: await seedReachPoints(),
    };

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
