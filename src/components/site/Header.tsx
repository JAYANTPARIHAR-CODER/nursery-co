"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Search, Store, User, X, ChevronDown } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { CATEGORY_LABELS } from "@/lib/data/plants";
import { COLLECTIONS } from "@/lib/data/collections";
import { photoUrl } from "@/lib/data/media";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui/Button";
import { Container } from "@/components/ui/primitives";
import { CityPicker } from "./CityPicker";
import { SearchOverlay } from "./SearchOverlay";

/**
 * Two-row header, modelled on The Flower Company's: utility row with a
 * centred wordmark, then a row of wide-tracked uppercase links with an
 * underline indicator. Collapses to a single row with a drawer on mobile.
 */

const CATEGORY_ENTRIES = Object.entries(CATEGORY_LABELS) as [
  keyof typeof CATEGORY_LABELS,
  string,
][];

type MenuKey = "plants" | "collections" | null;

export function Header() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Close every overlay on navigation.
     Adjusted during render rather than in an effect — React re-renders
     before committing, so the menu never paints open on the new page. */
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpenMenu(null);
    setDrawerOpen(false);
    setSearchOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenu(null);
        setDrawerOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock scroll behind the mobile drawer.
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  /* Hover intent: a short close delay keeps the menu from snapping shut
     while the pointer crosses the gap between trigger and panel. */
  const hoverOpen = (key: MenuKey) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(key);
  };
  const hoverClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 140);
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <AnnouncementBar />

      <header
        className={cn(
          "sticky top-0 z-50 bg-surface/95 backdrop-blur-sm transition-shadow duration-300",
          condensed ? "shadow-[0_1px_0_var(--color-line),0_6px_20px_-18px_rgba(20,36,27,0.5)]" : "shadow-[0_1px_0_var(--color-line)]",
        )}
        onMouseLeave={hoverClose}
      >
        {/* ---------------------------------------------- utility row */}
        <Container wide>
          <div
            className={cn(
              "grid grid-cols-[1fr_auto_1fr] items-center transition-[height] duration-300",
              condensed ? "h-14" : "h-16 sm:h-[72px]",
            )}
          >
            <div className="flex items-center gap-1">
              <IconButton
                label="Open menu"
                className="lg:hidden"
                onClick={() => setDrawerOpen(true)}
              >
                <Menu className="size-[18px]" strokeWidth={1.5} />
              </IconButton>
              <div className="hidden lg:block">
                <CityPicker />
              </div>
            </div>

            <Link
              href="/"
              className="group text-center transition-opacity hover:opacity-70"
              aria-label={`${BRAND.name} home`}
            >
              <span
                className={cn(
                  "font-display whitespace-nowrap transition-all duration-300",
                  condensed
                    ? "text-[15px] tracking-[0.22em]"
                    : "text-[17px] tracking-[0.26em] sm:text-xl",
                )}
              >
                {BRAND.wordmark}
              </span>
            </Link>

            <div className="flex items-center justify-end gap-0.5">
              <IconButton label="Search plants" onClick={() => setSearchOpen(true)}>
                <Search className="size-[18px]" strokeWidth={1.5} />
              </IconButton>
              <Link
                href="/partner"
                className="hidden items-center gap-1.5 px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted transition-colors hover:text-ink md:inline-flex"
              >
                <Store className="size-4" strokeWidth={1.5} />
                List your nursery
              </Link>
              <IconButton label="Account">
                <User className="size-[18px]" strokeWidth={1.5} />
              </IconButton>
            </div>
          </div>
        </Container>

        {/* ------------------------------------------------- nav row */}
        <div className="hidden border-t border-line lg:block">
          <Container wide>
            <nav className="flex items-center justify-center gap-9" aria-label="Main">
              <MenuTrigger
                label="All Plants"
                href="/plants"
                open={openMenu === "plants"}
                active={isActive("/plants")}
                onEnter={() => hoverOpen("plants")}
                onToggle={() => setOpenMenu(openMenu === "plants" ? null : "plants")}
              />
              <MenuTrigger
                label="Collections"
                href="/collections"
                open={openMenu === "collections"}
                active={isActive("/collections")}
                onEnter={() => hoverOpen("collections")}
                onToggle={() =>
                  setOpenMenu(openMenu === "collections" ? null : "collections")
                }
              />
              <Link
                href="/nurseries"
                className="nav-link"
                data-active={isActive("/nurseries")}
                onMouseEnter={hoverClose}
              >
                Nurseries
              </Link>
              <Link
                href="/partner"
                className="nav-link"
                data-active={isActive("/partner")}
                onMouseEnter={hoverClose}
              >
                For Nurseries
              </Link>
            </nav>
          </Container>
        </div>

        {/* ----------------------------------------------- mega menu */}
        {openMenu && (
          <div
            className="absolute inset-x-0 top-full hidden border-t border-line bg-surface shadow-[var(--shadow-pop)] lg:block"
            onMouseEnter={() => hoverOpen(openMenu)}
            onMouseLeave={hoverClose}
          >
            <Container wide>
              {openMenu === "plants" ? <PlantsMenu /> : <CollectionsMenu />}
            </Container>
          </div>
        )}
      </header>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

/* ------------------------------------------------------------- pieces */

function AnnouncementBar() {
  return (
    <div className="bg-ink text-ink-invert">
      <Container wide>
        <p className="flex items-center justify-center gap-2 py-2 text-center text-[10px] uppercase tracking-[0.18em]">
          <span>Live stock from 14 verified nurseries</span>
          <span className="text-ink-invert/35" aria-hidden>
            &middot;
          </span>
          <span className="hidden sm:inline">Compare prices before you buy</span>
          <span className="text-ink-invert/35 hidden sm:inline" aria-hidden>
            &middot;
          </span>
          <Link href="/partner" className="underline underline-offset-4 hover:opacity-70">
            List your nursery
          </Link>
        </p>
      </Container>
    </div>
  );
}

function MenuTrigger({
  label,
  href,
  open,
  active,
  onEnter,
  onToggle,
}: {
  label: string;
  href: string;
  open: boolean;
  active: boolean;
  onEnter: () => void;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center" onMouseEnter={onEnter}>
      <Link href={href} className="nav-link" data-active={active}>
        {label}
      </Link>
      <button
        type="button"
        aria-label={`${open ? "Hide" : "Show"} ${label} menu`}
        aria-expanded={open}
        onClick={onToggle}
        className="ml-1 text-ink-faint transition-colors hover:text-ink"
      >
        <ChevronDown
          className={cn("size-3 transition-transform duration-200", open && "rotate-180")}
          strokeWidth={2}
        />
      </button>
    </div>
  );
}

function PlantsMenu() {
  const featured = COLLECTIONS[0];
  return (
    <div className="animate-fade grid grid-cols-[1.6fr_1fr_0.9fr] gap-10 py-9">
      <div>
        <p className="eyebrow mb-5 text-ink-faint">Browse by category</p>
        <ul className="grid grid-cols-2 gap-x-8 gap-y-1">
          {CATEGORY_ENTRIES.map(([slug, label]) => (
            <li key={slug}>
              <Link
                href={`/plants?category=${slug}`}
                className="group flex items-center justify-between py-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
              >
                {label}
                <span className="opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100">
                  &rarr;
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="eyebrow mb-5 text-ink-faint">Shop by need</p>
        <ul className="space-y-1">
          {COLLECTIONS.slice(0, 5).map((c) => (
            <li key={c.slug}>
              <Link
                href={`/collections/${c.slug}`}
                className="block py-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
              >
                {c.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <Link href={`/collections/${featured.slug}`} className="group block">
        <div className="photo-well relative aspect-[4/5] overflow-hidden">
          <Image
            src={photoUrl(featured.photo, 500)}
            alt=""
            fill
            sizes="260px"
            className="object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-105"
          />
        </div>
        <p className="eyebrow mt-3 text-ink-faint">Featured</p>
        <p className="font-display mt-1 text-lg">{featured.title}</p>
      </Link>
    </div>
  );
}

function CollectionsMenu() {
  return (
    <div className="animate-fade grid grid-cols-3 gap-x-10 gap-y-6 py-9">
      {COLLECTIONS.map((c) => (
        <Link key={c.slug} href={`/collections/${c.slug}`} className="group flex gap-4">
          <div className="photo-well relative size-16 shrink-0 overflow-hidden">
            <Image
              src={photoUrl(c.photo, 160)}
              alt=""
              fill
              sizes="64px"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div className="min-w-0">
            <p className="font-display text-base transition-opacity group-hover:opacity-70">
              {c.title}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{c.tagline}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-ink/35 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-[61] flex w-[min(21rem,88vw)] flex-col bg-surface lg:hidden",
          "transition-transform duration-300 ease-[var(--ease-out-soft)]",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!open}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <span className="font-display text-sm tracking-[0.22em]">{BRAND.wordmark}</span>
          <IconButton label="Close menu" onClick={onClose}>
            <X className="size-[18px]" strokeWidth={1.5} />
          </IconButton>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          <div className="mb-6">
            <CityPicker />
          </div>

          <p className="eyebrow mb-3 text-ink-faint">Categories</p>
          <ul className="mb-8 space-y-0.5">
            {CATEGORY_ENTRIES.map(([slug, label]) => (
              <li key={slug}>
                <Link
                  href={`/plants?category=${slug}`}
                  className="block border-b border-line py-3 text-sm text-ink-muted transition-colors hover:text-ink"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="eyebrow mb-3 text-ink-faint">Collections</p>
          <ul className="mb-8 space-y-0.5">
            {COLLECTIONS.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/collections/${c.slug}`}
                  className="block border-b border-line py-3 text-sm text-ink-muted transition-colors hover:text-ink"
                >
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>

          <ul className="space-y-0.5">
            {[
              { href: "/plants", label: "All Plants" },
              { href: "/nurseries", label: "Nurseries" },
              { href: "/partner", label: "List your nursery" },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="block border-b border-line py-3 text-[11px] font-medium uppercase tracking-[0.14em]"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
