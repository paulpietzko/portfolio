import { onMount, createEffect, onCleanup } from "solid-js";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Tooltip,
  CategoryScale,
  Filler,
} from "chart.js";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Tooltip,
  CategoryScale,
  Filler,
);

interface CommitHistoryChartProps {
  data: number[];
}

const ACCENT = "#0acf83";
const GRID = "rgba(255,255,255,0.07)";
const LABEL = "rgba(255,255,255,0.38)";

const monthLabels = () =>
  Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (11 - i));
    return d.toLocaleString("default", { month: "short" });
  });

const CommitHistoryChart = (props: CommitHistoryChartProps) => {
  let canvas: HTMLCanvasElement | undefined;
  let chart: Chart | null = null;

  onMount(() => {
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    // Vertical gradient under the line, sized to the canvas
    const fill = ctx.createLinearGradient(0, 0, 0, canvas.offsetHeight || 320);
    fill.addColorStop(0, "rgba(10,207,131,0.28)");
    fill.addColorStop(1, "rgba(10,207,131,0)");

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: monthLabels(),
        datasets: [
          {
            label: "Commits",
            data: [...props.data],
            borderColor: ACCENT,
            backgroundColor: fill,
            fill: true,
            tension: 0.38,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: ACCENT,
            pointHoverBorderColor: "#0a0a0a",
            pointHoverBorderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1200, easing: "easeOutQuart" },
        interaction: { mode: "index", intersect: false },
        plugins: {
          tooltip: {
            backgroundColor: "#141414",
            borderColor: "rgba(255,255,255,0.12)",
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            titleColor: "rgba(255,255,255,0.5)",
            bodyColor: "#fff",
            bodyFont: { size: 14, weight: 600 },
            callbacks: {
              label: (item) => `${item.formattedValue} contributions`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { color: GRID },
            ticks: { color: LABEL, font: { size: 11 } },
          },
          y: {
            beginAtZero: true,
            grid: { color: GRID },
            border: { display: false },
            ticks: { color: LABEL, font: { size: 11 }, maxTicksLimit: 5 },
          },
        },
      },
    });
  });

  createEffect(() => {
    if (!chart) return;
    chart.data.datasets[0].data = [...props.data];
    chart.update();
  });

  onCleanup(() => {
    chart?.destroy();
    chart = null;
  });

  return (
    <div class="w-full max-w-full overflow-hidden">
      <canvas ref={canvas} class="h-[18rem] w-full max-w-full sm:h-[22rem]" />
    </div>
  );
};

export default CommitHistoryChart;
