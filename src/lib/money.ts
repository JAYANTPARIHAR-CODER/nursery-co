/**
 * All prices move through the app as integer paise.
 *
 * Floating point rupees drift (0.1 + 0.2 !== 0.3), and a marketplace that
 * shows a different number than it quotes loses nursery trust fast. Paise
 * in, formatted string out, and no float arithmetic anywhere in between.
 */

/** Author-time helper: rupees(449) -> 44900 paise. */
export const rupees = (r: number): number => Math.round(r * 100);

export function formatINR(paise: number, opts: { decimals?: boolean } = {}): string {
  const { decimals = false } = opts;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  }).format(paise / 100);
}

/** Compact form for dashboard metrics: ₹1.2L, ₹84.5k. */
export function formatINRCompact(paise: number): string {
  const r = paise / 100;
  if (r >= 10_000_000) return `₹${(r / 10_000_000).toFixed(1)}Cr`;
  if (r >= 100_000) return `₹${(r / 100_000).toFixed(1)}L`;
  if (r >= 1_000) return `₹${(r / 1_000).toFixed(1)}k`;
  return `₹${Math.round(r)}`;
}

/** Percentage off, rounded down so we never overstate a discount. */
export function discountPct(pricePaise: number, mrpPaise?: number): number | null {
  if (!mrpPaise || mrpPaise <= pricePaise) return null;
  return Math.floor(((mrpPaise - pricePaise) / mrpPaise) * 100);
}
