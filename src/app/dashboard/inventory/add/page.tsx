import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import { offersForNursery, offersForPlant, PUBLISHED_PLANTS } from "@/lib/catalog";
import { CURRENT_NURSERY_ID } from "@/lib/session";
import { PageHead } from "@/components/dash/Shell";
import { AddStockPicker, type Candidate } from "@/components/dash/AddStockPicker";

export default function AddStockPage() {
  const alreadyListed = new Set(offersForNursery(CURRENT_NURSERY_ID).map((o) => o.plantId));

  /**
   * Only plants we do not already carry. A nursery cannot create a plant,
   * so this list is the whole universe of things it can add.
   */
  const candidates: Candidate[] = PUBLISHED_PLANTS.filter(
    (p) => !alreadyListed.has(p.id),
  ).map((p) => {
    const rivals = offersForPlant(p.id).filter((o) => o.stock > 0);
    const prices = rivals.map((o) => o.pricePaise);
    return {
      id: p.id,
      slug: p.slug,
      commonName: p.commonName,
      botanicalName: p.botanicalName,
      category: p.category,
      photo: p.photo,
      rivalCount: rivals.length,
      lowestPaise: prices.length ? Math.min(...prices) : null,
      medianPaise: prices.length
        ? [...prices].sort((a, b) => a - b)[Math.floor(prices.length / 2)]
        : null,
    };
  });

  return (
    <div className="p-5 sm:p-8">
      <Link
        href="/dashboard/inventory"
        className="inline-flex items-center gap-2 text-xs text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.5} aria-hidden />
        Back to my stock
      </Link>

      <div className="mt-5">
        <PageHead
          title="Add stock"
          blurb="Pick a plant from the catalogue and set your price, pot size and quantity. We show you what other nurseries are charging so you can price deliberately."
        />
      </div>

      <div className="mt-6 flex gap-3 border border-line bg-sunken p-4">
        <Info className="mt-px size-4 shrink-0 text-ink-faint" strokeWidth={1.5} aria-hidden />
        <p className="text-xs leading-relaxed text-ink-muted">
          Cannot find something you grow?{" "}
          <Link href="/partner#apply" className="underline underline-offset-4">
            Send it to us
          </Link>{" "}
          and we will add it to the catalogue, usually within two working days. Nurseries
          cannot create entries themselves — that is what stops the same plant existing
          fourteen times and breaking the price comparison.
        </p>
      </div>

      <div className="mt-7">
        <AddStockPicker candidates={candidates} />
      </div>
    </div>
  );
}
