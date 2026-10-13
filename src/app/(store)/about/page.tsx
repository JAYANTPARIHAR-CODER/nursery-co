import type { Metadata } from "next";
import Image from "next/image";
import { photoUrl } from "@/lib/data/media";
import { Container, Section, SectionHead } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About",
  description:
    "Nursery Co. is a catalogue of plants, stocked by verified nurseries across India.",
};

const STEPS = [
  {
    title: "We catalogue the plant",
    body: "One authoritative entry per plant: botanical name, light, water, toxicity, mature size. Written once, checked by us.",
  },
  {
    title: "Nurseries list their stock",
    body: "Partner nurseries attach their own price, pot size and quantity to that entry. Ten quotes on one page.",
  },
  {
    title: "You compare and enquire",
    body: "Sort by price, distance or rating, then message the nursery. You buy from them directly.",
  },
];

const VALUES = [
  {
    title: "Transparency",
    body: "No commission on any sale. Nurseries pay a flat monthly fee, so the price you see is the price the nursery set.",
  },
  {
    title: "Curation over quantity",
    body: "We would rather have a small catalogue described accurately than a huge one described loosely.",
  },
  {
    title: "Supporting local growers",
    body: "Every listing connects you to an independent nursery in your own city. Your money goes to them.",
  },
  {
    title: "Verified in person",
    body: "We visit each nursery before it goes live, so the stock you browse is stock that actually exists.",
  },
];

const TEAM: { name: string; role: string; photo?: string }[] = [
  { name: "Bhalinder Deep Singh", role: "Founder and MD", photo: "/images/bhalinder-deep-singh.jpg" },
  { name: "Divyam Singhania", role: "Web Developer", photo: "/images/divyam-singhania.jpeg" },
  { name: "Jayant PARIHAR", role: "Web Architect", photo: "/images/jayant-parihar.png" },
  { name: "", role: "Marketing Head", photo: "/images/" },
  { name: "", role: "Legal advice", photo: "/images/" }, 
];

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-ink text-ink-invert">
        <div className="absolute inset-0 opacity-30" aria-hidden>
          <Image src={photoUrl(19, 2000, 78)} alt="" fill priority sizes="100vw" className="object-cover" />
        </div>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/55 to-ink/20" />
        <Container wide className="relative py-24 sm:py-32">
          <div className="max-w-3xl animate-rise">
            <p className="eyebrow text-ink-invert/55">About Nursery Co.</p>
            <h1 className="mt-5 text-[clamp(2.2rem,5.5vw,4rem)] leading-[1.05]">
              The right plant, from the nursery nearest you.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-invert/70 sm:text-lg">
              Nursery Co. is a catalogue of plants, stocked by verified
              nurseries across India. You see what is available near you, at
              what price, before you make a single call.
            </p>
          </div>
        </Container>
      </section>

      <Section tone="paper">
        <Container wide>
          <div className="grid gap-10 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-4">
              <SectionHead className="mb-0" eyebrow="Our mission" title="Why we built this" />
            </div>
            <div className="max-w-2xl space-y-5 text-base leading-relaxed text-ink-muted md:col-span-8">
              <p className="font-display text-2xl leading-snug text-ink sm:text-[1.7rem]">
                Buying a plant locally shouldn&rsquo;t mean phoning six
                nurseries to ask who has a monstera.
              </p>
              <p>
                Until now, finding out meant calling around, scrolling
                Instagram pages, or driving across the city to be told it was
                sold out. Prices were unclear, pot sizes were a guess.
              </p>
              <p>
                We built Nursery Co. so the guesswork happens once, in one
                place. Every plant has a single, checked entry. Every nursery
                shows its own stock and price against it.
              </p>
            </div>
            <div className="md:col-span-12">
              <div className="photo-well relative aspect-[21/9] overflow-hidden">
                <Image
                  src={photoUrl(20, 1600, 75)}
                  alt="Rows of plants growing inside a nursery greenhouse"
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="surface" className="border-y border-line">
        <Container wide>
          <SectionHead eyebrow="Process" title="How it works" />
          <ol className="grid gap-12 md:grid-cols-3 md:gap-10">
            {STEPS.map((step, i) => (
              <li key={step.title}>
                <div className="border-t-2 border-brand pt-6">
                  <span aria-hidden className="tabular font-display text-5xl text-ink-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 font-display text-xl sm:text-2xl">{step.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>
      <Section tone="sunken">
        <Container wide>
          <SectionHead eyebrow="Principles" title="What we hold ourselves to" />
          <ul className="grid gap-6 sm:grid-cols-2">
            {VALUES.map((v) => (
              <li key={v.title}>
                <article className="h-full border border-line bg-surface p-8 shadow-[var(--shadow-raise)]">
                  <h3 className="font-display text-xl sm:text-2xl">{v.title}</h3>
                  <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-muted">{v.body}</p>
                </article>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="surface" className="border-t border-line">
        <Container wide>
          <SectionHead eyebrow="Team" title="The people behind it"
            blurb="A small team of plant people and engineers, working with nurseries across six cities." />
          <ul className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
            {TEAM.map((m, i) => (
              <li key={`${m.role}-${i}`}>
                <div className="photo-well relative aspect-[4/5] overflow-hidden">
                  {m.photo !== undefined ? (
                    <Image src={m.photo} alt={`Portrait of ${m.name}`} fill
                      sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                  ) : (
                    <span aria-hidden className="absolute inset-0 grid place-items-center font-display text-5xl text-ink-faint">
                      {initials(m.name)}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 font-display text-lg">{m.name}</h3>
                <p className="mt-0.5 text-sm text-ink-muted">{m.role}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="paper" className="bg-brand-soft">
        <Container wide>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="mx-auto w-full max-w-xl text-center lg:mx-0 lg:text-left">
              <SectionHead align="center" className="mb-0 items-center lg:items-start lg:text-left" eyebrow="Get started"
                title="Find the plant. Then find who has it."
                blurb="Browse the catalogue, see live prices from nurseries near you, and message the one you like." />
              <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                <ButtonLink href="/plants" size="lg">Browse the catalogue</ButtonLink>
                <ButtonLink href="/partner" size="lg" variant="outline">List your stock</ButtonLink>
              </div>
            </div>
            <div className="photo-well relative aspect-[4/3] overflow-hidden">
              <Image
                src={photoUrl(6, 1200, 72)}
                alt="Plants stocked at a partner nursery"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
