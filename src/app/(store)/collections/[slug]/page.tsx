import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCollection, plantsInCollection, COLLECTIONS } from "@/lib/catalog";
import { photoUrl } from "@/lib/data/media";
import { Container, Section, SectionHead, Breadcrumbs } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { PlantGrid } from "@/components/plant/PlantCard";

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) return { title: "Collection not found" };
  return {
    title: collection.title,
    description: collection.description,
    openGraph: { images: [{ url: photoUrl(collection.photo, 1200) }] },
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ city?: string }>;
}) {
  const [{ slug }, { city }] = await Promise.all([params, searchParams]);

  const collection = getCollection(slug);
  if (!collection) notFound();

  const plants = plantsInCollection(slug);

  return (
    <>
      <div className="photo-well relative overflow-hidden">
        <Image
          src={photoUrl(collection.photo, 1800, 72)}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/55 to-ink/30" aria-hidden />
        <Container wide className="relative py-20 sm:py-28">
          <div className="max-w-2xl text-ink-invert">
            <Breadcrumbs
              trail={[
                { href: "/", label: "Home" },
                { href: "/collections", label: "Collections" },
                { label: collection.title },
              ]}
            />
            <p className="eyebrow mt-6 text-ink-invert/65">{collection.tagline}</p>
            <h1 className="mt-4 text-[clamp(2.2rem,5vw,3.75rem)] leading-[1.05]">
              {collection.title}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink-invert/75">
              {collection.description}
            </p>
          </div>
        </Container>
      </div>

      <Container wide className="py-12">
        <p className="tabular mb-8 border-b border-line pb-4 text-sm text-ink-muted">
          <span className="font-medium text-ink">{plants.length}</span>{" "}
          {plants.length === 1 ? "plant" : "plants"} in this collection
          {city && <span className="text-ink-faint"> · showing stock in {city}</span>}
        </p>
        <PlantGrid plants={plants} city={city} />
      </Container>

      <Section tone="sunken" className="py-14">
        <Container wide>
          <SectionHead
            className="mb-0"
            align="center"
            eyebrow="Keep looking"
            title="Browse every collection"
            blurb="Six ways into the catalogue, each built around a constraint that actually governs what will survive in your home."
          />
          <div className="mt-8 flex justify-center">
            <ButtonLink href="/collections" variant="outline">
              All collections
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
