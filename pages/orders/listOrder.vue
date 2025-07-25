<template>
  <div class="container mx-auto min-w-full">
    <!-- Title and Buttons -->
    <div class="flex items-center justify-between px-4">
      <HeadersContent
        title="List Orders"
        description="Manage your customer orders"
      />
      <div class="flex gap-2">
        <Button
          @click="refreshOrders"
          variant="outline"
          class="bg-background"
          :disabled="loading"
        >
          <RefreshCw
            class="mr-2 h-4 w-4"
            :class="{ 'animate-spin': loading }"
          />
          Refresh
        </Button>
        <Button @click="navigateToAddOrder" class="bg-primary">
          <Plus class="mr-2 h-4 w-4" />
          Add Order
        </Button>
      </div>
    </div>

    <!-- Search and Filter -->
    <div class="flex items-center gap-4 mb-8 px-4">
      <div class="relative flex-1 w-full">
        <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          placeholder="Search orders..."
          class="pl-8"
          @input="filterOrders"
        />
      </div>

      <Select v-model="selectedStatus" @update:modelValue="filterOrders">
        <SelectTrigger class="w-48">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="queue">Queue</SelectItem>
          <SelectItem value="processing">Processing</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="shipped">Shipped</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Select v-model="selectedDateRange" @update:modelValue="filterOrders">
        <SelectTrigger class="w-36">
          <SelectValue placeholder="Date Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Dates</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
      ></div>
    </div>

    <!-- Data Table -->
    <div v-else class="border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-12">
              <Checkbox
                :checked="selectAll"
                @update:checked="toggleSelectAll"
              />
            </TableHead>
            <TableHead class="w-24">Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead class="w-32">Items</TableHead>
            <TableHead class="text-left">Total</TableHead>
            <TableHead class="text-left">Status</TableHead>
            <TableHead class="text-center w-48">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="order in paginatedOrders"
            :key="order.id"
            class="hover:bg-muted/50"
          >
            <!-- Checkbox -->
            <TableCell>
              <Checkbox
                :checked="selectedOrders.includes(order.id)"
                @update:checked="toggleOrderSelection(order.id)"
              />
            </TableCell>
            <!-- Order ID -->
            <TableCell class="font-mono text-sm">
              {{ order.orderId || order.id }}
            </TableCell>
            <!-- Customer -->
            <TableCell class="font-medium">
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
            <!-- Date -->
            <TableCell>
              <div class="text-sm">
                <div>{{ formatDate(order.orderDate || order.createdAt) }}</div>
                <div class="text-muted-foreground">
                  {{ formatTime(order.orderDate || order.createdAt) }}
                </div>
              </div>
            </TableCell>
            <!-- Items -->
            <TableCell>
              <Badge variant="outline"> {{ getItemCount(order) }} items </Badge>
            </TableCell>
            <!-- Total -->
            <TableCell class="text-left font-medium">
              Rp {{ formatPrice(getOrderTotal(order)) }}
            </TableCell>
            <!-- Status -->
            <TableCell class="text-left">
              <Badge
                :variant="getStatusVariant(order.status)"
                class="capitalize"
              >
                {{ order.status || "pending" }}
              </Badge>
            </TableCell>
            <!-- Actions -->
            <TableCell class="text-center">
              <div class="flex items-center justify-end gap-1">
                <!-- Mark as Completed Button -->
                <Button
                  v-if="canMarkAsCompleted(order.status)"
                  variant="ghost"
                  size="sm"
                  @click="markAsCompleted(order.id)"
                  class="text-green-600 hover:text-green-700 hover:bg-green-50"
                  title="Mark as Completed"
                >
                  <Check class="h-4 w-4" />
                </Button>

                <!-- View Button -->
                <Button
                  variant="ghost"
                  size="sm"
                  @click="viewOrder(order.id)"
                  title="View Order"
                >
                  <Eye class="h-4 w-4" />
                </Button>

                <!-- Edit Button -->
                <Button
                  variant="ghost"
                  size="sm"
                  @click="editOrderModal(order.id)"
                  title="Edit Order"
                >
                  <Pencil class="h-4 w-4" />
                </Button>

                <!-- Delete Button -->
                <Button
                  variant="ghost"
                  size="sm"
                  @click="deleteOrder(order.id)"
                  title="Delete Order"
                >
                  <Trash2 class="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between space-x-2 p-4">
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

    <!-- Bulk Actions -->
    <div
      v-if="selectedOrders.length > 0"
      class="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div
        class="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-4"
      >
        <span class="text-sm font-medium"
          >{{ selectedOrders.length }} selected</span
        >
        <div class="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            @click="showBulkStatusModal = true"
          >
            <Settings class="h-4 w-4 mr-1" />
            Update Status
          </Button>
          <Button variant="secondary" size="sm" @click="bulkDelete">
            <Trash2 class="h-4 w-4 mr-1" />
            Delete
          </Button>
          <Button variant="secondary" size="sm" @click="clearSelection">
            <X class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Order Details Modal -->
    <Dialog v-model:open="showOrderModal">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle
            >Order Details -
            {{ selectedOrder?.orderId || selectedOrder?.id }}</DialogTitle
          >
        </DialogHeader>
        <div v-if="selectedOrder" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="font-medium">Customer</Label>
              <p>{{ selectedOrder.customerName || "N/A" }}</p>
              <p class="text-sm text-gray-500">
                {{ selectedOrder.customerEmail || "N/A" }}
              </p>
            </div>
            <div>
              <Label class="font-medium">Order Date</Label>
              <p>
                {{
                  formatDate(selectedOrder.orderDate || selectedOrder.createdAt)
                }}
              </p>
            </div>
            <div>
              <Label class="font-medium">Status</Label>
              <Badge :variant="getStatusVariant(selectedOrder.status)">
                {{ selectedOrder.status || "pending" }}
              </Badge>
            </div>
            <div>
              <Label class="font-medium">Total</Label>
              <p class="font-medium">
                Rp {{ formatPrice(getOrderTotal(selectedOrder)) }}
              </p>
            </div>
          </div>

          <div
            v-if="selectedOrder.products && selectedOrder.products.length > 0"
          >
            <Label class="font-medium">Products</Label>
            <div class="mt-2 space-y-2">
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

    <!-- Edit Order Modal -->
    <Dialog v-model:open="showEditModal">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle
            >Edit Order - {{ editOrder?.orderId || editOrder?.id }}</DialogTitle
          >
        </DialogHeader>
        <div v-if="editOrder" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="font-medium">Customer Name</Label>
              <Input
                v-model="editOrder.customerName"
                placeholder="Customer name"
              />
            </div>
            <div>
              <Label class="font-medium">Customer Email</Label>
              <Input
                v-model="editOrder.customerEmail"
                placeholder="Customer email"
                type="email"
              />
            </div>
            <div>
              <Label class="font-medium">Status</Label>
              <Select v-model="editOrder.status">
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="queue">Queue</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label class="font-medium">Order Date</Label>
              <p class="text-sm text-gray-600 mt-2">
                {{ formatDate(editOrder.orderDate || editOrder.createdAt) }}
              </p>
            </div>
          </div>

          <div>
            <Label class="font-medium">Shipping Address</Label>
            <Input
              v-model="editOrder.shippingAddress"
              placeholder="Shipping address"
            />
          </div>

          <div>
            <Label class="font-medium">Notes</Label>
            <Input v-model="editOrder.notes" placeholder="Order notes" />
          </div>

          <div v-if="editOrder.products && editOrder.products.length > 0">
            <Label class="font-medium">Products (Read Only)</Label>
            <div class="mt-2 space-y-2">
              <div
                v-for="product in editOrder.products"
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
            <div class="mt-2 pt-2 border-t">
              <div class="flex justify-between items-center font-medium">
                <span>Total:</span>
                <span>Rp {{ formatPrice(getOrderTotal(editOrder)) }}</span>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-4">
            <Button variant="outline" @click="showEditModal = false">
              Cancel
            </Button>
            <Button @click="saveOrderChanges" :disabled="savingOrder">
              {{ savingOrder ? "Saving..." : "Save Changes" }}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    <!-- Bulk Status Update Modal -->
    <Dialog v-model:open="showBulkStatusModal">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Status</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <p class="text-sm text-gray-600">
            Update status for {{ selectedOrders.length }} selected orders
          </p>
          <Select v-model="bulkStatusValue">
            <SelectTrigger>
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="queue">Queue</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <div class="flex justify-end gap-2">
            <Button variant="outline" @click="showBulkStatusModal = false">
              Cancel
            </Button>
            <Button @click="bulkStatusUpdate" :disabled="!bulkStatusValue">
              Update Status
            </Button>
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  Check,
} from "lucide-vue-next";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  where,
} from "firebase/firestore";

definePageMeta({
  middleware: "auth",
});

// Firebase Instance
const { $firebase } = useNuxtApp();

// Data Orders dari Firebase firestore
const allOrders = ref([]);
const loading = ref(true);

// Reactive data
const searchQuery = ref("");
const selectedStatus = ref("all");
const selectedDateRange = ref("all");
const filteredOrders = ref([]);
const selectedOrders = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const showOrderModal = ref(false);
const selectedOrder = ref(null);
const showBulkStatusModal = ref(false);
const bulkStatusValue = ref("");
const showEditModal = ref(false);
const editOrder = ref(null);
const savingOrder = ref(false);

// Fetch orders from Firestore except orders status completed
const fetchOrders = async () => {
  try {
    loading.value = true;
    const ordersCollection = collection($firebase.firestore, "orders");
    const ordersQuery = query(
      ordersCollection,
      orderBy("createdAt", "desc"),
      where("status", "not-in", ["completed"])
    );
    const querySnapshot = await getDocs(ordersQuery);

    allOrders.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    filteredOrders.value = [...allOrders.value];
    console.log("Orders fetched successfully:", allOrders.value);
    filterOrders(); // Initial filter to set up the view
  } catch (error) {
    console.error("Error fetching orders:", error);
  } finally {
    loading.value = false;
  }
};

// Refresh orders
const refreshOrders = async () => {
  await fetchOrders();
};

// Helper functions to handle different data structures
const getCustomerInitial = (order) => {
  const name = order.customerName || order.customer?.name || "N";
  return name.charAt(0).toUpperCase();
};

const getItemCount = (order) => {
  if (order.products && Array.isArray(order.products)) {
    return order.products.length;
  }
  return order.itemCount || 0;
};

const getOrderTotal = (order) => {
  if (order.grandTotal) return order.grandTotal;
  if (order.total) return order.total;
  if (order.subtotal) return order.subtotal;
  return 0;
};

// Check if order can be marked as completed
const canMarkAsCompleted = (status) => {
  return status === "shipped" || status === "processing";
};

// Computed properties
const selectAll = computed(() => {
  return (
    paginatedOrders.value.length > 0 &&
    paginatedOrders.value.every((order) =>
      selectedOrders.value.includes(order.id)
    )
  );
});

const totalPages = computed(() => {
  return Math.ceil(filteredOrders.value.length / parseInt(itemsPerPage.value));
});

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * parseInt(itemsPerPage.value);
  const end = start + parseInt(itemsPerPage.value);
  return filteredOrders.value.slice(start, end);
});

// Methods
const filterOrders = () => {
  let filtered = allOrders.value;

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (order) =>
        (order.orderId || order.id).toLowerCase().includes(query) ||
        (order.customerName || order.customer?.name || "")
          .toLowerCase()
          .includes(query) ||
        (order.customerEmail || order.customer?.email || "")
          .toLowerCase()
          .includes(query)
    );
  }

  // Filter by status
  if (selectedStatus.value && selectedStatus.value !== "all") {
    filtered = filtered.filter(
      (order) => order.status === selectedStatus.value
    );
  }

  // Filter by date range
  if (selectedDateRange.value && selectedDateRange.value !== "all") {
    const now = new Date();
    filtered = filtered.filter((order) => {
      const orderDate = new Date(
        order.orderDate || order.createdAt?.toDate?.() || order.createdAt
      );
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
        default:
          return true;
      }
    });
  }

  filteredOrders.value = filtered;
  currentPage.value = 1;
  selectedOrders.value = [];
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
      return "warning";
    case "completed":
      return "success";
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
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
    // Firestore Timestamp
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

const formatTime = (dateInput) => {
  if (!dateInput) return "N/A";

  let date;
  if (dateInput.toDate && typeof dateInput.toDate === "function") {
    // Firestore Timestamp
    date = dateInput.toDate();
  } else if (typeof dateInput === "string") {
    date = new Date(dateInput);
  } else {
    date = dateInput;
  }

  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toggleSelectAll = (checked) => {
  if (checked) {
    selectedOrders.value = [...paginatedOrders.value.map((o) => o.id)];
  } else {
    selectedOrders.value = [];
  }
};

const toggleOrderSelection = (orderId) => {
  const index = selectedOrders.value.indexOf(orderId);
  if (index > -1) {
    selectedOrders.value.splice(index, 1);
  } else {
    selectedOrders.value.push(orderId);
  }
};

const changePage = (page) => {
  currentPage.value = page;
  selectedOrders.value = [];
};

const clearSelection = () => {
  selectedOrders.value = [];
};

// Mark order as completed
const markAsCompleted = async (orderId) => {
  try {
    await updateDoc(doc($firebase.firestore, "orders", orderId), {
      status: "completed",
      updatedAt: new Date(),
    });

    // Update local state
    const orderIndex = allOrders.value.findIndex(
      (order) => order.id === orderId
    );
    if (orderIndex !== -1) {
      allOrders.value[orderIndex].status = "completed";
    }

    // Re-filter to update the view
    filterOrders();

    console.log("Order marked as completed successfully");
  } catch (error) {
    console.error("Error marking order as completed:", error);
  }
};

// Navigation methods
const navigateToAddOrder = () => {
  console.log("Navigate to add order");
  navigateTo("/orders/addOrder");
};

const viewOrder = (id) => {
  selectedOrder.value = allOrders.value.find((order) => order.id === id);
  showOrderModal.value = true;
};

const editOrderModal = (id) => {
  const order = allOrders.value.find((order) => order.id === id);
  // Create a copy to avoid mutating the original data
  editOrder.value = { ...order };
  showEditModal.value = true;
};

const saveOrderChanges = async () => {
  if (!editOrder.value) return;

  try {
    savingOrder.value = true;

    const updateData = {
      customerName: editOrder.value.customerName,
      customerEmail: editOrder.value.customerEmail,
      status: editOrder.value.status,
      shippingAddress: editOrder.value.shippingAddress,
      notes: editOrder.value.notes,
      updatedAt: new Date(),
    };

    await updateDoc(
      doc($firebase.firestore, "orders", editOrder.value.id),
      updateData
    );

    // Update local state
    const orderIndex = allOrders.value.findIndex(
      (order) => order.id === editOrder.value.id
    );
    if (orderIndex !== -1) {
      allOrders.value[orderIndex] = {
        ...allOrders.value[orderIndex],
        ...updateData,
      };
    }

    // Re-filter to update the view
    filterOrders();

    // Close modal
    showEditModal.value = false;
    editOrder.value = null;

    console.log("Order updated successfully");
  } catch (error) {
    console.error("Error updating order:", error);
  } finally {
    savingOrder.value = false;
  }
};

const editOrderOld = (id) => {
  console.log("Edit order:", id);
  navigateTo(`/orders/editOrder/${id}`);
};

const deleteOrder = async (id) => {
  if (confirm("Are you sure you want to delete this order?")) {
    try {
      await deleteDoc(doc($firebase.firestore, "orders", id));
      await fetchOrders(); // Refresh the orders list
      console.log("Order deleted successfully");
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  }
};

const bulkDelete = async () => {
  if (
    confirm(
      `Are you sure you want to delete ${selectedOrders.value.length} orders?`
    )
  ) {
    try {
      const deletePromises = selectedOrders.value.map((orderId) =>
        deleteDoc(doc($firebase.firestore, "orders", orderId))
      );
      await Promise.all(deletePromises);
      await fetchOrders(); // Refresh the orders list
      selectedOrders.value = [];
      console.log("Orders deleted successfully");
    } catch (error) {
      console.error("Error deleting orders:", error);
    }
  }
};

const bulkStatusUpdate = async () => {
  if (!bulkStatusValue.value) return;

  try {
    const updatePromises = selectedOrders.value.map((orderId) =>
      updateDoc(doc($firebase.firestore, "orders", orderId), {
        status: bulkStatusValue.value,
        updatedAt: new Date(),
      })
    );

    await Promise.all(updatePromises);

    // Update local state
    selectedOrders.value.forEach((orderId) => {
      const orderIndex = allOrders.value.findIndex(
        (order) => order.id === orderId
      );
      if (orderIndex !== -1) {
        allOrders.value[orderIndex].status = bulkStatusValue.value;
      }
    });

    // Re-filter to update the view
    filterOrders();

    // Close modal and clear selection
    showBulkStatusModal.value = false;
    bulkStatusValue.value = "";
    selectedOrders.value = [];

    console.log(
      `Bulk status update completed for ${selectedOrders.value.length} orders`
    );
  } catch (error) {
    console.error("Error updating order status:", error);
  }
};

// Initialize
onMounted(() => {
  fetchOrders();
});
</script>

<style></style>
