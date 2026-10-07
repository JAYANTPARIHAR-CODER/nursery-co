import { Plus } from "lucide-react";
import { offersForNursery, offersForPlant, nurseryStats } from "@/lib/catalog";
import { currentNursery, CURRENT_NURSERY_ID } from "@/lib/session";
import { planByTier } from "@/lib/data/collections";
import { PageHead, StatCard } from "@/components/dash/Shell";
import { ButtonLink } from "@/components/ui/Button";
import { InventoryTable, type InventoryRow } from "@/components/dash/InventoryTable";

export default function InventoryPage() {
  const nursery = currentNursery();
  const stats = nurseryStats(CURRENT_NURSERY_ID);
  const plan = planByTier(nursery.plan);

  const rows: InventoryRow[] = offersForNursery(CURRENT_NURSERY_ID)
    .filter((l) => l.plant.status === "published")
    .map((l) => {
      const rivals = offersForPlant(l.plantId)
        .filter((o) => o.nurseryId !== CURRENT_NURSERY_ID && o.stock > 0)
        .map((o) => o.pricePaise);
      return { ...l, cheapestRival: rivals.length ? Math.min(...rivals) : null };
    });

  const limit = plan.listingLimit;
  const used = rows.length;
  const pctUsed = limit === "unlimited" ? 0 : Math.round((used / limit) * 100);

  return (
    <div className="p-5 sm:p-8">
      <PageHead
        title="My stock"
        blurb="Your price, pot size and quantity for each catalogue plant you carry. Changes go live on the storefront immediately."
        action={
          <ButtonLink href="/dashboard/inventory/add" size="sm">
            <Plus className="size-3.5" strokeWidth={2} />
            Add stock
          </ButtonLink>
        }
      />

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total listings" value={String(used)} />
        <StatCard label="In stock" value={String(stats.inStock)} tone="good" />
        <StatCard
          label="Out of stock"
          value={String(stats.outOfStock)}
          sub="Still listed, but sorted last"
          tone={stats.outOfStock > 0 ? "warn" : "neutral"}
        />
        <StatCard
          label="Plan allowance"
          value={limit === "unlimited" ? "Unlimited" : `${used}/${limit}`}
          sub={
            limit === "unlimited"
              ? `${plan.name} plan`
              : `${pctUsed}% of your ${plan.name} allowance`
          }
        />
      </div>

      <div className="mt-8">
        <InventoryTable rows={rows} />
      </div>
    </div>
  );
}
