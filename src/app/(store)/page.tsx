import Link from "next/link";
import Image from "next/image";
import { Search, Store, Leaf, HandCoins, MapPinned } from "lucide-react";
import { BRAND } from "@/lib/brand";
import {
  searchPlants,
  listNurseries,
  platformStats,
  collectionCount,
  COLLECTIONS,
} from "@/lib/catalog";
import { CATEGORY_LABELS } from "@/lib/data/plants";
import { photoUrl } from "@/lib/data/media";
import { Container, Section, SectionHead, Rule } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { PlantRail } from "@/components/plant/PlantCard";
import { NurseryCard } from "@/components/nursery/NurseryCard";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { city } = await searchParams;

  const mostStocked = searchPlants({ city, sort: "popular" }).slice(0, 8);
  const newest = searchPlants({ city, sort: "newest" }).slice(0, 8);
  const nurseries = listNurseries({ city }).slice(0, 3);
  const stats = platformStats();

  return (
    <>
      <Hero city={city} stats={stats} />
      <HowItWorks />

      <Section tone="paper">
        <Container wide>
          <SectionHead
            eyebrow="Browse"
            title="Shop by category"
            action={{ href: "/plants", label: "All plants" }}
          />
          <CategoryTiles />
        </Container>
      </Section>

      <Section tone="sunken">
        <Container wide>
          <SectionHead
            eyebrow="Widely available"
            title="Stocked by the most nurseries"
            blurb="The plants our partners carry most often — easiest to find close to home, and the most competitive on price."
            action={{ href: "/plants?sort=popular", label: "See all" }}
          />
          <PlantRail plants={mostStocked} city={city} />
        </Container>
      </Section>

      <Section tone="paper">
        <Container wide>
          <SectionHead
            eyebrow="Curated"
            title="Find plants by what you need"
            blurb="Pick the constraint that actually matters in your home — a cat, a north-facing window, a desk with no sunlight — and we will narrow the catalogue to what genuinely works."
          />
          <CollectionGrid />
        </Container>
      </Section>

      <Section tone="sunken">
        <Container wide>
          <SectionHead
            eyebrow="Recently added"
            title="New in the catalogue"
            action={{ href: "/plants?sort=newest", label: "See all" }}
          />
          <PlantRail plants={newest} city={city} />
        </Container>
      </Section>

      <Section tone="paper">
        <Container wide>
          <SectionHead
            eyebrow="Our partners"
            title={city ? `Nurseries in ${city}` : "Nurseries on the platform"}
            blurb="Independent growers and garden centres, each verified in person before they go live."
            action={{ href: "/nurseries", label: "All nurseries" }}
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {nurseries.map((n) => (
              <NurseryCard key={n.id} nursery={n} />
            ))}
          </div>
        </Container>
      </Section>

      <PartnerBand />
    </>
  );
}

/* ----------------------------------------------------------------- hero */

function Hero({
  city,
  stats,
}: {
  city?: string;
  stats: ReturnType<typeof platformStats>;
}) {
  return (
    <section className="relative">
      <div className="photo-well relative min-h-[76vh] overflow-hidden">
        <Image
          src={photoUrl(10, 1800, 78)}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Readability scrim — a photo alone never carries body text reliably. */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/45 to-ink/25"
          aria-hidden
        />

        <Container wide className="relative flex min-h-[76vh] items-end pb-14 sm:pb-20">
          <div className="max-w-2xl text-ink-invert">
            <p className="eyebrow text-ink-invert/70">
              {city ? `Now serving ${city}` : "Across 6 Indian cities"}
            </p>
            <h1 className="mt-5 text-[clamp(2.4rem,6vw,4.25rem)] leading-[1.04]">
              The plant you want, from the nursery nearest you.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-invert/75">
              {BRAND.description}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                href="/plants"
                size="lg"
                className="border-ink-invert bg-ink-invert text-ink hover:bg-white hover:text-ink"
              >
                <Search className="size-4" strokeWidth={1.5} />
                Browse the catalogue
              </ButtonLink>
              <ButtonLink
                href="/partner"
                size="lg"
                variant="outline"
                className="border-ink-invert/45 text-ink-invert hover:border-ink-invert hover:bg-ink-invert/10"
              >
                <Store className="size-4" strokeWidth={1.5} />
                List your nursery
              </ButtonLink>
            </div>
          </div>
        </Container>
      </div>

      {/* Proof strip */}
      <div className="border-b border-line bg-surface">
        <Container wide>
          <dl className="grid grid-cols-2 divide-line sm:grid-cols-4 sm:divide-x">
            {[
              { k: `${stats.publishedPlants}`, v: "Plants catalogued" },
              { k: `${stats.liveNurseries}`, v: "Verified nurseries" },
              { k: `${stats.listings}`, v: "Live stock listings" },
              { k: "0%", v: "Commission on sales" },
            ].map((s, i) => (
              <div
                key={s.v}
                className={`px-2 py-7 text-center ${i < 2 ? "border-b border-line sm:border-b-0" : ""}`}
              >
                <dt className="tabular font-display text-3xl">{s.k}</dt>
                <dd className="eyebrow mt-2 text-ink-faint">{s.v}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- how it works */

function HowItWorks() {
  const steps = [
    {
      Icon: Leaf,
      title: "We catalogue the plant",
      body: "One authoritative entry per plant — botanical name, light, water, toxicity, mature size. Written once, checked by us, never duplicated across sellers.",
    },
    {
      Icon: Store,
      title: "Nurseries list their stock",
      body: "Partner nurseries attach their own price, pot size and quantity to that entry. Ten nurseries selling a monstera means ten quotes on one page, not ten near-identical listings.",
    },
    {
      Icon: MapPinned,
      title: "You compare and enquire",
      body: "Sort by price, distance or rating, then message the nursery directly on WhatsApp or through us. You buy from them — we never sit in the middle of the transaction.",
    },
  ];

  return (
    <Section tone="paper" className="py-14 sm:py-16">
      <Container wide>
        <Rule label="How it works" className="mb-12" />
        <div className="grid gap-x-10 gap-y-10 md:grid-cols-3">
          {steps.map(({ Icon, title, body }, i) => (
            <div key={title} className="flex gap-5">
              <div className="flex shrink-0 flex-col items-center gap-3">
                <span className="flex size-10 items-center justify-center border border-line text-ink-muted">
                  <Icon className="size-4" strokeWidth={1.5} aria-hidden />
                </span>
                <span className="tabular text-[10px] tracking-[0.14em] text-ink-faint">
                  0{i + 1}
                </span>
              </div>
              <div>
                <h3 className="text-lg">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------------ fragments */

function CategoryTiles() {
  const entries = Object.entries(CATEGORY_LABELS) as [string, string][];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {entries.map(([slug, label], i) => (
        <Link
          key={slug}
          href={`/plants?category=${slug}`}
          className="group relative block overflow-hidden"
        >
          <div className="photo-well relative aspect-[4/3]">
            <Image
              src={photoUrl(i * 2 + 1, 500)}
              alt=""
              fill
              sizes="(min-width:640px) 25vw, 50vw"
              className="object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-110"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-ink/75 to-ink/5 transition-opacity duration-300 group-hover:from-ink/85"
              aria-hidden
            />
          </div>
          <p className="absolute inset-x-0 bottom-0 p-4 text-sm font-medium text-ink-invert">
            {label}
          </p>
        </Link>
      ))}
    </div>
  );
}

function CollectionGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {COLLECTIONS.map((c) => (
        <Link key={c.slug} href={`/collections/${c.slug}`} className="group block">
          <div className="photo-well relative aspect-[3/2] overflow-hidden">
            <Image
              src={photoUrl(c.photo, 700)}
              alt=""
              fill
              sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-105"
            />
          </div>
          <div className="pt-4">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-display text-xl transition-opacity group-hover:opacity-65">
                {c.title}
              </h3>
              <span className="tabular shrink-0 text-xs text-ink-faint">
                {collectionCount(c)} plants
              </span>
            </div>
            <p className="mt-1.5 text-sm text-ink-muted">{c.tagline}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function PartnerBand() {
  return (
    <Section tone="ink">
      <Container wide>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-ink-invert/50">For nurseries</p>
            <h2 className="mt-4 text-[clamp(1.9rem,4vw,3rem)] text-ink-invert">
              Your stock, in front of people already looking for it.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-invert/65">
              Buyers arrive at a plant page having already decided what they want. All
              that is left is choosing who to buy it from — and that is a list you
              should be on.
            </p>

            <ul className="mt-8 space-y-3.5">
              {[
                {
                  Icon: HandCoins,
                  t: "No commission, ever",
                  d: "A flat monthly fee. Every rupee of every sale stays with you.",
                },
                {
                  Icon: Leaf,
                  t: "No catalogue work",
                  d: "We write the plant entries. You set a price, a pot size and a quantity.",
                },
                {
                  Icon: MapPinned,
                  t: "Local intent",
                  d: "Buyers filter by city and distance, so the leads you get are ones you can actually serve.",
                },
              ].map(({ Icon, t, d }) => (
                <li key={t} className="flex gap-3.5">
                  <Icon
                    className="mt-0.5 size-4 shrink-0 text-ink-invert/45"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <p className="text-sm leading-relaxed text-ink-invert/65">
                    <span className="font-medium text-ink-invert">{t}.</span> {d}
                  </p>
                </li>
              ))}
            </ul>

            <ButtonLink
              href="/partner"
              size="lg"
              className="mt-9 border-ink-invert bg-ink-invert text-ink hover:bg-white"
            >
              See plans &amp; pricing
            </ButtonLink>
          </div>

          <div className="photo-well relative aspect-[4/3] overflow-hidden">
            <Image
              src={photoUrl(6, 900)}
              alt=""
              fill
              sizes="(min-width:1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}
