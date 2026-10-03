/**
 * The countries the atlas lights up.
 *
 * This is the one file to edit when you get back from somewhere. Codes are
 * ISO 3166-1 alpha-2 and have to match `src/data/world-map.ts` — the map's own
 * three non-ISO entities are XK (Kosovo), XN (Northern Cyprus) and XS
 * (Somaliland).
 *
 * The quickest way to fill this in is the map itself: open the site with
 * `?edit` on the URL, click your way around the world, then hit “Copy list”
 * and paste the result over VISITED below.
 */

/** Where the map centres its “home” marker. */
export const HOME = "CH";

// England is GB: at this scale the map draws the United Kingdom as one country,
// so it lights up Scotland, Wales and Northern Ireland along with it.
export const VISITED: string[] = [
  "AT", "CH", "DE", "DK", "EG", "ES", "FR", "GB", "GR", "IT", "LI", "PT",
];
