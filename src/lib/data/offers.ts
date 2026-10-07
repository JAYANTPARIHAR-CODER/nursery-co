import type { Offer, OfferCondition } from "@/lib/types";
import { PLANTS } from "./plants";
import { NURSERIES } from "./nurseries";
import { rupees } from "@/lib/money";
import { seeded, between, pick } from "@/lib/utils";

/**
 * Offers are generated rather than hand-written — 24 plants across 14
 * nurseries is several hundred rows, and the point of the data is the
 * *spread* of prices, not any individual number.
 *
 * Generation is seeded from stable ids (see lib/utils#seeded), so the
 * output is identical on every render, on server and client alike. Swap
 * this whole module for a real API call and nothing downstream changes.
 */

/** Typical street price in a mid-market Indian nursery, in rupees. */
const BASE_RUPEES: Record<string, number> = {
  "monstera-deliciosa": 499,
  "snake-plant": 299,
  "money-plant-golden": 149,
  "peace-lily": 349,
  "zz-plant": 549,
  "areca-palm": 399,
  "rubber-plant": 449,
  "fiddle-leaf-fig": 899,
  "spider-plant": 199,
  "aloe-vera": 179,
  "jade-plant": 249,
  "echeveria-elegans": 149,
  tulsi: 99,
  "curry-leaf-plant": 199,
  mint: 79,
  hibiscus: 249,
  bougainvillea: 299,
  "mogra-jasmine": 249,
  "ficus-bonsai": 1299,
  "adenium-desert-rose": 799,
  "boston-fern": 299,
  "string-of-pearls": 449,
  "croton-petra": 229,
  "lucky-bamboo": 199,
};

/**
 * Price positioning per nursery. A curated studio in Koregaon Park and a
 * wholesale yard in Chattarpur should not quote the same number for the
 * same plant — that spread is the entire reason a comparison page exists.
 */
const POSITIONING: Record<string, { mult: number; carries: number }> = {
  "n-001": { mult: 1.05, carries: 0.85 }, // Green Canopy — broad, mid
  "n-002": { mult: 0.98, carries: 0.6 },
  "n-003": { mult: 1.42, carries: 0.45 }, // Deccan Studio — curated premium
  "n-004": { mult: 0.78, carries: 0.55 }, // Hadapsar — budget volume
  "n-005": { mult: 1.08, carries: 0.75 },
  "n-006": { mult: 1.34, carries: 0.5 }, // Bandra — design-led
  "n-007": { mult: 0.84, carries: 0.45 },
  "n-008": { mult: 1.02, carries: 0.9 }, // Whitefield — deepest catalogue
  "n-009": { mult: 0.92, carries: 0.55 },
  "n-010": { mult: 1.48, carries: 0.3 }, // Leaf Lab — rare, low volume
  "n-011": { mult: 1.12, carries: 0.7 },
  "n-012": { mult: 0.74, carries: 0.6 }, // Chattarpur — wholesale
  "n-013": { mult: 1.06, carries: 0.6 },
  "n-014": { mult: 0.96, carries: 0.6 },
};

const POT_SIZES = ['4"', '5"', '6"', '8"', '10"', '12"'] as const;
const POT_MATERIALS = [
  "Nursery bag",
  "Plastic grow pot",
  "Terracotta",
  "Ceramic",
  "Self-watering",
] as const;
const CONDITIONS: readonly OfferCondition[] = ["premium", "standard", "nursery-fresh"];

/** Speciality keywords that make a nursery more likely to stock a category. */
const AFFINITY: Record<string, string[]> = {
  "indoor-plants": ["Indoor foliage", "Compact plants", "Collector plants", "Statement plants"],
  "air-purifying": ["Indoor foliage", "Office contracts", "Office landscaping"],
  "flowering-plants": ["Flowering plants", "Seasonal bedding", "Winter annuals"],
  "succulents-cacti": ["Succulents", "Collector plants"],
  bonsai: ["Collector plants", "Rare aroids", "Gifting"],
  "herbs-edible": ["Herbs & edible", "Heirloom seeds", "Organic inputs"],
  "outdoor-shrubs": ["Outdoor shrubs", "Hedging", "Landscape supply", "Outdoor stock"],
  "hanging-creepers": ["Balcony gardens", "Compact plants", "Indoor foliage"],
};

function buildOffers(): Offer[] {
  const out: Offer[] = [];
  const published = PLANTS.filter((p) => p.status === "published");

  for (const plant of published) {
    const baseRupees = BASE_RUPEES[plant.slug] ?? 299;
    const carriedBy: string[] = [];

    for (const nursery of NURSERIES) {
      const rng = seeded(`${plant.id}:${nursery.id}`);
      const pos = POSITIONING[nursery.id] ?? { mult: 1, carries: 0.5 };

      // A nursery is likelier to stock a plant inside its speciality.
      const affinity = AFFINITY[plant.category] ?? [];
      const matches = nursery.specialities.some((s) => affinity.includes(s));
      const chance = Math.min(0.95, pos.carries + (matches ? 0.25 : -0.08));
      if (rng() > chance) continue;

      carriedBy.push(nursery.id);
      out.push(makeOffer(plant.id, plant.slug, nursery.id, baseRupees, pos.mult, rng));
    }

    // Guarantee a real comparison: every published plant needs at least
    // three offers, or the plant page has nothing to compare.
    if (carriedBy.length < 3) {
      const fallback = NURSERIES.filter((n) => !carriedBy.includes(n.id));
      for (const nursery of fallback.slice(0, 3 - carriedBy.length)) {
        const rng = seeded(`fallback:${plant.id}:${nursery.id}`);
        const pos = POSITIONING[nursery.id] ?? { mult: 1, carries: 0.5 };
        out.push(makeOffer(plant.id, plant.slug, nursery.id, baseRupees, pos.mult, rng));
      }
    }
  }

  return out;
}

function makeOffer(
  plantId: string,
  plantSlug: string,
  nurseryId: string,
  baseRupees: number,
  mult: number,
  rng: () => number,
): Offer {
  // ±12% nursery-level jitter on top of the positioning multiplier.
  const jitter = 0.88 + rng() * 0.24;
  const potIndex = between(rng, 0, POT_SIZES.length - 1);
  // Bigger pot, bigger plant, higher price.
  const potPremium = 1 + potIndex * 0.18;

  const raw = baseRupees * mult * jitter * potPremium;
  // Indian retail rounds to the nearest 9 or 49, never to 437.
  const price = Math.max(49, Math.round(raw / 10) * 10 - 1);

  // Roughly a third of listings carry a struck-through reference price.
  const hasMrp = rng() > 0.66;
  const mrp = hasMrp ? Math.round((price * (1.15 + rng() * 0.3)) / 10) * 10 - 1 : undefined;

  const stock = rng() > 0.1 ? between(rng, 1, 40) : 0;

  return {
    id: `o-${plantSlug}-${nurseryId}`,
    plantId,
    nurseryId,
    pricePaise: rupees(price),
    mrpPaise: mrp ? rupees(mrp) : undefined,
    potSize: POT_SIZES[potIndex],
    potMaterial: pick(rng, POT_MATERIALS),
    heightCm: between(rng, 15, 20 + potIndex * 25),
    stock,
    condition: pick(rng, CONDITIONS),
    deliversToCity: rng() > 0.15,
    updatedAt: `2026-${String(between(rng, 8, 10)).padStart(2, "0")}-${String(
      between(rng, 1, 28),
    ).padStart(2, "0")}`,
  };
}

export const OFFERS: Offer[] = buildOffers();

export const CONDITION_LABELS: Record<OfferCondition, string> = {
  premium: "Premium grade",
  standard: "Standard",
  "nursery-fresh": "Nursery fresh",
};
