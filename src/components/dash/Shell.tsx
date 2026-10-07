"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ArrowLeft,
  LayoutDashboard,
  Leaf,
  Store,
  CreditCard,
  Boxes,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui/Button";

/**
 * Icons are addressed by key rather than passed as components.
 *
 * Both consoles build their nav in a server layout, and a React component
 * is a function — functions cannot cross the server/client boundary. A
 * string key serialises fine and resolves here, on the client.
 */
const ICONS = {
  overview: LayoutDashboard,
  catalogue: Leaf,
  nurseries: Store,
  billing: CreditCard,
  stock: Boxes,
  enquiries: Inbox,
} satisfies Record<string, LucideIcon>;

export type IconKey = keyof typeof ICONS;

export interface NavItem {
  href: string;
  label: string;
  icon: IconKey;
  badge?: number;
}

/**
 * Chrome shared by both consoles.
 *
 * Deliberately a different shape from the storefront — dense, left-rail,
 * near-monochrome. An operator tool should not feel like a shop window,
 * and the visual break makes it obvious which side of the marketplace
 * you are looking at.
 */
export function DashShell({
  nav,
  title,
  subtitle,
  accent,
  children,
}: {
  nav: NavItem[];
  title: string;
  subtitle: string;
  accent: "admin" | "nursery";
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === pathname || (href !== "/admin" && href !== "/dashboard" && pathname.startsWith(href));

  const rail = (
    <div className="flex h-full flex-col">
      <div className="border-b border-line px-5 py-5">
        <Link href="/" className="inline-flex items-center gap-2 text-ink-faint transition-colors hover:text-ink">
          <ArrowLeft className="size-3.5" strokeWidth={1.5} aria-hidden />
          <span className="text-[10px] uppercase tracking-[0.16em]">
            {BRAND.wordmark}
          </span>
        </Link>
        <p className="mt-3 font-display text-lg leading-tight">{title}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-muted">
          <span
            className={cn(
              "inline-block size-1.5 rounded-full",
              accent === "admin" ? "bg-clay" : "bg-leaf",
            )}
            aria-hidden
          />
          {subtitle}
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto p-3" aria-label={title}>
        <ul className="space-y-0.5">
          {nav.map(({ href, label, icon, badge }) => {
            const Icon = ICONS[icon];
            return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-[var(--radius-card)] px-3 py-2.5 text-sm transition-colors duration-150",
                  isActive(href)
                    ? "bg-ink font-medium text-ink-invert"
                    : "text-ink-muted hover:bg-sunken hover:text-ink",
                )}
              >
                <Icon className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
                <span className="flex-1">{label}</span>
                {badge !== undefined && badge > 0 && (
                  <span
                    className={cn(
                      "tabular inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                      isActive(href) ? "bg-white/20" : "bg-clay text-white",
                    )}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-line p-4">
        <p className="text-[11px] leading-relaxed text-ink-faint">
          Demo console. Edits are not persisted — this is a frontend prototype.
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh bg-paper">
      {/* Desktop rail */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-line bg-surface lg:block">
        {rail}
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-ink/35 transition-opacity duration-250 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[61] w-64 border-r border-line bg-surface lg:hidden",
          "transition-transform duration-300 ease-[var(--ease-out-soft)]",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Console navigation"
        aria-hidden={!open}
      >
        <div className="absolute top-3 right-3">
          <IconButton label="Close navigation" onClick={() => setOpen(false)}>
            <X className="size-[18px]" strokeWidth={1.5} />
          </IconButton>
        </div>
        {rail}
      </aside>

      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur-sm lg:hidden">
          <IconButton label="Open navigation" onClick={() => setOpen(true)}>
            <Menu className="size-[18px]" strokeWidth={1.5} />
          </IconButton>
          <span className="font-display text-base">{title}</span>
        </div>
        <main id="main">{children}</main>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ pieces */

export function PageHead({
  title,
  blurb,
  action,
}: {
  title: string;
  blurb?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)]">{title}</h1>
        {blurb && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">{blurb}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "neutral" | "good" | "warn";
}) {
  return (
    <div className="border border-line bg-surface p-5">
      <p className="eyebrow text-ink-faint">{label}</p>
      <p
        className={cn(
          "tabular mt-3 font-display text-3xl leading-none",
          tone === "good" && "text-leaf",
          tone === "warn" && "text-clay",
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-2 text-xs text-ink-muted">{sub}</p>}
    </div>
  );
}

/**
 * Horizontally scrollable table wrapper — the page itself must never
 * scroll sideways, so wide tables scroll inside their own box.
 *
 * `minW` is the width below which columns start to crowd. Narrow tables
 * placed in a split layout need a smaller floor than full-width ones, or
 * they overflow a half-width column for no reason.
 */
export function TableWrap({
  children,
  minW = "46rem",
}: {
  children: React.ReactNode;
  minW?: string;
}) {
  return (
    <div className="overflow-x-auto border border-line bg-surface">
      <table className="w-full text-sm" style={{ minWidth: minW }}>
        {children}
      </table>
    </div>
  );
}

export function Th({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={cn(
        "border-b border-line px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[0.12em] text-ink-faint",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <td className={cn("px-4 py-3 align-middle", className)}>{children}</td>;
}
