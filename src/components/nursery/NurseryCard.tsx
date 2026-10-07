import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, MapPin, Truck } from "lucide-react";
import type { Nursery } from "@/lib/types";
import { offersForNursery } from "@/lib/catalog";
import { photoUrl } from "@/lib/data/media";
import { cn, formatDistance } from "@/lib/utils";
import { Badge, Rating } from "@/components/ui/primitives";

export function NurseryCard({
  nursery,
  className,
}: {
  nursery: Nursery;
  className?: string;
}) {
  const listings = offersForNursery(nursery.id);
  const inStock = listings.filter((l) => l.stock > 0).length;

  return (
    <article
      className={cn(
        // min-w-0: grid items default to `min-width: auto`, so a card whose
        // min-content is wider than its track silently widens the whole page.
        "group min-w-0 border border-line bg-surface",
        "transition-all duration-200 ease-[var(--ease-out-soft)]",
        "hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[var(--shadow-raise)]",
        className,
      )}
    >
      <Link href={`/nurseries/${nursery.slug}`} className="block">
        <div className="photo-well relative aspect-[16/9] overflow-hidden">
          <Image
            src={photoUrl(nursery.photo, 700)}
            alt={nursery.name}
            fill
            sizes="(min-width:1024px) 33vw, 100vw"
            className="object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-105"
          />
          {nursery.plan === "canopy" && (
            <div className="absolute top-3 left-3">
              <Badge tone="ink">Featured partner</Badge>
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="flex items-center gap-1.5 font-display text-lg leading-tight">
                <span className="truncate transition-opacity group-hover:opacity-65">
                  {nursery.name}
                </span>
                {nursery.verified && (
                  <BadgeCheck
                    className="size-4 shrink-0 text-brand"
                    strokeWidth={1.75}
                    aria-label="Verified partner"
                  />
                )}
              </h3>
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-ink-muted">
                <MapPin className="size-3 shrink-0" strokeWidth={1.5} aria-hidden />
                {nursery.area}, {nursery.city} · {formatDistance(nursery.distanceKm)}
              </p>
            </div>
            <Rating value={nursery.rating} count={nursery.reviewCount} className="shrink-0" />
          </div>

          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-muted">
            {nursery.bio}
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {nursery.specialities.slice(0, 3).map((s) => (
              <Badge key={s} tone="neutral">
                {s}
              </Badge>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3.5 text-xs text-ink-muted">
            <span className="tabular">
              <span className="font-medium text-ink">{inStock}</span> plants in stock
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Truck className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
              {nursery.deliveryRadiusKm} km radius
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
