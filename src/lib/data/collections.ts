import type { Collection, Plan } from "@/lib/types";
import { rupees } from "@/lib/money";

/** Editor-curated entry points into the catalogue. */
export const COLLECTIONS: Collection[] = [
  {
    slug: "pet-safe",
    title: "Safe Around Pets",
    tagline: "Non-toxic to cats and dogs",
    description:
      "Most popular houseplants — pothos, monstera, peace lily, ZZ — are toxic to cats and dogs if chewed. Every plant in this collection is not. If you have a curious animal at home, start here rather than hoping for the best.",
    photo: 8,
    filter: "pet-safe",
  },
  {
    slug: "low-light",
    title: "For Dim Corners",
    tagline: "Thrives away from a window",
    description:
      "North-facing flats, internal corridors, that one corner of the living room the sun never reaches. These plants genuinely tolerate low light rather than merely surviving it for a few months before declining.",
    photo: 4,
    filter: "low-light",
  },
  {
    slug: "air-purifying",
    title: "The Clean Air Set",
    tagline: "Foliage that earns its keep",
    description:
      "Broad-leaved, high-transpiration plants that improve the feel of a closed room. Useful through a Delhi winter or a sealed, air-conditioned office where the windows never open.",
    photo: 5,
    filter: "air-purifying",
  },
  {
    slug: "beginner",
    title: "Hard to Kill",
    tagline: "Forgiving of a missed week",
    description:
      "If something has died on you before, it was probably overwatering. These plants tolerate irregular care, travel and the occasional forgotten fortnight — the right place to rebuild some confidence.",
    photo: 1,
    filter: "beginner",
  },
  {
    slug: "flowering",
    title: "Always in Bloom",
    tagline: "Colour through the season",
    description:
      "Plants grown for flowers rather than foliage, selected for long flowering windows in Indian conditions. Several of these will bloom from March straight through to October given sun and a regular feed.",
    photo: 15,
    filter: "flowering",
  },
  {
    slug: "desk",
    title: "Desk & Shelf",
    tagline: "Compact enough for a workspace",
    description:
      "Under about forty centimetres and happy in artificial light. Small enough for a desk, a bookshelf or a bathroom sill without taking the surface over entirely.",
    photo: 11,
    filter: "desk",
  },
];

/**
 * Subscription tiers — this is the revenue model. Nurseries pay to be
 * listed; the marketplace takes no cut of any sale.
 */
export const PLANS: Plan[] = [
  {
    tier: "seed",
    name: "Seed",
    monthlyPaise: rupees(999),
    annualPaise: rupees(9_990),
    blurb: "For a single outlet testing the channel.",
    listingLimit: 25,
    features: [
      "Up to 25 live plant listings",
      "Nursery profile page",
      "Enquiries by phone and WhatsApp",
      "Appears in city search results",
      "Monthly performance email",
    ],
  },
  {
    tier: "sapling",
    name: "Sapling",
    monthlyPaise: rupees(2_499),
    annualPaise: rupees(24_990),
    blurb: "For established nurseries with real catalogue depth.",
    listingLimit: 150,
    features: [
      "Up to 150 live plant listings",
      "Verified partner badge",
      "Priority placement above Seed listings",
      "Enquiry inbox with response tracking",
      "Photo gallery on your profile",
      "Stock and price bulk editor",
      "Quarterly category insights",
    ],
    highlight: true,
  },
  {
    tier: "canopy",
    name: "Canopy",
    monthlyPaise: rupees(5_999),
    annualPaise: rupees(59_990),
    blurb: "For multi-outlet growers and landscape suppliers.",
    listingLimit: "unlimited",
    features: [
      "Unlimited plant listings",
      "Top placement on every plant page",
      "Featured on the homepage and city pages",
      "Multiple outlet locations under one account",
      "Bulk and wholesale enquiry routing",
      "Dedicated account manager",
      "Early access to new catalogue additions",
      "API access for stock sync",
    ],
  },
];

export const planByTier = (tier: Plan["tier"]) => PLANS.find((p) => p.tier === tier)!;
