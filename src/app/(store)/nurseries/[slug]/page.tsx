import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Truck,
  CalendarDays,
} from "lucide-react";
import { getNurseryBySlug, offersForNursery, NURSERIES } from "@/lib/catalog";
import { CATEGORY_LABELS } from "@/lib/data/plants";
import { CONDITION_LABELS } from "@/lib/data/offers";
import { photoUrl } from "@/lib/data/media";
import { formatINR, discountPct } from "@/lib/money";
import { formatDistance, relativeDays } from "@/lib/utils";
import {
  Container,
  Section,
  SectionHead,
  Breadcrumbs,
  Badge,
  Rating,
} from "@/components/ui/primitives";

export function generateStaticParams() {
  return NURSERIES.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const nursery = getNurseryBySlug(slug);
  if (!nursery) return { title: "Nursery not found" };
  return {
    title: `${nursery.name}, ${nursery.city}`,
    description: nursery.bio,
    openGraph: { images: [{ url: photoUrl(nursery.photo, 1200) }] },
  };
}

export default async function NurseryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const nursery = getNurseryBySlug(slug);
  if (!nursery) notFound();

  const listings = offersForNursery(nursery.id)
    .filter((l) => l.plant.status === "published")
    .sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0) || a.pricePaise - b.pricePaise);

  const inStock = listings.filter((l) => l.stock > 0);
  const cheapest = inStock.length ? Math.min(...inStock.map((l) => l.pricePaise)) : null;

  const waLink = `https://wa.me/${nursery.whatsapp}?text=${encodeURIComponent(
    `Hi ${nursery.name}, I found you on Nursery Co. and wanted to ask about your stock.`,
  )}`;

  return (
    <>
      {/* ---------------------------------------------------------- hero */}
      <div className="photo-well relative h-56 overflow-hidden sm:h-72">
        <Image
          src={photoUrl(nursery.photo, 1600, 70)}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-ink/15" aria-hidden />
      </div>

      <Container wide>
        <div className="-mt-14 relative border border-line bg-surface p-6 sm:p-8">
          <Breadcrumbs
            trail={[
              { href: "/", label: "Home" },
              { href: "/nurseries", label: "Nurseries" },
              { label: nursery.name },
            ]}
          />

          <div className="mt-5 flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0">
              <h1 className="flex flex-wrap items-center gap-2.5 text-[clamp(1.75rem,4vw,2.75rem)] leading-tight">
                {nursery.name}
                {nursery.verified && (
                  <BadgeCheck
                    className="size-6 shrink-0 text-brand"
                    strokeWidth={1.5}
                    aria-label="Verified partner"
                  />
                )}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-muted">
                <Rating value={nursery.rating} count={nursery.reviewCount} />
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
                  {nursery.area}, {nursery.city} · {formatDistance(nursery.distanceKm)} from
                  centre
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
                  Growing since {nursery.since}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {nursery.verified && <Badge tone="leaf">Verified partner</Badge>}
                {nursery.plan === "canopy" && <Badge tone="ink">Featured</Badge>}
                {nursery.specialities.map((s) => (
                  <Badge key={s} tone="neutral">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <a
                href={`tel:${nursery.phone.replace(/\s/g, "")}`}
                className="inline-flex h-11 items-center gap-2 border border-line-strong px-5 text-[11px] font-medium uppercase tracking-[0.14em] transition-all duration-150 hover:-translate-y-px hover:border-ink active:scale-[0.98]"
              >
                <Phone className="size-3.5" strokeWidth={1.5} />
                Call
              </a>
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-11 items-center gap-2 bg-brand px-5 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-invert transition-all duration-150 hover:-translate-y-px hover:bg-brand-hover active:scale-[0.98]"
              >
                <MessageCircle className="size-3.5" strokeWidth={1.5} />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </Container>

      {/* ------------------------------------------------------- content */}
      <Container wide className="py-12">
        <div className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
          <div className="min-w-0">
            <h2 className="text-xl">About</h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-[1.75] text-ink-muted">
              {nursery.bio}
            </p>

            <div className="mt-10">
              <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-4">
                <h2 className="text-xl">Stock listed here</h2>
                <p className="tabular text-sm text-ink-muted">
                  <span className="font-medium text-ink">{inStock.length}</span> available
                  <span className="text-ink-faint"> of {listings.length} listed</span>
                </p>
              </div>

              {listings.length === 0 ? (
                <p className="py-10 text-center text-sm text-ink-muted">
                  This nursery has not listed any stock yet.
                </p>
              ) : (
                <ul className="divide-y divide-line border-b border-line">
                  {listings.map((l) => {
                    const off = discountPct(l.pricePaise, l.mrpPaise);
                    const soldOut = l.stock === 0;
                    return (
                      <li
                        key={l.id}
                        className={`group flex items-center gap-4 py-4 transition-colors ${soldOut ? "opacity-55" : "hover:bg-sunken/55"}`}
                      >
                        <Link
                          href={`/plants/${l.plant.slug}`}
                          className="photo-well relative size-16 shrink-0 overflow-hidden"
                        >
                          <Image
                            src={photoUrl(l.plant.photo, 160)}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </Link>

                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/plants/${l.plant.slug}`}
                            className="font-medium transition-opacity hover:opacity-65"
                          >
                            {l.plant.commonName}
                          </Link>
                          <p className="truncate text-xs italic text-ink-faint">
                            {l.plant.botanicalName}
                          </p>
                          <p className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-ink-muted">
                            <span>
                              {l.potSize} {l.potMaterial.toLowerCase()} · {l.heightCm} cm
                            </span>
                            <span className="text-ink-faint">
                              {CONDITION_LABELS[l.condition]}
                            </span>
                            {soldOut ? (
                              <span className="font-medium text-clay">Out of stock</span>
                            ) : (
                              <span className="text-leaf">{l.stock} in stock</span>
                            )}
                            <span className="text-ink-faint">
                              Updated {relativeDays(l.updatedAt)}
                            </span>
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="tabular font-display text-xl leading-none">
                            {formatINR(l.pricePaise)}
                          </p>
                          {off !== null && (
                            <p className="mt-1 text-[11px] font-medium text-clay">
                              {off}% off
                            </p>
                          )}
                          <p className="eyebrow mt-1.5 text-ink-faint">
                            {CATEGORY_LABELS[l.plant.category].split(" ")[0]}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* --------------------------------------------------- sidebar */}
          <aside className="lg:sticky lg:top-36 lg:self-start">
            <div className="border border-line bg-surface p-6">
              <p className="eyebrow mb-4 text-ink-faint">Visit or contact</p>

              <dl className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-ink-faint" strokeWidth={1.5} aria-hidden />
                  <div>
                    <dt className="sr-only">Address</dt>
                    <dd className="leading-relaxed text-ink-muted">{nursery.address}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Clock className="mt-0.5 size-4 shrink-0 text-ink-faint" strokeWidth={1.5} aria-hidden />
                  <div>
                    <dt className="sr-only">Opening hours</dt>
                    <dd className="text-ink-muted">{nursery.hours}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Truck className="mt-0.5 size-4 shrink-0 text-ink-faint" strokeWidth={1.5} aria-hidden />
                  <div>
                    <dt className="sr-only">Delivery</dt>
                    <dd className="text-ink-muted">
                      Delivers within {nursery.deliveryRadiusKm} km of {nursery.area}
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-ink-faint" strokeWidth={1.5} aria-hidden />
                  <div>
                    <dt className="sr-only">Phone</dt>
                    <dd>
                      <a
                        href={`tel:${nursery.phone.replace(/\s/g, "")}`}
                        className="text-ink-muted underline-offset-4 hover:underline"
                      >
                        {nursery.phone}
                      </a>
                    </dd>
                  </div>
                </div>
              </dl>

              {cheapest !== null && (
                <div className="mt-6 border-t border-line pt-5">
                  <p className="eyebrow text-ink-faint">Stock starts at</p>
                  <p className="tabular mt-1.5 font-display text-3xl">
                    {formatINR(cheapest)}
                  </p>
                </div>
              )}

              <a
                href={waLink}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 bg-brand text-[11px] font-medium uppercase tracking-[0.14em] text-ink-invert transition-all duration-150 hover:-translate-y-px hover:bg-brand-hover active:scale-[0.99]"
              >
                <MessageCircle className="size-3.5" strokeWidth={1.5} />
                Message on WhatsApp
              </a>

              <p className="mt-4 text-xs leading-relaxed text-ink-faint">
                {nursery.name} sets its own prices and handles delivery. Nursery Co. does
                not take a commission on any sale.
              </p>
            </div>
          </aside>
        </div>
      </Container>

      <Section tone="sunken" className="py-14">
        <Container wide>
          <SectionHead
            className="mb-0"
            eyebrow="More options"
            title={`Other nurseries in ${nursery.city}`}
            action={{
              href: `/nurseries?city=${encodeURIComponent(nursery.city)}`,
              label: "See all",
            }}
          />
        </Container>
      </Section>
    </>
  );
}
