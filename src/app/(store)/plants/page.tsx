import type { Metadata } from "next";
import { Leaf } from "lucide-react";
import type { Difficulty, LightNeed, Placement, PlantCategory } from "@/lib/types";
import { searchPlants } from "@/lib/catalog";
import { CATEGORY_LABELS } from "@/lib/data/plants";
import { Container, SectionHead, Breadcrumbs, EmptyState } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { PlantGrid } from "@/components/plant/PlantCard";
import { FilterRail, SortSelect, type FilterState } from "@/components/plant/FilterRail";

export const metadata: Metadata = {
  title: "All plants",
  description:
    "Browse the full catalogue and see which nurseries near you stock each plant, with live prices and availability.",
};

type Params = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v;

const many = (v: string | string[] | undefined): string[] =>
  v === undefined ? [] : Array.isArray(v) ? v : [v];

export default async function PlantsPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const sp = await searchParams;

  const state: FilterState = {
    category: one(sp.category) ?? "all",
    light: many(sp.light),
    difficulty: many(sp.difficulty),
    petSafe: one(sp.petSafe) === "1",
    airPurifying: one(sp.airPurifying) === "1",
    flowering: one(sp.flowering) === "1",
    placement: one(sp.placement) ?? "",
    maxPrice: Number(one(sp.maxPrice) ?? 0),
    sort: one(sp.sort) ?? "popular",
  };

  const q = one(sp.q);
  const city = one(sp.city);

  const plants = searchPlants({
    q,
    city,
    category: state.category as PlantCategory | "all",
    light: state.light as LightNeed[],
    difficulty: state.difficulty as Difficulty[],
    petSafe: state.petSafe,
    airPurifying: state.airPurifying,
    flowering: state.flowering,
    placement: (state.placement || undefined) as Placement | undefined,
    maxPricePaise: state.maxPrice || undefined,
    sort: state.sort as "popular",
  });

  const heading =
    state.category !== "all"
      ? CATEGORY_LABELS[state.category as PlantCategory]
      : q
        ? `Results for “${q}”`
        : "Every plant we catalogue";

  return (
    <>
      <div className="border-b border-line bg-surface">
        <Container wide className="py-9">
          <Breadcrumbs
            trail={[
              { href: "/", label: "Home" },
              { href: "/plants", label: "Plants" },
              ...(state.category !== "all"
                ? [{ label: CATEGORY_LABELS[state.category as PlantCategory] }]
                : []),
            ]}
          />
          <SectionHead
            className="mt-6 mb-0"
            eyebrow={city ? `Available in ${city}` : "Catalogue"}
            title={heading}
            blurb={
              q
                ? undefined
                : "Each entry is written and verified by us. Open any plant to compare what every partner nursery is charging for it."
            }
          />
        </Container>
      </div>

      <Container wide className="py-10">
        {/* Block on mobile so the filter trigger stacks above the results;
            a flex row here would seat it beside the grid and squeeze it. */}
        <div className="lg:flex lg:gap-12">
          <FilterRail state={state} resultCount={plants.length} />

          <div className="min-w-0 flex-1">
            <div className="mb-7 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
              <p className="tabular text-sm text-ink-muted">
                <span className="font-medium text-ink">{plants.length}</span>{" "}
                {plants.length === 1 ? "plant" : "plants"}
                {city && <span className="text-ink-faint"> stocked in {city}</span>}
              </p>
              <SortSelect value={state.sort} />
            </div>

            {plants.length > 0 ? (
              <PlantGrid plants={plants} city={city} />
            ) : (
              <EmptyState
                icon={<Leaf className="size-8" strokeWidth={1.25} />}
                title="Nothing matches those filters"
                blurb={
                  city
                    ? `No plant in the catalogue matches this combination with a nursery in ${city}. Try widening the city in the header, or clearing a filter.`
                    : "Try removing a filter — the combination you have picked is a little too narrow."
                }
                action={
                  <ButtonLink href="/plants" variant="outline" size="sm">
                    Clear all filters
                  </ButtonLink>
                }
              />
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
