# Nursery Co. — frontend

A two-sided plant marketplace. **Admin** owns one canonical catalogue of plants;
**nurseries** attach their own stock (price, pot size, quantity) to those entries;
**buyers** open a plant and compare every nursery selling it.

Revenue is a flat nursery subscription — **no commission on sales**, which is why
there is no cart or checkout anywhere in this build.

Frontend only. All data is mock data; nothing persists.

```bash
npm install
npm run dev     # http://localhost:3000
```

| | |
|---|---|
| `npm run build` | production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |

Next.js 16 (App Router) · React 19 · Tailwind v4 · TypeScript

---

## Routes

**Storefront** — `src/app/(store)/`

| Route | What it is |
|---|---|
| `/` | Home: hero, how-it-works, category tiles, plant rails, collections, partners |
| `/plants` | Catalogue with URL-driven filters (category, light, care level, traits, price) |
| `/plants/[slug]` | **The key page.** Plant info + care profile + every nursery selling it |
| `/nurseries` · `/nurseries/[slug]` | Partner directory and profile with their full stock list |
| `/collections` · `/collections/[slug]` | Curated entry points (pet-safe, low-light, beginner…) |
| `/partner` | The revenue page: pricing tiers, onboarding, FAQ, application form |

**Admin console** — `src/app/admin/`
Overview (MRR, coverage gaps, things needing a decision) · plant catalogue CRUD ·
add-plant form · nursery verification · subscription billing.

**Nursery dashboard** — `src/app/dashboard/`
Signed in as Green Canopy Nursery (`src/lib/session.ts`).
Overview with **competitive pricing** (where you're being undercut) · editable stock
table · add stock from the catalogue · enquiry inbox · plan and invoices.

---

## How the data is shaped

`src/lib/types.ts` holds the model. The one rule that makes the whole thing work:

> A nursery **never creates a plant**. It creates an `Offer` against a `Plant` that
> admin already published.

If every nursery could add its own entries, the same monstera would exist fourteen
times and the price comparison would be meaningless.

```
src/lib/
  types.ts          domain model
  catalog.ts        every read goes through here — becomes the API client later
  money.ts          integer paise everywhere, never float rupees
  data/
    plants.ts       24 published + 2 drafts, real botanical care data
    nurseries.ts    14 partners across 6 cities, each on a paid plan
    offers.ts       ~200 listings, generated deterministically
    collections.ts  curated collections + the three pricing tiers
    enquiries.ts    inbound leads for the dashboard
    media.ts        all photography URLs — swap here for your own CDN
```

Two deliberate choices worth knowing:

- **Money is integer paise.** `formatINR(44900)` → `₹449`. No float arithmetic on
  prices anywhere.
- **Offers are generated from a seeded PRNG** (`seeded()` in `utils.ts`), not
  hand-written. Output is identical on server and client, so there are no hydration
  mismatches. The point of the data is the *spread* of prices, not any one number.

Swapping in a real backend means reimplementing the functions in `catalog.ts`.
No page or component needs to change.

---

## Design

Reference points you gave: the two-row centred-wordmark header is modelled on
**theflowercompany.in**; the catalogue and comparison density come from
**interflora.in**.

Tokens live in `src/app/globals.css` under `@theme`. Warm bone paper, deep forest
ink, clay and gold accents — deliberately not the default purple/indigo. Near-square
radii (2px) and hairline borders keep it editorial rather than bubbly. Fraunces for
display, Inter for UI, both self-hosted via `next/font`.

Light-only by design: both reference storefronts are, and a plant catalogue reads
better on warm paper.

---

## Changing things

**Brand name** — `src/lib/brand.ts`. One constant drives the wordmark, metadata and
footer.

**Photography** — `src/lib/data/media.ts`. Every plant, nursery and collection
references an index into one array, so pointing at your own CDN is a single-file
change. Add the host to `images.remotePatterns` in `next.config.ts`.

Current images are generic botanical stock, assigned by index — they are placeholders
and do **not** match the specific plant on each card. Real photography is the single
biggest visual upgrade available here.

**Cities** — `CITIES` in `src/lib/brand.ts`. City is held in the URL (`?city=Pune`)
so server components can filter on it and links stay shareable.

**Pricing tiers** — `PLANS` in `src/lib/data/collections.ts`.

---

## Known gaps

Things deliberately not built, since this is the frontend slice:

- No auth. The nursery dashboard hardcodes one partner; `/admin` is unguarded.
- Nothing persists. Stock edits, enquiry replies and form submissions are local
  state and reset on reload.
- No cart or checkout — by design, per the lead-generation model.
- Distance is a static field per nursery, not real geolocation. It is only shown
  once a city is selected, because distances aren't comparable across cities.
