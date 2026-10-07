"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/data/plants";
import { formatINR } from "@/lib/money";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/primitives";
import { Button, IconButton } from "@/components/ui/Button";
import { LIGHT_LABELS, DIFFICULTY_LABELS } from "./care";

/**
 * All filter state lives in the URL, so a filtered view can be linked,
 * bookmarked and rendered on the server. This component only translates
 * clicks into query-string edits.
 *
 * Current values arrive as props from the server page rather than from
 * `useSearchParams`, which would force the route out of static rendering.
 */

export interface FilterState {
  category: string;
  light: string[];
  difficulty: string[];
  petSafe: boolean;
  airPurifying: boolean;
  flowering: boolean;
  placement: string;
  maxPrice: number;
  sort: string;
}

const PRICE_STEPS = [30_000, 60_000, 100_000, 200_000, 0] as const; // paise; 0 = any

export const SORT_OPTIONS = [
  { value: "popular", label: "Most stocked" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name A–Z" },
  { value: "newest", label: "Recently added" },
];

export function FilterRail({
  state,
  resultCount,
}: {
  state: FilterState;
  resultCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  const apply = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const params = new URLSearchParams(window.location.search);
      mutate(params);
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const setSingle = (key: string, value: string | null) =>
    apply((p) => (value ? p.set(key, value) : p.delete(key)));

  const toggleMulti = (key: string, value: string) =>
    apply((p) => {
      const current = p.getAll(key);
      p.delete(key);
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      next.forEach((v) => p.append(key, v));
    });

  const toggleFlag = (key: string, on: boolean) =>
    apply((p) => (on ? p.set(key, "1") : p.delete(key)));

  const clearAll = () =>
    apply((p) => {
      // City is a global preference set in the header, not a catalogue filter.
      const city = p.get("city");
      Array.from(p.keys()).forEach((k) => p.delete(k));
      if (city) p.set("city", city);
    });

  const activeCount =
    (state.category !== "all" ? 1 : 0) +
    state.light.length +
    state.difficulty.length +
    (state.petSafe ? 1 : 0) +
    (state.airPurifying ? 1 : 0) +
    (state.flowering ? 1 : 0) +
    (state.placement ? 1 : 0) +
    (state.maxPrice ? 1 : 0);

  const body = (
    <div className="space-y-7">
      <Group title="Category">
        <ul className="space-y-0.5">
          <li>
            <FilterLink
              active={state.category === "all"}
              onClick={() => setSingle("category", null)}
            >
              All plants
            </FilterLink>
          </li>
          {Object.entries(CATEGORY_LABELS).map(([slug, label]) => (
            <li key={slug}>
              <FilterLink
                active={state.category === slug}
                onClick={() => setSingle("category", slug)}
              >
                {label}
              </FilterLink>
            </li>
          ))}
        </ul>
      </Group>

      <Group title="Light">
        {Object.entries(LIGHT_LABELS).map(([value, label]) => (
          <Checkbox
            key={value}
            label={label}
            checked={state.light.includes(value)}
            onChange={() => toggleMulti("light", value)}
          />
        ))}
      </Group>

      <Group title="Care level">
        {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
          <Checkbox
            key={value}
            label={label}
            checked={state.difficulty.includes(value)}
            onChange={() => toggleMulti("difficulty", value)}
          />
        ))}
      </Group>

      <Group title="Good for">
        <Checkbox
          label="Safe around pets"
          checked={state.petSafe}
          onChange={(e) => toggleFlag("petSafe", e.target.checked)}
        />
        <Checkbox
          label="Air purifying"
          checked={state.airPurifying}
          onChange={(e) => toggleFlag("airPurifying", e.target.checked)}
        />
        <Checkbox
          label="Flowering"
          checked={state.flowering}
          onChange={(e) => toggleFlag("flowering", e.target.checked)}
        />
      </Group>

      <Group title="Placement">
        <div className="flex gap-2">
          {[
            { value: "", label: "Any" },
            { value: "indoor", label: "Indoor" },
            { value: "outdoor", label: "Outdoor" },
          ].map((o) => (
            <button
              key={o.value || "any"}
              type="button"
              onClick={() => setSingle("placement", o.value || null)}
              className={cn(
                "h-9 flex-1 rounded-[var(--radius-card)] border text-xs transition-all duration-150",
                state.placement === o.value
                  ? "border-brand bg-brand text-ink-invert"
                  : "border-line text-ink-muted hover:border-ink hover:text-ink",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Starting price under">
        <div className="flex flex-wrap gap-2">
          {PRICE_STEPS.map((paise) => (
            <button
              key={paise}
              type="button"
              onClick={() => setSingle("maxPrice", paise ? String(paise) : null)}
              className={cn(
                "h-9 rounded-[var(--radius-card)] border px-3 text-xs tabular transition-all duration-150",
                state.maxPrice === paise
                  ? "border-brand bg-brand text-ink-invert"
                  : "border-line text-ink-muted hover:border-ink hover:text-ink",
              )}
            >
              {paise ? formatINR(paise) : "Any"}
            </button>
          ))}
        </div>
      </Group>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="text-[11px] uppercase tracking-[0.12em] text-ink-muted underline underline-offset-4 transition-colors hover:text-ink"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="sticky top-36">{body}</div>
      </aside>

      {/* Mobile trigger — stacks above the results grid */}
      <div className="mb-5 flex items-center gap-2 lg:hidden">
        <Button variant="outline" size="sm" onClick={() => setSheetOpen(true)}>
          <SlidersHorizontal className="size-3.5" strokeWidth={1.5} />
          Filters
          {activeCount > 0 && (
            <span className="ml-1 inline-flex size-4 items-center justify-center rounded-full bg-brand text-[9px] text-ink-invert">
              {activeCount}
            </span>
          )}
        </Button>
      </div>

      {/* Mobile sheet */}
      <div
        className={cn(
          "fixed inset-0 z-[70] bg-ink/35 backdrop-blur-[2px] transition-opacity duration-250 lg:hidden",
          sheetOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setSheetOpen(false)}
        aria-hidden
      />
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-[71] max-h-[86vh] bg-surface lg:hidden",
          "rounded-t-[14px] transition-transform duration-300 ease-[var(--ease-out-soft)]",
          sheetOpen ? "translate-y-0" : "translate-y-full",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Filter plants"
        aria-hidden={!sheetOpen}
      >
        <div className="flex justify-center pt-3 pb-1">
          <span className="h-1 w-9 rounded-full bg-line-strong" aria-hidden />
        </div>
        <div className="flex items-center justify-between border-b border-line px-5 pb-3">
          <p className="font-display text-lg">Filters</p>
          <IconButton label="Close filters" onClick={() => setSheetOpen(false)}>
            <X className="size-[18px]" strokeWidth={1.5} />
          </IconButton>
        </div>
        <div className="max-h-[58vh] overflow-y-auto px-5 py-6">{body}</div>
        <div className="border-t border-line p-4">
          <Button size="lg" className="w-full" onClick={() => setSheetOpen(false)}>
            Show {resultCount} {resultCount === 1 ? "plant" : "plants"}
          </Button>
        </div>
      </div>
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-3 text-ink-faint">{title}</p>
      {children}
    </div>
  );
}

function FilterLink({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={cn(
        "w-full py-1.5 text-left text-sm transition-colors",
        active ? "font-medium text-ink" : "text-ink-muted hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

/** Sort control that sits above the grid, beside the result count. */
export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.1em] text-ink-faint">
      Sort
      <select
        aria-label="Sort plants"
        value={value}
        onChange={(e) => {
          const params = new URLSearchParams(window.location.search);
          if (e.target.value === "popular") params.delete("sort");
          else params.set("sort", e.target.value);
          const qs = params.toString();
          router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        }}
        className="cursor-pointer border-b border-line bg-transparent py-1 text-[11px] tracking-[0.1em] text-ink uppercase outline-none transition-colors hover:border-ink"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
