import { createEffect } from "solid-js";

interface NumberCounterProps {
  number: number;
}

const NumberCounter = (props: NumberCounterProps) => {
  let counterRef: HTMLParagraphElement | null = null;

  createEffect(() => {
    const animateValue = (
      obj: HTMLElement,
      start: number,
      end: number,
      duration: number
    ) => {
      let startTimestamp: number | null = null;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.textContent = Math.floor(progress * (end - start) + start).toString();
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    };

    if (counterRef) {
      const start = 0; // Adjust starting value if needed
      const end = props.number; // Final value from props
      const duration = 2000; // Animation duration in milliseconds
      animateValue(counterRef, start, end, duration);
    }
  });

  return (
    <p
      ref={(el) => (counterRef = el)}
      class="text-6xl font-bold text-[rgba(10,207,131)]"
    >
      0
    </p>
  );
};

export default NumberCounter;
