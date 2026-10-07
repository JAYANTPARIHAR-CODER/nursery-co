import { NURSERIES, platformStats } from "@/lib/catalog";
import { PLAN_LABELS } from "@/lib/data/nurseries";
import { PLANS } from "@/lib/data/collections";
import { formatINR, formatINRCompact } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { PageHead, StatCard, TableWrap, Th, Td } from "@/components/dash/Shell";
import { Badge } from "@/components/ui/primitives";

const MONTHLY = { seed: 99_900, sapling: 249_900, canopy: 599_900 } as const;

export default function AdminBillingPage() {
  const stats = platformStats();

  const rows = [...NURSERIES].sort((a, b) => {
    // Past-due first — those are the ones needing action today.
    const urgency = (n: (typeof NURSERIES)[number]) =>
      n.planStatus === "past-due" ? 0 : n.planStatus === "trial" ? 1 : 2;
    return urgency(a) - urgency(b) || a.renewsOn.localeCompare(b.renewsOn);
  });

  const atRiskPaise = NURSERIES.filter((n) => n.planStatus === "past-due").reduce(
    (sum, n) => sum + MONTHLY[n.plan],
    0,
  );
  const trialPaise = NURSERIES.filter((n) => n.planStatus === "trial").reduce(
    (sum, n) => sum + MONTHLY[n.plan],
    0,
  );

  return (
    <div className="p-5 sm:p-8">
      <PageHead
        title="Billing"
        blurb="Subscription revenue by nursery. The platform takes no commission on sales, so this table is the entire top line."
      />

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Monthly recurring revenue"
          value={formatINRCompact(stats.mrrPaise)}
          sub="Active subscriptions only"
          tone="good"
        />
        <StatCard
          label="Annualised run rate"
          value={formatINRCompact(stats.mrrPaise * 12)}
          sub="MRR × 12, no churn assumption"
        />
        <StatCard
          label="At risk"
          value={formatINRCompact(atRiskPaise)}
          sub={`${stats.pastDue} past-due ${stats.pastDue === 1 ? "account" : "accounts"}`}
          tone={atRiskPaise > 0 ? "warn" : "neutral"}
        />
        <StatCard
          label="In trial"
          value={formatINRCompact(trialPaise)}
          sub={`${stats.trials} converting within 30 days`}
        />
      </div>

      <h2 className="mt-9 mb-4 text-lg">Plan mix</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {PLANS.map((plan) => {
          const members = NURSERIES.filter((n) => n.plan === plan.tier);
          const active = members.filter((n) => n.planStatus === "active");
          const share = Math.round((members.length / NURSERIES.length) * 100);
          return (
            <div key={plan.tier} className="border border-line bg-surface p-5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-display text-xl">{plan.name}</p>
                <span className="tabular text-xs text-ink-faint">
                  {formatINR(plan.monthlyPaise)}/mo
                </span>
              </div>
              <p className="tabular mt-3 font-display text-2xl">
                {formatINRCompact(active.length * MONTHLY[plan.tier])}
              </p>
              <p className="mt-1.5 text-xs text-ink-muted">
                {members.length} {members.length === 1 ? "nursery" : "nurseries"} ·{" "}
                {active.length} billing
              </p>
              {/* Share bar — one glance at where the revenue concentrates. */}
              <div className="mt-4 h-1 w-full overflow-hidden bg-canvas" aria-hidden>
                <div className="h-full bg-brand" style={{ width: `${share}%` }} />
              </div>
              <p className="tabular mt-2 text-[11px] text-ink-faint">
                {share}% of partners
              </p>
            </div>
          );
        })}
      </div>

      <h2 className="mt-9 mb-4 text-lg">Subscriptions</h2>
      <TableWrap>
        <thead>
          <tr>
            <Th>Nursery</Th>
            <Th>Plan</Th>
            <Th>Status</Th>
            <Th className="text-right">Monthly</Th>
            <Th>Next renewal</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((n) => (
            <tr
              key={n.id}
              className={`transition-colors hover:bg-sunken/60 ${n.planStatus === "past-due" ? "bg-clay-soft/50" : ""}`}
            >
              <Td>
                <p className="font-medium">{n.name}</p>
                <p className="text-xs text-ink-faint">
                  {n.area}, {n.city}
                </p>
              </Td>
              <Td>
                <Badge tone={n.plan === "canopy" ? "ink" : "neutral"}>
                  {PLAN_LABELS[n.plan]}
                </Badge>
              </Td>
              <Td>
                <Badge
                  tone={
                    n.planStatus === "active"
                      ? "leaf"
                      : n.planStatus === "trial"
                        ? "gold"
                        : "danger"
                  }
                >
                  {n.planStatus}
                </Badge>
              </Td>
              <Td className="tabular text-right font-medium">
                {n.planStatus === "trial" ? (
                  <span className="text-ink-faint">—</span>
                ) : (
                  formatINR(MONTHLY[n.plan])
                )}
              </Td>
              <Td className="text-xs whitespace-nowrap text-ink-muted">
                {formatDate(n.renewsOn)}
                {n.planStatus === "past-due" && (
                  <span className="block font-medium text-clay">Overdue</span>
                )}
              </Td>
              <Td>
                <div className="flex items-center justify-end gap-3 text-xs">
                  {n.planStatus === "past-due" && (
                    <button
                      type="button"
                      className="font-medium text-clay underline-offset-4 hover:underline"
                    >
                      Send reminder
                    </button>
                  )}
                  <button
                    type="button"
                    className="text-ink-muted underline-offset-4 hover:text-ink hover:underline"
                  >
                    Invoices
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
