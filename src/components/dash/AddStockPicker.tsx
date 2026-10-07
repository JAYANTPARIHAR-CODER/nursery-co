"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search, Check, X, TrendingDown } from "lucide-react";
import type { PlantCategory } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/data/plants";
import { photoUrl } from "@/lib/data/media";
import { formatINR } from "@/lib/money";
import { cn } from "@/lib/utils";
import { Badge, Field, Input, Select } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";

export interface Candidate {
  id: string;
  slug: string;
  commonName: string;
  botanicalName: string;
  category: PlantCategory;
  photo: number;
  rivalCount: number;
  lowestPaise: number | null;
  medianPaise: number | null;
}

const POT_SIZES = ['4"', '5"', '6"', '8"', '10"', '12"'];
const POT_MATERIALS = ["Nursery bag", "Plastic grow pot", "Terracotta", "Ceramic", "Self-watering"];

/**
 * Catalogue picker with an inline listing form.
 *
 * The competitive context (what rivals charge) sits right next to the
 * price input on purpose — a nursery pricing blind is the main reason
 * listings sit unviewed.
 */
export function AddStockPicker({ candidates }: { candidates: Candidate[] }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [added, setAdded] = useState<string[]>([]);

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return candidates.filter((c) => {
      if (added.includes(c.id)) return false;
      if (category !== "all" && c.category !== category) return false;
      if (!needle) return true;
      return `${c.commonName} ${c.botanicalName}`.toLowerCase().includes(needle);
    });
  }, [candidates, q, category, added]);

  const confirm = () => {
    if (!selected) return;
    setAdded((prev) => [...prev, selected.id]);
    setSelected(null);
  };

  return (
    <div>
      {added.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2 border border-leaf/25 bg-leaf-soft px-4 py-3">
          <Check className="size-4 shrink-0 text-leaf" strokeWidth={2} aria-hidden />
          <p className="text-sm">
            <span className="font-medium">
              {added.length} listing{added.length > 1 ? "s" : ""} added
            </span>
            <span className="text-ink-muted">
              {" "}
              — not persisted in this prototype.
            </span>
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint"
            strokeWidth={1.5}
            aria-hidden
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the catalogue"
            aria-label="Search catalogue"
            className="pl-9"
          />
        </div>
        <Select
          aria-label="Filter by category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-auto"
        >
          <option value="all">All categories</option>
          {Object.entries(CATEGORY_LABELS).map(([slug, label]) => (
            <option key={slug} value={slug}>
              {label}
            </option>
          ))}
        </Select>
        <p className="tabular ml-auto text-sm text-ink-muted">
          <span className="font-medium text-ink">{visible.length}</span> available to add
        </p>
      </div>

      {visible.length === 0 ? (
        <p className="mt-6 border border-dashed border-line-strong bg-surface py-14 text-center text-sm text-ink-muted">
          {candidates.length === 0
            ? "You already list every plant in the catalogue."
            : "Nothing left matching that search."}
        </p>
      ) : (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setSelected(c)}
                className={cn(
                  "flex w-full gap-3 border border-line bg-surface p-3 text-left",
                  "transition-all duration-150 ease-[var(--ease-out-soft)]",
                  "hover:-translate-y-0.5 hover:border-ink hover:shadow-[var(--shadow-raise)]",
                  "active:scale-[0.99]",
                )}
              >
                <div className="photo-well relative size-16 shrink-0 overflow-hidden">
                  <Image
                    src={photoUrl(c.photo, 160)}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.commonName}</p>
                  <p className="truncate text-xs italic text-ink-faint">
                    {c.botanicalName}
                  </p>
                  <p className="tabular mt-1.5 text-xs text-ink-muted">
                    {c.rivalCount === 0 ? (
                      <span className="text-leaf">No competition yet</span>
                    ) : (
                      <>
                        {c.rivalCount} selling · from{" "}
                        <span className="font-medium text-ink">
                          {formatINR(c.lowestPaise!)}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* ------------------------------------------------- listing form */}
      <div
        className={cn(
          "fixed inset-0 z-[80] bg-ink/40 transition-opacity duration-250",
          selected ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setSelected(null)}
        aria-hidden
      />
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-[81] w-full max-w-md bg-surface shadow-[var(--shadow-pop)]",
          "transition-transform duration-300 ease-[var(--ease-out-soft)]",
          selected ? "translate-x-0" : "translate-x-full",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Add listing"
        aria-hidden={!selected}
      >
        {selected && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              confirm();
            }}
            className="flex h-full flex-col"
          >
            <div className="flex items-start justify-between gap-4 border-b border-line p-5">
              <div className="flex gap-3">
                <div className="photo-well relative size-14 shrink-0 overflow-hidden">
                  <Image
                    src={photoUrl(selected.photo, 140)}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="eyebrow text-ink-faint">New listing</p>
                  <p className="mt-1 font-display text-lg leading-tight">
                    {selected.commonName}
                  </p>
                  <p className="truncate text-xs italic text-ink-faint">
                    {selected.botanicalName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Cancel"
                className="inline-flex size-9 items-center justify-center text-ink-muted transition-colors hover:bg-sunken hover:text-ink"
              >
                <X className="size-[18px]" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              {/* Market context, placed directly above the price field. */}
              <div className="border border-line bg-sunken p-4">
                <p className="eyebrow mb-3 flex items-center gap-1.5 text-ink-faint">
                  <TrendingDown className="size-3" strokeWidth={2} aria-hidden />
                  What others charge
                </p>
                {selected.rivalCount === 0 ? (
                  <p className="text-sm text-ink-muted">
                    Nobody else currently stocks this. You would be the only listing —
                    price it where you like.
                  </p>
                ) : (
                  <dl className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                        Lowest
                      </dt>
                      <dd className="tabular mt-1 font-display text-lg">
                        {formatINR(selected.lowestPaise!)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                        Median
                      </dt>
                      <dd className="tabular mt-1 font-display text-lg">
                        {formatINR(selected.medianPaise!)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                        Sellers
                      </dt>
                      <dd className="tabular mt-1 font-display text-lg">
                        {selected.rivalCount}
                      </dd>
                    </div>
                  </dl>
                )}
              </div>

              <Field label="Your price (₹)" htmlFor="a-price">
                <Input
                  id="a-price"
                  type="number"
                  min={1}
                  required
                  defaultValue={
                    selected.medianPaise ? Math.round(selected.medianPaise / 100) : 299
                  }
                  className="tabular"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Pot size" htmlFor="a-pot">
                  <Select id="a-pot" defaultValue='6"'>
                    {POT_SIZES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Pot material" htmlFor="a-mat">
                  <Select id="a-mat" defaultValue="Plastic grow pot">
                    {POT_MATERIALS.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Height (cm)" htmlFor="a-height">
                  <Input id="a-height" type="number" min={5} defaultValue={30} className="tabular" />
                </Field>
                <Field label="Quantity in stock" htmlFor="a-stock">
                  <Input id="a-stock" type="number" min={0} defaultValue={10} className="tabular" />
                </Field>
              </div>

              <Field
                label="Condition"
                htmlFor="a-cond"
                hint="Be honest — a mismatch between the listing and what arrives is the fastest way to a bad review."
              >
                <Select id="a-cond" defaultValue="standard">
                  <option value="premium">Premium grade</option>
                  <option value="standard">Standard</option>
                  <option value="nursery-fresh">Nursery fresh</option>
                </Select>
              </Field>

              <div className="flex flex-wrap gap-1.5">
                <Badge tone="neutral">{CATEGORY_LABELS[selected.category]}</Badge>
                {selected.rivalCount === 0 && <Badge tone="leaf">First to list</Badge>}
              </div>
            </div>

            <div className="flex gap-2 border-t border-line p-5">
              <Button type="button" variant="ghost" onClick={() => setSelected(null)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Add to my stock
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
