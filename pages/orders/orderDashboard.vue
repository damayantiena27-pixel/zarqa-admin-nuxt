<template>
  <div class="container mx-auto min-w-full">
    <!-- Header -->
    <div class="px-4">
      <HeadersContent
        title="Order Dashboard"
        description="Monitor order performance and analytics"
      />
    </div>

    <!-- Date Range Filter & Actions -->
    <div class="flex items-center justify-between gap-4 mb-8 px-4">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <Calendar class="h-4 w-4 text-muted-foreground" />
          <Label>Date Range:</Label>
        </div>
        <Select
          v-model="selectedDateRange"
          @update:modelValue="updateDateRange"
        >
          <SelectTrigger class="w-48">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex items-center gap-2">
        <Button variant="outline" @click="exportData" :disabled="isLoading">
          <Download class="h-4 w-4 mr-2" />
          Export Report
        </Button>
        <Button variant="outline" @click="refreshData" :disabled="isLoading">
          <RefreshCw
            class="h-4 w-4 mr-2"
            :class="{ 'animate-spin': isLoading }"
          />
          Refresh
        </Button>
      </div>
    </div>

    <!-- Key Metrics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 px-4">
      <!-- Total Orders -->
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0"
        >
          <CardTitle class="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingCart />
        </CardHeader>
        <CardContent>
          <div class="text-xl font-bold">
            {{ formatNumber(metrics.totalOrders) }}
          </div>
          <p class="text-xs text-muted-foreground">
            <span
              :class="
                metrics.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              "
            >
              {{ metrics.ordersGrowth >= 0 ? "+" : ""
              }}{{ metrics.ordersGrowth }}%
            </span>
            vs last period
          </p>
        </CardContent>
      </Card>

      <!-- Total Revenue -->
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0"
        >
          <CardTitle class="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign class="text-green-500" />
        </CardHeader>
        <CardContent>
          <div class="text-xl font-bold">
            Rp {{ formatPrice(metrics.totalRevenue) }}
          </div>
          <p class="text-xs text-muted-foreground">
            <span
              :class="
                metrics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              "
            >
              {{ metrics.revenueGrowth >= 0 ? "+" : ""
              }}{{ metrics.revenueGrowth }}%
            </span>
            vs last period
          </p>
        </CardContent>
      </Card>

      <!-- Average Order Value -->
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0"
        >
          <CardTitle class="text-sm font-medium">Avg Order Value</CardTitle>
          <TrendingUp class="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div class="text-xl font-bold">
            Rp {{ formatPrice(metrics.avgOrderValue) }}
          </div>
          <p class="text-xs text-muted-foreground">
            <span
              :class="
                metrics.aovGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              "
            >
              {{ metrics.aovGrowth >= 0 ? "+" : "" }}{{ metrics.aovGrowth }}%
            </span>
            vs last period
          </p>
        </CardContent>
      </Card>

      <!-- Completion Rate -->
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0"
        >
          <CardTitle class="text-sm font-medium">Completion Rate</CardTitle>
          <CheckCircle class="text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div class="text-xl font-bold">{{ metrics.completionRate }}%</div>
          <p class="text-xs text-muted-foreground">
            <span
              :class="
                metrics.completionGrowth >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              "
            >
              {{ metrics.completionGrowth >= 0 ? "+" : ""
              }}{{ metrics.completionGrowth }}%
            </span>
            vs last period
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8 px-4">
      <!-- Orders Trend Chart -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center">
            <BarChart3 class="mr-2 h-5 w-5" />
            Orders Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OverviewChart :chart-data="ordersChartData" />
        </CardContent>
      </Card>

      <!-- Revenue Trend Chart -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center">
            <LineChart class="mr-2 h-5 w-5" />
            Revenue Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OverviewChartLine :chart-data="revenueChartData" />
        </CardContent>
      </Card>
    </div>

    <!-- Status Distribution & Top Products -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8 px-4">
      <!-- Order Status Distribution -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center">
            <PieChart class="mr-2 h-5 w-5" />
            Order Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="status in statusDistribution"
              :key="status.name"
              class="flex items-center justify-between"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-4 h-4 rounded-full"
                  :style="{ backgroundColor: status.color }"
                ></div>
                <span class="font-medium capitalize">{{ status.name }}</span>
              </div>
              <div class="text-right">
                <div class="font-bold">{{ status.count }}</div>
                <div class="text-sm text-muted-foreground">
                  {{ status.percentage }}%
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Top Products -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center">
            <Award class="mr-2 h-5 w-5" />
            Top Selling Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="(product, index) in topProducts"
              :key="product.id"
              class="flex items-center justify-between"
            >
              <div class="flex items-center space-x-3">
                <Badge
                  :variant="index < 3 ? 'default' : 'secondary'"
                  class="w-6 h-6 rounded-full p-0 flex items-center justify-center"
                >
                  {{ index + 1 }}
                </Badge>
                <div>
                  <div class="font-medium">{{ product.name }}</div>
                  <div class="text-sm text-muted-foreground">
                    {{ product.category }}
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-bold">{{ product.quantity }} sold</div>
                <div class="text-sm text-muted-foreground">
                  Rp {{ formatPrice(product.revenue) }}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Recent Orders & Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 px-4 pb-4">
      <!-- Recent Orders -->
      <Card class="lg:col-span-2">
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle class="flex items-center">
              <Clock class="mr-2 h-5 w-5" />
              Recent Orders
            </CardTitle>
            <Button variant="outline" size="sm" @click="navigateToOrderList">
              View All
              <ArrowRight class="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div v-if="isLoading" class="flex justify-center items-center py-8">
            <RefreshCw class="animate-spin h-6 w-6 mr-3" />
            <span>Loading recent orders...</span>
          </div>
          <div
            v-else-if="recentOrders.length === 0"
            class="text-center py-8 text-muted-foreground"
          >
            No recent orders found
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="order in recentOrders"
              :key="order.id"
              class="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center"
                >
                  <span class="text-sm font-medium text-gray-600">
                    {{ getCustomerInitial(order) }}
                  </span>
                </div>
                <div>
                  <div class="font-medium">{{ order.orderId || order.id }}</div>
                  <div class="text-sm text-muted-foreground">
                    {{ order.customerName || "N/A" }}
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-medium">
                  Rp {{ formatPrice(getOrderTotal(order)) }}
                </div>
                <Badge
                  :variant="getStatusVariant(order.status)"
                  class="text-xs"
                >
                  {{ order.status || "pending" }}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Quick Actions -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center">
            <Zap class="mr-2 h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <Button @click="navigateToAddOrder" class="w-full justify-start">
              <Plus class="mr-2 h-4 w-4" />
              Add New Order
            </Button>
            <Button
              @click="navigateToQueue"
              variant="outline"
              class="w-full justify-start"
            >
              <Clock class="mr-2 h-4 w-4" />
              View Queue
            </Button>
            <Button
              @click="exportDetailedReport"
              variant="outline"
              class="w-full justify-start"
            >
              <FileText class="mr-2 h-4 w-4" />
              Detailed Report
            </Button>
            <Button
              @click="showSettings = true"
              variant="outline"
              class="w-full justify-start"
            >
              <Settings class="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Settings Modal -->
    <Dialog v-model:open="showSettings">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dashboard Settings</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div>
            <Label for="refreshInterval">Auto Refresh Interval (minutes)</Label>
            <Select v-model="settings.refreshInterval">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 minute</SelectItem>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="0">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="flex items-center space-x-2">
            <Checkbox id="notifications" v-model="settings.notifications" />
            <Label for="notifications">Enable notifications</Label>
          </div>
          <div class="flex justify-end space-x-2">
            <Button variant="outline" @click="showSettings = false"
              >Cancel</Button
            >
            <Button @click="saveSettings">Save Settings</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import HeadersContent from "~/components/ui/HeadersContent.vue";
import OverviewChart from "~/components/chart/OverviewChart.vue";
import OverviewChartLine from "~/components/chart/OverviewChartLine.vue";
import { ref, computed, onMounted, onUnmounted } from "vue";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  RefreshCw,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  CheckCircle,
  BarChart3,
  LineChart,
  PieChart,
  Award,
  Clock,
  ArrowRight,
  Zap,
  Plus,
  Download,
  Settings,
  FileText,
} from "lucide-vue-next";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  limit,
} from "firebase/firestore";

definePageMeta({
  middleware: "auth",
});

// Firebase Instance
const { $firebase } = useNuxtApp();

// State
const selectedDateRange = ref("month");
const showSettings = ref(false);
const refreshInterval = ref(null);
const isLoading = ref(false);

const settings = ref({
  refreshInterval: "5",
  notifications: true,
});

// Data
const allOrders = ref([]);
const recentOrders = ref([]);
const metrics = ref({
  totalOrders: 0,
  ordersGrowth: 0,
  totalRevenue: 0,
  revenueGrowth: 0,
  avgOrderValue: 0,
  aovGrowth: 0,
  completionRate: 0,
  completionGrowth: 0,
});

const statusDistribution = ref([]);
const topProducts = ref([]);

// Chart data
const ordersChartData = ref({
  labels: [],
  datasets: [
    {
      label: "Orders",
      data: [],
      backgroundColor: "rgba(59, 130, 246, 0.8)",
      borderColor: "rgb(59, 130, 246)",
      borderWidth: 1,
    },
  ],
});

const revenueChartData = ref({
  labels: [],
  datasets: [
    {
      label: "Revenue",
      data: [],
      borderColor: "rgb(34, 197, 94)",
      backgroundColor: "rgba(34, 197, 94, 0.1)",
      fill: true,
    },
  ],
});

// Fetch orders from Firestore
const fetchOrders = async () => {
  try {
    isLoading.value = true;
    const ordersCollection = collection($firebase.firestore, "orders");
    const ordersQuery = query(ordersCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(ordersQuery);

    allOrders.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("Orders fetched successfully:", allOrders.value.length);
    calculateMetrics();
    calculateStatusDistribution();
    calculateTopProducts();
    generateChartData();
    fetchRecentOrders();
  } catch (error) {
    console.error("Error fetching orders:", error);
  } finally {
    isLoading.value = false;
  }
};

// Fetch recent orders
const fetchRecentOrders = async () => {
  try {
    const ordersCollection = collection($firebase.firestore, "orders");
    const recentQuery = query(
      ordersCollection,
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const querySnapshot = await getDocs(recentQuery);

    recentOrders.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching recent orders:", error);
  }
};

// Calculate metrics
const calculateMetrics = () => {
  const filteredOrders = getFilteredOrders();
  const previousOrders = getPreviousPeriodOrders();

  const totalOrders = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce(
    (sum, order) => sum + getOrderTotal(order),
    0
  );
  const completedOrders = filteredOrders.filter(
    (order) => order.status === "delivered" || order.status === "completed"
  ).length;

  const prevTotalOrders = previousOrders.length;
  const prevTotalRevenue = previousOrders.reduce(
    (sum, order) => sum + getOrderTotal(order),
    0
  );
  const prevCompletedOrders = previousOrders.filter(
    (order) => order.status === "delivered" || order.status === "completed"
  ).length;

  // Calculate growth percentages with proper handling of zero values
  const calculateGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  metrics.value = {
    totalOrders,
    ordersGrowth: calculateGrowth(totalOrders, prevTotalOrders),
    totalRevenue,
    revenueGrowth: calculateGrowth(totalRevenue, prevTotalRevenue),
    avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
    aovGrowth: calculateGrowth(
      totalOrders > 0 ? totalRevenue / totalOrders : 0,
      prevTotalOrders > 0 ? prevTotalRevenue / prevTotalOrders : 0
    ),
    completionRate:
      totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
    completionGrowth: calculateGrowth(
      totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
      prevTotalOrders > 0 ? (prevCompletedOrders / prevTotalOrders) * 100 : 0
    ),
  };
};

// Calculate status distribution
const calculateStatusDistribution = () => {
  const filteredOrders = getFilteredOrders();
  const statusCounts = {};
  const statusColors = {
    delivered: "#10b981",
    completed: "#10b981",
    processing: "#3b82f6",
    queue: "#f59e0b",
    pending: "#6b7280",
    shipped: "#8b5cf6",
    cancelled: "#ef4444",
  };

  filteredOrders.forEach((order) => {
    const status = order.status || "pending";
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  const total = filteredOrders.length;
  statusDistribution.value = Object.entries(statusCounts).map(
    ([status, count]) => ({
      name: status,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      color: statusColors[status] || "#6b7280",
    })
  );
};

// Calculate top products
const calculateTopProducts = () => {
  const productCounts = {};
  const filteredOrders = getFilteredOrders();

  filteredOrders.forEach((order) => {
    if (order.products && Array.isArray(order.products)) {
      order.products.forEach((product) => {
        const productName = product.productName || product.name;
        if (productName) {
          if (!productCounts[productName]) {
            productCounts[productName] = {
              name: productName,
              category: product.category || "General",
              quantity: 0,
              revenue: 0,
            };
          }
          productCounts[productName].quantity += product.quantity || 1;
          productCounts[productName].revenue +=
            product.subtotal || product.unitPrice * product.quantity || 0;
        }
      });
    }
  });

  topProducts.value = Object.values(productCounts)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((product, index) => ({
      id: `P${index + 1}`,
      ...product,
    }));
};

// Generate chart data
const generateChartData = () => {
  const filteredOrders = getFilteredOrders();
  const chartLabels = getChartLabels();
  const ordersData = [];
  const revenueData = [];

  chartLabels.forEach((label) => {
    const periodOrders = filteredOrders.filter((order) => {
      const orderDate =
        order.createdAt?.toDate?.() || new Date(order.createdAt);
      return isOrderInPeriod(orderDate, label);
    });

    ordersData.push(periodOrders.length);
    revenueData.push(
      periodOrders.reduce((sum, order) => sum + getOrderTotal(order), 0)
    );
  });

  ordersChartData.value = {
    labels: chartLabels,
    datasets: [
      {
        label: "Orders",
        data: ordersData,
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
      },
    ],
  };

  revenueChartData.value = {
    labels: chartLabels,
    datasets: [
      {
        label: "Revenue",
        data: revenueData,
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
      },
    ],
  };
};

// Helper functions
const getFilteredOrders = () => {
  const now = new Date();
  return allOrders.value.filter((order) => {
    const orderDate = order.createdAt?.toDate?.() || new Date(order.createdAt);

    switch (selectedDateRange.value) {
      case "today":
        return orderDate.toDateString() === now.toDateString();
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDate >= weekAgo;
      case "month":
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      case "quarter":
        const quarter = Math.floor(now.getMonth() / 3);
        const orderQuarter = Math.floor(orderDate.getMonth() / 3);
        return (
          orderQuarter === quarter &&
          orderDate.getFullYear() === now.getFullYear()
        );
      case "year":
        return orderDate.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  });
};

const getPreviousPeriodOrders = () => {
  const now = new Date();
  return allOrders.value.filter((order) => {
    const orderDate = order.createdAt?.toDate?.() || new Date(order.createdAt);

    switch (selectedDateRange.value) {
      case "today":
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        return orderDate.toDateString() === yesterday.toDateString();
      case "week":
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDate >= twoWeeksAgo && orderDate < oneWeekAgo;
      case "month":
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return orderDate >= lastMonth && orderDate < thisMonth;
      case "quarter":
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const prevQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1;
        const prevQuarterYear =
          currentQuarter === 0 ? now.getFullYear() - 1 : now.getFullYear();
        const orderQuarter = Math.floor(orderDate.getMonth() / 3);
        return (
          orderQuarter === prevQuarter &&
          orderDate.getFullYear() === prevQuarterYear
        );
      case "year":
        return orderDate.getFullYear() === now.getFullYear() - 1;
      default:
        return false;
    }
  });
};

const getChartLabels = () => {
  const now = new Date();
  const labels = [];

  switch (selectedDateRange.value) {
    case "today":
      for (let i = 23; i >= 0; i--) {
        const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
        labels.push(hour.getHours().toString().padStart(2, "0") + ":00");
      }
      break;
    case "week":
      for (let i = 6; i >= 0; i--) {
        const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        labels.push(day.toLocaleDateString("id-ID", { weekday: "short" }));
      }
      break;
    case "month":
      const daysInMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      ).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        labels.push(i.toString());
      }
      break;
    case "quarter":
      const quarterMonths = ["Jan", "Feb", "Mar"];
      const currentQuarter = Math.floor(now.getMonth() / 3);
      for (let i = 0; i < 3; i++) {
        const monthIndex = currentQuarter * 3 + i;
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        labels.push(monthNames[monthIndex]);
      }
      break;
    default:
      for (let i = 11; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(month.toLocaleDateString("id-ID", { month: "short" }));
      }
  }

  return labels;
};

const isOrderInPeriod = (orderDate, label) => {
  const now = new Date();

  switch (selectedDateRange.value) {
    case "today":
      const hour = orderDate.getHours().toString().padStart(2, "0") + ":00";
      return hour === label;
    case "week":
      const dayName = orderDate.toLocaleDateString("id-ID", {
        weekday: "short",
      });
      return dayName === label;
    case "month":
      return orderDate.getDate() === parseInt(label);
    case "quarter":
      const monthName = orderDate.toLocaleDateString("id-ID", {
        month: "short",
      });
      return monthName === label;
    default:
      const monthName2 = orderDate.toLocaleDateString("id-ID", {
        month: "short",
      });
      return monthName2 === label;
  }
};

const getOrderTotal = (order) => {
  if (order.grandTotal) return Number(order.grandTotal) || 0;
  if (order.total) return Number(order.total) || 0;
  if (order.subtotal) return Number(order.subtotal) || 0;

  // Calculate from products if no total field
  if (order.products && Array.isArray(order.products)) {
    return order.products.reduce((sum, product) => {
      return (
        sum + (product.subtotal || product.unitPrice * product.quantity || 0)
      );
    }, 0);
  }

  return 0;
};

const getCustomerInitial = (order) => {
  const name = order.customerName || order.customer?.name || "N";
  return name.charAt(0).toUpperCase();
};

// Methods
const formatPrice = (price) => {
  if (!price) return "0";
  return new Intl.NumberFormat("id-ID").format(price);
};

const formatNumber = (number) => {
  if (!number) return "0";
  return new Intl.NumberFormat("id-ID").format(number);
};

const getStatusVariant = (status) => {
  switch (status) {
    case "delivered":
    case "completed":
      return "default";
    case "processing":
      return "secondary";
    case "queue":
      return "outline";
    case "shipped":
      return "outline";
    case "pending":
      return "secondary";
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
  }
};

const updateDateRange = () => {
  console.log("Updating data for range:", selectedDateRange.value);
  calculateMetrics();
  calculateStatusDistribution();
  calculateTopProducts();
  generateChartData();
};

const refreshData = async () => {
  await fetchOrders();
};

const navigateToOrderList = () => {
  navigateTo("/orders/listOrder");
};

const navigateToAddOrder = () => {
  navigateTo("/orders/addOrder");
};

const navigateToQueue = () => {
  navigateTo("/orders/orderQueue");
};

const exportData = () => {
  console.log("Export dashboard summary");
  const csvContent = generateDashboardCSV();
  downloadCSV(
    csvContent,
    `dashboard-summary-${selectedDateRange.value}-${
      new Date().toISOString().split("T")[0]
    }.csv`
  );
};

const exportDetailedReport = () => {
  console.log("Export detailed report");
  const csvContent = generateDetailedReportCSV();
  downloadCSV(
    csvContent,
    `detailed-report-${selectedDateRange.value}-${
      new Date().toISOString().split("T")[0]
    }.csv`
  );
};

const generateDashboardCSV = () => {
  const headers = ["Metric", "Value", "Growth"];
  const rows = [
    [
      "Total Orders",
      metrics.value.totalOrders,
      `${metrics.value.ordersGrowth}%`,
    ],
    [
      "Total Revenue",
      `Rp ${formatPrice(metrics.value.totalRevenue)}`,
      `${metrics.value.revenueGrowth}%`,
    ],
    [
      "Average Order Value",
      `Rp ${formatPrice(metrics.value.avgOrderValue)}`,
      `${metrics.value.aovGrowth}%`,
    ],
    [
      "Completion Rate",
      `${metrics.value.completionRate}%`,
      `${metrics.value.completionGrowth}%`,
    ],
  ];

  // Add status distribution
  rows.push(["", "", ""]);
  rows.push(["Status Distribution", "", ""]);
  statusDistribution.value.forEach((status) => {
    rows.push([status.name, status.count, `${status.percentage}%`]);
  });

  // Add top products
  rows.push(["", "", ""]);
  rows.push(["Top Products", "Quantity", "Revenue"]);
  topProducts.value.forEach((product) => {
    rows.push([
      product.name,
      product.quantity,
      `Rp ${formatPrice(product.revenue)}`,
    ]);
  });

  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");
};

const generateDetailedReportCSV = () => {
  const filteredOrders = getFilteredOrders();
  const headers = [
    "Order ID",
    "Customer",
    "Date",
    "Status",
    "Total",
    "Products",
  ];

  const rows = filteredOrders.map((order) => [
    order.orderId || order.id,
    order.customerName || "N/A",
    order.createdAt?.toDate?.()?.toLocaleDateString("id-ID") ||
      new Date(order.createdAt).toLocaleDateString("id-ID"),
    order.status || "pending",
    `Rp ${formatPrice(getOrderTotal(order))}`,
    order.products
      ?.map((p) => `${p.productName || p.name} (${p.quantity})`)
      .join("; ") || "N/A",
  ]);

  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");
};

const downloadCSV = (content, filename) => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const saveSettings = () => {
  localStorage.setItem("dashboardSettings", JSON.stringify(settings.value));
  showSettings.value = false;
  setupAutoRefresh();
};

const setupAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }

  if (settings.value.refreshInterval !== "0") {
    const interval = parseInt(settings.value.refreshInterval) * 60 * 1000;
    refreshInterval.value = setInterval(refreshData, interval);
  }
};

// Lifecycle
onMounted(() => {
  const savedSettings = localStorage.getItem("dashboardSettings");
  if (savedSettings) {
    settings.value = JSON.parse(savedSettings);
  }

  setupAutoRefresh();
  fetchOrders();
});

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});
</script>

<style scoped>
/* Custom styles for dashboard */
</style>
