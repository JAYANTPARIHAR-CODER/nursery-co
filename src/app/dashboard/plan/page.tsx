import Link from "next/link";
import { Check, Download } from "lucide-react";
import { nurseryStats } from "@/lib/catalog";
import { currentNursery, CURRENT_NURSERY_ID } from "@/lib/session";
import { PLANS, planByTier } from "@/lib/data/collections";
import { PLAN_LABELS } from "@/lib/data/nurseries";
import { formatINR } from "@/lib/money";
import { formatDate, cn } from "@/lib/utils";
import { PageHead, TableWrap, Th, Td } from "@/components/dash/Shell";
import { Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";

/** Six months of invoices, derived from the plan so the figures agree. */
function invoiceHistory(monthlyPaise: number) {
  const months = [
    "2026-09-14",
    "2026-08-14",
    "2026-07-14",
    "2026-06-14",
    "2026-05-14",
    "2026-04-14",
  ];
  return months.map((date, i) => ({
    id: `INV-2026-${String(9 - i).padStart(2, "0")}14`,
    date,
    amountPaise: monthlyPaise,
    status: "paid" as const,
  }));
}

export default function PlanPage() {
  const nursery = currentNursery();
  const stats = nurseryStats(CURRENT_NURSERY_ID);
  const current = planByTier(nursery.plan);
  const invoices = invoiceHistory(current.monthlyPaise);

  const limit = current.listingLimit;
  const pctUsed = limit === "unlimited" ? 0 : Math.round((stats.listings / limit) * 100);

  return (
    <div className="p-5 sm:p-8">
      <PageHead
        title="Plan & billing"
        blurb="A flat subscription, no commission. Everything a buyer pays you stays with you."
      />

      {/* --------------------------------------------------- current plan */}
      <div className="mt-7 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="border border-brand/30 bg-brand-soft p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow text-ink-faint">Current plan</p>
              <p className="mt-2 font-display text-3xl">{PLAN_LABELS[nursery.plan]}</p>
              <p className="mt-1.5 text-sm text-ink-muted">{current.blurb}</p>
            </div>
            <div className="text-right">
              <p className="tabular font-display text-3xl leading-none">
                {formatINR(current.monthlyPaise)}
                <span className="ml-1 text-sm text-ink-faint">/mo</span>
              </p>
              <Badge
                tone={nursery.planStatus === "active" ? "leaf" : "gold"}
                className="mt-2"
              >
                {nursery.planStatus}
              </Badge>
            </div>
          </div>

          <div className="mt-6 border-t border-brand/20 pt-5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-ink-muted">Listings used</span>
              <span className="tabular font-medium">
                {stats.listings}
                {limit === "unlimited" ? " · unlimited" : ` / ${limit}`}
              </span>
            </div>
            {limit !== "unlimited" && (
              <div
                className="mt-2.5 h-1.5 w-full overflow-hidden bg-white/60"
                role="progressbar"
                aria-valuenow={pctUsed}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Listing allowance used"
              >
                <div
                  className={cn("h-full", pctUsed > 85 ? "bg-clay" : "bg-brand")}
                  style={{ width: `${Math.min(100, pctUsed)}%` }}
                />
              </div>
            )}
            <p className="mt-4 text-sm text-ink-muted">
              Renews on{" "}
              <span className="font-medium text-ink">{formatDate(nursery.renewsOn)}</span>
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button size="sm">Change plan</Button>
            <Button size="sm" variant="ghost">
              Cancel subscription
            </Button>
          </div>
        </div>

        <div className="border border-line bg-surface p-6">
          <p className="eyebrow text-ink-faint">What you are not paying</p>
          <p className="tabular mt-3 font-display text-4xl leading-none text-leaf">₹0</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            in sales commission. A typical marketplace would have taken 15–20% of every
            order routed through this platform.
          </p>
          <ul className="mt-5 space-y-2 border-t border-line pt-5">
            {[
              "No commission at any tier",
              "No payment processing fees",
              "No charge per enquiry",
              "Cancel any time",
            ].map((f) => (
              <li key={f} className="flex gap-2.5 text-sm text-ink-muted">
                <Check className="mt-0.5 size-3.5 shrink-0 text-leaf" strokeWidth={2} aria-hidden />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* --------------------------------------------------- other plans */}
      <h2 className="mt-9 mb-4 text-lg">Other plans</h2>
      <div className="grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = plan.tier === nursery.plan;
          return (
            <div
              key={plan.tier}
              className={cn(
                "flex flex-col border bg-surface p-5",
                isCurrent ? "border-brand" : "border-line",
              )}
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-display text-xl">{plan.name}</p>
                {isCurrent && <Badge tone="leaf">Current</Badge>}
              </div>
              <p className="tabular mt-3 font-display text-2xl">
                {formatINR(plan.monthlyPaise)}
                <span className="ml-1 text-xs text-ink-faint">/mo</span>
              </p>
              <p className="mt-2 text-xs text-ink-muted">
                {plan.listingLimit === "unlimited"
                  ? "Unlimited listings"
                  : `Up to ${plan.listingLimit} listings`}
              </p>
              <ul className="mt-4 flex-1 space-y-1.5">
                {plan.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex gap-2 text-xs text-ink-muted">
                    <Check className="mt-0.5 size-3 shrink-0 text-brand" strokeWidth={2} aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              {!isCurrent && (
                <Button size="sm" variant="outline" className="mt-5 w-full">
                  {plan.monthlyPaise > current.monthlyPaise ? "Upgrade" : "Downgrade"}
                </Button>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-ink-muted">
        Full feature comparison on the{" "}
        <Link href="/partner#pricing" className="underline underline-offset-4">
          pricing page
        </Link>
        .
      </p>

      {/* ----------------------------------------------------- invoices */}
      <h2 className="mt-9 mb-4 text-lg">Invoices</h2>
      <TableWrap>
        <thead>
          <tr>
            <Th>Invoice</Th>
            <Th>Date</Th>
            <Th className="text-right">Amount</Th>
            <Th>Status</Th>
            <Th className="text-right">Download</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {invoices.map((inv) => (
            <tr key={inv.id} className="transition-colors hover:bg-sunken/60">
              <Td className="tabular font-medium">{inv.id}</Td>
              <Td className="text-xs whitespace-nowrap text-ink-muted">
                {formatDate(inv.date)}
              </Td>
              <Td className="tabular text-right font-medium">
                {formatINR(inv.amountPaise)}
              </Td>
              <Td>
                <Badge tone="leaf">{inv.status}</Badge>
              </Td>
              <Td>
                <div className="flex justify-end">
                  <button
                    type="button"
                    aria-label={`Download ${inv.id}`}
                    className="inline-flex items-center gap-1.5 text-xs text-ink-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
                  >
                    <Download className="size-3.5" strokeWidth={1.5} />
                    PDF
                  </button>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </div>
  );
}
