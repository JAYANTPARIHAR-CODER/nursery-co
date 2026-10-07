import type {
  Collection,
  Nursery,
  Offer,
  Plant,
  PlantCategory,
} from "@/lib/types";
import { PLANTS, PUBLISHED_PLANTS } from "@/lib/data/plants";
import { NURSERIES } from "@/lib/data/nurseries";
import { OFFERS } from "@/lib/data/offers";
import { COLLECTIONS } from "@/lib/data/collections";
import { ENQUIRIES } from "@/lib/data/enquiries";

/**
 * Every read goes through this module. When the real backend lands, these
 * function signatures become the API client surface and no page changes.
 */

/* ---------------------------------------------------------------- lookups */

const plantById = new Map(PLANTS.map((p) => [p.id, p]));
const plantBySlug = new Map(PLANTS.map((p) => [p.slug, p]));
const nurseryById = new Map(NURSERIES.map((n) => [n.id, n]));
const nurseryBySlug = new Map(NURSERIES.map((n) => [n.slug, n]));

export const getPlant = (id: string) => plantById.get(id);
export const getPlantBySlug = (slug: string) => plantBySlug.get(slug);
export const getNursery = (id: string) => nurseryById.get(id);
export const getNurseryBySlug = (slug: string) => nurseryBySlug.get(slug);
export const getCollection = (slug: string) => COLLECTIONS.find((c) => c.slug === slug);

/* ----------------------------------------------------------------- offers */

/** An offer with its nursery resolved — what the plant page actually renders. */
export interface OfferWithNursery extends Offer {
  nursery: Nursery;
}

export type OfferSort = "price-asc" | "price-desc" | "distance" | "rating";

/**
 * All live offers for a plant.
 *
 * A past-due nursery is excluded: the subscription *is* the product, so
 * letting an unpaid listing stay visible would quietly give the service
 * away. Out-of-stock offers are kept but sort last — seeing that a nearby
 * nursery normally carries something is still useful.
 */
export function offersForPlant(
  plantId: string,
  opts: { city?: string; sort?: OfferSort; inStockOnly?: boolean } = {},
): OfferWithNursery[] {
  const { city, sort = "price-asc", inStockOnly = false } = opts;

  let rows = OFFERS.filter((o) => o.plantId === plantId)
    .map((o) => {
      const nursery = nurseryById.get(o.nurseryId);
      return nursery ? { ...o, nursery } : null;
    })
    .filter((o): o is OfferWithNursery => o !== null)
    .filter((o) => o.nursery.planStatus !== "past-due");

  if (city) rows = rows.filter((o) => o.nursery.city === city);
  if (inStockOnly) rows = rows.filter((o) => o.stock > 0);

  const comparators: Record<OfferSort, (a: OfferWithNursery, b: OfferWithNursery) => number> = {
    "price-asc": (a, b) => a.pricePaise - b.pricePaise,
    "price-desc": (a, b) => b.pricePaise - a.pricePaise,
    distance: (a, b) => a.nursery.distanceKm - b.nursery.distanceKm,
    rating: (a, b) => b.nursery.rating - a.nursery.rating,
  };

  // Stocked listings always outrank empty ones, whatever the sort.
  return rows.sort((a, b) => {
    const stocked = Number(b.stock > 0) - Number(a.stock > 0);
    return stocked !== 0 ? stocked : comparators[sort](a, b);
  });
}

export function offersForNursery(nurseryId: string): (Offer & { plant: Plant })[] {
  return OFFERS.filter((o) => o.nurseryId === nurseryId)
    .map((o) => {
      const plant = plantById.get(o.plantId);
      return plant ? { ...o, plant } : null;
    })
    .filter((o): o is Offer & { plant: Plant } => o !== null);
}

export interface PriceSummary {
  from: number;
  to: number;
  nurseryCount: number;
  inStockCount: number;
}

/** Headline "from ₹X at N nurseries" shown on every card. */
export function priceSummary(plantId: string, city?: string): PriceSummary | null {
  const rows = offersForPlant(plantId, { city });
  if (rows.length === 0) return null;
  const prices = rows.map((r) => r.pricePaise);
  return {
    from: Math.min(...prices),
    to: Math.max(...prices),
    nurseryCount: rows.length,
    inStockCount: rows.filter((r) => r.stock > 0).length,
  };
}

/* --------------------------------------------------------------- browsing */

export type PlantSort = "popular" | "price-asc" | "price-desc" | "name" | "newest";

export interface CatalogQuery {
  q?: string;
  category?: PlantCategory | "all";
  city?: string;
  light?: Plant["care"]["light"][];
  difficulty?: Plant["difficulty"][];
  petSafe?: boolean;
  airPurifying?: boolean;
  flowering?: boolean;
  placement?: Plant["traits"]["placement"];
  /** Inclusive bounds in paise, matched against a plant's lowest offer. */
  maxPricePaise?: number;
  sort?: PlantSort;
}

export function searchPlants(query: CatalogQuery = {}): Plant[] {
  const {
    q,
    category,
    city,
    light,
    difficulty,
    petSafe,
    airPurifying,
    flowering,
    placement,
    maxPricePaise,
    sort = "popular",
  } = query;

  let rows = [...PUBLISHED_PLANTS];

  if (q?.trim()) {
    const needle = q.trim().toLowerCase();
    rows = rows.filter((p) =>
      [p.commonName, p.botanicalName, p.family, p.summary, ...p.tags]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }

  if (category && category !== "all") rows = rows.filter((p) => p.category === category);
  if (light?.length) rows = rows.filter((p) => light.includes(p.care.light));
  if (difficulty?.length) rows = rows.filter((p) => difficulty.includes(p.difficulty));
  if (petSafe) rows = rows.filter((p) => p.traits.petSafe);
  if (airPurifying) rows = rows.filter((p) => p.traits.airPurifying);
  if (flowering) rows = rows.filter((p) => p.traits.flowering);
  if (placement) {
    rows = rows.filter(
      (p) => p.traits.placement === placement || p.traits.placement === "both",
    );
  }

  // City and price both depend on live offers, so resolve them together.
  if (city || maxPricePaise) {
    rows = rows.filter((p) => {
      const summary = priceSummary(p.id, city);
      if (!summary) return false;
      return maxPricePaise ? summary.from <= maxPricePaise : true;
    });
  }

  const byLowestPrice = (p: Plant) => priceSummary(p.id, city)?.from ?? Number.MAX_SAFE_INTEGER;

  switch (sort) {
    case "price-asc":
      return rows.sort((a, b) => byLowestPrice(a) - byLowestPrice(b));
    case "price-desc":
      return rows.sort((a, b) => byLowestPrice(b) - byLowestPrice(a));
    case "name":
      return rows.sort((a, b) => a.commonName.localeCompare(b.commonName));
    case "newest":
      return rows.sort((a, b) => b.addedOn.localeCompare(a.addedOn));
    case "popular":
    default:
      // Stand-in for real demand data: breadth of nursery coverage.
      return rows.sort(
        (a, b) =>
          (priceSummary(b.id, city)?.nurseryCount ?? 0) -
          (priceSummary(a.id, city)?.nurseryCount ?? 0),
      );
  }
}

/* ------------------------------------------------------------ collections */

const COLLECTION_PREDICATES: Record<Collection["filter"], (p: Plant) => boolean> = {
  "pet-safe": (p) => p.traits.petSafe,
  "low-light": (p) => p.care.light === "low",
  "air-purifying": (p) => p.traits.airPurifying,
  beginner: (p) => p.difficulty === "easy" && p.traits.lowMaintenance,
  flowering: (p) => p.traits.flowering,
  desk: (p) => /desk|compact|windowsill|shelf/.test(p.tags.join(" ")),
};

export function plantsInCollection(slug: string): Plant[] {
  const collection = getCollection(slug);
  if (!collection) return [];
  return PUBLISHED_PLANTS.filter(COLLECTION_PREDICATES[collection.filter]);
}

export function collectionCount(collection: Collection): number {
  return PUBLISHED_PLANTS.filter(COLLECTION_PREDICATES[collection.filter]).length;
}

/** Same category first, then shared tags. Never returns the plant itself. */
export function relatedPlants(plant: Plant, limit = 4): Plant[] {
  const scored = PUBLISHED_PLANTS.filter((p) => p.id !== plant.id).map((p) => {
    let score = p.category === plant.category ? 10 : 0;
    score += p.tags.filter((t) => plant.tags.includes(t)).length * 3;
    if (p.difficulty === plant.difficulty) score += 1;
    if (p.care.light === plant.care.light) score += 1;
    return { plant: p, score };
  });
  return scored
    .sort((a, b) => b.score - a.score || a.plant.commonName.localeCompare(b.plant.commonName))
    .slice(0, limit)
    .map((s) => s.plant);
}

/* ----------------------------------------------------------- nurseries */

export function listNurseries(opts: { city?: string; verifiedOnly?: boolean } = {}) {
  let rows = NURSERIES.filter((n) => n.planStatus !== "past-due");
  if (opts.city) rows = rows.filter((n) => n.city === opts.city);
  if (opts.verifiedOnly) rows = rows.filter((n) => n.verified);
  // Canopy partners pay for top placement — that is the tier's promise.
  const rank = { canopy: 0, sapling: 1, seed: 2 } as const;
  return rows.sort(
    (a, b) => rank[a.plan] - rank[b.plan] || b.rating - a.rating,
  );
}

export function nurseryStats(nurseryId: string) {
  const listings = offersForNursery(nurseryId);
  const enquiries = ENQUIRIES.filter((e) => e.nurseryId === nurseryId);
  return {
    listings: listings.length,
    inStock: listings.filter((l) => l.stock > 0).length,
    outOfStock: listings.filter((l) => l.stock === 0).length,
    enquiries: enquiries.length,
    newEnquiries: enquiries.filter((e) => e.status === "new").length,
    converted: enquiries.filter((e) => e.status === "converted").length,
    inventoryValuePaise: listings.reduce((sum, l) => sum + l.pricePaise * l.stock, 0),
  };
}

export function enquiriesForNursery(nurseryId: string) {
  return ENQUIRIES.filter((e) => e.nurseryId === nurseryId)
    .map((e) => ({ ...e, plant: plantById.get(e.plantId)! }))
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}

/* --------------------------------------------------------------- platform */

/** Aggregates for the admin overview. */
export function platformStats() {
  const live = NURSERIES.filter((n) => n.planStatus !== "past-due");
  const mrrPaise = NURSERIES.filter((n) => n.planStatus === "active").reduce((sum, n) => {
    const monthly = { seed: 99_900, sapling: 249_900, canopy: 599_900 } as const;
    return sum + monthly[n.plan];
  }, 0);

  return {
    plants: PLANTS.length,
    publishedPlants: PUBLISHED_PLANTS.length,
    draftPlants: PLANTS.filter((p) => p.status === "draft").length,
    nurseries: NURSERIES.length,
    liveNurseries: live.length,
    pendingVerification: NURSERIES.filter((n) => !n.verified).length,
    pastDue: NURSERIES.filter((n) => n.planStatus === "past-due").length,
    trials: NURSERIES.filter((n) => n.planStatus === "trial").length,
    listings: OFFERS.length,
    enquiries: ENQUIRIES.length,
    mrrPaise,
  };
}

/** Catalogue coverage: how many nurseries carry each plant. */
export function coverageByPlant() {
  return PUBLISHED_PLANTS.map((p) => ({
    plant: p,
    count: OFFERS.filter((o) => o.plantId === p.id).length,
  })).sort((a, b) => a.count - b.count);
}

export { PLANTS, PUBLISHED_PLANTS, NURSERIES, OFFERS, COLLECTIONS, ENQUIRIES };
