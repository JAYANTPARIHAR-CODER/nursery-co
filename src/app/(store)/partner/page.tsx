import type { Metadata } from "next";
import Image from "next/image";
import { ClipboardList, HandCoins, LineChart, Users, Check } from "lucide-react";
import { platformStats } from "@/lib/catalog";
import { CITIES } from "@/lib/brand";
import { photoUrl } from "@/lib/data/media";
import {
  Container,
  Section,
  SectionHead,
  Field,
  Input,
  Select,
  Textarea,
  Rule,
} from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { PricingTable } from "@/components/site/PricingTable";

export const metadata: Metadata = {
  title: "List your nursery",
  description:
    "Put your stock in front of buyers who already know what plant they want. Flat monthly fee, zero commission on sales.",
};

export default function PartnerPage() {
  const stats = platformStats();

  return (
    <>
      {/* --------------------------------------------------------- apply */}
      <Section tone="paper">
        <div id="apply" className="scroll-mt-36" />
        <Container wide>
          <div className="mx-auto max-w-2xl">
            <SectionHead
              align="center"
              eyebrow="Apply"
              title="Tell us about your nursery"
              blurb="We read every application. Expect a reply within two working days."
            />

            <form className="space-y-5 border border-line bg-surface p-7 sm:p-9">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nursery name" htmlFor="p-name">
                  <Input id="p-name" name="nursery" required placeholder="Green Canopy Nursery" />
                </Field>
                <Field label="Your name" htmlFor="p-owner">
                  <Input id="p-owner" name="owner" required placeholder="Full name" />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Phone" htmlFor="p-phone">
                  <Input id="p-phone" name="phone" type="tel" inputMode="tel" required placeholder="+91" />
                </Field>
                <Field label="Email" htmlFor="p-email">
                  <Input id="p-email" name="email" type="email" required placeholder="you@nursery.in" />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="City" htmlFor="p-city">
                  <Select id="p-city" name="city" defaultValue="">
                    <option value="" disabled>
                      Choose a city
                    </option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="other">Somewhere else</option>
                  </Select>
                </Field>
                <Field
                  label="Roughly how many plant types"
                  htmlFor="p-size"
                  hint="An estimate is fine."
                >
                  <Select id="p-size" name="size" defaultValue="">
                    <option value="" disabled>
                      Choose a range
                    </option>
                    <option>Under 25</option>
                    <option>25 – 75</option>
                    <option>75 – 200</option>
                    <option>Over 200</option>
                  </Select>
                </Field>
              </div>

              <Field
                label="What do you specialise in?"
                htmlFor="p-about"
                hint="Anything that makes your stock distinctive — rare aroids, field-grown outdoor, bulk supply."
              >
                <Textarea id="p-about" name="about" rows={4} />
              </Field>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
                <p className="flex items-center gap-2 text-xs text-ink-faint">
                  <Check className="size-3.5 shrink-0 text-leaf" strokeWidth={2} aria-hidden />
                  30-day trial · no card required
                </p>
                <Button type="submit" size="lg">
                  Submit application
                </Button>
              </div>
            </form>

            <Rule className="mt-12" label="Already a partner" />
            <p className="mt-6 text-center text-sm text-ink-muted">
              <a href="/dashboard" className="underline underline-offset-4 hover:text-ink">
                Sign in to your dashboard
              </a>{" "}
              to manage stock and enquiries.
            </p>
          </div>
        </Container>
      </Section>
      {/* ---------------------------------------------------------- hero */}
      <section className="relative overflow-hidden bg-ink text-ink-invert">
        <div className="absolute inset-0 opacity-25" aria-hidden>
          <Image src={photoUrl(13, 1600, 60)} alt="" fill sizes="100vw" className="object-cover" />
        </div>
        <Container wide className="relative py-20 sm:py-28">
          <div className="max-w-2xl">
            <p className="eyebrow text-ink-invert/55">For nurseries &amp; garden centres</p>
            <h1 className="mt-5 text-[clamp(2.2rem,5.5vw,4rem)] leading-[1.05]">
              Sell to people who already know what they want.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-invert/70">
              By the time a buyer reaches a plant page they have chosen the plant. The
              only question left is who they buy it from — and that is a list you should
              be on.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#apply"
                className="inline-flex h-13 items-center justify-center bg-ink-invert px-8 text-[11px] font-medium uppercase tracking-[0.16em] text-ink transition-all duration-150 hover:-translate-y-px hover:bg-white active:scale-[0.99]"
              >
                Apply to list
              </a>
              <a
                href="#pricing"
                className="inline-flex h-13 items-center justify-center border border-ink-invert/40 px-8 text-[11px] font-medium uppercase tracking-[0.16em] transition-all duration-150 hover:-translate-y-px hover:border-ink-invert hover:bg-ink-invert/10"
              >
                See pricing
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* --------------------------------------------------------- stats */}
      <div className="border-b border-line bg-surface">
        <Container wide>
          <dl className="grid grid-cols-2 divide-line sm:grid-cols-4 sm:divide-x">
            {[
              { k: `${stats.publishedPlants}`, v: "Plants catalogued for you" },
              { k: `${stats.liveNurseries}`, v: "Nurseries already listed" },
              { k: `${CITIES.length}`, v: "Cities live" },
              { k: "0%", v: "Commission on your sales" },
            ].map((s, i) => (
              <div
                key={s.v}
                className={`px-3 py-7 text-center ${i < 2 ? "border-b border-line sm:border-b-0" : ""}`}
              >
                <dt className="tabular font-display text-3xl">{s.k}</dt>
                <dd className="eyebrow mt-2 text-ink-faint">{s.v}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </div>

      {/* --------------------------------------------------------- value */}
      <Section tone="paper">
        <Container wide>
          <SectionHead
            eyebrow="Why list with us"
            title="A listing fee, not a tax on every sale"
            blurb="Marketplaces usually take 15–25% of each order. We charge a flat monthly fee instead, which means the better you do, the more you keep."
          />

          <div className="grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                Icon: HandCoins,
                t: "Zero commission",
                d: "You keep 100% of every sale. The buyer pays you directly, in whatever way you already take payment — cash, UPI, card, on delivery.",
              },
              {
                Icon: ClipboardList,
                t: "No catalogue work",
                d: "We write and verify every plant entry: botanical name, care profile, toxicity, mature size. You add a price, a pot size and a quantity. That is the whole job.",
              },
              {
                Icon: Users,
                t: "High-intent buyers",
                d: "Nobody browses a plant comparison page idly. They have picked the plant and filtered to their own city — the leads you get are ones you can actually fulfil.",
              },
              {
                Icon: LineChart,
                t: "See what sells",
                d: "Your dashboard shows which listings get viewed, which convert to enquiries, and what competitors nearby are charging for the same plant.",
              },
            ].map(({ Icon, t, d }) => (
              <div key={t}>
                <span className="mb-5 inline-flex size-10 items-center justify-center border border-line text-ink-muted">
                  <Icon className="size-4" strokeWidth={1.5} aria-hidden />
                </span>
                <h3 className="text-lg">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{d}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------ onboarding */}
      <Section tone="sunken">
        <Container wide>
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <div>
              <SectionHead
                eyebrow="Getting started"
                title="Live within a week"
                blurb="Most nurseries are listed and taking enquiries inside five working days."
              />
              <ol className="space-y-7">
                {[
                  {
                    t: "Apply",
                    d: "Tell us where you are, what you grow and roughly how much you carry. Two minutes, using the form below.",
                  },
                  {
                    t: "We visit and verify",
                    d: "Someone comes to the nursery in person to confirm you are real and that the stock matches what you say. This is why the verified badge means something.",
                  },
                  {
                    t: "List your stock",
                    d: "Search our catalogue, tick the plants you carry, then set a price, pot size and quantity for each. Bulk upload by spreadsheet if your range is large.",
                  },
                  {
                    t: "Start taking enquiries",
                    d: "You appear on every plant page you stock. Enquiries arrive by WhatsApp, phone or your dashboard inbox.",
                  },
                ].map((s, i) => (
                  <li key={s.t} className="flex gap-5">
                    <span className="tabular mt-0.5 shrink-0 font-display text-2xl text-ink-faint">
                      0{i + 1}
                    </span>
                    <div>
                      <h3 className="text-lg">{s.t}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="photo-well relative aspect-[4/5] overflow-hidden lg:sticky lg:top-36 lg:self-start">
              <Image
                src={photoUrl(9, 900)}
                alt=""
                fill
                sizes="(min-width:1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------- pricing */}
      <Section tone="paper">
        <div id="pricing" className="scroll-mt-36" />
        <Container wide>
          <SectionHead
            align="center"
            eyebrow="Pricing"
            title="Plans that scale with your catalogue"
            blurb="Every tier includes the verified listing, the enquiry inbox and zero commission. The difference is how many plants you can list and how prominently you appear."
          />
          <PricingTable />
        </Container>
      </Section>

      {/* ----------------------------------------------------------- FAQ */}
      <Section tone="sunken">
        <Container wide>
          <div className="grid gap-12 lg:grid-cols-[22rem_1fr] lg:gap-20">
            <SectionHead
              className="mb-0"
              eyebrow="Questions"
              title="Before you apply"
            />
            <dl className="divide-y divide-line border-y border-line">
              {[
                {
                  q: "Do you take a cut of what I sell?",
                  a: "No. Not at any tier, not on any sale. You pay a flat monthly or annual fee to be listed, and everything the buyer pays you is yours. We never handle the money, which is also why we never hold your payouts.",
                },
                {
                  q: "Can I add my own plants to the catalogue?",
                  a: "Not directly, and that is deliberate. If every nursery created its own entries, the same monstera would exist fourteen times and the comparison would fall apart. Send us anything missing and we will add it, usually within two working days — then every nursery can list against it.",
                },
                {
                  q: "What if my prices change often?",
                  a: "Edit them any time from the dashboard; changes go live immediately. Canopy plans can also sync stock and prices through our API if you already run inventory software.",
                },
                {
                  q: "Who handles delivery?",
                  a: "You do, on your own terms and within whatever radius you set. We pass the buyer to you and step out of the way — we are not a logistics company.",
                },
                {
                  q: "What happens if I stop paying?",
                  a: "Your listings come off the storefront at the end of the billing period, but your account and catalogue stay intact for six months so you can pick up where you left off.",
                },
                {
                  q: "Is there a minimum contract?",
                  a: "No. Monthly plans can be cancelled at any time and annual plans are refunded pro rata for unused months.",
                },
              ].map((f) => (
                <div key={f.q} className="py-6">
                  <dt className="font-display text-lg">{f.q}</dt>
                  <dd className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
                    {f.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </Section>

      
    </>
  );
}
