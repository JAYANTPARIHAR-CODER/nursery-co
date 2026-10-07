import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Droplets, Sun, Gauge, PawPrint, Wind, Ruler } from "lucide-react";
import {
  getPlantBySlug,
  offersForPlant,
  priceSummary,
  relatedPlants,
  PUBLISHED_PLANTS,
} from "@/lib/catalog";
import { CATEGORY_LABELS } from "@/lib/data/plants";
import { photoUrl } from "@/lib/data/media";
import { formatINR } from "@/lib/money";
import {
  Container,
  Section,
  SectionHead,
  Breadcrumbs,
  Badge,
} from "@/components/ui/primitives";
import { PlantGrid } from "@/components/plant/PlantCard";
import { OfferList } from "@/components/plant/OfferList";
import {
  CarePanel,
  PetSafetyNote,
  LIGHT_LABELS,
  WATER_LABELS,
  DIFFICULTY_LABELS,
} from "@/components/plant/care";

export function generateStaticParams() {
  return PUBLISHED_PLANTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const plant = getPlantBySlug(slug);
  if (!plant) return { title: "Plant not found" };

  const summary = priceSummary(plant.id);
  return {
    title: plant.commonName,
    description: `${plant.summary} ${
      summary
        ? `Available from ${formatINR(summary.from)} across ${summary.nurseryCount} nurseries.`
        : ""
    }`.trim(),
    openGraph: {
      title: `${plant.commonName} (${plant.botanicalName})`,
      description: plant.summary,
      images: [{ url: photoUrl(plant.photo, 1200) }],
    },
  };
}

export default async function PlantPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ city?: string }>;
}) {
  const [{ slug }, { city }] = await Promise.all([params, searchParams]);

  const plant = getPlantBySlug(slug);
  if (!plant || plant.status !== "published") notFound();

  const offers = offersForPlant(plant.id, { city });
  const summary = priceSummary(plant.id, city);
  const related = relatedPlants(plant, 4);

  return (
    <>
      <Container wide className="pt-7">
        <Breadcrumbs
          trail={[
            { href: "/", label: "Home" },
            { href: "/plants", label: "Plants" },
            {
              href: `/plants?category=${plant.category}`,
              label: CATEGORY_LABELS[plant.category],
            },
            { label: plant.commonName },
          ]}
        />
      </Container>

      {/* ------------------------------------------------------ overview */}
      <Container wide className="py-9">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="lg:sticky lg:top-36 lg:self-start">
            <div className="photo-well relative aspect-[4/5] overflow-hidden">
              <Image
                src={photoUrl(plant.photo, 1000)}
                alt={plant.commonName}
                fill
                priority
                sizes="(min-width:1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {[plant.photo + 7, plant.photo + 11, plant.photo + 15].map((p, i) => (
                <div key={i} className="photo-well relative aspect-square overflow-hidden">
                  <Image
                    src={photoUrl(p, 300)}
                    alt=""
                    fill
                    sizes="140px"
                    className="object-cover opacity-85 transition-opacity hover:opacity-100"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow text-ink-faint">{CATEGORY_LABELS[plant.category]}</p>
            <h1 className="mt-3 text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.05]">
              {plant.commonName}
            </h1>
            <p className="mt-2 text-base italic text-ink-muted">
              {plant.botanicalName}
              <span className="ml-2 text-xs not-italic text-ink-faint">
                {plant.family}
              </span>
            </p>

            <p className="mt-6 text-lg leading-relaxed text-ink-muted">{plant.summary}</p>

            {/* Price headline — the comparison proposition, stated up front. */}
            {summary ? (
              <div className="mt-8 border-y border-line py-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="eyebrow text-ink-faint">Price range</p>
                    <p className="tabular mt-2 font-display text-4xl leading-none">
                      {formatINR(summary.from)}
                      {summary.to !== summary.from && (
                        <span className="text-ink-faint"> – {formatINR(summary.to)}</span>
                      )}
                    </p>
                  </div>
                  <p className="text-sm text-ink-muted">
                    across{" "}
                    <span className="font-medium text-ink">{summary.nurseryCount}</span>{" "}
                    {summary.nurseryCount === 1 ? "nursery" : "nurseries"}
                    {city && ` in ${city}`}
                    <br />
                    <span className="text-xs text-ink-faint">
                      {summary.inStockCount} with stock today
                    </span>
                  </p>
                </div>
                <a
                  href="#nurseries"
                  className="mt-5 inline-flex h-12 w-full items-center justify-center bg-brand text-[11px] font-medium uppercase tracking-[0.16em] text-ink-invert transition-all duration-150 hover:-translate-y-px hover:bg-brand-hover active:scale-[0.99] sm:w-auto sm:px-10"
                >
                  Compare {summary.nurseryCount} nurseries
                </a>
              </div>
            ) : (
              <div className="mt-8 border-y border-line py-6">
                <p className="text-sm text-ink-muted">
                  No partner nursery stocks this{city ? ` in ${city}` : ""} right now.
                </p>
              </div>
            )}

            {/* Care at a glance */}
            <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
              {[
                { Icon: Sun, label: "Light", value: LIGHT_LABELS[plant.care.light] },
                {
                  Icon: Droplets,
                  label: "Water",
                  value: `Every ~${plant.care.waterEveryDays} days`,
                },
                {
                  Icon: Gauge,
                  label: "Care level",
                  value: DIFFICULTY_LABELS[plant.difficulty],
                },
                { Icon: Ruler, label: "Mature size", value: plant.matureSize },
                {
                  Icon: Wind,
                  label: "Air purifying",
                  value: plant.traits.airPurifying ? "Yes" : "Not notably",
                },
                {
                  Icon: PawPrint,
                  label: "Pet safe",
                  value: plant.traits.petSafe ? "Yes" : "No — toxic",
                },
              ].map(({ Icon, label, value }) => (
                <div key={label}>
                  <dt className="eyebrow flex items-center gap-1.5 text-ink-faint">
                    <Icon className="size-3.5" strokeWidth={1.5} aria-hidden />
                    {label}
                  </dt>
                  <dd className="mt-1.5 text-sm">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-7 flex flex-wrap gap-1.5">
              {plant.tags.map((t) => (
                <Link key={t} href={`/plants?q=${encodeURIComponent(t)}`}>
                  <Badge tone="neutral" className="transition-colors hover:border-ink">
                    {t.replace(/-/g, " ")}
                  </Badge>
                </Link>
              ))}
            </div>

            <div className="mt-7">
              <PetSafetyNote plant={plant} />
            </div>
          </div>
        </div>
      </Container>

      {/* ----------------------------------------------------- nurseries */}
      <Section tone="sunken" className="scroll-mt-32" >
        <div id="nurseries" className="scroll-mt-36" />
        <Container wide>
          <SectionHead
            eyebrow="Where to buy"
            title={`Nurseries stocking ${plant.commonName}`}
            blurb="Each nursery sets its own price, pot size and delivery terms. You buy from them directly — we take no commission on the sale."
          />
          <OfferList plant={plant} offers={offers} city={city} />
        </Container>
      </Section>

      {/* --------------------------------------------------------- care */}
      <Section tone="paper">
        <Container wide>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
            <div>
              <p className="eyebrow text-ink-faint">About this plant</p>
              <h2 className="mt-3 text-[clamp(1.6rem,3vw,2.25rem)]">
                Living with {plant.commonName}
              </h2>
              <p className="mt-5 text-[15px] leading-[1.75] text-ink-muted">
                {plant.description}
              </p>

              <div className="mt-8 border-t border-line pt-6">
                <p className="eyebrow mb-3 text-ink-faint">Watering rhythm</p>
                <p className="text-sm leading-relaxed text-ink-muted">
                  {WATER_LABELS[plant.care.water]} — roughly every{" "}
                  <span className="font-medium text-ink">
                    {plant.care.waterEveryDays} days
                  </span>
                  . Treat that as a starting point, not a rule: check the top two
                  centimetres of soil with a finger and water only when it is dry. Pots
                  dry out faster in summer and far slower through the monsoon.
                </p>
              </div>
            </div>

            <div>
              <p className="eyebrow mb-4 text-ink-faint">Full care profile</p>
              <CarePanel plant={plant} />
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------ related */}
      {related.length > 0 && (
        <Section tone="sunken">
          <Container wide>
            <SectionHead
              eyebrow="You might also like"
              title="Similar plants"
              action={{ href: `/plants?category=${plant.category}`, label: "See category" }}
            />
            <PlantGrid plants={related} city={city} />
          </Container>
        </Section>
      )}
    </>
  );
}
