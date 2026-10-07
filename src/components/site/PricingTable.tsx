"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { PLANS } from "@/lib/data/collections";
import { formatINR } from "@/lib/money";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/primitives";

/**
 * Plan cards with a billing-period toggle.
 *
 * Annual is priced at ten months for twelve, so the saving is stated as a
 * real number rather than a vague "save more" — nurseries running on thin
 * margins will do the arithmetic either way.
 */
export function PricingTable() {
  const [annual, setAnnual] = useState(false);

  return (
    <div>
      <div className="mb-10 flex justify-center">
        <div
          className="inline-flex rounded-[var(--radius-pill)] border border-line bg-surface p-1"
          role="group"
          aria-label="Billing period"
        >
          {[
            { value: false, label: "Monthly" },
            { value: true, label: "Annual · 2 months free" },
          ].map((o) => (
            <button
              key={String(o.value)}
              type="button"
              aria-pressed={annual === o.value}
              onClick={() => setAnnual(o.value)}
              className={cn(
                "rounded-[var(--radius-pill)] px-5 py-2 text-[11px] font-medium uppercase tracking-[0.1em] transition-all duration-200",
                annual === o.value
                  ? "bg-ink text-ink-invert"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const paise = annual ? plan.annualPaise : plan.monthlyPaise;
          const perMonth = annual ? Math.round(plan.annualPaise / 12) : plan.monthlyPaise;
          const saving = plan.monthlyPaise * 12 - plan.annualPaise;

          return (
            <div
              key={plan.tier}
              className={cn(
                "relative flex flex-col border bg-surface p-7 transition-all duration-200 ease-[var(--ease-out-soft)]",
                plan.highlight
                  ? "border-brand shadow-[var(--shadow-raise)] lg:-mt-3 lg:mb-3"
                  : "border-line hover:border-line-strong",
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-2.5 left-7">
                  <Badge tone="ink">Most popular</Badge>
                </div>
              )}

              <div>
                <h3 className="font-display text-2xl">{plan.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                  {plan.blurb}
                </p>
              </div>

              <div className="mt-7 border-y border-line py-6">
                <p className="tabular font-display text-4xl leading-none">
                  {formatINR(paise)}
                  <span className="ml-1.5 text-sm text-ink-faint">
                    /{annual ? "year" : "month"}
                  </span>
                </p>
                <p className="mt-2 text-xs text-ink-faint">
                  {annual ? (
                    <>
                      <span className="tabular">{formatINR(perMonth)}</span> a month ·
                      saves <span className="tabular text-leaf">{formatINR(saving)}</span>
                    </>
                  ) : (
                    "Billed monthly, cancel any time"
                  )}
                </p>
                <p className="mt-3 text-xs text-ink-muted">
                  <span className="font-medium text-ink">
                    {plan.listingLimit === "unlimited"
                      ? "Unlimited"
                      : plan.listingLimit}
                  </span>{" "}
                  live listings · <span className="text-leaf">0% commission</span>
                </p>
              </div>

              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm text-ink-muted">
                    <Check
                      className="mt-0.5 size-3.5 shrink-0 text-brand"
                      strokeWidth={2}
                      aria-hidden
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#apply"
                className={cn(
                  "mt-8 inline-flex h-12 items-center justify-center rounded-[var(--radius-card)] border text-[11px] font-medium uppercase tracking-[0.14em]",
                  "transition-all duration-150 hover:-translate-y-px active:scale-[0.99]",
                  plan.highlight
                    ? "border-brand bg-brand text-ink-invert hover:bg-brand-hover"
                    : "border-line-strong text-ink hover:border-ink hover:bg-sunken",
                )}
              >
                Start with {plan.name}
              </a>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-xs text-ink-faint">
        All plans include a 30-day trial. No card required to start, and no commission on
        any sale at any tier.
      </p>
    </div>
  );
}
