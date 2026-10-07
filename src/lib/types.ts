/* ------------------------------------------------------------------
   Domain model for the two-sided catalogue.

   The central idea: ADMIN owns the canonical plant entries. A NURSERY
   never creates a plant — it attaches an OFFER (its own price, pot
   size and stock) to a plant that already exists in the catalogue.
   That one constraint is what keeps the comparison view meaningful.
   ------------------------------------------------------------------ */

export type LightNeed = "low" | "bright-indirect" | "full-sun";
export type WaterNeed = "low" | "moderate" | "high";
export type Difficulty = "easy" | "moderate" | "expert";
export type Placement = "indoor" | "outdoor" | "both";

export type PlantCategory =
  | "indoor-plants"
  | "flowering-plants"
  | "succulents-cacti"
  | "air-purifying"
  | "bonsai"
  | "herbs-edible"
  | "outdoor-shrubs"
  | "hanging-creepers";

export interface Care {
  light: LightNeed;
  water: WaterNeed;
  /** Watering cadence in days, used for the "every N days" care line. */
  waterEveryDays: number;
  humidity: string;
  temperature: string;
  soil: string;
  fertiliser: string;
}

export interface PlantTraits {
  petSafe: boolean;
  airPurifying: boolean;
  lowMaintenance: boolean;
  flowering: boolean;
  placement: Placement;
}

/** A canonical catalogue entry. Created and owned by admin only. */
export interface Plant {
  id: string;
  slug: string;
  commonName: string;
  botanicalName: string;
  family: string;
  category: PlantCategory;
  /** Index into the shared media pool — see lib/data/media.ts */
  photo: number;
  summary: string;
  description: string;
  care: Care;
  traits: PlantTraits;
  difficulty: Difficulty;
  matureSize: string;
  growthRate: string;
  tags: string[];
  /** Admin workflow state. Only `published` plants reach the storefront. */
  status: "published" | "draft";
  addedOn: string;
}

export type PlanTier = "seed" | "sapling" | "canopy";

export interface Nursery {
  id: string;
  slug: string;
  name: string;
  city: string;
  area: string;
  address: string;
  /** Straight-line km from the city centre — stands in for real geo. */
  distanceKm: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
  since: number;
  phone: string;
  whatsapp: string;
  hours: string;
  deliveryRadiusKm: number;
  specialities: string[];
  bio: string;
  photo: number;
  plan: PlanTier;
  /** Subscription state — drives the admin billing table. */
  planStatus: "active" | "trial" | "past-due";
  renewsOn: string;
}

export type OfferCondition = "premium" | "standard" | "nursery-fresh";

/** One nursery's listing of one catalogue plant. */
export interface Offer {
  id: string;
  plantId: string;
  nurseryId: string;
  /** Integer paise. Never a float — see lib/money.ts */
  pricePaise: number;
  /** Optional struck-through reference price, also in paise. */
  mrpPaise?: number;
  potSize: string;
  potMaterial: string;
  heightCm: number;
  stock: number;
  condition: OfferCondition;
  deliversToCity: boolean;
  updatedAt: string;
}

export interface Collection {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  photo: number;
  /** Predicate key resolved in lib/catalog.ts */
  filter: "pet-safe" | "low-light" | "air-purifying" | "beginner" | "flowering" | "desk";
}

export interface Enquiry {
  id: string;
  plantId: string;
  nurseryId: string;
  customerName: string;
  customerCity: string;
  quantity: number;
  message: string;
  channel: "web" | "whatsapp" | "phone";
  status: "new" | "responded" | "converted" | "closed";
  receivedAt: string;
}

export interface Plan {
  tier: PlanTier;
  name: string;
  monthlyPaise: number;
  annualPaise: number;
  blurb: string;
  listingLimit: number | "unlimited";
  features: string[];
  highlight?: boolean;
}
