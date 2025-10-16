<template>
  <div class="container mx-auto min-w-full">
    <!-- Header -->
    <div class="px-4 mb-6">
      <HeadersContent
        title="Customer Dashboard"
        description="Monitor customer analytics and insights"
      />
    </div>

    <!-- Date Range Filter -->
    <div class="flex items-center gap-4 mb-6 px-4">
      <div class="flex items-center gap-2">
        <Calendar class="h-4 w-4 text-muted-foreground" />
        <Label>Analysis Period:</Label>
      </div>
      <Select v-model="selectedPeriod" @update:modelValue="updatePeriod">
        <SelectTrigger class="w-48">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="quarter">This Quarter</SelectItem>
          <SelectItem value="year">This Year</SelectItem>
          <SelectItem value="all">All Time</SelectItem>
          <!-- If custom range di klik maka muncul toast, tapi nanti di ganti dengan rentang kalendar -->
          <SelectItem @click="showCustomRange" value="custom"
            >Custom Range</SelectItem
          >
        </SelectContent>
      </Select>
      <Button variant="outline" @click="refreshData">
        <RefreshCw class="h-4 w-4 mr-2" />
        Refresh
      </Button>
    </div>

    <!-- Key Metrics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 px-4">
      <!-- Total Customers -->
      <!-- Total Pemasukan  -->
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0"
        >
          <CardTitle class="text-sm font-medium"> Total Customer </CardTitle>
          <Users class="" />
        </CardHeader>
        <CardContent>
          <div class="text-xl font-bold">{{ metrics.totalCustomers }}</div>
          <p class="text-xs text-muted-foreground mt-1">
            <span
              :class="
                metrics.customerGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              "
            >
              {{ metrics.customerGrowth >= 0 ? "+" : ""
              }}{{ metrics.customerGrowth }}%
            </span>
            this period
          </p>
        </CardContent>
      </Card>

      <!-- New Customers -->
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0"
        >
          <CardTitle class="text-sm font-medium"> New Customer </CardTitle>
          <UserPlus class="text-green-500" />
        </CardHeader>
        <CardContent>
          <div class="text-xl font-bold">{{ metrics.newCustomers }}</div>
          <p class="text-xs text-muted-foreground mt-1">
            <span
              :class="
                metrics.newCustomerGrowth >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              "
            >
              {{ metrics.newCustomerGrowth >= 0 ? "+" : ""
              }}{{ metrics.newCustomerGrowth }}%
            </span>
            this period
          </p>
        </CardContent>
      </Card>

      <!-- VIP Customers -->
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0"
        >
          <CardTitle class="text-sm font-medium"> VIP Customer </CardTitle>
          <Crown class="text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div class="text-xl font-bold">{{ metrics.vipCustomers }}</div>
          <p class="text-xs text-muted-foreground mt-1">
            {{
              ((metrics.vipCustomers / metrics.totalCustomers) * 100).toFixed(
                1
              )
            }}% of total
          </p>
        </CardContent>
      </Card>

      <!-- Average Customer Lifetime Value -->
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0"
        >
          <CardTitle class="text-sm font-medium"> Average CLV </CardTitle>
          <TrendingUp class="" />
        </CardHeader>
        <CardContent>
          <div class="text-xl font-bold">
            Rp {{ formatPrice(metrics.avgCLV) }}
          </div>
          <p class="text-xs text-muted-foreground mt-1">
            <span
              :class="
                metrics.clvGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              "
            >
              {{ metrics.clvGrowth >= 0 ? "+" : "" }}{{ metrics.clvGrowth }}%
            </span>
            vs last period
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Customer Segmentation & Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 px-4">
      <!-- Customer Segmentation -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center">
            <PieChart class="mr-2 h-5 w-5" />
            Customer Segmentation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="segment in customerSegments"
              :key="segment.name"
              class="flex items-center justify-between"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-4 h-4 rounded-full"
                  :style="{ backgroundColor: segment.color }"
                ></div>
                <div>
                  <span class="font-medium">{{ segment.name }}</span>
                  <p class="text-sm text-muted-foreground">
                    {{ segment.description }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <div class="font-bold">{{ segment.count }}</div>
                <div class="text-sm text-muted-foreground">
                  {{ segment.percentage }}%
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Customer Activity -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center">
            <Activity class="mr-2 h-5 w-5" />
            Customer Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              class="flex items-center justify-between p-3 bg-green-50 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <span class="font-medium">Active (Last 30 days)</span>
              </div>
              <div class="text-right">
                <div class="font-bold text-green-700">
                  {{ activityStats.active }}
                </div>
                <div class="text-sm text-green-600">
                  {{ activityStats.activePercentage }}%
                </div>
              </div>
            </div>

            <div
              class="flex items-center justify-between p-3 bg-yellow-50 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span class="font-medium">Inactive (30-90 days)</span>
              </div>
              <div class="text-right">
                <div class="font-bold text-yellow-700">
                  {{ activityStats.inactive }}
                </div>
                <div class="text-sm text-yellow-600">
                  {{ activityStats.inactivePercentage }}%
                </div>
              </div>
            </div>

            <div
              class="flex items-center justify-between p-3 bg-red-50 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                <span class="font-medium">At Risk (90+ days)</span>
              </div>
              <div class="text-right">
                <div class="font-bold text-red-700">
                  {{ activityStats.atRisk }}
                </div>
                <div class="text-sm text-red-600">
                  {{ activityStats.atRiskPercentage }}%
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Top Customers & Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 px-4">
      <!-- Top Customers by Value -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle class="flex items-center">
              <Award class="mr-2 h-5 w-5" />
              Top Customers by Value
            </CardTitle>
            <Button variant="outline" size="sm" @click="navigateToCustomerList">
              View All
              <ArrowRight class="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="(customer, index) in topCustomers"
              :key="customer.id"
              class="flex items-center justify-between"
            >
              <div class="flex items-center space-x-3">
                <Badge
                  :variant="index < 3 ? 'default' : 'secondary'"
                  class="w-6 h-6 rounded-full p-0 flex items-center justify-center"
                >
                  {{ index + 1 }}
                </Badge>
                <div
                  class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center"
                >
                  <span class="text-sm font-medium text-gray-600">
                    {{ customer.name.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div>
                  <div class="font-medium">{{ customer.name }}</div>
                  <div class="text-sm text-muted-foreground flex items-center">
                    {{ customer.email }}
                    <Crown
                      v-if="customer.type === 'vip'"
                      class="ml-2 h-3 w-3 text-yellow-500"
                    />
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-bold">
                  Rp {{ formatPrice(customer.totalSpent) }}
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ customer.orderCount }} orders
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Recent Customer Activity -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center">
            <Clock class="mr-2 h-5 w-5" />
            Recent Customer Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="activity in recentActivity"
              :key="activity.id"
              class="flex items-start space-x-3 p-3 border rounded-lg"
            >
              <div
                class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"
              >
                <span class="text-xs font-medium text-gray-600">
                  {{ activity.customer.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2">
                  <span class="font-medium">{{ activity.customer }}</span>
                  <Badge
                    :variant="getActivityVariant(activity.type)"
                    class="text-xs"
                  >
                    {{ activity.type }}
                  </Badge>
                </div>
                <p class="text-sm text-muted-foreground">
                  {{ activity.description }}
                </p>
                <p class="text-xs text-muted-foreground">
                  {{ formatRelativeTime(activity.timestamp) }}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Customer Insights & Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 mb-4">
      <!-- Customer Insights -->
      <Card class="lg:col-span-2">
        <CardHeader>
          <CardTitle class="flex items-center">
            <Brain class="mr-2 h-5 w-5" />
            Customer Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 bg-blue-50 rounded-lg">
              <div class="flex items-center space-x-2 mb-2">
                <TrendingUp class="h-5 w-5 text-blue-600" />
                <span class="font-medium text-blue-900">Growth Trend</span>
              </div>
              <p class="text-sm text-blue-700">
                Customer acquisition is up 15% this month, with strong retention
                rates among VIP customers.
              </p>
            </div>

            <div class="p-4 bg-green-50 rounded-lg">
              <div class="flex items-center space-x-2 mb-2">
                <Target class="h-5 w-5 text-green-600" />
                <span class="font-medium text-green-900">Opportunity</span>
              </div>
              <p class="text-sm text-green-700">
                23 customers are close to VIP status. Consider targeted
                promotions to boost their spending.
              </p>
            </div>

            <div class="p-4 bg-yellow-50 rounded-lg">
              <div class="flex items-center space-x-2 mb-2">
                <AlertTriangle class="h-5 w-5 text-yellow-600" />
                <span class="font-medium text-yellow-900">At Risk</span>
              </div>
              <p class="text-sm text-yellow-700">
                12 VIP customers haven't ordered in 60+ days. Implement
                re-engagement campaigns.
              </p>
            </div>

            <div class="p-4 bg-purple-50 rounded-lg">
              <div class="flex items-center space-x-2 mb-2">
                <Heart class="h-5 w-5 text-purple-600" />
                <span class="font-medium text-purple-900">Loyalty</span>
              </div>
              <p class="text-sm text-purple-700">
                Average customer lifespan is 18 months with 4.2 orders per
                customer.
              </p>
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
            <Button @click="navigateToAddCustomer" class="w-full justify-start">
              <UserPlus class="mr-2 h-4 w-4" />
              Add New Customer
            </Button>
            <Button
              @click="exportCustomerData"
              variant="outline"
              class="w-full justify-start"
            >
              <Download class="mr-2 h-4 w-4" />
              Export Customer Data
            </Button>
            <Button
              @click="sendBulkEmail"
              variant="outline"
              class="w-full justify-start"
            >
              <Mail class="mr-2 h-4 w-4" />
              Send Bulk Email
            </Button>
            <Button
              @click="createSegment"
              variant="outline"
              class="w-full justify-start"
            >
              <Users class="mr-2 h-4 w-4" />
              Create Segment
            </Button>
            <Button
              @click="viewAnalytics"
              variant="outline"
              class="w-full justify-start"
            >
              <BarChart3 class="mr-2 h-4 w-4" />
              Detailed Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup>
import HeadersContent from "~/components/ui/HeadersContent.vue";
import { ref, computed, onMounted } from "vue";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  RefreshCw,
  Users,
  UserPlus,
  Crown,
  TrendingUp,
  PieChart,
  Activity,
  Award,
  ArrowRight,
  Clock,
  Brain,
  Target,
  AlertTriangle,
  Heart,
  Zap,
  Download,
  Mail,
  BarChart3,
} from "lucide-vue-next";

definePageMeta({
  middleware: "auth",
});

// State
const selectedPeriod = ref("month");

// Sample data
const metrics = ref({
  totalCustomers: 342,
  customerGrowth: 12.5,
  newCustomers: 28,
  newCustomerGrowth: 15.8,
  vipCustomers: 45,
  avgCLV: 2450000,
  clvGrowth: 8.2,
});

const customerSegments = ref([
  {
    name: "VIP Customers",
    description: "High-value repeat customers",
    count: 45,
    percentage: 13,
    color: "#fbbf24",
  },
  {
    name: "Regular Customers",
    description: "Consistent buyers",
    count: 156,
    percentage: 46,
    color: "#3b82f6",
  },
  {
    name: "New Customers",
    description: "First-time buyers",
    count: 89,
    percentage: 26,
    color: "#10b981",
  },
  {
    name: "Inactive Customers",
    description: "No recent activity",
    count: 52,
    percentage: 15,
    color: "#ef4444",
  },
]);

const activityStats = ref({
  active: 234,
  activePercentage: 68,
  inactive: 76,
  inactivePercentage: 22,
  atRisk: 32,
  atRiskPercentage: 10,
});

const topCustomers = ref([
  {
    id: "C001",
    name: "Siti Aminah",
    email: "siti@email.com",
    type: "vip",
    totalSpent: 15750000,
    orderCount: 12,
  },
  {
    id: "C002",
    name: "Budi Santoso",
    email: "budi@email.com",
    type: "vip",
    totalSpent: 12300000,
    orderCount: 8,
  },
  {
    id: "C003",
    name: "Maya Sari",
    email: "maya@email.com",
    type: "vip",
    totalSpent: 9850000,
    orderCount: 15,
  },
  {
    id: "C004",
    name: "Ahmad Rizki",
    email: "ahmad@email.com",
    type: "regular",
    totalSpent: 7200000,
    orderCount: 6,
  },
  {
    id: "C005",
    name: "Dewi Lestari",
    email: "dewi@email.com",
    type: "regular",
    totalSpent: 5400000,
    orderCount: 9,
  },
]);

const recentActivity = ref([
  {
    id: "A001",
    customer: "Siti Aminah",
    type: "order",
    description: "Placed a new order for Abaya One Set",
    timestamp: "2024-01-17T10:30:00Z",
  },
  {
    id: "A002",
    customer: "Budi Santoso",
    type: "registration",
    description: "Registered as a new customer",
    timestamp: "2024-01-17T09:15:00Z",
  },
  {
    id: "A003",
    customer: "Maya Sari",
    type: "vip_upgrade",
    description: "Upgraded to VIP status",
    timestamp: "2024-01-16T16:45:00Z",
  },
  {
    id: "A004",
    customer: "Ahmad Rizki",
    type: "review",
    description: "Left a 5-star review for Gamis Tunik",
    timestamp: "2024-01-16T14:20:00Z",
  },
]);

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID").format(price);
};

const formatRelativeTime = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

const getActivityVariant = (type) => {
  switch (type) {
    case "order":
      return "default";
    case "registration":
      return "secondary";
    case "vip_upgrade":
      return "outline";
    case "review":
      return "outline";
    default:
      return "secondary";
  }
};

const updatePeriod = () => {
  console.log("Updating period to:", selectedPeriod.value);
  refreshData();
};

const refreshData = () => {
  console.log("Refreshing customer dashboard data...");
};

const navigateToCustomerList = () => {
  console.log("Navigate to customer list");
};

const navigateToAddCustomer = () => {
  console.log("Navigate to add customer");
};

const exportCustomerData = () => {
  console.log("Export customer data");
};

const sendBulkEmail = () => {
  console.log("Send bulk email");
};

const createSegment = () => {
  console.log("Create customer segment");
};

const viewAnalytics = () => {
  console.log("View detailed analytics");
};

// Initialize
onMounted(() => {
  refreshData();
});
</script>

<style scoped>
/* Custom styles for dashboard */
</style>
