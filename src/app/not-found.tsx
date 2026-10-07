import Link from "next/link";
import { BRAND } from "@/lib/brand";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Link
        href="/"
        className="font-display text-sm tracking-[0.24em] transition-opacity hover:opacity-60"
      >
        {BRAND.wordmark}
      </Link>

      <p className="eyebrow mt-14 text-ink-faint">Error 404</p>
      <h1 className="mt-4 text-[clamp(2rem,6vw,3.5rem)]">This one did not take root.</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
        The page you are after has been moved or never existed. The catalogue is still
        where you left it.
      </p>

      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/plants"
          className="inline-flex h-12 items-center justify-center bg-brand px-8 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-invert transition-all duration-150 hover:-translate-y-px hover:bg-brand-hover active:scale-[0.99]"
        >
          Browse plants
        </Link>
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center border border-line-strong px-8 text-[11px] font-medium uppercase tracking-[0.16em] transition-all duration-150 hover:-translate-y-px hover:border-ink"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
