"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, ExternalLink } from "lucide-react";
import { PLANTS, CATEGORY_LABELS } from "@/lib/data/plants";
import { OFFERS } from "@/lib/data/offers";
import { photoUrl } from "@/lib/data/media";
import { formatDate, cn } from "@/lib/utils";
import { PageHead, TableWrap, Th, Td } from "@/components/dash/Shell";
import { Badge, Input, Select } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";

type StatusFilter = "all" | "published" | "draft";

/**
 * The admin side of the catalogue. Everything the storefront shows comes
 * from here, so this table is the real control surface of the product.
 */
export default function AdminCataloguePage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [category, setCategory] = useState("all");

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return PLANTS.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (category !== "all" && p.category !== category) return false;
      if (!needle) return true;
      return [p.commonName, p.botanicalName, p.family, ...p.tags]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    }).sort((a, b) => b.addedOn.localeCompare(a.addedOn));
  }, [q, status, category]);

  const listingCount = (plantId: string) =>
    OFFERS.filter((o) => o.plantId === plantId).length;

  return (
    <div className="p-5 sm:p-8">
      <PageHead
        title="Plant catalogue"
        blurb="The canonical plant list. Nurseries attach stock to these entries — they can never create one, which is what keeps a single plant from appearing fourteen times."
        action={
          <ButtonLink href="/admin/catalogue/new" size="sm">
            <Plus className="size-3.5" strokeWidth={2} />
            Add plant
          </ButtonLink>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint"
            strokeWidth={1.5}
            aria-hidden
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, botanical name or tag"
            aria-label="Search catalogue"
            className="pl-9"
          />
        </div>

        <Select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          className="w-auto"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </Select>

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
          <span className="font-medium text-ink">{rows.length}</span> of {PLANTS.length}
        </p>
      </div>

      <div className="mt-5">
        <TableWrap>
          <thead>
            <tr>
              <Th>Plant</Th>
              <Th>Category</Th>
              <Th className="text-right">Nurseries</Th>
              <Th>Status</Th>
              <Th>Added</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((p) => {
              const count = listingCount(p.id);
              return (
                <tr key={p.id} className="transition-colors hover:bg-sunken/60">
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="photo-well relative size-10 shrink-0 overflow-hidden">
                        <Image
                          src={photoUrl(p.photo, 100)}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium">{p.commonName}</p>
                        <p className="truncate text-xs italic text-ink-faint">
                          {p.botanicalName}
                        </p>
                      </div>
                    </div>
                  </Td>
                  <Td className="text-xs whitespace-nowrap text-ink-muted">
                    {CATEGORY_LABELS[p.category]}
                  </Td>
                  <Td className="text-right">
                    <span
                      className={cn(
                        "tabular font-medium",
                        count === 0 ? "text-ink-faint" : count <= 3 ? "text-clay" : "text-ink",
                      )}
                    >
                      {count}
                    </span>
                  </Td>
                  <Td>
                    <Badge tone={p.status === "published" ? "leaf" : "gold"}>
                      {p.status}
                    </Badge>
                  </Td>
                  <Td className="text-xs whitespace-nowrap text-ink-muted">
                    {formatDate(p.addedOn)}
                  </Td>
                  <Td>
                    <div className="flex items-center justify-end gap-3 text-xs">
                      {p.status === "published" ? (
                        <Link
                          href={`/plants/${p.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-ink-muted underline-offset-4 hover:text-ink hover:underline"
                        >
                          View <ExternalLink className="size-3" strokeWidth={1.5} />
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className="text-leaf underline-offset-4 hover:underline"
                        >
                          Publish
                        </button>
                      )}
                      <button
                        type="button"
                        className="text-ink-muted underline-offset-4 hover:text-ink hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>

        {rows.length === 0 && (
          <p className="border border-t-0 border-line bg-surface py-14 text-center text-sm text-ink-muted">
            No plants match those filters.
          </p>
        )}
      </div>
    </div>
  );
}
