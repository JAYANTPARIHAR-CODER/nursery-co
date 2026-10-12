import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { BRAND, CITIES } from "@/lib/brand";
import { CATEGORY_LABELS } from "@/lib/data/plants";
import { COLLECTIONS } from "@/lib/data/collections";
import { Container } from "@/components/ui/primitives";

const CATEGORY_ENTRIES = Object.entries(CATEGORY_LABELS) as [string, string][];

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink text-ink-invert">
      {/* Partner strip — the revenue pitch, repeated at the end of every page. */}
      <div className="border-b border-white/10">
        <Container wide>
          <div className="flex flex-col items-start gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl text-ink-invert">Run a nursery?</h2>
              <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-ink-invert/60">
                List your stock against our catalogue and reach buyers already searching
                for the plants on your benches. No commission on any sale.
              </p>
            </div>
            <Link
              href="/partner"
              className="shrink-0 border border-ink-invert px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.16em] transition-all duration-150 hover:-translate-y-px hover:bg-ink-invert hover:text-ink"
            >
              See plans &amp; pricing
            </Link>
          </div>
        </Container>
      </div>

      <Container wide>
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <p className="font-display text-base tracking-[0.22em]">{BRAND.wordmark}</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-invert/55">
              {BRAND.tagline}.
            </p>
            <div className="mt-6 flex gap-2">
              {[
                { href: BRAND.social.instagram, Icon: InstagramGlyph, label: "Instagram" },
                { href: BRAND.social.facebook, Icon: FacebookGlyph, label: "Facebook" },
                { href: BRAND.social.youtube, Icon: YoutubeGlyph, label: "YouTube" },
              ].map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex size-9 items-center justify-center border border-white/15 text-ink-invert/70 transition-colors hover:border-white/40 hover:text-ink-invert"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn
            title="Categories"
            links={CATEGORY_ENTRIES.map(([slug, label]) => ({
              href: `/plants?category=${slug}`,
              label,
            }))}
          />
          <FooterColumn
            title="Collections"
            links={COLLECTIONS.map((c) => ({
              href: `/collections/${c.slug}`,
              label: c.title,
            }))}
          />
          <FooterColumn
            title="Cities"
            links={CITIES.map((c) => ({
              href: `/nurseries?city=${encodeURIComponent(c)}`,
              label: `Nurseries in ${c}`,
            }))}
          />

          <div>
            <p className="eyebrow mb-4 text-ink-invert/45">Get in touch</p>
            <ul className="space-y-2.5 text-sm text-ink-invert/65">
              <li>
                <a
                  href={`mailto:${BRAND.email}`}
                  className="inline-flex items-center gap-2 transition-colors hover:text-ink-invert"
                >
                  <Mail className="size-3.5 shrink-0" strokeWidth={1.5} />
                  {BRAND.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${BRAND.phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2 transition-colors hover:text-ink-invert"
                >
                  <Phone className="size-3.5 shrink-0" strokeWidth={1.5} />
                  {BRAND.phone}
                </a>
              </li>
              <li className="pt-1 text-xs text-ink-invert/40">{BRAND.supportHours}</li>
            </ul>

            <p className="eyebrow mt-8 mb-4 text-ink-invert/45">Partners</p>
            <ul className="space-y-2.5 text-sm text-ink-invert/65">
              <li>
                <Link href="/about" className="transition-colors hover:text-ink-invert">
                  About us
                </Link>
              </li>
              <li>
                <Link href="/partner" className="transition-colors hover:text-ink-invert">
                  Plans &amp; pricing
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="transition-colors hover:text-ink-invert">
                  Nursery dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin" className="transition-colors hover:text-ink-invert">
                  Admin console
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 py-7 text-xs text-ink-invert/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {BRAND.name}. Prices and stock are supplied
            by partner nurseries.
          </p>
          <p className="text-ink-invert/30">
            Demo frontend &middot; catalogue data is illustrative
          </p>
        </div>
      </Container>
    </footer>
  );
}

/* Brand glyphs are drawn inline — lucide dropped its brand set in v1, and
   trademarked marks are better kept explicit than pulled from an icon font. */

const glyph = "size-4 fill-current";

function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" className={glyph} aria-hidden focusable="false">
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.8 3.8 0 0 1-1.38-.9 3.8 3.8 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.9 5.9 0 0 0-2.13 1.38A5.9 5.9 0 0 0 .63 4.14c-.3.76-.5 1.64-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13a5.9 5.9 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0Z" />
      <path d="M12 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" />
      <circle cx="18.41" cy="5.59" r="1.44" />
    </svg>
  );
}

function FacebookGlyph() {
  return (
    <svg viewBox="0 0 24 24" className={glyph} aria-hidden focusable="false">
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
    </svg>
  );
}

function YoutubeGlyph() {
  return (
    <svg viewBox="0 0 24 24" className={glyph} aria-hidden focusable="false">
      <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.54 12 3.54 12 3.54s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.19C0 8.08 0 12 0 12s0 3.92.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14C24 15.92 24 12 24 12s0-3.92-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z" />
    </svg>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="eyebrow mb-4 text-ink-invert/45">{title}</p>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-sm text-ink-invert/65 transition-colors hover:text-ink-invert"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
