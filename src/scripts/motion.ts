/**
 * A small, dependency-free scroll/reveal engine.
 *
 * Everything on the page that reacts to scroll goes through here so there is
 * exactly one scroll listener and one rAF loop, and so every effect gets
 * torn down and rebuilt correctly across view transitions.
 *
 * Components call `register()` with an init function at module scope. The
 * init function runs on every `astro:page-load` (which also fires on the
 * initial load) and may return a cleanup function.
 */

type Cleanup = (() => void) | void;
type Initer = () => Cleanup;

export type ProgressMode =
  /** 0 when the element's top reaches the viewport bottom, 1 when its bottom leaves the top. */
  | "cover"
  /** For elements taller than the viewport: 0 when the top hits the viewport top, 1 when the bottom hits the viewport bottom. */
  | "pin"
  /** 0 when the element's top is at the viewport top, 1 once it has scrolled fully past. */
  | "exit";

export const clamp = (v: number, min = 0, max = 1) =>
  v < min ? min : v > max ? max : v;

/** Maps `v` from the range [a, b] onto [0, 1], clamped. */
export const range = (v: number, a: number, b: number) =>
  clamp((v - a) / (b - a || 1));

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* -------------------------------------------------------------------------
   Lifecycle
   ------------------------------------------------------------------------- */

const initers = new Map<Initer, Cleanup>();
let booted = false;

function runIniter(fn: Initer) {
  const previous = initers.get(fn);
  if (typeof previous === "function") previous();
  initers.set(fn, fn());
}

export function register(fn: Initer) {
  if (!initers.has(fn)) initers.set(fn, undefined);
  if (booted) runIniter(fn);
}

/* -------------------------------------------------------------------------
   Scroll progress
   ------------------------------------------------------------------------- */

type RectListener = (rect: DOMRect, viewportHeight: number) => void;
type Subscriber = { el: HTMLElement; onRect: RectListener };

const subscribers = new Set<Subscriber>();
let frame = 0;

export function progressFrom(
  rect: DOMRect,
  vh: number,
  mode: ProgressMode,
): number {
  if (mode === "pin") {
    // Distance the element can travel under a sticky child.
    const travel = rect.height - vh;
    return travel > 0 ? clamp(-rect.top / travel) : rect.top <= 0 ? 1 : 0;
  }

  if (mode === "exit") {
    return clamp(-rect.top / (rect.height || 1));
  }

  return clamp((vh - rect.top) / (vh + rect.height));
}

function tick() {
  frame = 0;
  const vh = window.innerHeight;
  // Read every rect first, then let listeners write, so a listener's style
  // writes can't force a layout for the next listener's read.
  const reads: [Subscriber, DOMRect][] = [];
  for (const sub of subscribers) reads.push([sub, sub.el.getBoundingClientRect()]);
  for (const [sub, rect] of reads) sub.onRect(rect, vh);
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(tick);
}

/**
 * Lowest-level hook: calls `onRect` with the element's viewport rect on every
 * scroll/resize frame. Returns an unsubscribe function.
 */
export function trackRect(el: HTMLElement, onRect: RectListener): () => void {
  const sub: Subscriber = { el, onRect };
  subscribers.add(sub);
  schedule();
  return () => subscribers.delete(sub);
}

/**
 * Calls `onProgress` with a 0→1 value describing how far `el` has travelled
 * through the viewport. Returns an unsubscribe function.
 */
export function trackProgress(
  el: HTMLElement,
  mode: ProgressMode,
  onProgress: (progress: number) => void,
): () => void {
  let last = -1;
  return trackRect(el, (rect, vh) => {
    const p = progressFrom(rect, vh, mode);
    // Skip the write when nothing moved enough to matter on screen.
    if (Math.abs(p - last) < 0.0002) return;
    last = p;
    onProgress(p);
  });
}

/** Convenience: writes the progress into a CSS custom property. */
export function trackProgressVar(
  el: HTMLElement,
  mode: ProgressMode,
  property: string,
  target: HTMLElement = el,
) {
  return trackProgress(el, mode, (p) =>
    target.style.setProperty(property, p.toFixed(4)),
  );
}

/* -------------------------------------------------------------------------
   Reveals
   ------------------------------------------------------------------------- */

/**
 * Reveals `[data-reveal]` and `.mask-line` elements as they enter the
 * viewport. Children of a `[data-reveal-group]` are staggered by
 * `--reveal-step` (default 90ms).
 */
function initReveals(): Cleanup {
  const targets = document.querySelectorAll<HTMLElement>(
    "[data-reveal], .mask-line",
  );
  if (!targets.length) return;

  for (const group of document.querySelectorAll<HTMLElement>(
    "[data-reveal-group]",
  )) {
    const step = Number(group.dataset.revealGroup) || 90;
    const children = group.querySelectorAll<HTMLElement>(
      "[data-reveal], .mask-line",
    );
    children.forEach((child, i) => {
      child.style.setProperty("--reveal-delay", `${i * step}ms`);
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.01 },
  );

  targets.forEach((el) => observer.observe(el));
  return () => observer.disconnect();
}

/* -------------------------------------------------------------------------
   Count-up
   ------------------------------------------------------------------------- */

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/** Animates `[data-count-to]` numbers the first time they come into view. */
function initCounters(): Cleanup {
  const targets = document.querySelectorAll<HTMLElement>("[data-count-to]");
  if (!targets.length) return;

  const format = (value: number) => value.toLocaleString("en-US");
  const reduced = prefersReducedMotion();
  const frames = new Set<number>();

  const run = (el: HTMLElement) => {
    const target = Number(el.dataset.countTo) || 0;
    if (reduced) {
      el.textContent = format(target);
      return;
    }
    const duration = 1800;
    let start: number | null = null;
    const step = (now: number) => {
      if (start === null) start = now;
      const t = Math.min((now - start) / duration, 1);
      el.textContent = format(Math.round(easeOutExpo(t) * target));
      if (t < 1) frames.add(requestAnimationFrame(step));
    };
    frames.add(requestAnimationFrame(step));
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        run(entry.target as HTMLElement);
      }
    },
    { threshold: 0.4 },
  );

  targets.forEach((el) => observer.observe(el));

  return () => {
    observer.disconnect();
    frames.forEach((id) => cancelAnimationFrame(id));
  };
}

/* -------------------------------------------------------------------------
   Boot
   ------------------------------------------------------------------------- */

if (typeof document !== "undefined") {
  document.documentElement.classList.add("js");

  register(initReveals);
  register(initCounters);

  const onScroll = () => schedule();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  document.addEventListener("astro:page-load", () => {
    booted = true;
    for (const fn of [...initers.keys()]) runIniter(fn);
    // Re-measure once fonts and images have settled the layout.
    requestAnimationFrame(schedule);
    window.setTimeout(schedule, 300);
  });

  document.addEventListener("astro:before-swap", () => {
    subscribers.clear();
    document.documentElement.style.setProperty("--wash", "0");
  });
}
