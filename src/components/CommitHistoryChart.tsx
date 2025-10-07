import { onMount, createEffect, onCleanup } from "solid-js";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Filler,
} from "chart.js";

// Register Chart.js components and plugins
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Filler
);

interface CommitHistoryChartProps {
  data: number[];
}

const CommitHistoryChart = (props: CommitHistoryChartProps) => {
  let canvasRef: HTMLCanvasElement | null = null;
  let chartInstance: Chart | null = null;

  // Create chart on mount
  onMount(() => {
    if (!canvasRef) return;
    const ctx = canvasRef.getContext("2d");
    if (!ctx) return;

    chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: Array.from({ length: 12 }, (_, i) =>
          new Date(new Date().setMonth(new Date().getMonth() - (11 - i)))
            .toLocaleString("default", { month: "short" })
        ),
        datasets: [
          {
            label: "Commits Per Month",
            data: [...props.data],
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: false,
            text: "Commit History (Last 12 Months)",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  });

  // Update chart when data changes
  createEffect(() => {
    if (chartInstance && props.data) {
      chartInstance.data.datasets[0].data = [...props.data];
      chartInstance.update();
    }
  });

  // Cleanup chart
  onCleanup(() => {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
  });

  return (
    <div class="w-full max-w-full overflow-hidden">
      <canvas
        ref={(el) => (canvasRef = el)}
        class="w-full h-[20rem] max-w-full"
      />
    </div>
  );
};

export default CommitHistoryChart;