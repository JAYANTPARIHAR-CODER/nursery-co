"use client";

import { useCallback, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MapPin, ChevronDown } from "lucide-react";
import { CITIES } from "@/lib/brand";

const ALL = "All cities";
const STORAGE_KEY = "nco.city";
const CHANGE_EVENT = "nco:city-change";

/**
 * City lives in the URL (`?city=Pune`) so server components can filter on
 * it and a link stays shareable. The last choice is mirrored into
 * localStorage and reapplied on the next visit.
 *
 * Read through `useSyncExternalStore` rather than an effect: the value
 * exists only on the client, and this is the one hook that stays
 * hydration-safe (it serves the server snapshot during hydration, then
 * swaps) without a setState-in-effect cascade.
 *
 * Deliberately avoids `useSearchParams` — this renders inside the root
 * layout, and that hook would opt every route out of static rendering.
 */

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function getSnapshot(): string {
  const fromUrl = new URLSearchParams(window.location.search).get("city");
  if (fromUrl) return fromUrl;
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? ALL;
  } catch {
    // Private browsing can refuse storage reads.
    return ALL;
  }
}

/** The server has no city — render the neutral default so markup matches. */
const getServerSnapshot = () => ALL;

export function CityPicker({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const city = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const onChange = useCallback(
    (next: string) => {
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // The URL still carries the choice even if storage is unavailable.
      }

      const params = new URLSearchParams(window.location.search);
      if (next === ALL) params.delete("city");
      else params.set("city", next);
      // Results reset to the first page whenever the city changes.
      params.delete("page");

      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      // router.push does not fire popstate, so nudge the store ourselves.
      window.dispatchEvent(new Event(CHANGE_EVENT));
    },
    [pathname, router],
  );

  return (
    <div className={className}>
      <label className="group relative flex cursor-pointer items-center gap-1.5 text-ink-muted transition-colors hover:text-ink">
        <MapPin className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
        <span className="text-[11px] font-medium uppercase tracking-[0.12em]">{city}</span>
        <ChevronDown className="size-3 shrink-0" strokeWidth={2} aria-hidden />
        <select
          aria-label="Choose your city"
          value={city}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        >
          <option value={ALL}>{ALL}</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
