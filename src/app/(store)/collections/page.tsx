import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { COLLECTIONS, collectionCount } from "@/lib/catalog";
import { photoUrl } from "@/lib/data/media";
import { Container, SectionHead, Breadcrumbs } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Curated entry points into the catalogue — pet-safe plants, low-light corners, air purifiers and more.",
};

export default function CollectionsPage() {
  return (
    <>
      <div className="border-b border-line bg-surface">
        <Container wide className="py-9">
          <Breadcrumbs trail={[{ href: "/", label: "Home" }, { label: "Collections" }]} />
          <SectionHead
            className="mt-6 mb-0"
            eyebrow="Curated"
            title="Collections"
            blurb="Start from the constraint rather than the plant. Pick the thing that actually governs your choice — a cat, a dim room, a desk — and we will narrow the catalogue to what genuinely works."
          />
        </Container>
      </div>

      <Container wide className="py-12">
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2">
          {COLLECTIONS.map((c, i) => (
            <Link key={c.slug} href={`/collections/${c.slug}`} className="group block">
              <div className="photo-well relative aspect-[16/10] overflow-hidden">
                <Image
                  src={photoUrl(c.photo, 900)}
                  alt=""
                  fill
                  priority={i < 2}
                  sizes="(min-width:640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-105"
                />
              </div>
              <div className="pt-5">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-display text-2xl transition-opacity group-hover:opacity-65">
                    {c.title}
                  </h2>
                  <span className="tabular shrink-0 text-xs text-ink-faint">
                    {collectionCount(c)} plants
                  </span>
                </div>
                <p className="eyebrow mt-2 text-ink-faint">{c.tagline}</p>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
                  {c.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
}
