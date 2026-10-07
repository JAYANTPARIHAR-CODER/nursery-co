import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/data/plants";
import { LIGHT_LABELS, WATER_LABELS, DIFFICULTY_LABELS } from "@/components/plant/care";
import { PageHead } from "@/components/dash/Shell";
import { Field, Input, Select, Textarea, Checkbox } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";

/**
 * Creating a catalogue entry. Every field here is something a buyer will
 * read or filter on, which is why the care profile is mandatory rather
 * than optional — a half-filled entry breaks the filters for everyone.
 */
export default function NewPlantPage() {
  return (
    <div className="p-5 sm:p-8">
      <Link
        href="/admin/catalogue"
        className="inline-flex items-center gap-2 text-xs text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.5} aria-hidden />
        Back to catalogue
      </Link>

      <div className="mt-5">
        <PageHead
          title="Add a plant"
          blurb="This becomes the single authoritative entry every nursery lists against. Take the time to get the care profile right — the storefront filters depend on it."
        />
      </div>

      <form className="mt-7 max-w-3xl space-y-10">
        {/* ------------------------------------------------- identity */}
        <Fieldset legend="Identity" hint="How the plant is named and classified.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Common name" htmlFor="c-name" hint="What buyers actually search for.">
              <Input id="c-name" name="commonName" required placeholder="Monstera Deliciosa" />
            </Field>
            <Field label="Botanical name" htmlFor="c-bot">
              <Input id="c-bot" name="botanicalName" required placeholder="Monstera deliciosa" />
            </Field>
            <Field label="Family" htmlFor="c-family">
              <Input id="c-family" name="family" placeholder="Araceae" />
            </Field>
            <Field label="Category" htmlFor="c-cat">
              <Select id="c-cat" name="category" defaultValue="">
                <option value="" disabled>
                  Choose a category
                </option>
                {Object.entries(CATEGORY_LABELS).map(([slug, label]) => (
                  <option key={slug} value={slug}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field
            label="One-line summary"
            htmlFor="c-sum"
            hint="Shown on every card. Lead with the single most useful fact, not marketing copy."
          >
            <Input
              id="c-sum"
              name="summary"
              maxLength={110}
              placeholder="The split-leaf classic. Fast, forgiving and architectural once it matures."
            />
          </Field>

          <Field
            label="Full description"
            htmlFor="c-desc"
            hint="Two or three sentences a buyer could not get from a photo — what it is actually like to live with."
          >
            <Textarea id="c-desc" name="description" rows={5} />
          </Field>
        </Fieldset>

        {/* ----------------------------------------------------- care */}
        <Fieldset
          legend="Care profile"
          hint="Every field here powers a storefront filter. Incomplete entries get held as drafts."
        >
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Light" htmlFor="c-light">
              <Select id="c-light" name="light" defaultValue="bright-indirect">
                {Object.entries(LIGHT_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Water need" htmlFor="c-water">
              <Select id="c-water" name="water" defaultValue="moderate">
                {Object.entries(WATER_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Water every (days)" htmlFor="c-days">
              <Input
                id="c-days"
                name="waterEveryDays"
                type="number"
                min={1}
                max={60}
                defaultValue={7}
                className="tabular"
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Humidity" htmlFor="c-hum">
              <Input id="c-hum" name="humidity" placeholder="50–70%, mist in dry months" />
            </Field>
            <Field label="Temperature" htmlFor="c-temp">
              <Input id="c-temp" name="temperature" placeholder="18–30°C" />
            </Field>
            <Field label="Soil" htmlFor="c-soil">
              <Input id="c-soil" name="soil" placeholder="Chunky aroid mix — bark, perlite" />
            </Field>
            <Field label="Feeding" htmlFor="c-fert">
              <Input id="c-fert" name="fertiliser" placeholder="Balanced NPK monthly, Mar–Oct" />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Difficulty" htmlFor="c-diff">
              <Select id="c-diff" name="difficulty" defaultValue="easy">
                {Object.entries(DIFFICULTY_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Mature size" htmlFor="c-size">
              <Input id="c-size" name="matureSize" placeholder="2–3 m indoors" />
            </Field>
            <Field label="Growth rate" htmlFor="c-growth">
              <Select id="c-growth" name="growthRate" defaultValue="Moderate">
                <option>Slow</option>
                <option>Moderate</option>
                <option>Fast</option>
              </Select>
            </Field>
          </div>
        </Fieldset>

        {/* --------------------------------------------------- traits */}
        <Fieldset legend="Traits" hint="These drive the curated collections and the safety notice.">
          <div className="grid gap-x-8 sm:grid-cols-2">
            <Checkbox
              name="petSafe"
              label={
                <span>
                  Safe around pets{" "}
                  <span className="text-ink-faint">— non-toxic to cats and dogs</span>
                </span>
              }
            />
            <Checkbox name="airPurifying" label="Air purifying" />
            <Checkbox name="lowMaintenance" label="Low maintenance" />
            <Checkbox name="flowering" label="Flowering" />
          </div>

          <div className="mt-4 flex gap-3 border border-line bg-sunken p-4">
            <Info className="mt-px size-4 shrink-0 text-ink-faint" strokeWidth={1.5} aria-hidden />
            <p className="text-xs leading-relaxed text-ink-muted">
              Pet safety is the one field worth double-checking against a veterinary
              source before publishing. A wrong value here is the only mistake on this
              form that can hurt someone&rsquo;s animal.
            </p>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Placement" htmlFor="c-place">
              <Select id="c-place" name="placement" defaultValue="indoor">
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
                <option value="both">Both</option>
              </Select>
            </Field>
            <Field label="Tags" htmlFor="c-tags" hint="Comma separated — statement, trailing, beginner.">
              <Input id="c-tags" name="tags" placeholder="statement, climbing, large-leaf" />
            </Field>
          </div>
        </Fieldset>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line pt-6">
          <Button type="button" variant="ghost">
            Save as draft
          </Button>
          <Button type="submit">Publish to storefront</Button>
        </div>
      </form>
    </div>
  );
}

function Fieldset({
  legend,
  hint,
  children,
}: {
  legend: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-5">
      <div className="border-b border-line pb-3">
        <legend className="font-display text-xl">{legend}</legend>
        {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
      </div>
      {children}
    </fieldset>
  );
}
