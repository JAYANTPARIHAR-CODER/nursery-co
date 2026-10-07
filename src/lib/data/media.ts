/**
 * Shared photography pool.
 *
 * Every plant, nursery and collection references an index into this array
 * rather than carrying its own URL, so swapping the whole site over to real
 * nursery photography is a single-file change. Point `base` at your own CDN
 * and replace the ids; nothing downstream needs to move.
 *
 * Hosts must also be allow-listed in next.config.ts -> images.remotePatterns.
 */

const base = "https://images.unsplash.com";

const IDS = [
  "photo-1416879595882-3373a0480b5b",
  "photo-1485955900006-10f4d324d411",
  "photo-1509423350716-97f9360b4e09",
  "photo-1512428813834-c702c7702b78",
  "photo-1521334884684-d80222895322",
  "photo-1593482892290-f54927ae1bb6",
  "photo-1508022713622-df2d8fb7b4cd",
  "photo-1463154545680-d59320fd685d",
  "photo-1545241047-6083a3684587",
  "photo-1459156212016-c812468e2115",
  "photo-1470058869958-2a77ade41c02",
  "photo-1572688484438-313a6e50c333",
  "photo-1587049352846-4a222e784d38",
  "photo-1536566482680-fca31930a0bd",
  "photo-1485833077593-4278bba3f11f",
  "photo-1502082553048-f009c37129b9",
  "photo-1524758631624-e2822e304c36",
  "photo-1441974231531-c6227db76b6e",
  "photo-1418065460487-3e41a6c84dc5",
] as const;

export const MEDIA_COUNT = IDS.length;

/**
 * Resolve a photo index to a URL. Indices wrap, so data files can use any
 * integer without bounds-checking against the pool size.
 */
export function photoUrl(index: number, width = 800, quality = 72): string {
  const id = IDS[((index % IDS.length) + IDS.length) % IDS.length];
  return `${base}/${id}?auto=format&fit=crop&w=${width}&q=${quality}`;
}
