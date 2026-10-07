import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "clay" | "quiet";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand text-ink-invert hover:bg-brand-hover border border-brand hover:border-brand-hover",
  outline:
    "bg-transparent text-ink border border-line-strong hover:border-ink hover:bg-sunken",
  ghost: "bg-transparent text-ink border border-transparent hover:bg-sunken",
  clay: "bg-clay text-white border border-clay hover:brightness-95",
  quiet:
    "bg-surface text-ink border border-line hover:border-line-strong shadow-[var(--shadow-raise)]",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[11px] tracking-[0.12em]",
  md: "h-11 px-6 text-[11px] tracking-[0.16em]",
  lg: "h-13 px-8 text-xs tracking-[0.16em]",
};

const BASE = cn(
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-card)]",
  "font-medium uppercase whitespace-nowrap select-none",
  "transition-[transform,background-color,border-color,box-shadow,filter]",
  "duration-150 ease-[var(--ease-out-soft)]",
  "hover:-translate-y-px active:translate-y-0 active:scale-[0.985]",
  "disabled:pointer-events-none disabled:opacity-45",
);

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & ComponentProps<"button">) {
  return (
    <button className={cn(BASE, VARIANTS[variant], SIZES[size], className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link className={cn(BASE, VARIANTS[variant], SIZES[size], className)} {...rest}>
      {children}
    </Link>
  );
}

/** Square icon-only control for header and toolbar use. */
export function IconButton({
  className,
  label,
  children,
  ...rest
}: { label: string; children: ReactNode } & ComponentProps<"button">) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-[var(--radius-card)]",
        "text-ink-muted transition-colors duration-150 hover:bg-sunken hover:text-ink",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
