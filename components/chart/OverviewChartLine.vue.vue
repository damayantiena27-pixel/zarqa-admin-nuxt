<template>
  <div class="w-full h-full">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from "vue";
import { Chart, registerables } from "chart.js";

// Register Chart.js components
Chart.register(...registerables);

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

const chartCanvas = ref(null);
let chartInstance = null;

const createChart = () => {
  if (!chartCanvas.value) return;

  // Destroy existing chart if it exists
  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = chartCanvas.value.getContext("2d");

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: props.data.labels || [],
      datasets: [
        {
          label: "Income",
          data: props.data.datasets?.[0]?.data || [],
          borderColor: "#22c55e",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#22c55e",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
        {
          label: "Expenses",
          data: props.data.datasets?.[1]?.data || [],
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#ef4444",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index",
      },
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12,
              weight: "500",
            },
          },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          borderColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: function (context) {
              const value = new Intl.NumberFormat("id-ID").format(
                context.parsed.y
              );
              return `${context.dataset.label}: Rp ${value}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: true,
            color: "rgba(0, 0, 0, 0.05)",
          },
          ticks: {
            font: {
              size: 11,
            },
            color: "#6b7280",
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            display: true,
            color: "rgba(0, 0, 0, 0.05)",
          },
          ticks: {
            font: {
              size: 11,
            },
            color: "#6b7280",
            callback: function (value) {
              return (
                "Rp " +
                new Intl.NumberFormat("id-ID", {
                  notation: "compact",
                  compactDisplay: "short",
                }).format(value)
              );
            },
          },
        },
      },
      elements: {
        point: {
          hoverBorderWidth: 3,
        },
      },
    },
  });
};

onMounted(() => {
  createChart();
});

watch(
  () => props.data,
  () => {
    createChart();
  },
  { deep: true }
);

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>
