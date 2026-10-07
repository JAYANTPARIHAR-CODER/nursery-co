import type { ReactNode } from "react";
import Link from "next/link";
import {
  Droplets,
  Sun,
  Thermometer,
  Sprout,
  FlaskConical,
  Gauge,
  Ruler,
  Wind,
  PawPrint,
  AlertTriangle,
} from "lucide-react";
import type { Difficulty, LightNeed, Plant, WaterNeed } from "@/lib/types";
import { cn } from "@/lib/utils";

export const LIGHT_LABELS: Record<LightNeed, string> = {
  low: "Low light",
  "bright-indirect": "Bright, indirect",
  "full-sun": "Full sun",
};

export const WATER_LABELS: Record<WaterNeed, string> = {
  low: "Sparing",
  moderate: "Moderate",
  high: "Thirsty",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  moderate: "Moderate",
  expert: "Needs experience",
};

/** A labelled care fact. Icon, tiny label, value. */
export function CareStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 border-t border-line py-4">
      <span className="mt-0.5 shrink-0 text-ink-faint" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="eyebrow text-ink-faint">{label}</p>
        <p className="mt-1 text-sm leading-snug text-ink">{value}</p>
      </div>
    </div>
  );
}

/** The full care panel on a plant page. */
export function CarePanel({ plant }: { plant: Plant }) {
  const i = (Icon: typeof Sun) => <Icon className="size-4" strokeWidth={1.5} />;

  return (
    <div className="grid gap-x-10 sm:grid-cols-2">
      <CareStat icon={i(Sun)} label="Light" value={LIGHT_LABELS[plant.care.light]} />
      <CareStat
        icon={i(Droplets)}
        label="Water"
        value={`${WATER_LABELS[plant.care.water]} — roughly every ${plant.care.waterEveryDays} days`}
      />
      <CareStat icon={i(Wind)} label="Humidity" value={plant.care.humidity} />
      <CareStat icon={i(Thermometer)} label="Temperature" value={plant.care.temperature} />
      <CareStat icon={i(Sprout)} label="Soil" value={plant.care.soil} />
      <CareStat icon={i(FlaskConical)} label="Feeding" value={plant.care.fertiliser} />
      <CareStat
        icon={i(Gauge)}
        label="Difficulty"
        value={`${DIFFICULTY_LABELS[plant.difficulty]} — ${plant.growthRate.toLowerCase()} growing`}
      />
      <CareStat icon={i(Ruler)} label="Mature size" value={plant.matureSize} />
    </div>
  );
}

/**
 * Toxicity notice. Stated plainly and only when the plant is actually
 * toxic — a reassuring green box on every page would train people to
 * ignore the one that matters.
 */
export function PetSafetyNote({ plant }: { plant: Plant }) {
  if (plant.traits.petSafe) {
    return (
      <div className="flex gap-3 border border-leaf/25 bg-leaf-soft p-4">
        <PawPrint className="mt-px size-4 shrink-0 text-leaf" strokeWidth={1.75} aria-hidden />
        <p className="text-sm leading-relaxed text-ink">
          <span className="font-medium">Safe around pets.</span> Non-toxic to cats and
          dogs if nibbled. Still worth discouraging — any plant matter upsets a stomach
          in quantity.
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-3 border border-clay/25 bg-clay-soft p-4">
      <AlertTriangle
        className="mt-px size-4 shrink-0 text-clay"
        strokeWidth={1.75}
        aria-hidden
      />
      <p className="text-sm leading-relaxed text-ink">
        <span className="font-medium">Keep away from pets.</span> {plant.commonName} is
        toxic to cats and dogs if chewed, usually causing mouth irritation and vomiting.
        Place it out of reach, or browse{" "}
        <Link href="/collections/pet-safe" className="underline underline-offset-4">
          pet-safe alternatives
        </Link>
        .
      </p>
    </div>
  );
}

/** Compact three-dot scale used in dense listings. */
export function CareScale({
  level,
  max = 3,
  className,
}: {
  level: number;
  max?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex gap-1", className)} aria-hidden>
      {Array.from({ length: max }, (_, idx) => (
        <span
          key={idx}
          className={cn(
            "size-1.5 rounded-full",
            idx < level ? "bg-brand" : "bg-line-strong",
          )}
        />
      ))}
    </span>
  );
}
