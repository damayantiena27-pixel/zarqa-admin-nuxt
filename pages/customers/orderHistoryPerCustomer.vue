<template>
  <div class="container mx-auto min-w-full">
    <!-- Header -->
    <div class="flex items-center justify-between px-4">
      <HeadersContent
        title="Customer Order History"
        description="View order history for each customer"
      />
      <div class="flex gap-2">
        <Button @click="exportData" variant="outline">
          <Download class="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
    </div>

    <!-- Customer Selection -->
    <Card class="mb-6 mx-4">
      <CardHeader>
        <CardTitle class="text-lg">Select Customer</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label class="pb-2">Customer</Label>
            <Select v-model="selectedCustomerId" @update:modelValue="loadCustomerOrders">
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="customer in customers"
                  :key="customer.id"
                  :value="customer.id"
                >
                  {{ customer.fullName }} ({{ customer.email }})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label class="pb-2">Date Range</Label>
            <Select v-model="dateRange" @update:modelValue="loadCustomerOrders">
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Customer Stats -->
    <div v-if="selectedCustomer" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 px-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0">
          <CardTitle class="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingCart class="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ customerStats.totalOrders }}</div>
          <p class="text-xs text-muted-foreground">All orders</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0">
          <CardTitle class="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign class="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-green-600">
            Rp {{ formatPrice(customerStats.totalRevenue) }}
          </div>
          <p class="text-xs text-muted-foreground">Lifetime value</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0">
          <CardTitle class="text-sm font-medium">Avg Order Value</CardTitle>
          <TrendingUp class="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-purple-600">
            Rp {{ formatPrice(customerStats.avgOrderValue) }}
          </div>
          <p class="text-xs text-muted-foreground">Per order</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0">
          <CardTitle class="text-sm font-medium">Completed Orders</CardTitle>
          <CheckCircle class="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ customerStats.completedOrders }}</div>
          <p class="text-xs text-muted-foreground">
            {{ customerStats.completionRate }}% completion rate
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Orders Table -->
    <div v-if="selectedCustomerId" class="border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-24">Order ID</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Order Date</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Total</TableHead>
            <TableHead class="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="isLoading">
            <TableCell colspan="7" class="text-center p-8">
              <div class="flex items-center justify-center">
                <RefreshCw class="animate-spin h-6 w-6 mr-3" />
                Loading orders...
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="customerOrders.length === 0">
            <TableCell colspan="7" class="text-center p-8 text-gray-500">
              <FileX class="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p class="text-lg font-medium">No orders found</p>
              <p class="text-sm">This customer hasn't placed any orders yet</p>
            </TableCell>
          </TableRow>
          <TableRow
            v-else
            v-for="order in customerOrders"
            :key="order.id"
            class="hover:bg-muted/50"
          >
            <TableCell class="font-mono text-sm">
              {{ order.orderId || order.id }}
            </TableCell>
            <TableCell>
              <div class="space-y-1">
                <div
                  v-for="product in (order.products || []).slice(0, 2)"
                  :key="product.productId"
                  class="text-sm"
                >
                  {{ product.productName }} x{{ product.quantity }}
                </div>
                <div
                  v-if="(order.products || []).length > 2"
                  class="text-xs text-muted-foreground"
                >
                  +{{ (order.products || []).length - 2 }} more items
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div class="text-sm">
                {{ formatDate(order.createdAt) }}
              </div>
            </TableCell>
            <TableCell>
              <div class="text-sm">
                {{ order.deadline ? formatDate(order.deadline) : 'N/A' }}
              </div>
            </TableCell>
            <TableCell>
              <Badge :variant="getStatusVariant(order.status)" class="capitalize">
                {{ order.status || 'pending' }}
              </Badge>
            </TableCell>
            <TableCell class="text-right font-medium">
              Rp {{ formatPrice(order.grandTotal || order.total || 0) }}
            </TableCell>
            <TableCell class="text-center">
              <Button
                variant="ghost"
                size="sm"
                @click="viewOrderDetails(order)"
                title="View Details"
              >
                <Eye class="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Empty State -->
    <div v-else class="border rounded-lg p-12 text-center mx-4">
      <Users class="h-16 w-16 mx-auto mb-4 text-gray-400" />
      <h3 class="text-lg font-medium mb-2">Select a Customer</h3>
      <p class="text-muted-foreground">
        Choose a customer from the dropdown above to view their order history
      </p>
    </div>

    <!-- Order Details Modal -->
    <Dialog v-model:open="showDetailsModal">
      <DialogContent class="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Order Details - {{ selectedOrder?.orderId || selectedOrder?.id }}
          </DialogTitle>
        </DialogHeader>
        <div v-if="selectedOrder" class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="font-medium">Customer</Label>
              <p>{{ selectedOrder.customerName }}</p>
              <p class="text-sm text-muted-foreground">
                {{ selectedOrder.customerEmail }}
              </p>
            </div>
            <div>
              <Label class="font-medium">Order Date</Label>
              <p>{{ formatDateTime(selectedOrder.createdAt) }}</p>
            </div>
            <div>
              <Label class="font-medium">Status</Label>
              <Badge :variant="getStatusVariant(selectedOrder.status)">
                {{ selectedOrder.status }}
              </Badge>
            </div>
            <div>
              <Label class="font-medium">Total</Label>
              <p class="font-bold text-lg">
                Rp {{ formatPrice(selectedOrder.grandTotal || selectedOrder.total || 0) }}
              </p>
            </div>
          </div>

          <div v-if="selectedOrder.products && selectedOrder.products.length > 0">
            <Label class="font-medium mb-3 block">Products</Label>
            <div class="space-y-2">
              <div
                v-for="product in selectedOrder.products"
                :key="product.productId"
                class="flex justify-between items-center p-2 bg-gray-50 rounded"
              >
                <span>{{ product.productName }} x{{ product.quantity }}</span>
                <span>Rp {{ formatPrice(product.subtotal) }}</span>
              </div>
            </div>
          </div>

          <div v-if="selectedOrder.shippingAddress">
            <Label class="font-medium">Shipping Address</Label>
            <p class="text-sm">{{ selectedOrder.shippingAddress }}</p>
          </div>

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
  RefreshCw,
  FileX,
  Eye,
  CheckCircle,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-vue-next";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy as firestoreOrderBy,
} from "firebase/firestore";

definePageMeta({
  middleware: "auth",
});

const { $firebase } = useNuxtApp();

const customers = ref([]);
const customerOrders = ref([]);
const selectedCustomerId = ref("");
const selectedCustomer = ref(null);
const dateRange = ref("all");
const isLoading = ref(false);
const showDetailsModal = ref(false);
const selectedOrder = ref(null);

const customerStats = computed(() => {
  const orders = customerOrders.value;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce(
    (sum, order) => sum + (order.grandTotal || order.total || 0),
    0
  );
  const completedOrders = orders.filter((order) => order.status === "delivered" || order.status === "completed").length;

  return {
    totalOrders,
    totalRevenue,
    avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
    completedOrders,
    completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
  };
});

const loadCustomers = async () => {
  try {
    const customersRef = collection($firebase.firestore, "customers");
    const querySnapshot = await getDocs(customersRef);
    customers.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error loading customers:", error);
  }
};

const loadCustomerOrders = async () => {
  if (!selectedCustomerId.value) {
    customerOrders.value = [];
    return;
  }

  try {
    isLoading.value = true;

    // Get selected customer data
    selectedCustomer.value = customers.value.find(
      (c) => c.id === selectedCustomerId.value
    );

    if (!selectedCustomer.value) return;

    const ordersRef = collection($firebase.firestore, "orders");
    let q = query(
      ordersRef,
      where("customerEmail", "==", selectedCustomer.value.email),
      firestoreOrderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    let orders = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Apply date range filter
    if (dateRange.value !== "all") {
      const now = new Date();
      orders = orders.filter((order) => {
        const orderDate = order.createdAt?.toDate?.() || new Date(order.createdAt);

        switch (dateRange.value) {
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

    customerOrders.value = orders;
  } catch (error) {
    console.error("Error loading customer orders:", error);
  } finally {
    isLoading.value = false;
  }
};

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

  return date.toLocaleString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusVariant = (status) => {
  switch (status) {
    case "queue":
      return "default";
    case "pending":
      return "secondary";
    case "processing":
      return "default";
    case "shipped":
      return "outline";
    case "delivered":
    case "completed":
      return "default";
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
  }
};

const viewOrderDetails = (order) => {
  selectedOrder.value = order;
  showDetailsModal.value = true;
};

const exportData = () => {
  if (!selectedCustomer.value || customerOrders.value.length === 0) {
    alert("Please select a customer with orders first");
    return;
  }

  const headers = ["Order ID", "Order Date", "Products", "Status", "Total"];
  const rows = customerOrders.value.map((order) => [
    order.orderId || order.id,
    formatDate(order.createdAt),
    (order.products || [])
      .map((p) => `${p.productName} x${p.quantity}`)
      .join("; "),
    order.status || "pending",
    order.grandTotal || order.total || 0,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${selectedCustomer.value.fullName}-order-history.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

onMounted(() => {
  loadCustomers();
});
</script>

<style scoped>
</style>
