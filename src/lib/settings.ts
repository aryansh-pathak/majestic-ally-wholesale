import "server-only";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { DEFAULT_TIERS, type Tier } from "./pricing";

export type AppSettings = {
  notificationEmail: string;
  emailFrom: string;
  heroHeadline: string;
  heroSubtext: string;
  storyMarkdown: string;
  whereWeSell: string[];
  freeShipThresholdCents: number;
  flatShippingCents: number;
  tiers: Tier[];
};

const DEFAULTS: AppSettings = {
  notificationEmail: "info@majesticallyproducts.com",
  emailFrom:
    process.env.EMAIL_FROM ||
    "Majestic Ally Wholesale <no-reply@majesticallyproducts.com>",
  heroHeadline: "Wholesale tack, grooming & western pet goods — built to last.",
  heroSubtext:
    "Majestic Ally supplies retailers and resellers with 140+ styles of equestrian gear and hand-tooled pet accessories. Log in to see your wholesale pricing.",
  storyMarkdown:
    "Majestic Ally is the wholesale line of Amay International LLC, based in Naperville, Illinois. We manufacture equestrian tack, stable essentials, and western pet goods — over 140 styles, most in a full range of colors — from everyday slow-feed hay nets to hand-tooled leather headstalls and matched show sets.\n\nOur slow-feeder line is the one barns reorder season after season, and our hand-tooled leather brings real western craftsmanship to headstalls, breast collars, saddle bags, and dog collars alike. Riders already know us on Amazon, Walmart, Etsy, and eBay — now we bring the full collection to retailers at wholesale, with free shipping on every order.",
  whereWeSell: [
    "Amazon",
    "Walmart Marketplace",
    "Etsy",
    "eBay",
    "Chewy",
    "Faire",
  ],
  freeShipThresholdCents: 15000,
  flatShippingCents: 1500,
  tiers: DEFAULT_TIERS,
};

/** Read the singleton settings row, merged over sensible defaults. */
export async function getSettings(): Promise<AppSettings> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.settings)
    .where(eq(schema.settings.id, 1))
    .limit(1);
  const row = rows[0];
  if (!row) return DEFAULTS;

  return {
    notificationEmail: row.notificationEmail || DEFAULTS.notificationEmail,
    emailFrom: row.emailFrom || DEFAULTS.emailFrom,
    heroHeadline: row.heroHeadline || DEFAULTS.heroHeadline,
    heroSubtext: row.heroSubtext || DEFAULTS.heroSubtext,
    // Ignore the seeded placeholder copy so the real story shows until the
    // owner writes their own in Admin → Settings.
    storyMarkdown:
      row.storyMarkdown && !row.storyMarkdown.includes("[Placeholder")
        ? row.storyMarkdown
        : DEFAULTS.storyMarkdown,
    whereWeSell: (row.whereWeSell as string[]) || DEFAULTS.whereWeSell,
    freeShipThresholdCents:
      row.freeShipThresholdCents ?? DEFAULTS.freeShipThresholdCents,
    flatShippingCents: row.flatShippingCents ?? DEFAULTS.flatShippingCents,
    tiers: (row.tiers as Tier[]) || DEFAULTS.tiers,
  };
}

/** Ensure a settings row exists (called by the seed script). */
export async function ensureSettingsRow() {
  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.settings)
    .where(eq(schema.settings.id, 1))
    .limit(1);
  if (rows[0]) return;
  await db.insert(schema.settings).values({
    id: 1,
    notificationEmail: DEFAULTS.notificationEmail,
    emailFrom: DEFAULTS.emailFrom,
    heroHeadline: DEFAULTS.heroHeadline,
    heroSubtext: DEFAULTS.heroSubtext,
    storyMarkdown: DEFAULTS.storyMarkdown,
    whereWeSell: DEFAULTS.whereWeSell,
    freeShipThresholdCents: DEFAULTS.freeShipThresholdCents,
    flatShippingCents: DEFAULTS.flatShippingCents,
    tiers: DEFAULTS.tiers,
  });
}

export { DEFAULTS as DEFAULT_SETTINGS };
