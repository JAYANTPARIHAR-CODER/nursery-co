import Link from "next/link";
import { AlertTriangle, TrendingUp, Plus } from "lucide-react";
import { platformStats, coverageByPlant, NURSERIES, ENQUIRIES } from "@/lib/catalog";
import { PLAN_LABELS } from "@/lib/data/nurseries";
import { formatINRCompact, formatINR } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { PageHead, StatCard, TableWrap, Th, Td } from "@/components/dash/Shell";
import { Badge } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";

export default function AdminOverview() {
  const stats = platformStats();
  // Always the six thinnest, never a fixed threshold — a cut-off of "<= 4"
  // silently renders an empty table the moment supply improves past it.
  const thin = coverageByPlant().slice(0, 6);
  const pastDue = NURSERIES.filter((n) => n.planStatus === "past-due");
  const unverified = NURSERIES.filter((n) => !n.verified);
  const recentEnquiries = [...ENQUIRIES]
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt))
    .slice(0, 5);

  return (
    <div className="p-5 sm:p-8">
      <PageHead
        title="Overview"
        blurb="Marketplace health at a glance — catalogue depth, partner coverage and subscription revenue."
        action={
          <ButtonLink href="/admin/catalogue/new" size="sm">
            <Plus className="size-3.5" strokeWidth={2} />
            Add plant
          </ButtonLink>
        }
      />

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Monthly recurring revenue"
          value={formatINRCompact(stats.mrrPaise)}
          sub={`${stats.nurseries - stats.pastDue - stats.trials} nurseries billing · ${stats.trials} on trial`}
          tone="good"
        />
        <StatCard
          label="Catalogue"
          value={String(stats.publishedPlants)}
          sub={`${stats.draftPlants} drafts awaiting review`}
        />
        <StatCard
          label="Live nurseries"
          value={String(stats.liveNurseries)}
          sub={`${stats.pendingVerification} pending verification`}
        />
        <StatCard
          label="Stock listings"
          value={String(stats.listings)}
          sub={`${stats.enquiries} enquiries routed this month`}
        />
      </div>

      {/* Things that need a human decision today. */}
      {(pastDue.length > 0 || unverified.length > 0) && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg">Needs attention</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {pastDue.length > 0 && (
              <div className="border border-clay/30 bg-clay-soft p-5">
                <p className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="size-4 shrink-0 text-clay" strokeWidth={1.75} aria-hidden />
                  {pastDue.length} subscription{pastDue.length > 1 ? "s" : ""} past due
                </p>
                <ul className="mt-3 space-y-2">
                  {pastDue.map((n) => (
                    <li key={n.id} className="flex items-center justify-between gap-3 text-sm">
                      <Link
                        href="/admin/billing"
                        className="underline-offset-4 hover:underline"
                      >
                        {n.name}
                      </Link>
                      <span className="text-xs text-ink-muted">
                        due {formatDate(n.renewsOn)}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs leading-relaxed text-ink-muted">
                  Listings are already hidden from the storefront while a subscription is
                  past due.
                </p>
              </div>
            )}

            {unverified.length > 0 && (
              <div className="border border-line bg-surface p-5">
                <p className="font-medium">
                  {unverified.length} nurser{unverified.length > 1 ? "ies" : "y"} awaiting
                  verification
                </p>
                <ul className="mt-3 space-y-2">
                  {unverified.map((n) => (
                    <li key={n.id} className="flex items-center justify-between gap-3 text-sm">
                      <Link
                        href={`/nurseries/${n.slug}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {n.name}
                      </Link>
                      <span className="text-xs text-ink-muted">
                        {n.area}, {n.city}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs leading-relaxed text-ink-muted">
                  A site visit is required before the verified badge is granted.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        {/* Coverage gaps — the supply-side problem worth solving.
            min-w-0: without it the grid track inflates to the table min-width. */}
        <div className="min-w-0">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="text-lg">Thinnest coverage</h2>
            <Link
              href="/admin/catalogue"
              className="text-[11px] uppercase tracking-[0.1em] text-ink-muted underline-offset-4 hover:underline"
            >
              Full catalogue
            </Link>
          </div>
          <TableWrap minW="24rem">
            <thead>
              <tr>
                <Th>Plant</Th>
                <Th>Category</Th>
                <Th className="text-right">Nurseries</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {thin.map(({ plant, count }) => (
                <tr key={plant.id} className="transition-colors hover:bg-sunken/60">
                  <Td>
                    <Link
                      href={`/plants/${plant.slug}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {plant.commonName}
                    </Link>
                  </Td>
                  <Td className="text-xs text-ink-muted">
                    {plant.category.replace(/-/g, " ")}
                  </Td>
                  <Td className="text-right">
                    <span
                      className={`tabular font-medium ${count <= 3 ? "text-clay" : "text-ink"}`}
                    >
                      {count}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
          <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
            <TrendingUp className="mt-px size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
            Plants carried by few nurseries give buyers no real price comparison. Recruit
            supply here first.
          </p>
        </div>

        {/* Recent enquiries across the platform. */}
        <div className="min-w-0">
          <h2 className="mb-4 text-lg">Latest enquiries</h2>
          <TableWrap minW="24rem">
            <thead>
              <tr>
                <Th>Customer</Th>
                <Th>Nursery</Th>
                <Th>Status</Th>
                <Th className="text-right">Received</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {recentEnquiries.map((e) => {
                const nursery = NURSERIES.find((n) => n.id === e.nurseryId);
                return (
                  <tr key={e.id} className="transition-colors hover:bg-sunken/60">
                    <Td className="font-medium">{e.customerName}</Td>
                    <Td className="text-xs text-ink-muted">{nursery?.name}</Td>
                    <Td>
                      <Badge
                        tone={
                          e.status === "converted"
                            ? "leaf"
                            : e.status === "new"
                              ? "gold"
                              : "neutral"
                        }
                      >
                        {e.status}
                      </Badge>
                    </Td>
                    <Td className="text-right text-xs whitespace-nowrap text-ink-muted">
                      {formatDate(e.receivedAt)}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </TableWrap>
        </div>
      </div>

      {/* Revenue by tier */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg">Revenue by plan</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {(["canopy", "sapling", "seed"] as const).map((tier) => {
            const members = NURSERIES.filter(
              (n) => n.plan === tier && n.planStatus === "active",
            );
            const monthly = { seed: 99_900, sapling: 249_900, canopy: 599_900 }[tier];
            return (
              <div key={tier} className="border border-line bg-surface p-5">
                <div className="flex items-baseline justify-between">
                  <p className="font-display text-xl">{PLAN_LABELS[tier]}</p>
                  <span className="tabular text-xs text-ink-faint">
                    {formatINR(monthly)}/mo
                  </span>
                </div>
                <p className="tabular mt-3 font-display text-2xl">
                  {formatINRCompact(members.length * monthly)}
                </p>
                <p className="mt-1.5 text-xs text-ink-muted">
                  {members.length} active {members.length === 1 ? "nursery" : "nurseries"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
