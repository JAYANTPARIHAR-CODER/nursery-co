"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Sparkles,
  X,
} from "lucide-react";
import type { Plant } from "@/lib/types";
import type { OfferWithNursery, OfferSort } from "@/lib/catalog";
import { formatINR, discountPct } from "@/lib/money";
import { CONDITION_LABELS } from "@/lib/data/offers";
import { cn, formatDistance, relativeDays } from "@/lib/utils";
import { Badge, Rating, Field, Input, Textarea, Select } from "@/components/ui/primitives";
import { Button, ButtonLink, IconButton } from "@/components/ui/Button";

/**
 * The comparison table. This is the page — everything above it exists to
 * get the visitor here, and the enquiry is the conversion event the
 * nursery is paying for.
 */

const SORTS: { value: OfferSort; label: string; needsCity?: boolean }[] = [
  { value: "price-asc", label: "Lowest price" },
  { value: "distance", label: "Nearest first", needsCity: true },
  { value: "rating", label: "Highest rated" },
  { value: "price-desc", label: "Highest price" },
];

export function OfferList({
  plant,
  offers,
  city,
}: {
  plant: Plant;
  offers: OfferWithNursery[];
  city?: string;
}) {
  const [sort, setSort] = useState<OfferSort>("price-asc");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [enquiry, setEnquiry] = useState<OfferWithNursery | null>(null);

  const rows = useMemo(() => {
    const comparators: Record<OfferSort, (a: OfferWithNursery, b: OfferWithNursery) => number> = {
      "price-asc": (a, b) => a.pricePaise - b.pricePaise,
      "price-desc": (a, b) => b.pricePaise - a.pricePaise,
      distance: (a, b) => a.nursery.distanceKm - b.nursery.distanceKm,
      rating: (a, b) => b.nursery.rating - a.nursery.rating,
    };
    const base = inStockOnly ? offers.filter((o) => o.stock > 0) : offers;
    return [...base].sort((a, b) => {
      const stocked = Number(b.stock > 0) - Number(a.stock > 0);
      return stocked !== 0 ? stocked : comparators[sort](a, b);
    });
  }, [offers, sort, inStockOnly]);

  // Superlatives are computed over in-stock listings only — flagging the
  // cheapest option as "best price" when nobody can sell it is a lie.
  const available = offers.filter((o) => o.stock > 0);
  const bestPriceId = available.length
    ? available.reduce((lo, o) => (o.pricePaise < lo.pricePaise ? o : lo)).id
    : null;

  /**
   * Distance is measured from each nursery's own city centre, so it only
   * means anything once a city is chosen. Across a mixed list, "3.6 km"
   * in Mumbai and "11.2 km" in Pune are not comparable — so no "nearest"
   * badge, no distance sort, and each row names its city instead.
   */
  const nearestId =
    city && available.length
      ? available.reduce((n, o) => (o.nursery.distanceKm < n.nursery.distanceKm ? o : n)).id
      : null;

  if (offers.length === 0) {
    return (
      <div className="border border-dashed border-line-strong bg-surface p-10 text-center">
        <p className="font-display text-lg">Not stocked{city ? ` in ${city}` : ""} right now</p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
          No partner nursery {city ? `in ${city} ` : ""}currently lists {plant.commonName}.
          Try switching city in the header, or browse what is available nearby.
        </p>
        <ButtonLink href="/plants" variant="outline" size="sm" className="mt-5">
          Browse the catalogue
        </ButtonLink>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-ink-muted">
            <span className="font-medium text-ink">{offers.length}</span>{" "}
            {offers.length === 1 ? "nursery stocks" : "nurseries stock"} this
            {city ? ` in ${city}` : ""}
            <span className="text-ink-faint"> · {available.length} in stock today</span>
          </p>
          {!city && (
            <p className="mt-1 text-xs text-ink-faint">
              Showing every city. Pick yours in the header to sort by distance.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setInStockOnly((v) => !v)}
            aria-pressed={inStockOnly}
            className={cn(
              "h-9 rounded-[var(--radius-card)] border px-3 text-[11px] uppercase tracking-[0.1em] transition-all duration-150",
              inStockOnly
                ? "border-brand bg-brand text-ink-invert"
                : "border-line text-ink-muted hover:border-ink hover:text-ink",
            )}
          >
            In stock only
          </button>
          <Select
            aria-label="Sort offers"
            value={sort}
            onChange={(e) => setSort(e.target.value as OfferSort)}
            className="h-9 w-auto text-xs"
          >
            {SORTS.filter((s) => !s.needsCity || city).map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <ul className="divide-y divide-line border-y border-line">
        {rows.map((offer) => (
          <OfferRow
            key={offer.id}
            offer={offer}
            plant={plant}
            isBestPrice={offer.id === bestPriceId}
            isNearest={offer.id === nearestId && offer.id !== bestPriceId}
            showCity={!city}
            onEnquire={() => setEnquiry(offer)}
          />
        ))}
      </ul>

      {rows.length === 0 && (
        <p className="py-10 text-center text-sm text-ink-muted">
          Every listing is out of stock right now.{" "}
          <button
            type="button"
            className="underline underline-offset-4"
            onClick={() => setInStockOnly(false)}
          >
            Show all {offers.length} nurseries
          </button>
        </p>
      )}

      <EnquiryModal plant={plant} offer={enquiry} onClose={() => setEnquiry(null)} />
    </div>
  );
}

/* ------------------------------------------------------------------ row */

function OfferRow({
  offer,
  plant,
  isBestPrice,
  isNearest,
  showCity,
  onEnquire,
}: {
  offer: OfferWithNursery;
  plant: Plant;
  isBestPrice: boolean;
  isNearest: boolean;
  /** True when the list spans cities, so each row must name its own. */
  showCity: boolean;
  onEnquire: () => void;
}) {
  const { nursery } = offer;
  const off = discountPct(offer.pricePaise, offer.mrpPaise);
  const soldOut = offer.stock === 0;
  const lowStock = offer.stock > 0 && offer.stock <= 3;

  const waMessage = encodeURIComponent(
    `Hi ${nursery.name}, I found your listing for ${plant.commonName} (${offer.potSize} pot) at ${formatINR(offer.pricePaise)}. Is it available?`,
  );

  return (
    <li
      className={cn(
        "group grid gap-4 py-5 transition-colors duration-150 sm:grid-cols-[1fr_auto] sm:items-center",
        soldOut ? "opacity-55" : "hover:bg-sunken/55",
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <Link
            href={`/nurseries/${nursery.slug}`}
            className="font-medium transition-opacity hover:opacity-65"
          >
            {nursery.name}
          </Link>
          {nursery.verified && (
            <BadgeCheck
              className="size-4 shrink-0 text-brand"
              strokeWidth={1.75}
              aria-label="Verified partner"
            />
          )}
          {isBestPrice && (
            <Badge tone="leaf">
              <Sparkles className="size-2.5" strokeWidth={2} aria-hidden /> Best price
            </Badge>
          )}
          {isNearest && <Badge tone="gold">Nearest</Badge>}
          {nursery.plan === "canopy" && <Badge tone="neutral">Featured</Badge>}
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
          <Rating value={nursery.rating} count={nursery.reviewCount} />
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3 shrink-0" strokeWidth={1.5} aria-hidden />
            {showCity ? (
              <>
                {nursery.area}, <span className="font-medium text-ink">{nursery.city}</span>
              </>
            ) : (
              <>
                {nursery.area} · {formatDistance(nursery.distanceKm)}
              </>
            )}
          </span>
          {offer.deliversToCity && (
            <span className="text-leaf">Delivers up to {nursery.deliveryRadiusKm} km</span>
          )}
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <Package className="size-3.5 shrink-0 text-ink-faint" strokeWidth={1.5} aria-hidden />
            {offer.potSize} {offer.potMaterial.toLowerCase()} · {offer.heightCm} cm tall
          </span>
          <span className="text-ink-faint">{CONDITION_LABELS[offer.condition]}</span>
          {soldOut ? (
            <span className="font-medium text-clay">Out of stock</span>
          ) : lowStock ? (
            <span className="font-medium text-clay">Only {offer.stock} left</span>
          ) : (
            <span className="text-leaf">{offer.stock} in stock</span>
          )}
          <span className="text-ink-faint">
            Updated {relativeDays(offer.updatedAt)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-5 sm:justify-end">
        <div className="text-left sm:text-right">
          <p className="tabular font-display text-2xl leading-none">
            {formatINR(offer.pricePaise)}
          </p>
          {off !== null && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs sm:justify-end">
              <span className="tabular text-ink-faint line-through">
                {formatINR(offer.mrpPaise!)}
              </span>
              <span className="font-medium text-clay">{off}% off</span>
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          <a
            href={`https://wa.me/${nursery.whatsapp}?text=${waMessage}`}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`Message ${nursery.name} on WhatsApp`}
            className={cn(
              "inline-flex size-11 items-center justify-center rounded-[var(--radius-card)] border border-line",
              "text-ink-muted transition-all duration-150",
              "hover:-translate-y-px hover:border-leaf hover:text-leaf active:scale-[0.97]",
            )}
          >
            <MessageCircle className="size-4" strokeWidth={1.5} />
          </a>
          <Button
            size="md"
            variant={soldOut ? "outline" : "primary"}
            onClick={onEnquire}
            disabled={soldOut}
          >
            {soldOut ? "Notify me" : "Enquire"}
          </Button>
        </div>
      </div>
    </li>
  );
}

/* ---------------------------------------------------------------- modal */

function EnquiryModal({
  plant,
  offer,
  onClose,
}: {
  plant: Plant;
  offer: OfferWithNursery | null;
  onClose: () => void;
}) {
  const [sent, setSent] = useState(false);
  const open = offer !== null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Frontend only — a real build posts to /api/enquiries here.
    setSent(true);
  };

  const close = () => {
    onClose();
    // Reset after the exit transition so the form does not flash back.
    setTimeout(() => setSent(false), 250);
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[80] bg-ink/40 backdrop-blur-[2px] transition-opacity duration-250",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={close}
        aria-hidden
      />
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-[81] mx-auto w-full max-w-lg bg-surface shadow-[var(--shadow-pop)]",
          "transition-all duration-300 ease-[var(--ease-out-soft)]",
          "sm:inset-y-0 sm:right-0 sm:left-auto sm:mx-0 sm:h-full sm:max-w-md",
          open
            ? "translate-y-0 opacity-100 sm:translate-x-0"
            : "pointer-events-none translate-y-6 opacity-0 sm:translate-x-full sm:translate-y-0 sm:opacity-100",
        )}
        role="dialog"
        aria-modal="true"
        aria-label={`Enquire about ${plant.commonName}`}
        aria-hidden={!open}
      >
        {offer && (
          <div className="flex h-full max-h-[88vh] flex-col sm:max-h-none">
            <div className="flex items-start justify-between gap-4 border-b border-line p-5">
              <div className="min-w-0">
                <p className="eyebrow text-ink-faint">Enquiry</p>
                <p className="mt-1.5 font-display text-lg leading-tight">
                  {plant.commonName}
                </p>
                <p className="mt-0.5 truncate text-xs text-ink-muted">
                  {offer.nursery.name} · {offer.potSize} ·{" "}
                  <span className="tabular font-medium text-ink">
                    {formatINR(offer.pricePaise)}
                  </span>
                </p>
              </div>
              <IconButton label="Close enquiry" onClick={close}>
                <X className="size-[18px]" strokeWidth={1.5} />
              </IconButton>
            </div>

            {sent ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-leaf-soft">
                  <BadgeCheck className="size-7 text-leaf" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl">Enquiry sent</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-muted">
                  {offer.nursery.name} usually replies within a few hours during
                  opening hours ({offer.nursery.hours}).
                </p>
                <div className="mt-7 flex w-full max-w-xs flex-col gap-2">
                  <a
                    href={`tel:${offer.nursery.phone.replace(/\s/g, "")}`}
                    className="inline-flex h-11 items-center justify-center gap-2 border border-line-strong text-[11px] uppercase tracking-[0.14em] transition-colors hover:border-ink"
                  >
                    <Phone className="size-3.5" strokeWidth={1.5} /> Call instead
                  </a>
                  <Button variant="ghost" size="md" onClick={close}>
                    Keep browsing
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-1 flex-col overflow-y-auto">
                <div className="flex-1 space-y-4 p-5">
                  <Field label="Your name" htmlFor="eq-name">
                    <Input id="eq-name" name="name" required placeholder="Full name" />
                  </Field>
                  <Field label="Phone" htmlFor="eq-phone" hint="The nursery will call or WhatsApp you back.">
                    <Input
                      id="eq-phone"
                      name="phone"
                      type="tel"
                      required
                      inputMode="tel"
                      placeholder="+91"
                    />
                  </Field>
                  <Field label="Quantity" htmlFor="eq-qty">
                    <Input
                      id="eq-qty"
                      name="quantity"
                      type="number"
                      min={1}
                      max={offer.stock || 1}
                      defaultValue={1}
                      className="tabular"
                    />
                  </Field>
                  <Field label="Message" htmlFor="eq-msg">
                    <Textarea
                      id="eq-msg"
                      name="message"
                      rows={4}
                      defaultValue={`Is this ${plant.commonName} available in a ${offer.potSize} pot?`}
                    />
                  </Field>
                  <p className="text-xs leading-relaxed text-ink-faint">
                    Your details go to {offer.nursery.name} only. {" "}
                    {offer.nursery.name} sets its own price and handles delivery
                    directly &mdash; we do not take a cut of the sale.
                  </p>
                </div>
                <div className="border-t border-line p-5">
                  <Button type="submit" size="lg" className="w-full">
                    Send enquiry
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </>
  );
}
