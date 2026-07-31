import { onMount, onCleanup } from "solid-js";

interface NumberCounterProps {
  number: number;
  /** Milliseconds the count-up takes. */
  duration?: number;
}

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

const NumberCounter = (props: NumberCounterProps) => {
  let el: HTMLParagraphElement | undefined;
  let raf = 0;
  let observer: IntersectionObserver | undefined;

  const format = (value: number) => value.toLocaleString("en-US");

  onMount(() => {
    if (!el) return;

    const target = props.number ?? 0;
    const duration = props.duration ?? 1800;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduced) {
      el.textContent = format(target);
      return;
    }

    // Only count once the number is actually on screen
    const run = () => {
      let start: number | null = null;
      const step = (now: number) => {
        if (start === null) start = now;
        const t = Math.min((now - start) / duration, 1);
        el!.textContent = format(Math.round(easeOutExpo(t) * target));
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer?.disconnect();
          run();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
  });

  onCleanup(() => {
    // Also runs when the SSR render tree is disposed, where there is no rAF
    if (typeof cancelAnimationFrame === "function") cancelAnimationFrame(raf);
    observer?.disconnect();
  });

  return (
    <p ref={el} class="counter">
      0
    </p>
  );
};

export default NumberCounter;
