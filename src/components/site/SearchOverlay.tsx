"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, X, CornerDownLeft } from "lucide-react";
import { PUBLISHED_PLANTS, CATEGORY_LABELS } from "@/lib/data/plants";
import { NURSERIES } from "@/lib/data/nurseries";
import { photoUrl } from "@/lib/data/media";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/primitives";
import { IconButton } from "@/components/ui/Button";

/**
 * Full-width search sheet. The catalogue is small enough to ship to the
 * client and filter locally, which keeps results instant; swap `match`
 * for a fetch when the catalogue outgrows that.
 */

const SUGGESTIONS = [
  "Monstera",
  "Snake plant",
  "Pet safe",
  "Low light",
  "Bonsai",
  "Tulsi",
];

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  /* Clear the query as the sheet opens. Adjusted during render so the
     stale result list never flashes before the effect could clear it. */
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) setQ("");
  }

  useEffect(() => {
    if (!open) return;
    // Focusing is a DOM side effect, so it belongs in an effect.
    // Wait out the sheet transition before stealing focus.
    const t = setTimeout(() => inputRef.current?.focus(), 90);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const { plants, nurseries } = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (needle.length < 2) return { plants: [], nurseries: [] };
    return {
      plants: PUBLISHED_PLANTS.filter((p) =>
        [p.commonName, p.botanicalName, p.family, ...p.tags]
          .join(" ")
          .toLowerCase()
          .includes(needle),
      ).slice(0, 6),
      nurseries: NURSERIES.filter((n) =>
        [n.name, n.city, n.area, ...n.specialities].join(" ").toLowerCase().includes(needle),
      ).slice(0, 3),
    };
  }, [q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/plants?q=${encodeURIComponent(q.trim())}`);
    onClose();
  };

  const hasQuery = q.trim().length >= 2;
  const noResults = hasQuery && plants.length === 0 && nurseries.length === 0;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[70] bg-ink/30 backdrop-blur-[2px] transition-opacity duration-250",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          "fixed inset-x-0 top-0 z-[71] bg-surface transition-transform duration-300 ease-[var(--ease-out-soft)]",
          open ? "translate-y-0" : "-translate-y-full",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Search the catalogue"
        aria-hidden={!open}
      >
        <Container wide>
          <form onSubmit={submit} className="flex h-20 items-center gap-4">
            <Search className="size-5 shrink-0 text-ink-faint" strokeWidth={1.5} aria-hidden />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search plants, botanical names or nurseries"
              aria-label="Search query"
              className="h-full flex-1 bg-transparent font-display text-xl outline-none placeholder:text-ink-faint sm:text-2xl"
            />
            {q && (
              <span className="hidden items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-ink-faint sm:flex">
                <CornerDownLeft className="size-3" strokeWidth={1.5} /> to search
              </span>
            )}
            <IconButton label="Close search" onClick={onClose} type="button">
              <X className="size-5" strokeWidth={1.5} />
            </IconButton>
          </form>

          <div className="max-h-[70vh] overflow-y-auto border-t border-line py-7">
            {!hasQuery && (
              <div>
                <p className="eyebrow mb-4 text-ink-faint">Popular searches</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setQ(s)}
                      className="rounded-[var(--radius-pill)] border border-line px-4 py-2 text-xs text-ink-muted transition-all duration-150 hover:-translate-y-px hover:border-ink hover:text-ink"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {noResults && (
              <p className="py-8 text-center text-sm text-ink-muted">
                Nothing matches{" "}
                <span className="font-medium text-ink">&ldquo;{q}&rdquo;</span>. Try a
                common name like &ldquo;money plant&rdquo;, or browse{" "}
                <Link href="/plants" className="underline underline-offset-4" onClick={onClose}>
                  the full catalogue
                </Link>
                .
              </p>
            )}

            {plants.length > 0 && (
              <div className="mb-8">
                <p className="eyebrow mb-4 text-ink-faint">Plants</p>
                <ul className="grid gap-1 sm:grid-cols-2">
                  {plants.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/plants/${p.slug}`}
                        onClick={onClose}
                        className="group flex items-center gap-4 p-2 transition-colors hover:bg-sunken"
                      >
                        <div className="photo-well relative size-14 shrink-0 overflow-hidden">
                          <Image
                            src={photoUrl(p.photo, 140)}
                            alt=""
                            fill
                            sizes="56px"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{p.commonName}</p>
                          <p className="truncate text-xs text-ink-faint italic">
                            {p.botanicalName}
                          </p>
                        </div>
                        <span className="ml-auto shrink-0 text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                          {CATEGORY_LABELS[p.category]}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {nurseries.length > 0 && (
              <div>
                <p className="eyebrow mb-4 text-ink-faint">Nurseries</p>
                <ul className="grid gap-1 sm:grid-cols-2">
                  {nurseries.map((n) => (
                    <li key={n.id}>
                      <Link
                        href={`/nurseries/${n.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-4 p-2 transition-colors hover:bg-sunken"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{n.name}</p>
                          <p className="truncate text-xs text-ink-faint">
                            {n.area}, {n.city}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Container>
      </div>
    </>
  );
}
