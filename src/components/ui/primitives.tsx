import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------- layout */

export function Container({
  className,
  children,
  wide = false,
}: {
  className?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-5 sm:px-8",
        wide ? "max-w-[1600px]" : "max-w-[1280px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Section({
  className,
  children,
  tone = "paper",
}: {
  className?: string;
  children: ReactNode;
  tone?: "paper" | "sunken" | "surface" | "ink";
}) {
  const tones = {
    paper: "bg-paper",
    sunken: "bg-sunken",
    surface: "bg-surface",
    ink: "bg-ink text-ink-invert",
  } as const;
  return (
    <section className={cn("py-16 sm:py-20 lg:py-24", tones[tone], className)}>
      {children}
    </section>
  );
}

/**
 * Standard section header: tiny tracked eyebrow, serif title, optional
 * link on the right. Used everywhere so the page rhythm stays consistent.
 */
export function SectionHead({
  eyebrow,
  title,
  blurb,
  action,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  blurb?: string;
  action?: { href: string; label: string };
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-10 flex gap-6",
        align === "center"
          ? "flex-col items-center text-center"
          : "flex-col items-start justify-between sm:flex-row sm:items-end",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && <p className="eyebrow mb-3 text-ink-faint">{eyebrow}</p>}
        <h2 className="text-[clamp(1.75rem,3.2vw,2.5rem)]">{title}</h2>
        {blurb && (
          <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{blurb}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="eyebrow group shrink-0 border-b border-ink pb-1 text-ink transition-opacity hover:opacity-60"
        >
          {action.label}
          <span className="ml-1.5 inline-block transition-transform duration-200 group-hover:translate-x-0.5">
            &rarr;
          </span>
        </Link>
      )}
    </div>
  );
}

/* -------------------------------------------------------------- badges */

type BadgeTone = "neutral" | "leaf" | "clay" | "gold" | "ink" | "danger";

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: "bg-sunken text-ink-muted border-line",
  leaf: "bg-leaf-soft text-leaf border-leaf/20",
  clay: "bg-clay-soft text-clay border-clay/20",
  gold: "bg-gold-soft text-gold border-gold/25",
  ink: "bg-ink text-ink-invert border-ink",
  danger: "bg-[#fdeceb] text-[#a3301f] border-[#a3301f]/20",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[var(--radius-card)] border px-2 py-[3px]",
        "text-[10px] font-medium uppercase tracking-[0.1em] whitespace-nowrap",
        BADGE_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------- rating */

export function Rating({
  value,
  count,
  className,
  showCount = true,
}: {
  value: number;
  count?: number;
  className?: string;
  showCount?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs", className)}>
      <Star className="size-3.5 fill-gold text-gold" strokeWidth={0} aria-hidden />
      <span className="tabular font-medium text-ink">{value.toFixed(1)}</span>
      {showCount && count !== undefined && (
        <span className="tabular text-ink-faint">({count})</span>
      )}
    </span>
  );
}

/* --------------------------------------------------------------- forms */

export function Field({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="eyebrow text-ink-muted">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}

const CONTROL = cn(
  "w-full rounded-[var(--radius-card)] border border-line bg-surface",
  "px-3 text-sm text-ink placeholder:text-ink-faint",
  "transition-colors duration-150 hover:border-line-strong",
  "focus:border-brand-ring focus:outline-none",
);

export function Input({ className, ...rest }: ComponentProps<"input">) {
  return <input className={cn(CONTROL, "h-11", className)} {...rest} />;
}

export function Textarea({ className, ...rest }: ComponentProps<"textarea">) {
  return <textarea className={cn(CONTROL, "min-h-24 py-2.5 leading-relaxed", className)} {...rest} />;
}

export function Select({ className, children, ...rest }: ComponentProps<"select">) {
  return (
    <select className={cn(CONTROL, "h-11 cursor-pointer appearance-none pr-8", className)} {...rest}>
      {children}
    </select>
  );
}

export function Checkbox({
  label,
  className,
  ...rest
}: { label: ReactNode } & ComponentProps<"input">) {
  return (
    <label
      className={cn(
        "group flex cursor-pointer items-center gap-2.5 py-1 text-sm text-ink-muted",
        "transition-colors hover:text-ink",
        className,
      )}
    >
      <input
        type="checkbox"
        className={cn(
          "size-4 shrink-0 cursor-pointer appearance-none rounded-[2px] border border-line-strong bg-surface",
          "transition-all duration-150",
          "checked:border-brand checked:bg-brand",
          "checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22 fill=%22none%22 stroke=%22white%22 stroke-width=%222.5%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M3 8.5l3.2 3.2L13 5%22/></svg>')] checked:bg-center checked:bg-no-repeat",
        )}
        {...rest}
      />
      {label}
    </label>
  );
}

/* ----------------------------------------------------------- feedback */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-[var(--radius-card)]", className)} aria-hidden />;
}

export function EmptyState({
  icon,
  title,
  blurb,
  action,
}: {
  icon?: ReactNode;
  title: string;
  blurb?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-line-strong bg-surface px-6 py-20 text-center">
      {icon && <div className="mb-4 text-ink-faint">{icon}</div>}
      <h3 className="text-xl">{title}</h3>
      {blurb && <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">{blurb}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* --------------------------------------------------------- navigation */

export function Breadcrumbs({
  trail,
}: {
  trail: { href?: string; label: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[11px]">
      {trail.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-2">
          {i > 0 && <span className="text-ink-faint" aria-hidden>/</span>}
          {item.href ? (
            <Link
              href={item.href}
              className="uppercase tracking-[0.12em] text-ink-faint transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ) : (
            <span className="uppercase tracking-[0.12em] text-ink-muted">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/** Thin rule with an optional centred label — used between page sections. */
export function Rule({ label, className }: { label?: string; className?: string }) {
  if (!label) return <hr className={cn("border-line", className)} />;
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <hr className="flex-1 border-line" />
      <span className="eyebrow text-ink-faint">{label}</span>
      <hr className="flex-1 border-line" />
    </div>
  );
}
