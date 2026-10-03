/**
 * One-off generator: Natural Earth (via world-atlas TopoJSON) -> a compact
 * TypeScript module of projected SVG paths, checked into the repo.
 *
 * The output is committed, so the site itself has no map dependency and the
 * build does no geometry work. Re-run it only to retune the projection or the
 * simplification:
 *
 *   npm i --no-save world-atlas@2 i18n-iso-countries
 *   node scripts/gen-map.mjs src/data/world-map.ts
 *
 * TOL / MIN_RING / DOT_BELOW can be overridden from the environment.
 */
import { readFileSync, writeFileSync } from "node:fs";
import countriesIso from "i18n-iso-countries";

const SRC = "node_modules/world-atlas/countries-50m.json";
const topo = JSON.parse(readFileSync(SRC, "utf8"));

/* ---------------------------------------------------------------- topojson */

const { scale: [sx, sy], translate: [tx, ty] } = topo.transform;

/** Delta-decode + de-quantise one arc into absolute [lon, lat] pairs. */
const decodeArc = (arc) => {
  let x = 0;
  let y = 0;
  return arc.map(([dx, dy]) => {
    x += dx;
    y += dy;
    return [x * sx + tx, y * sy + ty];
  });
};

/* ------------------------------------------------------------ simplify (DP) */

/** Squared perpendicular distance from p to the segment ab. */
const segDist = (p, a, b) => {
  let [x, y] = a;
  let dx = b[0] - x;
  let dy = b[1] - y;
  if (dx || dy) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) [x, y] = b;
    else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }
  dx = p[0] - x;
  dy = p[1] - y;
  return dx * dx + dy * dy;
};

/**
 * Douglas-Peucker. Endpoints are always kept, which is what preserves shared
 * borders: two neighbours assemble from the same simplified arc.
 * `kx` scales longitude so the tolerance means roughly the same on screen at
 * every latitude (meridians converge towards the poles).
 */
const simplify = (pts, tol, kx) => {
  if (pts.length < 3) return pts;
  const scaled = pts.map(([lon, lat]) => [lon * kx, lat]);
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const sq = tol * tol;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    let index = -1;
    let max = sq;
    for (let i = first + 1; i < last; i++) {
      const d = segDist(scaled[i], scaled[first], scaled[last]);
      if (d > max) {
        max = d;
        index = i;
      }
    }
    if (index > 0) {
      keep[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }
  return pts.filter((_, i) => keep[i]);
};

/* -------------------------------------------------------------- projection */

// Equal Earth (Šavrič, Patterson & Jenny, 2018). Equal-area, so the share of
// the world's land each country covers can be measured straight off the paths.
const A1 = 1.340264;
const A2 = -0.081106;
const A3 = 0.000893;
const A4 = 0.003796;
const M = Math.sqrt(3) / 2;

const project = ([lon, lat]) => {
  const l = (lon * Math.PI) / 180;
  const p = (lat * Math.PI) / 180;
  const t = Math.asin(M * Math.sin(p));
  const t2 = t * t;
  const t6 = t2 * t2 * t2;
  return [
    (l * Math.cos(t)) / (M * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2))),
    t * (A1 + A2 * t2 + t6 * (A3 + A4 * t2)),
  ];
};

const VIEW_W = 1000;
const [xMax] = project([180, 0]);
const [, yMax] = project([0, 90]);
const K = VIEW_W / (2 * xMax);
const VIEW_H = 2 * yMax * K;

const toPx = (lonlat) => {
  const [x, y] = project(lonlat);
  return [(x + xMax) * K, (yMax - y) * K];
};

/* ------------------------------------------------------------------- build */

// Tolerance in degrees of longitude at the equator. 360deg spans 1000px, so
// 0.32deg is a little under a pixel.
const TOL = Number(process.env.TOL ?? 0.32);
// Rings smaller than this (px^2) are dropped: at this scale they are sub-pixel
// specks that cost bytes and render as nothing.
const MIN_RING = Number(process.env.MIN_RING ?? 1.2);
// A country whose whole geometry lands under this gets a dot instead, so
// microstates stay visible and clickable.
const DOT_BELOW = Number(process.env.DOT_BELOW ?? 2.5);

const SKIP = new Set(["Antarctica"]);

const rawArcs = topo.arcs.map(decodeArc);

const arcs = rawArcs.map((pts) => {
  const meanLat =
    pts.reduce((sum, [, lat]) => sum + lat, 0) / (pts.length || 1);
  // Never below ~0.2: at the poles the weight would collapse to zero and
  // simplify every arc up there to a straight line.
  const kx = Math.max(Math.cos((meanLat * Math.PI) / 180), 0.2);
  return simplify(pts, TOL, kx);
});

/**
 * Resolve a topojson arc-index list into one closed ring, unwrapped across the
 * antimeridian: Natural Earth carries Russia as a single ring running past
 * 180deg, and projecting that raw draws a 700px smear across the Pacific.
 */
const ring = (indices, source = arcs) => {
  const pts = [];
  for (const index of indices) {
    const arc = index < 0 ? [...source[~index]].reverse() : source[index];
    // The first point repeats the previous arc's last point.
    for (const p of pts.length ? arc.slice(1) : arc) pts.push(p);
  }

  const out = [pts[0]];
  let shift = 0;
  for (let i = 1; i < pts.length; i++) {
    const delta = pts[i][0] - pts[i - 1][0];
    if (delta > 180) shift -= 360;
    else if (delta < -180) shift += 360;
    out.push(shift ? [pts[i][0] + shift, pts[i][1]] : pts[i]);
  }
  return out;
};

/** Mean of a ring's vertices — good enough to place a dot or a label. */
const centre = (pts) => [
  pts.reduce((sum, [x]) => sum + x, 0) / pts.length,
  pts.reduce((sum, [, y]) => sum + y, 0) / pts.length,
];

/** Shoelace. Sign tells us which way the ring winds; magnitude is the area. */
const signedArea = (pts) => {
  let a = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    a += (pts[j][0] - pts[i][0]) * (pts[j][1] + pts[i][1]);
  }
  return a / 2;
};

const round = (n) => Math.round(n * 10) / 10;

const toPath = (rings) =>
  rings
    .map(
      (pts) => `M${pts.map(([x, y]) => `${round(x)} ${round(y)}`).join("L")}Z`,
    )
    .join("");

/* ------------------------------------------------- frame + graticule paths */

/** Samples a meridian every `step` degrees of latitude and projects it. */
const meridian = (lon, from = -90, to = 90, step = 4) => {
  const pts = [];
  for (let lat = from; step > 0 ? lat <= to : lat >= to; lat += step) {
    pts.push(toPx([lon, lat]));
  }
  return pts;
};

// In Equal Earth y depends only on latitude and x is linear in longitude, so
// a parallel is a straight segment and needs exactly two points.
const parallel = (lat) => [toPx([-180, lat]), toPx([180, lat])];

const line = (pts) =>
  `M${pts.map(([x, y]) => `${round(x)} ${round(y)}`).join("L")}`;

// The outline of the whole projection: down one antimeridian and up the other.
const OUTLINE = `${line(meridian(180, -90, 90, 3))}${line(meridian(-180, 90, -90, -3)).replace(/^M/, "L")}Z`;

const GRATICULE = [
  ...[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((lon) =>
    line(meridian(lon)),
  ),
  ...[-60, -30, 0, 30, 60].map((lat) => line(parallel(lat))),
].join("");

const rows = [];

/**
 * Natural Earth files some overseas regions under their parent country. On a
 * travel map that is wrong — a weekend in Paris should not light up South
 * America — so these are cut out into rows of their own. Matched on any point
 * of the polygon's raw outline, as [lon, lat].
 */
const OVERSEAS = [
  { parent: "France", code: "GF", name: "French Guiana", box: [-55, 1.5, -51, 6.5] },
  { parent: "France", code: "GP", name: "Guadeloupe", box: [-62, 15.8, -60.9, 16.6] },
  { parent: "France", code: "MQ", name: "Martinique", box: [-61.3, 14.3, -60.7, 15] },
  { parent: "France", code: "RE", name: "Réunion", box: [55, -21.5, 56, -20.8] },
  { parent: "France", code: "YT", name: "Mayotte", box: [44.9, -13.1, 45.4, -12.5] },
];

const overseasFor = (parent, polygon) => {
  const index = polygon[0][0];
  const [lon, lat] = rawArcs[index < 0 ? ~index : index][0];
  return OVERSEAS.find(
    ({ parent: p, box: [w, s, e, n] }) =>
      p === parent && lon >= w && lon <= e && lat >= s && lat <= n,
  );
};

const addRow = (id, code, name, polygons) => {
  const kept = [];
  let area = 0;
  let cx = 0;
  let cy = 0;
  let fallback = null;

  for (const polygon of polygons) {
    let outerKept = false;
    for (const [i, indices] of polygon.entries()) {
      const pts = ring(indices).map(toPx);
      // A microstate can simplify away to a couple of points. It still has to
      // land on the map, so its position comes off the unsimplified ring.
      if (i === 0 && !fallback) fallback = centre(ring(indices, rawArcs).map(toPx));
      if (pts.length < 4) continue;

      const a = Math.abs(signedArea(pts));
      if (i === 0) {
        if (a < MIN_RING) break;
        outerKept = true;
        area += a;
        // Ring centroid, area-weighted across the country's islands.
        const [mx, my] = centre(pts);
        cx += mx * a;
        cy += my * a;
      } else if (!outerKept || a < MIN_RING) {
        continue; // a hole in a ring we dropped, or a sub-pixel one
      }
      kept.push(pts);
    }
  }

  if (area) {
    cx /= area;
    cy /= area;
  } else if (fallback) {
    [cx, cy] = fallback;
  } else {
    return;
  }

  rows.push({
    id,
    code,
    name,
    area,
    d: area < DOT_BELOW ? "" : toPath(kept),
    x: round(cx),
    y: round(cy),
  });
};

for (const geo of topo.objects.countries.geometries) {
  const name = geo.properties.name;
  if (SKIP.has(name)) continue;

  const polygons = geo.type === "Polygon" ? [geo.arcs] : geo.arcs;
  const home = [];
  const away = new Map();

  for (const polygon of polygons) {
    const split = overseasFor(name, polygon);
    if (split) away.set(split, [...(away.get(split) ?? []), polygon]);
    else home.push(polygon);
  }

  addRow(geo.id, null, name, home);
  for (const [split, parts] of away) addRow(null, split.code, split.name, parts);
}

/* ------------------------------------------------------------- ISO alpha-2 */

// Natural Earth carries a few entities ISO 3166 does not, and this vintage
// files France and Norway under the un-coded "-99".
const BY_NAME = {
  France: "FR",
  Norway: "NO",
  Kosovo: "XK",
  Somaliland: "XS",
  "N. Cyprus": "XN",
};

const out = [];
const unmapped = [];

for (const row of rows) {
  const code =
    row.code ?? BY_NAME[row.name] ?? countriesIso.numericToAlpha2(row.id);
  if (!code) {
    unmapped.push(`${row.name} (${row.id})`);
    continue;
  }
  out.push({ ...row, code });
}

// Natural Earth splits a few countries across several features (mainland and
// dependency); one entry per ISO code is what the atlas wants.
const merged = new Map();
for (const row of out) {
  const prev = merged.get(row.code);
  if (!prev) {
    merged.set(row.code, { ...row });
    continue;
  }
  prev.d += row.d;
  if (row.area > prev.area) {
    prev.x = row.x;
    prev.y = row.y;
    prev.name = row.name;
  }
  prev.area += row.area;
}

const final = [...merged.values()].sort((a, b) => a.code.localeCompare(b.code));
const land = final.reduce((sum, r) => sum + r.area, 0);

const body = final
  .map((r) => {
    const fields = [
      `code:${JSON.stringify(r.code)}`,
      `name:${JSON.stringify(r.name)}`,
      `x:${r.x}`,
      `y:${r.y}`,
      `share:${+(r.area / land).toFixed(5)}`,
      r.d ? `d:${JSON.stringify(r.d)}` : `dot:true`,
    ];
    return `  {${fields.join(",")}},`;
  })
  .join("\n");

const file = `/**
 * Country outlines for the atlas, projected once at authoring time.
 *
 * Source: Natural Earth 1:50m (public domain) via the world-atlas TopoJSON,
 * reprojected to Equal Earth and Douglas-Peucker simplified per shared *arc* —
 * per arc, so neighbouring borders stay identical and the map has no slivers
 * between countries. Antarctica is left out.
 *
 * Generated by scripts/gen-map.mjs — change the map by re-running that, not by
 * editing this file. Equal Earth is equal-area, so \`share\` is a true fraction
 * of the world's mapped land.
 */

export type MapCountry = {
  /** ISO 3166-1 alpha-2, plus XK/XN/XS for the three de-facto states. */
  code: string;
  name: string;
  /** Centroid — places the microstate dots and anchors the hover label. */
  x: number;
  y: number;
  /** Fraction of the world's mapped land area. */
  share: number;
  /** SVG path. Absent on microstates too small to draw — they get a dot. */
  d?: string;
  dot?: true;
};

export const MAP_VIEWBOX = { width: ${VIEW_W}, height: ${Math.round(VIEW_H)} };

/** The edge of the projection — the two antimeridians, closed. */
export const MAP_OUTLINE = ${JSON.stringify(OUTLINE)};

/** Meridians every 30 degrees and parallels every 30, as one path. */
export const MAP_GRATICULE = ${JSON.stringify(GRATICULE)};

/** Radius of the marker drawn for countries with no visible outline. */
export const DOT_R = 3.2;

export const MAP_COUNTRIES: MapCountry[] = [
${body}
];
`;

const target = process.argv[2];
if (!target) throw new Error("usage: node gen-map.mjs <out.ts>");
writeFileSync(target, file);

console.error(
  `wrote ${target}: ${final.length} countries, ${(file.length / 1024).toFixed(1)} kB, ` +
    `viewBox ${VIEW_W}x${Math.round(VIEW_H)}, dots: ${final.filter((r) => !r.d).length}`,
);
if (unmapped.length) console.error("unmapped:", unmapped.join(", "));
