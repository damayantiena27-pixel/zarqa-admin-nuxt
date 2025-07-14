<template>
  <div class="container mx-auto min-w-full">
    <!-- Header -->
    <div class="flex items-center justify-between px-4">
      <HeadersContent
        title="Order History"
        description="View and analyze completed orders"
      />
      <div class="flex gap-2">
        <Button @click="refreshHistory" variant="outline" :disabled="isLoading">
          <RefreshCw
            class="mr-2 h-4 w-4"
            :class="{ 'animate-spin': isLoading }"
          />
          Refresh
        </Button>
        <Button @click="exportHistory" variant="outline">
          <Download class="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button @click="showFilters = !showFilters" variant="outline">
          <Filter class="mr-2 h-4 w-4" />
          {{ showFilters ? "Hide" : "Show" }} Filters
        </Button>
      </div>
    </div>

    <!-- Advanced Filters -->
    <Card v-if="showFilters" class="mb-6 mx-4">
      <CardHeader>
        <CardTitle class="text-lg">Advanced Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Date Range -->
          <div>
            <Label class="pb-2">Date Range</Label>
            <Select
              v-model="filters.dateRange"
              @update:modelValue="applyFilters"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Status Filter -->
          <div>
            <Label class="pb-2">Status</Label>
            <Select v-model="filters.status" @update:modelValue="applyFilters">
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Value Range -->
          <div>
            <Label class="pb-2">Order Value</Label>
            <Select
              v-model="filters.valueRange"
              @update:modelValue="applyFilters"
            >
              <SelectTrigger>
                <SelectValue placeholder="All Values" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Values</SelectItem>
                <SelectItem value="high">≥ Rp 1,000,000</SelectItem>
                <SelectItem value="medium">Rp 500,000 - Rp 999,999</SelectItem>
                <SelectItem value="low">&lt; Rp 500,000</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Sort By -->
          <div>
            <Label class="pb-2">Sort By</Label>
            <Select v-model="filters.sortBy" @update:modelValue="applyFilters">
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Value</SelectItem>
                <SelectItem value="lowest">Lowest Value</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="flex items-center gap-4 mt-4">
          <div class="relative flex-1 max-w-sm">
            <Search
              class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"
            />
            <Input
              v-model="filters.search"
              placeholder="Search orders, customers..."
              class="pl-8"
              @input="applyFilters"
            />
          </div>
          <Button @click="clearFilters" variant="outline">
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Summary Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 px-4">
      <!-- Total Orders -->
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0"
        >
          <CardTitle class="text-sm font-medium"> Total Orders </CardTitle>
          <ShoppingCart />
        </CardHeader>
        <CardContent>
          <div class="text-xl font-bold">{{ filteredStats.totalOrders }}</div>
          <p class="text-xs text-muted-foreground">
            {{
              getPercentageChange(
                filteredStats.totalOrders,
                previousStats.totalOrders
              )
            }}% from last period
          </p>
        </CardContent>
      </Card>

      <!-- Total Revenue -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-">
          <CardTitle class="text-sm font-medium"> Total Revenue </CardTitle>
          <DollarSign class="text-green-500" />
        </CardHeader>
        <CardContent>
          <div class="text-xl font-bold text-green-600">
            Rp {{ formatPrice(filteredStats.totalRevenue) }}
          </div>
          <p class="text-xs text-muted-foreground">
            {{
              getPercentageChange(
                filteredStats.totalRevenue,
                previousStats.totalRevenue
              )
            }}% from last period
          </p>
        </CardContent>
      </Card>

      <!-- Average Order Value -->
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0"
        >
          <CardTitle class="text-sm font-medium"> Avg Order Value </CardTitle>
          <TrendingUp class="text-purple-500" />
        </CardHeader>
        <CardContent>
          <div class="text-xl font-bold text-purple-600">
            Rp {{ formatPrice(filteredStats.avgOrderValue) }}
          </div>
          <p class="text-xs text-muted-foreground">
            {{
              getPercentageChange(
                filteredStats.avgOrderValue,
                previousStats.avgOrderValue
              )
            }}% from last period
          </p>
        </CardContent>
      </Card>

      <!-- Completion Rate -->
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0"
        >
          <CardTitle class="text-sm font-medium"> Completion Rate </CardTitle>
          <CheckCircle class="text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div class="text-xl font-bold">
            {{ filteredStats.completionRate }}%
          </div>
          <p class="text-xs text-muted-foreground">
            {{
              getPercentageChange(
                filteredStats.completionRate,
                previousStats.completionRate
              )
            }}% from last period
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- History Table -->
    <div class="border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-24">Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Order Date</TableHead>
            <TableHead>Completion Date</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="isLoading">
            <TableCell colspan="9" class="text-center p-8">
              <div class="flex items-center justify-center">
                <RefreshCw class="animate-spin h-6 w-6 mr-3" />
                Loading order history...
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="paginatedHistory.length === 0">
            <TableCell colspan="9" class="text-center p-8 text-gray-500">
              <FileX class="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p class="text-lg font-medium">No orders found</p>
              <p class="text-sm">Try adjusting your filters</p>
            </TableCell>
          </TableRow>
          <TableRow
            v-else
            v-for="order in paginatedHistory"
            :key="order.id"
            class="hover:bg-muted/50"
          >
            <!-- Order ID -->
            <TableCell class="font-mono text-sm">
              {{ order.orderId || order.id }}
            </TableCell>

            <!-- Customer -->
            <TableCell>
              <div class="flex items-center">
                <div
                  class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3"
                >
                  <span class="text-sm font-medium text-gray-600">
                    {{ getCustomerInitial(order) }}
                  </span>
                </div>
                <div>
                  <div class="font-medium">
                    {{ order.customerName || "N/A" }}
                  </div>
                  <div class="text-sm text-muted-foreground">
                    {{ order.customerEmail || "N/A" }}
                  </div>
                </div>
              </div>
            </TableCell>

            <!-- Products -->
            <TableCell>
              <div class="space-y-1">
                <div
                  v-for="product in (order.products || []).slice(0, 2)"
                  :key="product.productId || product.id"
                  class="text-sm"
                >
                  {{ product.productName || product.name }} x{{
                    product.quantity
                  }}
                </div>
                <div
                  v-if="(order.products || []).length > 2"
                  class="text-xs text-muted-foreground"
                >
                  +{{ (order.products || []).length - 2 }} more items
                </div>
                <div
                  v-if="!order.products || order.products.length === 0"
                  class="text-sm text-muted-foreground"
                >
                  No products
                </div>
              </div>
            </TableCell>

            <!-- Order Date -->
            <TableCell>
              <div class="text-sm">
                {{ formatDate(order.orderDate || order.createdAt) }}
              </div>
            </TableCell>

            <!-- Completion Date -->
            <TableCell>
              <div class="text-sm">
                {{
                  order.completionDate
                    ? formatDate(order.completionDate)
                    : formatDate(order.updatedAt)
                }}
              </div>
            </TableCell>

            <!-- Duration -->
            <TableCell>
              <div class="text-sm">
                {{ calculateDuration(order) }}
              </div>
            </TableCell>

            <!-- Total -->
            <TableCell class="font-medium">
              Rp {{ formatPrice(getOrderTotal(order)) }}
            </TableCell>

            <!-- Status -->
            <TableCell>
              <Badge
                :variant="getStatusVariant(order.status)"
                class="capitalize"
              >
                {{ order.status || "pending" }}
              </Badge>
            </TableCell>

            <!-- Actions -->
            <TableCell class="text-center">
              <div class="flex items-center justify-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  @click="viewOrderDetails(order)"
                  title="View Details"
                >
                  <Eye class="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  @click="downloadInvoice(order.id)"
                  title="Download Invoice"
                >
                  <Download class="h-4 w-4" />
                </Button>
                <Button
                  v-if="order.status === 'delivered'"
                  variant="ghost"
                  size="sm"
                  @click="reorderItems(order)"
                  title="Reorder"
                >
                  <RotateCcw class="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between space-x-2 p-4 mx-4">
      <div class="flex items-center space-x-2">
        <p class="text-sm font-medium">Rows per page</p>
        <Select v-model="itemsPerPage" @update:modelValue="changePage(1)">
          <SelectTrigger class="h-8 w-16">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex items-center space-x-6 lg:space-x-8">
        <div class="flex w-32 items-center justify-center text-sm font-medium">
          Page {{ currentPage }} of {{ totalPages }}
        </div>
        <div class="flex items-center space-x-2">
          <Button
            variant="outline"
            class="h-8 w-8 p-0"
            @click="changePage(1)"
            :disabled="currentPage === 1"
          >
            <ChevronsLeft class="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            class="h-8 w-8 p-0"
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
          >
            <ChevronLeft class="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            class="h-8 w-8 p-0"
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
          >
            <ChevronRight class="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            class="h-8 w-8 p-0"
            @click="changePage(totalPages)"
            :disabled="currentPage === totalPages"
          >
            <ChevronsRight class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Order Details Modal -->
    <Dialog v-model:open="showDetailsModal">
      <DialogContent class="max-w-3xl">
        <DialogHeader>
          <DialogTitle
            >Order Details -
            {{ selectedOrder?.orderId || selectedOrder?.id }}</DialogTitle
          >
        </DialogHeader>
        <div v-if="selectedOrder" class="space-y-6">
          <!-- Order Timeline -->
          <div>
            <Label class="font-medium mb-3 block">Order Timeline</Label>
            <div class="space-y-3">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <div class="font-medium">Order Placed</div>
                  <div class="text-sm text-muted-foreground">
                    {{
                      formatDateTime(
                        selectedOrder.orderDate || selectedOrder.createdAt
                      )
                    }}
                  </div>
                </div>
              </div>
              <div
                v-if="
                  selectedOrder.processingStarted ||
                  selectedOrder.status === 'processing'
                "
                class="flex items-center space-x-3"
              >
                <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div>
                  <div class="font-medium">Processing Started</div>
                  <div class="text-sm text-muted-foreground">
                    {{
                      formatDateTime(
                        selectedOrder.processingStarted ||
                          selectedOrder.updatedAt
                      )
                    }}
                  </div>
                </div>
              </div>
              <div
                v-if="
                  selectedOrder.status === 'delivered' ||
                  selectedOrder.status === 'cancelled'
                "
                class="flex items-center space-x-3"
              >
                <div
                  :class="[
                    'w-3 h-3 rounded-full',
                    selectedOrder.status === 'delivered'
                      ? 'bg-green-500'
                      : 'bg-red-500',
                  ]"
                ></div>
                <div>
                  <div class="font-medium">
                    {{
                      selectedOrder.status === "delivered"
                        ? "Order Completed"
                        : "Order Cancelled"
                    }}
                  </div>
                  <div class="text-sm text-muted-foreground">
                    {{
                      formatDateTime(
                        selectedOrder.completionDate || selectedOrder.updatedAt
                      )
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Details -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="font-medium">Customer</Label>
              <p>{{ selectedOrder.customerName || "N/A" }}</p>
              <p class="text-sm text-muted-foreground">
                {{ selectedOrder.customerEmail || "N/A" }}
              </p>
            </div>
            <div>
              <Label class="font-medium">Total Duration</Label>
              <p>{{ calculateDuration(selectedOrder) }}</p>
            </div>
            <div>
              <Label class="font-medium">Total Value</Label>
              <p class="font-bold">
                Rp {{ formatPrice(getOrderTotal(selectedOrder)) }}
              </p>
            </div>
            <div>
              <Label class="font-medium">Status</Label>
              <Badge :variant="getStatusVariant(selectedOrder.status)">
                {{ selectedOrder.status || "pending" }}
              </Badge>
            </div>
          </div>

          <!-- Products -->
          <div
            v-if="selectedOrder.products && selectedOrder.products.length > 0"
          >
            <Label class="font-medium mb-3 block">Products</Label>
            <div class="space-y-2">
              <div
                v-for="product in selectedOrder.products"
                :key="product.productId || product.id"
                class="flex justify-between items-center p-2 bg-gray-50 rounded"
              >
                <span
                  >{{ product.productName || product.name }} x{{
                    product.quantity
                  }}</span
                >
                <span
                  >Rp
                  {{
                    formatPrice(
                      product.subtotal || product.unitPrice * product.quantity
                    )
                  }}</span
                >
              </div>
            </div>
          </div>

          <!-- Shipping Address -->
          <div v-if="selectedOrder.shippingAddress">
            <Label class="font-medium">Shipping Address</Label>
            <p class="text-sm">{{ selectedOrder.shippingAddress }}</p>
          </div>

          <!-- Notes -->
          <div v-if="selectedOrder.notes">
            <Label class="font-medium">Notes</Label>
            <p class="text-sm">{{ selectedOrder.notes }}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import HeadersContent from "~/components/ui/HeadersContent.vue";
import { ref, computed, onMounted } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
  Download,
  Filter,
  Search,
  RefreshCw,
  FileX,
  Eye,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle,
  ShoppingCart,
  DollarSign,
  TrendingUp,
} from "lucide-vue-next";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

definePageMeta({
  middleware: "auth",
});

// Firebase Instance
const { $firebase } = useNuxtApp();

// State
const showFilters = ref(false);
const showDetailsModal = ref(false);
const selectedOrder = ref(null);
const isLoading = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(20);

// Data
const allOrders = ref([]);
const previousStats = ref({
  totalOrders: 0,
  totalRevenue: 0,
  avgOrderValue: 0,
  completionRate: 0,
});

const filters = ref({
  dateRange: "month",
  status: "all",
  valueRange: "all",
  sortBy: "newest",
  search: "",
});

// Fetch orders from Firestore
const fetchOrderHistory = async () => {
  try {
    isLoading.value = true;
    const ordersCollection = collection($firebase.firestore, "orders");

    // Query for completed and cancelled orders only
    const historyQuery = query(
      ordersCollection,
      where("status", "in", ["completed", "cancelled"]),
      orderBy("updatedAt", "desc"),
      limit(1000) // Limit for performance
    );

    const querySnapshot = await getDocs(historyQuery);

    allOrders.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(
      "Order history fetched successfully:",
      allOrders.value.length,
      "orders"
    );
  } catch (error) {
    console.error("Error fetching order history:", error);
  } finally {
    isLoading.value = false;
  }
};

// Refresh history
const refreshHistory = async () => {
  await fetchOrderHistory();
};

// Helper functions
const getCustomerInitial = (order) => {
  const name = order.customerName || "N";
  return name.charAt(0).toUpperCase();
};

const getOrderTotal = (order) => {
  if (order.grandTotal) return order.grandTotal;
  if (order.total) return order.total;
  if (order.subtotal) return order.subtotal;
  return 0;
};

const calculateDuration = (order) => {
  if (!order.createdAt || !order.updatedAt) return "N/A";

  let startDate, endDate;

  // Handle Firestore Timestamp
  if (order.createdAt.toDate && typeof order.createdAt.toDate === "function") {
    startDate = order.createdAt.toDate();
  } else {
    startDate = new Date(order.createdAt);
  }

  if (order.updatedAt.toDate && typeof order.updatedAt.toDate === "function") {
    endDate = order.updatedAt.toDate();
  } else {
    endDate = new Date(order.updatedAt);
  }

  const diffInHours = Math.round((endDate - startDate) / (1000 * 60 * 60));
  return diffInHours > 0 ? `${diffInHours}h` : "< 1h";
};

const getPercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

// Computed
const filteredHistory = computed(() => {
  let filtered = [...allOrders.value];

  // Filter by status
  if (filters.value.status !== "all") {
    filtered = filtered.filter(
      (order) => order.status === filters.value.status
    );
  }

  // Filter by date range
  if (filters.value.dateRange !== "all") {
    const now = new Date();
    filtered = filtered.filter((order) => {
      const orderDate =
        order.updatedAt?.toDate?.() || new Date(order.updatedAt);

      switch (filters.value.dateRange) {
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
  }

  // Filter by value range
  if (filters.value.valueRange !== "all") {
    filtered = filtered.filter((order) => {
      const total = getOrderTotal(order);
      switch (filters.value.valueRange) {
        case "high":
          return total >= 1000000;
        case "medium":
          return total >= 500000 && total < 1000000;
        case "low":
          return total < 500000;
        default:
          return true;
      }
    });
  }

  // Filter by search
  if (filters.value.search) {
    const query = filters.value.search.toLowerCase();
    filtered = filtered.filter(
      (order) =>
        (order.orderId || order.id).toLowerCase().includes(query) ||
        (order.customerName || "").toLowerCase().includes(query) ||
        (order.customerEmail || "").toLowerCase().includes(query)
    );
  }

  // Sort
  switch (filters.value.sortBy) {
    case "newest":
      filtered.sort((a, b) => {
        const dateA = a.updatedAt?.toDate?.() || new Date(a.updatedAt);
        const dateB = b.updatedAt?.toDate?.() || new Date(b.updatedAt);
        return dateB - dateA;
      });
      break;
    case "oldest":
      filtered.sort((a, b) => {
        const dateA = a.updatedAt?.toDate?.() || new Date(a.updatedAt);
        const dateB = b.updatedAt?.toDate?.() || new Date(b.updatedAt);
        return dateA - dateB;
      });
      break;
    case "highest":
      filtered.sort((a, b) => getOrderTotal(b) - getOrderTotal(a));
      break;
    case "lowest":
      filtered.sort((a, b) => getOrderTotal(a) - getOrderTotal(b));
      break;
  }

  return filtered;
});

const filteredStats = computed(() => {
  const orders = filteredHistory.value;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce(
    (sum, order) => sum + getOrderTotal(order),
    0
  );
  const completedOrders = orders.filter(
    (order) => order.status === "completed"
  ).length;

  return {
    totalOrders,
    totalRevenue,
    avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
    completionRate:
      totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
  };
});

const totalPages = computed(() => {
  return Math.ceil(filteredHistory.value.length / parseInt(itemsPerPage.value));
});

const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * parseInt(itemsPerPage.value);
  const end = start + parseInt(itemsPerPage.value);
  return filteredHistory.value.slice(start, end);
});

// Methods
const formatPrice = (price) => {
  if (!price) return "0";
  return new Intl.NumberFormat("id-ID").format(price);
};

const formatDate = (dateInput) => {
  if (!dateInput) return "N/A";

  let date;
  if (dateInput.toDate && typeof dateInput.toDate === "function") {
    date = dateInput.toDate();
  } else if (typeof dateInput === "string") {
    date = new Date(dateInput);
  } else {
    date = dateInput;
  }

  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (dateInput) => {
  if (!dateInput) return "N/A";

  let date;
  if (dateInput.toDate && typeof dateInput.toDate === "function") {
    date = dateInput.toDate();
  } else if (typeof dateInput === "string") {
    date = new Date(dateInput);
  } else {
    date = dateInput;
  }

  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusVariant = (status) => {
  switch (status) {
    case "completed":
      return "success";
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
};

const applyFilters = () => {
  currentPage.value = 1;
};

const clearFilters = () => {
  filters.value = {
    dateRange: "all",
    status: "all",
    valueRange: "all",
    sortBy: "newest",
    search: "",
  };
  applyFilters();
};

const changePage = (page) => {
  currentPage.value = page;
};

const viewOrderDetails = (order) => {
  selectedOrder.value = order;
  showDetailsModal.value = true;
};

const downloadInvoice = (orderId) => {
  console.log("Download invoice for:", orderId);
  // TODO: Implement invoice download functionality
  alert("Invoice download feature will be implemented soon!");
};

const reorderItems = (order) => {
  console.log("Reorder items from:", order.id);
  // TODO: Navigate to add order with pre-filled data
  navigateTo("/orders/addOrder");
};

const exportHistory = () => {
  console.log("Export order history");
  // TODO: Implement CSV/Excel export
  const csvContent = generateCSV();
  downloadCSV(csvContent, "order-history.csv");
};

const generateCSV = () => {
  const headers = [
    "Order ID",
    "Customer",
    "Email",
    "Products",
    "Order Date",
    "Completion Date",
    "Duration",
    "Total",
    "Status",
  ];
  const rows = filteredHistory.value.map((order) => [
    order.orderId || order.id,
    order.customerName || "N/A",
    order.customerEmail || "N/A",
    (order.products || [])
      .map((p) => `${p.productName || p.name} x${p.quantity}`)
      .join("; "),
    formatDate(order.orderDate || order.createdAt),
    formatDate(order.updatedAt),
    calculateDuration(order),
    getOrderTotal(order),
    order.status || "pending",
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

// Initialize
onMounted(() => {
  fetchOrderHistory();
});
</script>

<style scoped>
/* Custom styles */
</style>
