import Link from "next/link";
import Image from "next/image";
import { Droplets, Sun, PawPrint, Wind } from "lucide-react";
import type { Plant } from "@/lib/types";
import { priceSummary } from "@/lib/catalog";
import { formatINR } from "@/lib/money";
import { photoUrl } from "@/lib/data/media";
import { CATEGORY_LABELS } from "@/lib/data/plants";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/primitives";
import { LIGHT_LABELS, WATER_LABELS } from "./care";

/**
 * The catalogue's atomic unit.
 *
 * Deliberately leads with "from ₹X across N nurseries" rather than a
 * single price — the whole proposition is that the same plant costs
 * different amounts depending on who you walk to.
 */
export function PlantCard({
  plant,
  city,
  priority = false,
  className,
}: {
  plant: Plant;
  city?: string;
  priority?: boolean;
  className?: string;
}) {
  const summary = priceSummary(plant.id, city);

  return (
    <article className={cn("group relative flex min-w-0 flex-col", className)}>
      <Link href={`/plants/${plant.slug}`} className="flex flex-1 flex-col">
        <div className="photo-well relative aspect-[4/5] overflow-hidden">
          <Image
            src={photoUrl(plant.photo, 600)}
            alt={plant.commonName}
            fill
            priority={priority}
            sizes="(min-width:1280px) 25vw, (min-width:768px) 33vw, 50vw"
            className="object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.06]"
          />

          <div className="pointer-events-none absolute inset-x-2 top-2 flex flex-wrap gap-1">
            {plant.traits.petSafe && (
              <Badge tone="leaf" className="bg-surface/92 backdrop-blur-[2px]">
                <PawPrint className="size-2.5" strokeWidth={2} aria-hidden /> Pet safe
              </Badge>
            )}
            {plant.care.light === "low" && (
              <Badge tone="neutral" className="bg-surface/92 backdrop-blur-[2px]">
                Low light
              </Badge>
            )}
          </div>

          {summary && summary.inStockCount === 0 && (
            <div className="absolute inset-x-0 bottom-0 bg-ink/80 py-1.5 text-center text-[10px] uppercase tracking-[0.14em] text-ink-invert backdrop-blur-[2px]">
              Currently out of stock
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col pt-3.5">
          <p className="eyebrow text-ink-faint">{CATEGORY_LABELS[plant.category]}</p>

          <h3 className="mt-1.5 font-display text-[17px] leading-snug transition-opacity duration-200 group-hover:opacity-65">
            {plant.commonName}
          </h3>
          <p className="mt-0.5 text-xs italic text-ink-faint">{plant.botanicalName}</p>

          {/* Care at a glance — the two numbers that decide whether it survives.
              Must wrap: three items sit wider than a card in a 2-up mobile grid,
              and an unwrappable row widens the whole grid track. */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[11px] text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <Sun className="size-3.5 shrink-0 text-ink-faint" strokeWidth={1.5} aria-hidden />
              {LIGHT_LABELS[plant.care.light]}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Droplets className="size-3.5 shrink-0 text-ink-faint" strokeWidth={1.5} aria-hidden />
              {plant.care.waterEveryDays}d
            </span>
            {plant.traits.airPurifying && (
              <span className="inline-flex items-center gap-1.5">
                <Wind className="size-3.5 shrink-0 text-ink-faint" strokeWidth={1.5} aria-hidden />
                Purifying
              </span>
            )}
          </div>

          <div className="mt-auto pt-3.5">
            {summary ? (
              // Wraps: at 320px a 2-up card is ~130px, too narrow to hold the
              // price and the nursery count on one line.
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 border-t border-line pt-3">
                <p className="tabular font-display text-lg">
                  <span className="mr-1 text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                    from
                  </span>
                  {formatINR(summary.from)}
                </p>
                <p className="text-[11px] whitespace-nowrap text-ink-muted">
                  {summary.nurseryCount}{" "}
                  {summary.nurseryCount === 1 ? "nursery" : "nurseries"}
                </p>
              </div>
            ) : (
              <p className="border-t border-line pt-3 text-[11px] text-ink-faint">
                No nursery stocks this {city ? `in ${city}` : "yet"}
              </p>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

export function PlantGrid({
  plants,
  city,
  className,
}: {
  plants: Plant[];
  city?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {plants.map((p, i) => (
        <PlantCard key={p.id} plant={p} city={city} priority={i < 4} />
      ))}
    </div>
  );
}

/** Horizontal scroller used on the homepage rails. */
export function PlantRail({ plants, city }: { plants: Plant[]; city?: string }) {
  return (
    <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8">
      {plants.map((p) => (
        <PlantCard
          key={p.id}
          plant={p}
          city={city}
          className="w-[62vw] shrink-0 snap-start sm:w-[38vw] lg:w-[23vw] xl:w-[19rem]"
        />
      ))}
    </div>
  );
}

export { WATER_LABELS };
