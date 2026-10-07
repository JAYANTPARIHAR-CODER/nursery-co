import type { Metadata } from "next";
import Link from "next/link";
import { Store } from "lucide-react";
import { listNurseries } from "@/lib/catalog";
import { CITIES } from "@/lib/brand";
import { cn } from "@/lib/utils";
import {
  Container,
  SectionHead,
  Breadcrumbs,
  EmptyState,
  Section,
} from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { NurseryCard } from "@/components/nursery/NurseryCard";

export const metadata: Metadata = {
  title: "Partner nurseries",
  description:
    "Independent nurseries and garden centres listing live stock on the platform, verified in person before they go live.",
};

export default async function NurseriesPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; verified?: string }>;
}) {
  const { city, verified } = await searchParams;
  const verifiedOnly = verified === "1";
  const nurseries = listNurseries({ city, verifiedOnly });

  return (
    <>
      <div className="border-b border-line bg-surface">
        <Container wide className="py-9">
          <Breadcrumbs
            trail={[{ href: "/", label: "Home" }, { label: "Nurseries" }]}
          />
          <SectionHead
            className="mt-6 mb-0"
            eyebrow="Our partners"
            title={city ? `Nurseries in ${city}` : "Partner nurseries"}
            blurb="Every partner is visited and verified before listing. They set their own prices and handle delivery themselves — we never take a cut of a sale."
            action={{ href: "/partner", label: "List your nursery" }}
          />
        </Container>
      </div>

      <Container wide className="py-10">
        {/* City chips — a second entry point to the header's city picker. */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <CityChip href="/nurseries" label="All cities" active={!city} />
          {CITIES.map((c) => (
            <CityChip
              key={c}
              href={`/nurseries?city=${encodeURIComponent(c)}`}
              label={c}
              active={city === c}
            />
          ))}
          <span className="mx-1 h-5 w-px bg-line" aria-hidden />
          <CityChip
            href={
              verifiedOnly
                ? city
                  ? `/nurseries?city=${encodeURIComponent(city)}`
                  : "/nurseries"
                : `/nurseries?${new URLSearchParams({ ...(city ? { city } : {}), verified: "1" })}`
            }
            label="Verified only"
            active={verifiedOnly}
          />
        </div>

        <p className="tabular mb-7 border-b border-line pb-4 text-sm text-ink-muted">
          <span className="font-medium text-ink">{nurseries.length}</span>{" "}
          {nurseries.length === 1 ? "nursery" : "nurseries"}
          {city && ` in ${city}`}
        </p>

        {nurseries.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {nurseries.map((n) => (
              <NurseryCard key={n.id} nursery={n} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Store className="size-8" strokeWidth={1.25} />}
            title={`No partners in ${city} yet`}
            blurb="We are onboarding nurseries city by city. If you run one here, this is a good moment to get in early."
            action={
              <ButtonLink href="/partner" size="sm">
                List your nursery
              </ButtonLink>
            }
          />
        )}
      </Container>

      <Section tone="sunken" className="py-14">
        <Container wide>
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl">Not seeing your city?</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
                We open a new city once at least five nurseries there are ready to list.
                Register your interest and we will come to you first.
              </p>
            </div>
            <ButtonLink href="/partner" variant="outline" className="shrink-0">
              Register interest
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}

function CityChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "rounded-[var(--radius-pill)] border px-4 py-2 text-xs transition-all duration-150",
        active
          ? "border-brand bg-brand text-ink-invert"
          : "border-line text-ink-muted hover:-translate-y-px hover:border-ink hover:text-ink",
      )}
    >
      {label}
    </Link>
  );
}
