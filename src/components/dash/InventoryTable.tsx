"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Check, X, ArrowUpRight, Pencil } from "lucide-react";
import type { Offer, Plant } from "@/lib/types";
import { photoUrl } from "@/lib/data/media";
import { formatINR, rupees } from "@/lib/money";
import { cn, relativeDays } from "@/lib/utils";
import { TableWrap, Th, Td } from "@/components/dash/Shell";
import { Badge, Input, Select } from "@/components/ui/primitives";

export interface InventoryRow extends Offer {
  plant: Plant;
  /** Cheapest in-stock price from any other nursery, or null if unique. */
  cheapestRival: number | null;
}

type StockFilter = "all" | "in-stock" | "out";

/**
 * Editable stock table.
 *
 * Edits are held in local state only — this is a frontend prototype, so
 * there is nothing to PATCH yet. The edit/commit/cancel shape is the real
 * one though, so wiring it to an endpoint later is a single handler.
 */
export function InventoryTable({ rows }: { rows: InventoryRow[] }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<StockFilter>("all");
  const [edits, setEdits] = useState<Record<string, { price: number; stock: number }>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({ price: 0, stock: 0 });

  const valueOf = (row: InventoryRow) =>
    edits[row.id] ?? { price: row.pricePaise, stock: row.stock };

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows
      .filter((r) => {
        const { stock } = valueOf(r);
        if (filter === "in-stock" && stock === 0) return false;
        if (filter === "out" && stock > 0) return false;
        if (!needle) return true;
        return `${r.plant.commonName} ${r.plant.botanicalName}`
          .toLowerCase()
          .includes(needle);
      })
      .sort((a, b) => a.plant.commonName.localeCompare(b.plant.commonName));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, q, filter, edits]);

  const startEdit = (row: InventoryRow) => {
    const v = valueOf(row);
    setDraft({ price: Math.round(v.price / 100), stock: v.stock });
    setEditing(row.id);
  };

  const commit = (row: InventoryRow) => {
    setEdits((prev) => ({
      ...prev,
      [row.id]: {
        price: rupees(Math.max(1, draft.price)),
        stock: Math.max(0, draft.stock),
      },
    }));
    setEditing(null);
  };

  const dirtyCount = Object.keys(edits).length;

  return (
    <div>
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
            placeholder="Search your stock"
            aria-label="Search stock"
            className="pl-9"
          />
        </div>

        <Select
          aria-label="Filter by availability"
          value={filter}
          onChange={(e) => setFilter(e.target.value as StockFilter)}
          className="w-auto"
        >
          <option value="all">All listings</option>
          <option value="in-stock">In stock</option>
          <option value="out">Out of stock</option>
        </Select>

        <p className="tabular ml-auto text-sm text-ink-muted">
          <span className="font-medium text-ink">{visible.length}</span> of {rows.length}
        </p>
      </div>

      {dirtyCount > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-brand/30 bg-brand-soft px-4 py-3">
          <p className="text-sm">
            <span className="font-medium">
              {dirtyCount} unsaved {dirtyCount === 1 ? "change" : "changes"}
            </span>
            <span className="text-ink-muted"> — not persisted in this prototype.</span>
          </p>
          <button
            type="button"
            onClick={() => setEdits({})}
            className="text-[11px] uppercase tracking-[0.1em] underline underline-offset-4"
          >
            Revert all
          </button>
        </div>
      )}

      <div className="mt-5">
        <TableWrap>
          <thead>
            <tr>
              <Th>Plant</Th>
              <Th>Pot &amp; size</Th>
              <Th className="text-right">Your price</Th>
              <Th className="text-right">Cheapest rival</Th>
              <Th className="text-right">Stock</Th>
              <Th>Updated</Th>
              <Th className="text-right">Edit</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visible.map((row) => {
              const v = valueOf(row);
              const isEditing = editing === row.id;
              const dirty = row.id in edits;
              const beaten = row.cheapestRival !== null && v.price > row.cheapestRival;

              return (
                <tr
                  key={row.id}
                  className={cn(
                    "transition-colors",
                    dirty ? "bg-brand-soft/40" : "hover:bg-sunken/60",
                    v.stock === 0 && "opacity-60",
                  )}
                >
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="photo-well relative size-10 shrink-0 overflow-hidden">
                        <Image
                          src={photoUrl(row.plant.photo, 100)}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/plants/${row.plant.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline"
                        >
                          {row.plant.commonName}
                          <ArrowUpRight className="size-3 shrink-0" strokeWidth={1.5} />
                        </Link>
                        <p className="truncate text-xs italic text-ink-faint">
                          {row.plant.botanicalName}
                        </p>
                      </div>
                    </div>
                  </Td>

                  <Td className="text-xs whitespace-nowrap text-ink-muted">
                    {row.potSize} {row.potMaterial.toLowerCase()}
                    <br />
                    <span className="text-ink-faint">{row.heightCm} cm tall</span>
                  </Td>

                  <Td className="text-right">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-xs text-ink-faint">₹</span>
                        <input
                          type="number"
                          min={1}
                          value={draft.price}
                          onChange={(e) => setDraft((d) => ({ ...d, price: +e.target.value }))}
                          aria-label="Price in rupees"
                          autoFocus
                          className="tabular h-9 w-24 border border-brand-ring bg-surface px-2 text-right text-sm outline-none"
                        />
                      </div>
                    ) : (
                      <span className={cn("tabular font-medium", beaten && "text-clay")}>
                        {formatINR(v.price)}
                      </span>
                    )}
                  </Td>

                  <Td className="tabular text-right text-xs text-ink-muted">
                    {row.cheapestRival === null ? (
                      <span className="text-ink-faint">only seller</span>
                    ) : (
                      formatINR(row.cheapestRival)
                    )}
                  </Td>

                  <Td className="text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        min={0}
                        value={draft.stock}
                        onChange={(e) => setDraft((d) => ({ ...d, stock: +e.target.value }))}
                        aria-label="Quantity in stock"
                        className="tabular h-9 w-20 border border-brand-ring bg-surface px-2 text-right text-sm outline-none"
                      />
                    ) : v.stock === 0 ? (
                      <Badge tone="danger">Out</Badge>
                    ) : (
                      <span
                        className={cn("tabular font-medium", v.stock <= 3 && "text-clay")}
                      >
                        {v.stock}
                      </span>
                    )}
                  </Td>

                  <Td className="text-xs whitespace-nowrap text-ink-muted">
                    {dirty ? (
                      <span className="font-medium text-brand">just now</span>
                    ) : (
                      relativeDays(row.updatedAt)
                    )}
                  </Td>

                  <Td>
                    <div className="flex items-center justify-end gap-1.5">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => commit(row)}
                            aria-label="Save changes"
                            className="inline-flex size-8 items-center justify-center border border-brand bg-brand text-ink-invert transition-transform active:scale-95"
                          >
                            <Check className="size-3.5" strokeWidth={2} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditing(null)}
                            aria-label="Cancel"
                            className="inline-flex size-8 items-center justify-center border border-line text-ink-muted transition-colors hover:border-ink hover:text-ink"
                          >
                            <X className="size-3.5" strokeWidth={2} />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEdit(row)}
                          aria-label={`Edit ${row.plant.commonName}`}
                          className="inline-flex size-8 items-center justify-center border border-line text-ink-muted transition-all hover:-translate-y-px hover:border-ink hover:text-ink"
                        >
                          <Pencil className="size-3.5" strokeWidth={1.5} />
                        </button>
                      )}
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>

        {visible.length === 0 && (
          <p className="border border-t-0 border-line bg-surface py-14 text-center text-sm text-ink-muted">
            No listings match that search.
          </p>
        )}
      </div>
    </div>
  );
}
