/**
 * Single source of truth for brand identity.
 * Rename here and the wordmark, page metadata and footer all follow.
 */
export const BRAND = {
  name: "Nursery Co.",
  /** Rendered letter-spaced in the header wordmark. */
  wordmark: "NURSERY CO.",
  tagline: "India's plant catalogue, stocked by nurseries near you",
  description:
    "Browse a curated catalogue of plants, then see exactly which nurseries near you have them in stock — with live prices, pot sizes and availability.",
  email: "hello@nurseryco.in",
  phone: "+91 98200 00000",
  supportHours: "Mon-Sat, 9am-7pm IST",
  social: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    youtube: "https://youtube.com",
  },
} as const;

/** Cities with live nursery coverage. */
export const CITIES = [
  "Pune",
  "Mumbai",
  "Bengaluru",
  "Delhi NCR",
  "Hyderabad",
  "Chennai",
] as const;

export type City = (typeof CITIES)[number];
export const DEFAULT_CITY: City = "Pune";
