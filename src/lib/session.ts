import { getNursery } from "@/lib/catalog";

/**
 * Stand-in for authentication.
 *
 * The nursery dashboard renders as one signed-in partner. Swap this for a
 * real session lookup and every dashboard page keeps working unchanged.
 */
export const CURRENT_NURSERY_ID = "n-001";

export function currentNursery() {
  const nursery = getNursery(CURRENT_NURSERY_ID);
  if (!nursery) throw new Error(`Seed data missing nursery ${CURRENT_NURSERY_ID}`);
  return nursery;
}
