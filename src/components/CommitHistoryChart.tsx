import { createEffect, onCleanup } from "solid-js";
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

  createEffect(() => {
    if (!canvasRef) {
      console.error("Canvas reference is not available");
      return;
    }

    const ctx = canvasRef.getContext("2d");
    if (!ctx) {
      console.error("Failed to get 2D context from canvas");
      return;
    }

    // Destroy any existing chart instance
    if (chartInstance) {
      chartInstance.destroy();
    }

    // Convert reactive Proxy to a plain array
    const plainData = [...props.data];

    // Create a new Chart.js instance
    chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: Array.from({ length: 12 }, (_, i) =>
          new Date(
            new Date().setMonth(new Date().getMonth() - (11 - i))
          ).toLocaleString("default", { month: "short" })
        ),
        datasets: [
          {
            label: "Commits Per Month",
            data: plainData,
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
            display: true,
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

    // Trigger resize to ensure proper rendering
    chartInstance.resize();
  });

  onCleanup(() => {
    if (chartInstance) {
      chartInstance.destroy();
    }
  });

  return (
    <div class="w-full h-full">
      <canvas
        ref={(el) => (canvasRef = el)}
        class="w-[50rem] h-full"
      />
    </div>
  );
};

export default CommitHistoryChart;
