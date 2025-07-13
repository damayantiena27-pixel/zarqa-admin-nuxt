<template>
  <div class="container mx-auto px-4 min-w-full">
    <!-- Header -->
    <HeadersContent
      title="Finance Dashboard"
      description="Monitor your business financial performance"
    />

    <!-- Alert Messages -->
    <Alert
      v-if="message"
      :class="messageType === 'error' ? 'border-red-500' : 'border-green-500'"
      class="mb-6"
    >
      <AlertDescription>{{ message }}</AlertDescription>
    </Alert>

    <!-- Date Range Selector -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center space-x-4">
        <Select
          v-model="selectedPeriod"
          @update:model-value="loadFinancialData"
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
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>

        <div
          v-if="selectedPeriod === 'custom'"
          class="flex items-center space-x-2"
        >
          <Input
            type="date"
            v-model="customDateRange.start"
            class="w-40"
            @change="loadFinancialData"
          />
          <span>to</span>
          <Input
            type="date"
            v-model="customDateRange.end"
            class="w-40"
            @change="loadFinancialData"
          />
        </div>
      </div>

      <div class="flex space-x-2">
        <Button variant="outline" @click="exportData">
          <Download class="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button @click="refreshData">
          <RefreshCw class="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>

    <!-- Financial Overview Cards - IMPROVED -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <!-- Total Income (Revenue) -->
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0"
        >
          <CardTitle class="text-sm font-medium">Total Income</CardTitle>
          <TrendingUp class="text-green-500" />
        </CardHeader>
        <CardContent>
          <div class="text-xl font-bold text-green-600">
            Rp {{ formatPrice(financialData.totalIncome) }}
          </div>
          <p class="text-xs text-muted-foreground">
            <span
              :class="
                financialData.incomeGrowth >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              "
            >
              {{ financialData.incomeGrowth >= 0 ? "+" : ""
              }}{{ financialData.incomeGrowth.toFixed(1) }}%
            </span>
            from last period
          </p>
        </CardContent>
      </Card>

      <!-- Total Expenses -->
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0"
        >
          <CardTitle class="text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown class="text-red-500" />
        </CardHeader>
        <CardContent>
          <div class="text-xl font-bold text-red-600">
            Rp {{ formatPrice(financialData.totalExpenses) }}
          </div>
          <p class="text-xs text-muted-foreground">
            <span
              :class="
                financialData.expenseGrowth <= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              "
            >
              {{ financialData.expenseGrowth >= 0 ? "+" : ""
              }}{{ financialData.expenseGrowth.toFixed(1) }}%
            </span>
            from last period
          </p>
        </CardContent>
      </Card>

      <!-- Net Profit -->
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0"
        >
          <CardTitle class="text-sm font-medium">Net Profit</CardTitle>
          <DollarSign />
        </CardHeader>
        <CardContent>
          <div
            class="text-xl font-bold"
            :class="
              financialData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
            "
          >
            Rp {{ formatPrice(financialData.netProfit) }}
          </div>
          <p class="text-xs text-muted-foreground">
            {{
              financialData.totalIncome > 0
                ? (
                    (financialData.netProfit / financialData.totalIncome) *
                    100
                  ).toFixed(1)
                : 0
            }}% profit margin
          </p>
        </CardContent>
      </Card>

      <!-- Actual Cash Flow -->
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0"
        >
          <CardTitle class="text-sm font-medium">Cash Flow</CardTitle>
          <Wallet />
        </CardHeader>
        <CardContent>
          <div
            class="text-xl font-bold"
            :class="
              financialData.actualCashFlow >= 0
                ? 'text-green-600'
                : 'text-red-600'
            "
          >
            Rp {{ formatPrice(financialData.actualCashFlow) }}
          </div>
          <p class="text-xs text-muted-foreground">
            {{ formatPaidVsPending() }}
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Additional Business Metrics -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
      <!-- Operating Metrics -->
      <Card>
        <CardHeader>
          <CardTitle>Operating Metrics</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="flex justify-between">
            <span class="text-sm text-muted-foreground">Gross Margin</span>
            <span class="font-medium">{{ getGrossMargin() }}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-muted-foreground">Operating Ratio</span>
            <span class="font-medium">{{ getOperatingRatio() }}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-muted-foreground">Burn Rate</span>
            <span class="font-medium"
              >Rp {{ formatPrice(getBurnRate()) }}/month</span
            >
          </div>
        </CardContent>
      </Card>

      <!-- Pending Items -->
      <Card>
        <CardHeader>
          <CardTitle>Pending Items</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="flex justify-between">
            <span class="text-sm text-muted-foreground">Pending Expenses</span>
            <Badge variant="secondary">{{
              financialData.pendingExpenses
            }}</Badge>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-muted-foreground">Pending Amount</span>
            <span class="font-medium text-orange-600"
              >Rp {{ formatPrice(financialData.pendingAmount) }}</span
            >
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-muted-foreground">Unpaid Invoices</span>
            <Badge variant="outline">{{ financialData.unpaidInvoices }}</Badge>
          </div>
        </CardContent>
      </Card>

      <!-- Quick Actions -->
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent class="space-y-2">
          <Button
            class="w-full"
            @click="$router.push('/admin/finance/transactions')"
          >
            <Plus class="mr-2 h-4 w-4" />
            Add Income
          </Button>
          <Button
            variant="outline"
            class="w-full"
            @click="$router.push('/admin/finance/expenses')"
          >
            <FileText class="mr-2 h-4 w-4" />
            Submit Expense
          </Button>
          <Button
            variant="outline"
            class="w-full"
            @click="$router.push('/admin/finance/approvals')"
          >
            <CheckCircle class="mr-2 h-4 w-4" />
            Review Approvals
          </Button>
        </CardContent>
      </Card>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
      <!-- Income vs Expenses Chart -->
      <Card>
        <CardHeader>
          <CardTitle>Income vs Expenses Trend</CardTitle>
          <CardDescription>Monthly comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="h-80">
            <OverviewChart :data="chartData" />
          </div>
        </CardContent>
      </Card>

      <!-- Cash Flow Analysis -->
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Analysis</CardTitle>
          <CardDescription>Actual vs projected cash flow</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              class="flex justify-between items-center p-3 bg-green-50 rounded"
            >
              <span class="text-sm font-medium">Cash Inflow</span>
              <span class="font-bold text-green-600"
                >Rp {{ formatPrice(financialData.cashInflow) }}</span
              >
            </div>
            <div
              class="flex justify-between items-center p-3 bg-red-50 rounded"
            >
              <span class="text-sm font-medium">Cash Outflow</span>
              <span class="font-bold text-red-600"
                >Rp {{ formatPrice(financialData.cashOutflow) }}</span
              >
            </div>
            <div
              class="flex justify-between items-center p-3 bg-blue-50 rounded"
            >
              <span class="text-sm font-medium">Net Cash Flow</span>
              <span
                class="font-bold"
                :class="
                  financialData.actualCashFlow >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                "
              >
                Rp {{ formatPrice(financialData.actualCashFlow) }}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Recent Transactions with better categorization -->
    <Card class="mb-4">
      <CardHeader class="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Financial Activities</CardTitle>
          <CardDescription
            >Latest income and expense transactions</CardDescription
          >
        </div>
        <Button
          variant="outline"
          @click="$router.push('/admin/finance/transactions')"
        >
          View All
          <ArrowRight class="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div v-if="loadingTransactions" class="text-center py-8">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"
          ></div>
          <p class="mt-2 text-sm text-muted-foreground">
            Loading transactions...
          </p>
        </div>
        <div
          v-else-if="recentTransactions.length === 0"
          class="text-center py-8"
        >
          <p class="text-muted-foreground">No recent transactions</p>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="transaction in recentTransactions"
            :key="transaction.id"
            class="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
          >
            <div class="flex items-center space-x-4">
              <div
                class="p-2 rounded-full"
                :class="
                  transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                "
              >
                <component
                  :is="getTransactionIcon(transaction.category)"
                  :class="
                    transaction.type === 'income'
                      ? 'text-green-600'
                      : 'text-red-600'
                  "
                  class="h-4 w-4"
                />
              </div>
              <div>
                <div class="font-medium">{{ transaction.description }}</div>
                <div class="text-sm text-muted-foreground">
                  {{ getCategoryLabel(transaction.category) }} •
                  {{ transaction.entity }} •
                  {{ formatDate(transaction.date) }}
                </div>
              </div>
            </div>
            <div class="text-right">
              <div
                class="font-bold"
                :class="
                  transaction.type === 'income'
                    ? 'text-green-600'
                    : 'text-red-600'
                "
              >
                {{ transaction.type === "income" ? "+" : "-" }}Rp
                {{ formatPrice(transaction.amount) }}
              </div>
              <Badge
                :variant="getStatusVariant(transaction.status)"
                class="text-xs"
              >
                {{ transaction.status }}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Download,
  RefreshCw,
  ArrowRight,
  Plus,
  FileText,
  CheckCircle,
  ShoppingCart,
  Truck,
  Users,
  Settings,
  Smartphone,
  Zap,
  Car,
  Briefcase,
  Home,
  TrendingUpIcon,
} from "lucide-vue-next";
import HeadersContent from "~/components/ui/HeadersContent.vue";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import OverviewChart from "@/components/chart/OverviewChartLine.vue";

definePageMeta({
  middleware: "auth",
});

// State
const selectedPeriod = ref("month");
const customDateRange = reactive({
  start: "",
  end: "",
});
const message = ref("");
const messageType = ref("");
const loadingTransactions = ref(false);

// Enhanced financial data structure
const financialData = reactive({
  // Basic metrics
  totalIncome: 0,
  totalExpenses: 0,
  netProfit: 0,

  // Enhanced cash flow metrics
  actualCashFlow: 0,
  cashInflow: 0,
  cashOutflow: 0,

  // Growth metrics
  incomeGrowth: 0,
  expenseGrowth: 0,

  // Pending items
  pendingExpenses: 0,
  pendingAmount: 0,
  unpaidInvoices: 0,

  // Business metrics
  grossMargin: 0,
  operatingRatio: 0,
  burnRate: 0,
});

const recentTransactions = ref([]);
const chartData = ref({
  labels: [
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
  ],
  datasets: [
    {
      label: "Income",
      data: Array(12).fill(0),
      backgroundColor: "#22c55e",
      borderRadius: 4,
      borderSkipped: false,
    },
    {
      label: "Expenses",
      data: Array(12).fill(0),
      backgroundColor: "#ef4444",
      borderRadius: 4,
      borderSkipped: false,
    },
  ],
});

// Enhanced computed methods
const getGrossMargin = () => {
  if (financialData.totalIncome === 0) return "0.0";
  return ((financialData.netProfit / financialData.totalIncome) * 100).toFixed(
    1
  );
};

const getOperatingRatio = () => {
  if (financialData.totalIncome === 0) return "0.0";
  return (
    (financialData.totalExpenses / financialData.totalIncome) *
    100
  ).toFixed(1);
};

const getBurnRate = () => {
  // Calculate monthly average expenses
  return financialData.totalExpenses / 1; // Assuming current period is 1 month
};

const formatPaidVsPending = () => {
  const paidPercentage =
    financialData.totalExpenses > 0
      ? (
          (financialData.cashOutflow / financialData.totalExpenses) *
          100
        ).toFixed(0)
      : 100;
  return `${paidPercentage}% paid`;
};

// Helper function to get date range based on selected period
const getDateRange = () => {
  const now = new Date();
  let startDate, endDate;

  switch (selectedPeriod.value) {
    case "today":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      break;
    case "week":
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      startDate = new Date(
        weekStart.getFullYear(),
        weekStart.getMonth(),
        weekStart.getDate()
      );
      endDate = new Date(
        weekStart.getFullYear(),
        weekStart.getMonth(),
        weekStart.getDate() + 7
      );
      break;
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      break;
    case "quarter":
      const quarterStart = Math.floor(now.getMonth() / 3) * 3;
      startDate = new Date(now.getFullYear(), quarterStart, 1);
      endDate = new Date(now.getFullYear(), quarterStart + 3, 1);
      break;
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear() + 1, 0, 1);
      break;
    case "custom":
      if (customDateRange.start && customDateRange.end) {
        startDate = new Date(customDateRange.start);
        endDate = new Date(customDateRange.end);
        endDate.setDate(endDate.getDate() + 1);
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      }
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }

  return { startDate, endDate };
};

// Enhanced function to fetch financial data
const loadFinancialData = async () => {
  try {
    loadingTransactions.value = true;
    const { $firebase } = useNuxtApp();
    const { startDate, endDate } = getDateRange();

    // Fetch completed transactions for accurate cash flow
    const transactionsQuery = query(
      collection($firebase.firestore, "transactions"),
      where("date", ">=", startDate),
      where("date", "<", endDate),
      where("status", "==", "completed"),
      orderBy("date", "desc")
    );

    const transactionsSnapshot = await getDocs(transactionsQuery);
    const transactions = transactionsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
      };
    });

    // Fetch pending expenses
    const pendingExpensesQuery = query(
      collection($firebase.firestore, "expenses"),
      where("status", "in", ["pending", "approved"])
    );

    const pendingSnapshot = await getDocs(pendingExpensesQuery);
    const pendingExpenses = pendingSnapshot.docs.map((doc) => doc.data());

    // Calculate metrics
    const income = transactions.filter((t) => t.type === "income");
    const expenses = transactions.filter((t) => t.type === "expense");

    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalPendingAmount = pendingExpenses.reduce(
      (sum, e) => sum + e.amount,
      0
    );

    // Calculate actual cash flow (only completed/paid transactions)
    const cashInflow = totalIncome; // All income is considered cash inflow
    const cashOutflow = totalExpenses; // Only paid expenses are cash outflow
    const actualCashFlow = cashInflow - cashOutflow;

    // Update financial data
    Object.assign(financialData, {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      actualCashFlow,
      cashInflow,
      cashOutflow,
      pendingExpenses: pendingExpenses.length,
      pendingAmount: totalPendingAmount,
      unpaidInvoices: income.filter((t) => t.status === "pending").length,
      // Add growth calculation logic here based on previous period
      incomeGrowth: 0, // Calculate vs previous period
      expenseGrowth: 0, // Calculate vs previous period
    });

    // Get recent transactions (last 5)
    recentTransactions.value = transactions.slice(0, 5);

    // Generate chart data based on selected period
    generateChartData(transactions);
    console.log("Enhanced financial data loaded:", financialData);
  } catch (error) {
    console.error("Error loading financial data:", error);
    showMessage("Failed to load financial data", "error");
  } finally {
    loadingTransactions.value = false;
  }
};

// Function to generate chart data
const generateChartData = (transactions) => {
  const { startDate, endDate } = getDateRange();

  let labels = [];
  let incomeData = [];
  let expenseData = [];

  if (selectedPeriod.value === "today") {
    // Hourly data for today
    labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    incomeData = Array(24).fill(0);
    expenseData = Array(24).fill(0);

    transactions.forEach((transaction) => {
      const hour = transaction.date.getHours();
      if (transaction.type === "income") {
        incomeData[hour] += transaction.amount;
      } else {
        expenseData[hour] += transaction.amount;
      }
    });
  } else if (selectedPeriod.value === "week") {
    // Daily data for this week
    labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    incomeData = Array(7).fill(0);
    expenseData = Array(7).fill(0);

    transactions.forEach((transaction) => {
      const dayOfWeek = transaction.date.getDay();
      if (transaction.type === "income") {
        incomeData[dayOfWeek] += transaction.amount;
      } else {
        expenseData[dayOfWeek] += transaction.amount;
      }
    });
  } else if (selectedPeriod.value === "month") {
    // Weekly data for this month
    const weeksInMonth = Math.ceil(
      (endDate - startDate) / (7 * 24 * 60 * 60 * 1000)
    );
    labels = Array.from({ length: weeksInMonth }, (_, i) => `Week ${i + 1}`);
    incomeData = Array(weeksInMonth).fill(0);
    expenseData = Array(weeksInMonth).fill(0);

    transactions.forEach((transaction) => {
      const weekIndex = Math.floor(
        (transaction.date - startDate) / (7 * 24 * 60 * 60 * 1000)
      );
      if (weekIndex >= 0 && weekIndex < weeksInMonth) {
        if (transaction.type === "income") {
          incomeData[weekIndex] += transaction.amount;
        } else {
          expenseData[weekIndex] += transaction.amount;
        }
      }
    });
  } else {
    // Monthly data for quarter/year
    const months = [
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

    if (selectedPeriod.value === "quarter") {
      const quarterStart = Math.floor(new Date().getMonth() / 3) * 3;
      labels = months.slice(quarterStart, quarterStart + 3);
      incomeData = Array(3).fill(0);
      expenseData = Array(3).fill(0);

      transactions.forEach((transaction) => {
        const monthIndex = transaction.date.getMonth() - quarterStart;
        if (monthIndex >= 0 && monthIndex < 3) {
          if (transaction.type === "income") {
            incomeData[monthIndex] += transaction.amount;
          } else {
            expenseData[monthIndex] += transaction.amount;
          }
        }
      });
    } else {
      // Year view - all 12 months
      labels = months;
      incomeData = Array(12).fill(0);
      expenseData = Array(12).fill(0);

      transactions.forEach((transaction) => {
        const monthIndex = transaction.date.getMonth();
        if (transaction.type === "income") {
          incomeData[monthIndex] += transaction.amount;
        } else {
          expenseData[monthIndex] += transaction.amount;
        }
      });
    }
  }

  // Update chart data
  chartData.value = {
    labels,
    datasets: [
      {
        label: "Income",
        data: incomeData,
        backgroundColor: "#22c55e",
        borderColor: "#22c55e",
      },
      {
        label: "Expenses",
        data: expenseData,
        backgroundColor: "#ef4444",
        borderColor: "#ef4444",
      },
    ],
  };
};

// Helper methods
const formatPrice = (price) => {
  if (!price) return "0";
  return new Intl.NumberFormat("id-ID").format(price);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getCategoryLabel = (category) => {
  const labels = {
    // Income categories
    sales: "Sales Revenue",
    service: "Service Income",
    commission: "Commission",
    rental: "Rental Income",
    investment: "Investment Returns",
    // Expense categories
    materials: "Raw Materials",
    labor: "Labor Costs",
    operational: "Operational",
    marketing: "Marketing",
    utilities: "Utilities",
    transportation: "Transportation",
    others: "Others",
  };
  return labels[category] || category;
};

const getTransactionIcon = (category) => {
  const icons = {
    // Income icons
    sales: ShoppingCart,
    service: Briefcase,
    commission: TrendingUpIcon,
    rental: Home,
    investment: TrendingUp,
    // Expense icons
    materials: Truck,
    labor: Users,
    operational: Settings,
    marketing: Smartphone,
    utilities: Zap,
    transportation: Car,
    others: FileText,
  };
  return icons[category] || FileText;
};

const getStatusVariant = (status) => {
  const variants = {
    completed: "default",
    pending: "secondary",
    cancelled: "destructive",
  };
  return variants[status] || "secondary";
};

const showMessage = (msg, type) => {
  message.value = msg;
  messageType.value = type;
  setTimeout(() => {
    message.value = "";
    messageType.value = "";
  }, 5000);
};

const refreshData = () => {
  loadFinancialData();
  showMessage("Financial data refreshed successfully!", "success");
};

const exportData = async () => {
  try {
    const { $firebase } = useNuxtApp();
    const { startDate, endDate } = getDateRange();

    // Fetch all transactions for export
    const transactionsQuery = query(
      collection($firebase.firestore, "transactions"),
      where("date", ">=", startDate),
      where("date", "<", endDate),
      orderBy("date", "desc")
    );

    const snapshot = await getDocs(transactionsQuery);
    const transactions = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        transactionId: data.transactionId,
        type: data.type,
        category: getCategoryLabel(data.category),
        description: data.description,
        amount: data.amount,
        date: data.date?.toDate
          ? data.date.toDate().toISOString().split("T")[0]
          : "",
        status: data.status,
        entity: data.entity || "",
        paymentMethod: data.paymentMethod || "",
        reference: data.reference || "",
        notes: data.notes || "",
      };
    });

    if (transactions.length === 0) {
      showMessage("No data to export for selected period", "error");
      return;
    }

    const headers = [
      "Transaction ID",
      "Type",
      "Category",
      "Description",
      "Amount",
      "Date",
      "Status",
      "Entity",
      "Payment Method",
      "Reference",
      "Notes",
    ];

    const csvContent = [
      headers.join(","),
      ...transactions.map((row) =>
        Object.values(row)
          .map((value) =>
            typeof value === "string" && value.includes(",")
              ? `"${value}"`
              : value
          )
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `financial-report-${selectedPeriod.value}-${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showMessage("Financial report exported successfully!", "success");
  } catch (error) {
    console.error("Export error:", error);
    showMessage("Failed to export data", "error");
  }
};

onMounted(() => {
  console.log("Loading enhanced finance dashboard...");
  loadFinancialData();
});
</script>
