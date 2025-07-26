<template>
  <div class="container mx-auto px-4 min-w-full">
    <div class="mx-auto space-y-6">
      <!-- Header -->
      <HeadersContent
        title="Product Dashboard"
        description="Monitor and manage your products"
      />

      <!-- Alert Messages -->
      <Alert
        v-if="message"
        :class="messageType === 'error' ? 'border-red-500' : 'border-green-500'"
        class=""
      >
        <AlertDescription>{{ message }}</AlertDescription>
      </Alert>

      <!-- Quick Actions -->
      <div class="flex justify-between gap-3">
        <div class="flex gap-2">
          <Button
            variant="outline"
            class="gap-2"
            @click="exportData"
            :disabled="loading || allProducts.length === 0"
          >
            <Download class="h-4 w-4" />
            Export Data
          </Button>
          <Button @click="navigateToAddProduct" class="gap-2">
            <Package class="h-4 w-4" />
            Add Product
          </Button>
        </div>
        <div class="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            @click="refreshData"
            :disabled="loading"
          >
            <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': loading }" />
            Refresh
          </Button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader
            class="flex flex-row items-center justify-between space-y-0"
          >
            <CardTitle class="text-sm font-medium">Total Products</CardTitle>
            <Package />
          </CardHeader>
          <CardContent>
            <div class="text-xl font-bold">{{ stats.totalProducts }}</div>
            <p class="text-xs text-muted-foreground">
              <span class="text-green-600"
                >+{{ stats.totalProductsGrowth }}%</span
              >
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            class="flex flex-row items-center justify-between space-y-0"
          >
            <CardTitle class="text-sm font-medium">Active Products</CardTitle>
            <ShoppingCart />
          </CardHeader>
          <CardContent>
            <div class="text-xl font-bold">{{ stats.activeProducts }}</div>
            <p class="text-xs text-muted-foreground">
              <span class="text-green-600"
                >+{{ stats.activeProductsGrowth }}%</span
              >
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            class="flex flex-row items-center justify-between space-y-0"
          >
            <CardTitle class="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle />
          </CardHeader>
          <CardContent>
            <div class="text-xl font-bold text-orange-600">
              {{ stats.lowStockItems }}
            </div>
            <p class="text-xs text-muted-foreground">
              <span class="text-red-600">{{ stats.lowStockGrowth }}</span>
              requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            class="flex flex-row items-center justify-between space-y-0"
          >
            <CardTitle class="text-sm font-medium">Total Value</CardTitle>
            <DollarSign />
          </CardHeader>
          <CardContent>
            <div class="text-xl font-bold text-green-600">
              Rp {{ formatCurrency(stats.totalValue) }}
            </div>
            <p class="text-xs text-muted-foreground">
              <span class="text-green-600">+{{ stats.valueGrowth }}%</span>
              from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- Charts and Categories Section -->
      <div class="grid gap-4 md:grid-cols-3">
        <!-- Sales Overview Chart -->
        <Card class="md:col-span-2">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Monthly product sales trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="h-80">
              <OverviewChart
                :chart-data="chartData"
                v-if="chartData.datasets.length > 0"
              />
              <div
                v-else
                class="flex items-center justify-center h-full text-muted-foreground"
              >
                <div class="text-center">
                  <Loader2 class="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p>Loading chart data...</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Top Categories -->
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div
                v-for="category in topCategories"
                :key="category.name"
                class="flex items-center justify-between"
              >
                <div class="flex items-center gap-2">
                  <div
                    class="w-3 h-3 rounded-full"
                    :style="{ backgroundColor: category.color }"
                  ></div>
                  <span class="text-sm font-medium">{{ category.name }}</span>
                </div>
                <div class="text-right">
                  <div class="text-sm font-bold">{{ category.count }}</div>
                  <div class="text-xs text-muted-foreground">
                    {{ category.percentage }}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Recent Activity & Top Products -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Activity -->
        <Card>
          <CardHeader class="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" @click="viewAllActivities">
              View all
            </Button>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div
                v-for="activity in recentActivities"
                :key="activity.id"
                class="flex items-start gap-3"
              >
                <div class="p-2 rounded-lg" :class="activity.iconBg">
                  <component
                    :is="activity.icon"
                    class="w-4 h-4"
                    :class="activity.iconColor"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium">{{ activity.title }}</p>
                  <p class="text-sm text-muted-foreground">
                    {{ activity.description }}
                  </p>
                  <p class="text-xs text-muted-foreground mt-1">
                    {{ formatTimeAgo(activity.time) }}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Top Products -->
        <Card>
          <CardHeader class="flex flex-row items-center justify-between">
            <CardTitle>Top Products</CardTitle>
            <Button variant="ghost" size="sm" @click="viewAllProducts">
              View all
            </Button>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div
                v-for="product in topProducts"
                :key="product.id"
                class="flex items-center gap-4"
              >
                <img
                  :src="product.imageUrl || '/placeholder-product.jpg'"
                  :alt="product.title"
                  class="w-12 h-12 rounded-lg object-cover"
                  @error="handleImageError"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">
                    {{ product.title }}
                  </p>
                  <p class="text-sm text-muted-foreground">
                    Stock: {{ product.stock }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold">
                    Rp {{ formatCurrency(product.price) }}
                  </p>
                  <Badge
                    :variant="
                      product.statusProduct === 'active'
                        ? 'default'
                        : 'secondary'
                    "
                    class="text-xs"
                  >
                    {{ product.statusProduct }}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Inventory Alerts -->
      <Card class="mb-4">
        <CardHeader class="flex flex-row items-center justify-between">
          <div>
            <CardTitle class="flex items-center gap-2">
              <AlertTriangle class="h-5 w-5 text-destructive" />
              Inventory Alerts
            </CardTitle>
          </div>
          <Badge variant="destructive">
            {{ inventoryAlerts.length }} alerts
          </Badge>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <!-- Search and Filter -->
            <div class="flex gap-4">
              <div class="relative flex-1">
                <Search
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"
                />
                <Input
                  placeholder="Search products..."
                  class="pl-10"
                  v-model="searchQuery"
                />
              </div>
              <Select v-model="selectedAlertFilter">
                <SelectTrigger class="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Alerts</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Alerts Table -->
            <div class="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Min Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="alert in filteredAlerts" :key="alert.id">
                    <TableCell>
                      <div class="flex items-center gap-3">
                        <img
                          :src="alert.imageUrl || '/placeholder-product.jpg'"
                          :alt="alert.title"
                          class="w-10 h-10 rounded-lg object-cover"
                          @error="handleImageError"
                        />
                        <div>
                          <p class="font-medium">{{ alert.title }}</p>
                          <p class="text-sm text-muted-foreground">
                            ID: {{ alert.id }}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{{ getCategoryName(alert.category) }}</TableCell>
                    <TableCell>
                      <span class="font-medium">{{ alert.stock }}</span>
                    </TableCell>
                    <TableCell>{{ alert.minLevel || 5 }}</TableCell>
                    <TableCell>
                      <Badge
                        :variant="
                          alert.stock === 0 ? 'destructive' : 'secondary'
                        "
                      >
                        {{ alert.stock === 0 ? "Out of Stock" : "Low Stock" }}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div class="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          class="gap-1"
                          @click="openRestockModal(alert)"
                        >
                          <History class="h-3 w-3" />
                          Restock
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          class="gap-1"
                          @click="openEditModal(alert)"
                        >
                          <Edit class="h-3 w-3" />
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <!-- No alerts message -->
            <div v-if="filteredAlerts.length === 0" class="text-center py-8">
              <AlertTriangle
                class="h-12 w-12 text-muted-foreground mx-auto mb-4"
              />
              <p class="text-muted-foreground">No inventory alerts found</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Restock Modal -->
    <Dialog v-model:open="restockModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restock Product</DialogTitle>
          <DialogDescription>
            Add stock to {{ selectedProduct?.title }}
          </DialogDescription>
        </DialogHeader>
        <div v-if="selectedProduct" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="text-sm font-medium">Product</Label>
              <p class="text-sm text-muted-foreground">
                {{ selectedProduct.title }}
              </p>
            </div>
            <div>
              <Label class="text-sm font-medium">Current Stock</Label>
              <p class="text-sm text-muted-foreground font-semibold">
                {{ selectedProduct.stock }} units
              </p>
            </div>
          </div>
          <div>
            <Label class="text-sm font-medium">Add Quantity *</Label>
            <Input
              v-model="restockForm.quantity"
              type="number"
              placeholder="Enter quantity to add"
              min="1"
              :disabled="restockLoading"
            />
          </div>
          <div>
            <Label class="text-sm font-medium">Reason</Label>
            <Textarea
              v-model="restockForm.reason"
              placeholder="Enter reason for restocking (optional)"
              rows="2"
              :disabled="restockLoading"
            />
          </div>
          <div class="p-3 bg-muted rounded-lg">
            <p class="text-sm">
              <span class="font-medium">New Stock:</span>
              {{
                selectedProduct.stock + (parseInt(restockForm.quantity) || 0)
              }}
              units
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            @click="closeRestockModal"
            :disabled="restockLoading"
          >
            Cancel
          </Button>
          <Button
            @click="handleRestock"
            :disabled="
              restockLoading ||
              !restockForm.quantity ||
              restockForm.quantity <= 0
            "
          >
            <Loader2 v-if="restockLoading" class="h-4 w-4 mr-2 animate-spin" />
            Restock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Edit Modal -->
    <Dialog v-model:open="editModalOpen">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription> Update product information </DialogDescription>
        </DialogHeader>
        <div v-if="selectedProduct" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="text-sm font-medium">Product ID</Label>
              <Input :value="selectedProduct.id" disabled class="bg-muted" />
            </div>
            <div>
              <Label class="text-sm font-medium">Title *</Label>
              <Input
                v-model="editForm.title"
                placeholder="Enter product title"
                :disabled="editLoading"
              />
            </div>
            <div>
              <Label class="text-sm font-medium">Category *</Label>
              <Select v-model="editForm.category" :disabled="editLoading">
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="category in categories"
                    :key="category.id"
                    :value="category.id"
                  >
                    {{ category.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label class="text-sm font-medium">Price *</Label>
              <Input
                v-model="editForm.price"
                type="number"
                placeholder="Enter price"
                :disabled="editLoading"
              />
            </div>
            <div>
              <Label class="text-sm font-medium">Stock *</Label>
              <Input
                v-model="editForm.stock"
                type="number"
                placeholder="Enter stock quantity"
                :disabled="editLoading"
              />
            </div>
            <div>
              <Label class="text-sm font-medium">Min Level</Label>
              <Input
                v-model="editForm.minLevel"
                type="number"
                placeholder="Enter minimum stock level"
                :disabled="editLoading"
              />
            </div>
            <div>
              <Label class="text-sm font-medium">Status</Label>
              <Select v-model="editForm.statusProduct" :disabled="editLoading">
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label class="text-sm font-medium">Description</Label>
            <Textarea
              v-model="editForm.description"
              placeholder="Enter product description"
              rows="3"
              :disabled="editLoading"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            @click="closeEditModal"
            :disabled="editLoading"
          >
            Cancel
          </Button>
          <Button
            @click="handleEdit"
            :disabled="editLoading || !editForm.title || !editForm.category"
          >
            <Loader2 v-if="editLoading" class="h-4 w-4 mr-2 animate-spin" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Package,
  AlertTriangle,
  DollarSign,
  Search,
  Download,
  Edit,
  History,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  TrendingUp,
  Loader2,
} from "lucide-vue-next";
import HeadersContent from "~/components/ui/HeadersContent.vue";
import OverviewChart from "@/components/chart/OverviewChart.vue";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";

definePageMeta({
  middleware: "auth",
});

const { $firebase } = useNuxtApp();

// Reactive data
const loading = ref(true);
const searchQuery = ref("");
const selectedAlertFilter = ref("all");
const message = ref("");
const messageType = ref("");

// Modal states
const restockModalOpen = ref(false);
const editModalOpen = ref(false);
const selectedProduct = ref(null);
const restockLoading = ref(false);
const editLoading = ref(false);

// Form data for modals
const restockForm = ref({
  quantity: 0,
  reason: "",
});

const editForm = ref({
  title: "",
  price: 0,
  stock: 0,
  minLevel: 0,
  category: "",
  statusProduct: "active",
  description: "",
});

// Products and categories
const allProducts = ref([]);
const categories = ref([]);

// Stats data
const stats = ref({
  totalProducts: 0,
  totalProductsGrowth: 0,
  activeProducts: 0,
  activeProductsGrowth: 0,
  lowStockItems: 0,
  lowStockGrowth: 0,
  totalValue: 0,
  valueGrowth: 0,
});

// Chart data
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
      label: "Sales",
      data: [],
      backgroundColor: "#FF4F0F",
      borderColor: "#FF4F0F",
      borderWidth: 2,
      fill: false,
      tension: 0.4,
    },
  ],
});

// Top categories
const topCategories = ref([]);

// Recent activities
const recentActivities = ref([]);

// Top products
const topProducts = ref([]);

// Computed properties
const inventoryAlerts = computed(() => {
  return allProducts.value.filter(
    (product) => product.stock <= (product.minLevel || 5) || product.stock === 0
  );
});

const filteredAlerts = computed(() => {
  let filtered = inventoryAlerts.value;

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (alert) =>
        alert.title?.toLowerCase().includes(query) ||
        alert.id?.toLowerCase().includes(query) ||
        getCategoryName(alert.category).toLowerCase().includes(query)
    );
  }

  // Filter by alert status
  if (selectedAlertFilter.value !== "all") {
    if (selectedAlertFilter.value === "out") {
      filtered = filtered.filter((alert) => alert.stock === 0);
    } else if (selectedAlertFilter.value === "low") {
      filtered = filtered.filter(
        (alert) => alert.stock > 0 && alert.stock <= (alert.minLevel || 5)
      );
    }
  }

  return filtered;
});

// Fetch functions
const fetchCategories = async () => {
  try {
    const q = query(
      collection($firebase.firestore, "categories"),
      orderBy("name")
    );
    const querySnapshot = await getDocs(q);

    categories.value = querySnapshot.docs.map((doc) => ({
      id: doc.data().id || doc.id,
      name: doc.data().name,
      firestoreId: doc.id,
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    showMessage("Failed to load categories", "error");
  }
};

const fetchProducts = async () => {
  try {
    loading.value = true;
    const productsRef = collection($firebase.firestore, "products");
    const q = query(productsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    allProducts.value = querySnapshot.docs.map((doc) => ({
      firestoreId: doc.id,
      id: doc.data().id,
      ...doc.data(),
    }));

    calculateStats();
    calculateTopCategories();
    generateChartData();
    fetchTopProducts();
    generateRecentActivities();

    showMessage("Data refreshed successfully!", "success");
  } catch (error) {
    console.error("Error fetching products:", error);
    showMessage("Failed to load products", "error");
  } finally {
    loading.value = false;
  }
};

const calculateStats = () => {
  const total = allProducts.value.length;
  const active = allProducts.value.filter(
    (p) => p.statusProduct === "active"
  ).length;
  const lowStock = allProducts.value.filter(
    (p) => p.stock <= (p.minLevel || 5)
  ).length;
  const totalValue = allProducts.value.reduce(
    (sum, p) => sum + (p.price || 0) * (p.stock || 0),
    0
  );

  stats.value = {
    totalProducts: total,
    totalProductsGrowth: Math.floor(Math.random() * 20) + 5,
    activeProducts: active,
    activeProductsGrowth: Math.floor(Math.random() * 15) + 3,
    lowStockItems: lowStock,
    lowStockGrowth: lowStock,
    totalValue: totalValue,
    valueGrowth: Math.floor(Math.random() * 25) + 10,
  };
};

const calculateTopCategories = () => {
  const categoryCount = {};
  const colors = [
    "#FF4F0F",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
  ];

  allProducts.value.forEach((product) => {
    const categoryName = getCategoryName(product.category);
    categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
  });

  const total = allProducts.value.length;
  topCategories.value = Object.entries(categoryCount)
    .map(([name, count], index) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      color: colors[index % colors.length],
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};

const generateChartData = () => {
  // Generate sample monthly data based on current products
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const baseValue = Math.floor(Math.random() * 5000) + 1000;
    const seasonalMultiplier = i >= 10 || i <= 1 ? 1.5 : 1;
    return Math.floor(baseValue * seasonalMultiplier);
  });

  chartData.value = {
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
        label: "Sales",
        data: monthlyData,
        backgroundColor: "#FF4F0F",
        borderColor: "#FF4F0F",
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      },
    ],
  };
};

const fetchTopProducts = () => {
  topProducts.value = allProducts.value
    .filter((p) => p.statusProduct === "active")
    .sort((a, b) => (b.price || 0) - (a.price || 0))
    .slice(0, 4);
};

const generateRecentActivities = () => {
  const activities = [];
  const now = new Date();

  const recentProducts = allProducts.value
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 4);

  recentProducts.forEach((product, index) => {
    const createdAt = new Date(product.createdAt || now);

    activities.push({
      id: index + 1,
      title: "New product added",
      description: `${product.title} added to ${getCategoryName(
        product.category
      )} category`,
      time: createdAt,
      icon: Plus,
      iconBg: "bg-green-50 dark:bg-green-950",
      iconColor: "text-green-600 dark:text-green-400",
    });
  });

  recentActivities.value = activities;
};

// Helper functions
const getCategoryName = (categoryId) => {
  const category = categories.value.find((cat) => cat.id === categoryId);
  return category ? category.name : categoryId || "Unknown";
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID").format(amount || 0);
};

const formatTimeAgo = (date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)} hours ago`;
  } else {
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  }
};

const handleImageError = (event) => {
  event.target.src = "/placeholder-product.jpg";
};

const showMessage = (msg, type) => {
  message.value = msg;
  messageType.value = type;
  setTimeout(() => {
    message.value = "";
    messageType.value = "";
  }, 5000);
};

// Action functions
const refreshData = async () => {
  await fetchProducts();
  await fetchCategories();
};

const navigateToAddProduct = () => {
  navigateTo("/admin/products/addProduct");
};

const exportData = async () => {
  try {
    if (allProducts.value.length === 0) {
      showMessage("No data to export", "error");
      return;
    }

    // Prepare CSV data
    const headers = [
      "Product ID",
      "Title",
      "Category",
      "Price",
      "Stock",
      "Min Level",
      "Status",
      "Description",
      "Created At",
    ];

    const csvData = allProducts.value.map((product) => [
      product.id || "",
      `"${(product.title || "").replace(/"/g, '""')}"`,
      `"${getCategoryName(product.category)}"`,
      product.price || 0,
      product.stock || 0,
      product.minLevel || 5,
      product.statusProduct || "active",
      `"${(product.description || "").replace(/"/g, '""')}"`,
      product.createdAt || "",
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `products_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    showMessage("Products exported successfully!", "success");
  } catch (error) {
    console.error("Export error:", error);
    showMessage("Failed to export data", "error");
  }
};

const viewAllActivities = () => {
  navigateTo("/admin/products/inventory");
};

const viewAllProducts = () => {
  navigateTo("/admin/products/listProducts");
};

// Modal functions
const openRestockModal = (product) => {
  selectedProduct.value = product;
  restockForm.value = {
    quantity: 0,
    reason: "",
  };
  restockModalOpen.value = true;
};

const openEditModal = (product) => {
  selectedProduct.value = product;
  editForm.value = {
    title: product.title || "",
    price: product.price || 0,
    stock: product.stock || 0,
    minLevel: product.minLevel || 5,
    category: product.category || "",
    statusProduct: product.statusProduct || "active",
    description: product.description || "",
  };
  editModalOpen.value = true;
};

const closeRestockModal = () => {
  restockModalOpen.value = false;
  selectedProduct.value = null;
  restockForm.value = {
    quantity: 0,
    reason: "",
  };
};

const closeEditModal = () => {
  editModalOpen.value = false;
  selectedProduct.value = null;
  editForm.value = {
    title: "",
    price: 0,
    stock: 0,
    minLevel: 0,
    category: "",
    statusProduct: "active",
    description: "",
  };
};

const handleRestock = async () => {
  try {
    if (!selectedProduct.value || restockForm.value.quantity <= 0) {
      showMessage("Please enter a valid quantity", "error");
      return;
    }

    restockLoading.value = true;
    const productRef = doc(
      $firebase.firestore,
      "products",
      selectedProduct.value.firestoreId
    );
    const newStock =
      selectedProduct.value.stock + parseInt(restockForm.value.quantity);

    await updateDoc(productRef, {
      stock: newStock,
      lastRestocked: new Date().toISOString(),
      restockReason: restockForm.value.reason || "Manual restock",
      updatedAt: new Date().toISOString(),
    });

    // Update local data
    const productIndex = allProducts.value.findIndex(
      (p) => p.firestoreId === selectedProduct.value.firestoreId
    );
    if (productIndex !== -1) {
      allProducts.value[productIndex].stock = newStock;
    }

    showMessage("Product restocked successfully!", "success");
    closeRestockModal();
    calculateStats();
  } catch (error) {
    console.error("Error restocking product:", error);
    showMessage("Failed to restock product. Please try again.", "error");
  } finally {
    restockLoading.value = false;
  }
};

const handleEdit = async () => {
  try {
    if (!selectedProduct.value) return;

    editLoading.value = true;
    const productRef = doc(
      $firebase.firestore,
      "products",
      selectedProduct.value.firestoreId
    );

    await updateDoc(productRef, {
      title: editForm.value.title,
      price: parseFloat(editForm.value.price),
      stock: parseInt(editForm.value.stock),
      minLevel: parseInt(editForm.value.minLevel),
      category: editForm.value.category,
      statusProduct: editForm.value.statusProduct,
      description: editForm.value.description,
      updatedAt: new Date().toISOString(),
    });

    // Update local data
    const productIndex = allProducts.value.findIndex(
      (p) => p.firestoreId === selectedProduct.value.firestoreId
    );
    if (productIndex !== -1) {
      allProducts.value[productIndex] = {
        ...allProducts.value[productIndex],
        ...editForm.value,
        price: parseFloat(editForm.value.price),
        stock: parseInt(editForm.value.stock),
        minLevel: parseInt(editForm.value.minLevel),
      };
    }

    showMessage("Product updated successfully!", "success");
    closeEditModal();
    calculateStats();
    calculateTopCategories();
    fetchTopProducts();
  } catch (error) {
    console.error("Error updating product:", error);
    showMessage("Failed to update product. Please try again.", "error");
  } finally {
    editLoading.value = false;
  }
};

// Initialize
onMounted(async () => {
  await fetchCategories();
  await fetchProducts();
});

// Watch for changes
watch(
  allProducts,
  () => {
    calculateStats();
    calculateTopCategories();
    generateChartData();
    fetchTopProducts();
    generateRecentActivities();
  },
  { deep: true }
);
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
