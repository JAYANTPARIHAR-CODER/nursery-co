import Link from "next/link";
import { BadgeCheck, ExternalLink } from "lucide-react";
import { NURSERIES, offersForNursery } from "@/lib/catalog";
import { PLAN_LABELS } from "@/lib/data/nurseries";
import { formatDate } from "@/lib/utils";
import { PageHead, TableWrap, Th, Td, StatCard } from "@/components/dash/Shell";
import { Badge, Rating } from "@/components/ui/primitives";

const PLAN_RANK = { canopy: 0, sapling: 1, seed: 2 } as const;

export default function AdminNurseriesPage() {
  const rows = [...NURSERIES].sort(
    (a, b) => PLAN_RANK[a.plan] - PLAN_RANK[b.plan] || a.name.localeCompare(b.name),
  );

  const verified = NURSERIES.filter((n) => n.verified).length;
  const trials = NURSERIES.filter((n) => n.planStatus === "trial").length;
  const pastDue = NURSERIES.filter((n) => n.planStatus === "past-due").length;

  return (
    <div className="p-5 sm:p-8">
      <PageHead
        title="Nurseries"
        blurb="Every partner on the platform, their subscription state and how much stock they are actually maintaining."
      />

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total partners" value={String(NURSERIES.length)} />
        <StatCard
          label="Verified"
          value={String(verified)}
          sub={`${NURSERIES.length - verified} awaiting a site visit`}
          tone="good"
        />
        <StatCard label="On trial" value={String(trials)} sub="Converting within 30 days" />
        <StatCard
          label="Past due"
          value={String(pastDue)}
          sub="Listings hidden from storefront"
          tone={pastDue > 0 ? "warn" : "neutral"}
        />
      </div>

      <div className="mt-8">
        <TableWrap>
          <thead>
            <tr>
              <Th>Nursery</Th>
              <Th>City</Th>
              <Th>Plan</Th>
              <Th>Status</Th>
              <Th className="text-right">Listings</Th>
              <Th>Rating</Th>
              <Th>Renews</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((n) => {
              const listings = offersForNursery(n.id);
              const live = listings.filter((l) => l.stock > 0).length;
              return (
                <tr key={n.id} className="transition-colors hover:bg-sunken/60">
                  <Td>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">{n.name}</span>
                      {n.verified && (
                        <BadgeCheck
                          className="size-3.5 shrink-0 text-brand"
                          strokeWidth={1.75}
                          aria-label="Verified"
                        />
                      )}
                    </div>
                    <p className="text-xs text-ink-faint">Since {n.since}</p>
                  </Td>
                  <Td className="text-xs whitespace-nowrap text-ink-muted">
                    {n.area}
                    <br />
                    <span className="text-ink-faint">{n.city}</span>
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
                  <Td className="text-right">
                    <span className="tabular font-medium">{live}</span>
                    <span className="tabular text-xs text-ink-faint"> / {listings.length}</span>
                  </Td>
                  <Td>
                    <Rating value={n.rating} count={n.reviewCount} />
                  </Td>
                  <Td className="text-xs whitespace-nowrap text-ink-muted">
                    {formatDate(n.renewsOn)}
                  </Td>
                  <Td>
                    <div className="flex items-center justify-end gap-3 text-xs">
                      {!n.verified && (
                        <button
                          type="button"
                          className="text-leaf underline-offset-4 hover:underline"
                        >
                          Verify
                        </button>
                      )}
                      <Link
                        href={`/nurseries/${n.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-ink-muted underline-offset-4 hover:text-ink hover:underline"
                      >
                        View <ExternalLink className="size-3" strokeWidth={1.5} />
                      </Link>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-ink-muted">
        A nursery marked <span className="font-medium text-ink">past due</span> keeps its
        account and catalogue, but its listings are filtered out of every storefront
        query until payment clears — the subscription is the product, so an unpaid
        listing would be giving it away.
      </p>
    </div>
  );
}
