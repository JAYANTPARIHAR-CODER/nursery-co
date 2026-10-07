import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, ArrowUpRight, BadgeCheck, Plus } from "lucide-react";
import {
  nurseryStats,
  enquiriesForNursery,
  offersForNursery,
  offersForPlant,
} from "@/lib/catalog";
import { currentNursery, CURRENT_NURSERY_ID } from "@/lib/session";
import { PLAN_LABELS } from "@/lib/data/nurseries";
import { photoUrl } from "@/lib/data/media";
import { formatINR, formatINRCompact } from "@/lib/money";
import { relativeDays } from "@/lib/utils";
import { PageHead, StatCard, TableWrap, Th, Td } from "@/components/dash/Shell";
import { Badge } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";

export default function NurseryOverview() {
  const nursery = currentNursery();
  const stats = nurseryStats(CURRENT_NURSERY_ID);
  const enquiries = enquiriesForNursery(CURRENT_NURSERY_ID);
  const listings = offersForNursery(CURRENT_NURSERY_ID);

  const newEnquiries = enquiries.filter((e) => e.status === "new");
  const outOfStock = listings.filter((l) => l.stock === 0);

  /**
   * Competitive position: for each listing, how our price compares with
   * the cheapest other nursery carrying the same plant. This is the
   * single most useful thing the dashboard can tell a partner.
   */
  const pricing = listings
    .filter((l) => l.stock > 0)
    .map((l) => {
      const rivals = offersForPlant(l.plantId)
        .filter((o) => o.nurseryId !== CURRENT_NURSERY_ID && o.stock > 0)
        .map((o) => o.pricePaise);
      if (rivals.length === 0) return null;
      const cheapest = Math.min(...rivals);
      return { listing: l, cheapest, delta: l.pricePaise - cheapest, rivals: rivals.length };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const undercut = pricing.filter((p) => p.delta > 0).sort((a, b) => b.delta - a.delta);
  const winning = pricing.filter((p) => p.delta <= 0).length;

  return (
    <div className="p-5 sm:p-8">
      <PageHead
        title="Overview"
        blurb={`${nursery.area}, ${nursery.city} · on the ${PLAN_LABELS[nursery.plan]} plan`}
        action={
          <ButtonLink href="/dashboard/inventory/add" size="sm">
            <Plus className="size-3.5" strokeWidth={2} />
            Add stock
          </ButtonLink>
        }
      />

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="New enquiries"
          value={String(stats.newEnquiries)}
          sub={`${stats.enquiries} total · ${stats.converted} converted`}
          tone={stats.newEnquiries > 0 ? "warn" : "neutral"}
        />
        <StatCard
          label="Live listings"
          value={String(stats.inStock)}
          sub={`${stats.outOfStock} marked out of stock`}
        />
        <StatCard
          label="Cheapest on"
          value={`${winning}/${pricing.length}`}
          sub="Listings where you beat every rival"
          tone={winning > pricing.length / 2 ? "good" : "neutral"}
        />
        <StatCard
          label="Stock value"
          value={formatINRCompact(stats.inventoryValuePaise)}
          sub="Listed price × quantity on hand"
        />
      </div>

      {/* ------------------------------------------------- action items */}
      {(newEnquiries.length > 0 || outOfStock.length > 0) && (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {newEnquiries.length > 0 && (
            <div className="border border-line bg-surface p-5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-medium">
                  {newEnquiries.length} enquir
                  {newEnquiries.length === 1 ? "y" : "ies"} waiting on you
                </p>
                <Link
                  href="/dashboard/enquiries"
                  className="text-[11px] uppercase tracking-[0.1em] text-ink-muted underline-offset-4 hover:underline"
                >
                  Open inbox
                </Link>
              </div>
              <ul className="mt-4 space-y-3">
                {newEnquiries.slice(0, 3).map((e) => (
                  <li key={e.id} className="flex gap-3 border-t border-line pt-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {e.customerName}
                        <span className="ml-2 text-xs font-normal text-ink-faint">
                          {e.plant.commonName} × {e.quantity}
                        </span>
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-ink-muted">
                        {e.message}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs whitespace-nowrap text-ink-faint">
                      {relativeDays(e.receivedAt)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-ink-muted">
                Partners who reply within four hours convert roughly three times as
                often as those who reply the next day.
              </p>
            </div>
          )}

          {outOfStock.length > 0 && (
            <div className="border border-line bg-surface p-5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="size-4 shrink-0 text-clay" strokeWidth={1.75} aria-hidden />
                  {outOfStock.length} listing{outOfStock.length > 1 ? "s" : ""} out of stock
                </p>
                <Link
                  href="/dashboard/inventory"
                  className="text-[11px] uppercase tracking-[0.1em] text-ink-muted underline-offset-4 hover:underline"
                >
                  Update
                </Link>
              </div>
              <ul className="mt-4 space-y-2.5">
                {outOfStock.slice(0, 4).map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center gap-3 border-t border-line pt-2.5"
                  >
                    <div className="photo-well relative size-8 shrink-0 overflow-hidden">
                      <Image
                        src={photoUrl(l.plant.photo, 80)}
                        alt=""
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    </div>
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {l.plant.commonName}
                    </span>
                    <span className="shrink-0 text-xs text-ink-faint">{l.potSize}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-ink-muted">
                Out-of-stock listings still appear, but sort below every available one.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------ price position */}
      <div className="mt-8">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-lg">Where you are being undercut</h2>
          <p className="text-xs text-ink-muted">
            Compared against in-stock listings from other nurseries
          </p>
        </div>

        {undercut.length === 0 ? (
          <div className="border border-leaf/25 bg-leaf-soft p-6">
            <p className="flex items-center gap-2 font-medium">
              <BadgeCheck className="size-4 shrink-0 text-leaf" strokeWidth={1.75} aria-hidden />
              You are the cheapest on every listing you stock.
            </p>
          </div>
        ) : (
          <>
            <TableWrap>
              <thead>
                <tr>
                  <Th>Plant</Th>
                  <Th>Pot</Th>
                  <Th className="text-right">Your price</Th>
                  <Th className="text-right">Cheapest rival</Th>
                  <Th className="text-right">Difference</Th>
                  <Th className="text-right">Rivals</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {undercut.slice(0, 8).map(({ listing, cheapest, delta, rivals }) => (
                  <tr key={listing.id} className="transition-colors hover:bg-sunken/60">
                    <Td>
                      <Link
                        href={`/plants/${listing.plant.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline"
                      >
                        {listing.plant.commonName}
                        <ArrowUpRight className="size-3 shrink-0" strokeWidth={1.5} />
                      </Link>
                    </Td>
                    <Td className="text-xs text-ink-muted">{listing.potSize}</Td>
                    <Td className="tabular text-right font-medium">
                      {formatINR(listing.pricePaise)}
                    </Td>
                    <Td className="tabular text-right text-ink-muted">
                      {formatINR(cheapest)}
                    </Td>
                    <Td className="tabular text-right font-medium text-clay">
                      +{formatINR(delta)}
                    </Td>
                    <Td className="tabular text-right text-xs text-ink-muted">{rivals}</Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
            <p className="mt-3 text-xs leading-relaxed text-ink-muted">
              Being more expensive is not automatically a problem — a larger, better
              established plant in a ceramic pot is worth more than a cutting in a
              nursery bag. Check the pot size and height on the plant page before
              dropping a price.
            </p>
          </>
        )}
      </div>

      {/* ----------------------------------------------------- top plants */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg">Most enquired</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(
            enquiries.reduce<Record<string, number>>((acc, e) => {
              acc[e.plantId] = (acc[e.plantId] ?? 0) + 1;
              return acc;
            }, {}),
          )
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([plantId, count]) => {
              const plant = enquiries.find((e) => e.plantId === plantId)!.plant;
              return (
                <div key={plantId} className="flex gap-3 border border-line bg-surface p-4">
                  <div className="photo-well relative size-14 shrink-0 overflow-hidden">
                    <Image
                      src={photoUrl(plant.photo, 140)}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{plant.commonName}</p>
                    <p className="tabular mt-1 text-xs text-ink-muted">
                      {count} {count === 1 ? "enquiry" : "enquiries"}
                    </p>
                    <Badge tone="neutral" className="mt-2">
                      {plant.category.split("-")[0]}
                    </Badge>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
