<template>
  <div class="container mx-auto overflow-hidden min-w-full">
    <!-- Header -->
    <div class="flex items-center justify-between px-4">
      <HeadersContent
        title="Queue Order Management"
        description="Manage order priorities using Greedy Algorithm"
      />
      <div class="flex gap-2">
        <Button @click="recalculatePriorities" variant="outline">
          <RefreshCw class="mr-2 h-4 w-4" />
          Recalculate Priorities
        </Button>
        <Button @click="showCapacityModal = true" class="bg-primary">
          <Settings class="mr-2 h-4 w-4" />
          Capacity Settings
        </Button>
      </div>
    </div>
    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 px-4">
      <!-- Total Antrian -->
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0"
        >
          <CardTitle class="text-sm font-medium"> Total Antrian </CardTitle>
          <Clock class="text-blue-500" />
        </CardHeader>
        <CardContent>
          <div class="text-xl font-bold">{{ actualQueueOrders.length }}</div>
          <p class="text-xs text-muted-foreground">Queue Orders</p>
        </CardContent>
      </Card>
      <!-- High Priority Count atau prioritas Utama -->
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0"
        >
          <CardTitle class="text-sm font-medium"> Prioritas Utama </CardTitle>
          <AlertTriangle class="text-red-500" />
        </CardHeader>
        <CardContent>
          <div class="text-xl font-bold">{{ highPriorityCount }}</div>
          <p class="text-xs text-muted-foreground">High Priority</p>
        </CardContent>
      </Card>
      <!-- Today's Capacity atau total kapasitas -->
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0"
        >
          <CardTitle class="text-sm font-medium">Kapasitas Hari Ini</CardTitle>
          <TrendingUp
            class="h-8 w-8"
            :class="
              actualTodayCapacity.current >= actualTodayCapacity.max
                ? 'text-red-500'
                : 'text-green-500'
            "
          />
        </CardHeader>
        <CardContent>
          <div class="text-xl font-bold">
            {{ actualTodayCapacity.current }}/{{ actualTodayCapacity.max }}
          </div>
          <p class="text-xs text-muted-foreground">Today's Capacity</p>
          <!-- Hapus progress bar ini -->
        </CardContent>
      </Card>
      <!-- Average Processing Time atau rata-rata waktu proses -->
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0"
        >
          <CardTitle class="text-sm font-medium">
            Rata-rata Waktu Proses
          </CardTitle>
          <Timer class="text-purple-500" />
        </CardHeader>
        <CardContent>
          <div class="text-xl font-bold">{{ averageProcessingTime }} jam</div>
          <p class="text-xs text-muted-foreground">Average Processing Time</p>
        </CardContent>
      </Card>
    </div>
    <!-- Priority Algorithm Info -->
    <Card class="mb-8 mx-4">
      <CardHeader>
        <CardTitle class="flex items-center">
          <Brain class="mr-2 h-5 w-5" />
          Greedy Algorithm Priority Calculation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
          <div class="text-center">
            <div class="font-semibold text-red-600">Deadline Score</div>
            <div class="text-muted-foreground">40% weight</div>
            <div class="text-xs mt-1">Urgent orders first</div>
          </div>
          <div class="text-center">
            <div class="font-semibold text-green-600">Value Score</div>
            <div class="text-muted-foreground">25% weight</div>
            <div class="text-xs mt-1">High-value priority</div>
          </div>
          <div class="text-center">
            <div class="font-semibold text-blue-600">Complexity Score</div>
            <div class="text-muted-foreground">20% weight</div>
            <div class="text-xs mt-1">Simple products first</div>
          </div>
          <div class="text-center">
            <div class="font-semibold text-purple-600">Customer Score</div>
            <div class="text-muted-foreground">10% weight</div>
            <div class="text-xs mt-1">VIP customers</div>
          </div>
          <div class="text-center">
            <div class="font-semibold text-orange-600">Time Score</div>
            <div class="text-muted-foreground">5% weight</div>
            <div class="text-xs mt-1">FIFO tie-breaker</div>
          </div>
        </div>
      </CardContent>
    </Card>
    <!-- Queue Table -->
    <div class="border max-w-screen overflow-hidden">
      <div class="">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-16 min-w-16">Queue #</TableHead>
              <TableHead class="w-24 min-w-24">Order ID</TableHead>
              <TableHead class="min-w-48">Customer</TableHead>
              <TableHead class="min-w-48">Products</TableHead>
              <TableHead class="min-w-40">Deadline</TableHead>
              <TableHead class="min-w-32">Value</TableHead>
              <TableHead class="min-w-48">Priority Score</TableHead>
              <TableHead class="min-w-24">Status</TableHead>
              <TableHead class="min-w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="(order, index) in sortedQueueOrders"
              :key="order.id"
              :class="getPriorityRowClass(order.priorityScore)"
            >
              <!-- Queue Position -->
              <TableCell class="font-bold text-center">
                <Badge :variant="getQueuePositionVariant(index + 1)">
                  {{ index + 1 }}
                </Badge>
              </TableCell>
              <!-- Order ID -->
              <TableCell class="font-mono text-sm">
                {{ order.orderId }}
              </TableCell>
              <!-- Customer -->
              <TableCell>
                <div class="flex items-center">
                  <div
                    class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3 flex-shrink-0"
                  >
                    <span class="text-sm font-medium text-gray-600">
                      {{ order.customerName.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <div class="min-w-0">
                    <div class="font-medium whitespace-nowrap">
                      {{ order.customerName }}
                    </div>
                    <Badge
                      v-if="order.customerType === 'vip'"
                      variant="secondary"
                      class="text-xs"
                    >
                      VIP
                    </Badge>
                  </div>
                </div>
              </TableCell>
              <!-- Products -->
              <TableCell>
                <div class="space-y-1">
                  <div
                    v-for="product in order.products.slice(0, 2)"
                    :key="product.productId"
                    class="text-sm whitespace-nowrap"
                  >
                    {{ product.productName }} x{{ product.quantity }}
                  </div>
                  <div
                    v-if="order.products.length > 2"
                    class="text-xs text-muted-foreground"
                  >
                    +{{ order.products.length - 2 }} more items
                  </div>
                </div>
              </TableCell>
              <!-- Deadline -->
              <TableCell>
                <div class="text-sm">
                  <div
                    :class="getDeadlineClass(order.deadline)"
                    class="whitespace-nowrap"
                  >
                    {{ formatDate(order.deadline) }}
                  </div>
                  <div class="text-xs text-muted-foreground whitespace-nowrap">
                    {{ getTimeUntilDeadline(order.deadline) }}
                  </div>
                </div>
              </TableCell>
              <!-- Value -->
              <TableCell class="font-medium">
                <div class="whitespace-nowrap">
                  Rp {{ formatPrice(order.grandTotal) }}
                </div>
              </TableCell>
              <!-- Priority Score -->
              <TableCell>
                <div class="flex items-center space-x-2 min-w-0">
                  <div class="flex-1 min-w-20">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div
                        class="h-2 rounded-full transition-all duration-300"
                        :class="getPriorityBarClass(order.priorityScore)"
                        :style="{
                          width: `${(order.priorityScore / 100) * 100}%`,
                        }"
                      ></div>
                    </div>
                  </div>
                  <span class="text-sm font-bold whitespace-nowrap">{{
                    order.priorityScore.toFixed(1)
                  }}</span>
                </div>
                <div
                  class="text-xs text-muted-foreground mt-1 whitespace-nowrap"
                >
                  D:{{ order.scores.deadline }} V:{{ order.scores.value }} C:{{
                    order.scores.complexity
                  }}
                  Cu:{{ order.scores.customer }}
                </div>
              </TableCell>
              <!-- Status -->
              <TableCell>
                <Badge :variant="getStatusVariant(order.status)">
                  {{ order.status }}
                </Badge>
              </TableCell>
              <!-- Actions -->
              <TableCell>
                <div class="flex items-center space-x-2">
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
                    @click="startProcessing(order.id)"
                    title="Start Processing"
                    :disabled="
                      order.status === 'processing' ||
                      actualTodayCapacity.current >= actualTodayCapacity.max
                    "
                  >
                    <Play class="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="moveToTop(order.id)"
                    title="Move to Top"
                    class="text-orange-600"
                  >
                    <ArrowUp class="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
    <!-- Order Details Modal -->
    <Dialog v-model:open="showDetailsModal">
      <DialogContent class="max-w-3xl overflow-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Order Details & Priority Breakdown</DialogTitle>
        </DialogHeader>
        <div v-if="selectedOrder" class="space-y-6">
          <!-- Basic Info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="font-medium">Order ID</Label>
              <p>{{ selectedOrder.orderId }}</p>
            </div>
            <div>
              <Label class="font-medium">Customer</Label>
              <p>
                {{ selectedOrder.customerName }}
                <Badge
                  v-if="selectedOrder.customerType === 'vip'"
                  variant="secondary"
                  class="ml-2"
                  >VIP</Badge
                >
              </p>
            </div>
            <div>
              <Label class="font-medium">Total Value</Label>
              <p class="font-bold">
                Rp {{ formatPrice(selectedOrder.grandTotal) }}
              </p>
            </div>
            <div>
              <Label class="font-medium">Deadline</Label>
              <p :class="getDeadlineClass(selectedOrder.deadline)">
                {{ formatDate(selectedOrder.deadline) }}
              </p>
            </div>
          </div>
          <!-- Priority Score Breakdown -->
          <div>
            <Label class="font-medium mb-3 block"
              >Priority Score Breakdown</Label
            >
            <div class="space-y-3">
              <div
                class="flex items-center justify-between p-3 bg-red-50 rounded"
              >
                <span>Deadline Score (40%)</span>
                <div class="flex items-center space-x-2">
                  <div class="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-red-500 h-2 rounded-full"
                      :style="{
                        width: `${(selectedOrder.scores.deadline / 40) * 100}%`,
                      }"
                    ></div>
                  </div>
                  <span class="font-bold"
                    >{{ selectedOrder.scores.deadline }}/40</span
                  >
                </div>
              </div>
              <div
                class="flex items-center justify-between p-3 bg-green-50 rounded"
              >
                <span>Value Score (25%)</span>
                <div class="flex items-center space-x-2">
                  <div class="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-green-500 h-2 rounded-full"
                      :style="{
                        width: `${(selectedOrder.scores.value / 25) * 100}%`,
                      }"
                    ></div>
                  </div>
                  <span class="font-bold"
                    >{{ selectedOrder.scores.value }}/25</span
                  >
                </div>
              </div>
              <div
                class="flex items-center justify-between p-3 bg-blue-50 rounded"
              >
                <span>Complexity Score (20%)</span>
                <div class="flex items-center space-x-2">
                  <div class="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-blue-500 h-2 rounded-full"
                      :style="{
                        width: `${
                          (selectedOrder.scores.complexity / 20) * 100
                        }%`,
                      }"
                    ></div>
                  </div>
                  <span class="font-bold"
                    >{{ selectedOrder.scores.complexity }}/20</span
                  >
                </div>
              </div>
              <div
                class="flex items-center justify-between p-3 bg-purple-50 rounded"
              >
                <span>Customer Score (10%)</span>
                <div class="flex items-center space-x-2">
                  <div class="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-purple-500 h-2 rounded-full"
                      :style="{
                        width: `${(selectedOrder.scores.customer / 10) * 100}%`,
                      }"
                    ></div>
                  </div>
                  <span class="font-bold"
                    >{{ selectedOrder.scores.customer }}/10</span
                  >
                </div>
              </div>
              <div
                class="flex items-center justify-between p-3 bg-orange-50 rounded"
              >
                <span>Time Score (5%)</span>
                <div class="flex items-center space-x-2">
                  <div class="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-orange-500 h-2 rounded-full"
                      :style="{
                        width: `${(selectedOrder.scores.time / 5) * 100}%`,
                      }"
                    ></div>
                  </div>
                  <span class="font-bold"
                    >{{ selectedOrder.scores.time }}/5</span
                  >
                </div>
              </div>
              <div
                class="flex items-center justify-between p-3 bg-gray-100 rounded border-2 border-gray-300"
              >
                <span class="font-bold">Total Priority Score</span>
                <span class="text-xl font-bold"
                  >{{ selectedOrder.priorityScore.toFixed(1) }}/100</span
                >
              </div>
            </div>
          </div>
          <!-- Products List -->
          <div>
            <Label class="font-medium mb-3 block">Products</Label>
            <div class="space-y-2">
              <div
                v-for="product in selectedOrder.products"
                :key="product.productId"
                class="flex justify-between items-center p-2 bg-gray-50 rounded"
              >
                <div>
                  <span class="font-medium">{{ product.productName }}</span>
                  <span class="text-sm text-muted-foreground ml-2">
                    (Complexity: {{ product.complexity }}/10)
                  </span>
                </div>
                <div class="text-right">
                  <div>Qty: {{ product.quantity }}</div>
                  <div class="text-sm text-muted-foreground">
                    Rp {{ formatPrice(product.subtotal) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    <!-- Capacity Settings Modal -->
    <Dialog v-model:open="showCapacityModal">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Production Capacity Settings</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div>
            <Label for="maxDaily">Maximum Orders Per Day</Label>
            <Input
              id="maxDaily"
              v-model.number="capacitySettings.maxOrdersPerDay"
              type="number"
              min="1"
            />
          </div>
          <div>
            <Label for="avgTime">Average Processing Time (hours)</Label>
            <Input
              id="avgTime"
              v-model.number="capacitySettings.avgProcessingTime"
              type="number"
              min="0.5"
              step="0.5"
            />
          </div>
          <div class="flex justify-end space-x-2">
            <Button variant="outline" @click="showCapacityModal = false"
              >Cancel</Button
            >
            <Button @click="saveCapacitySettings">Save Settings</Button>
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  RefreshCw,
  Settings,
  Clock,
  AlertTriangle,
  TrendingUp,
  Timer,
  Brain,
  Eye,
  Play,
  ArrowUp,
} from "lucide-vue-next";

// Firebase imports
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { useNuxtApp } from "#app";

definePageMeta({
  middleware: "auth",
});

const { $firebase } = useNuxtApp();

// State
const queueOrders = ref([]);
const showDetailsModal = ref(false);
const showCapacityModal = ref(false);
const selectedOrder = ref(null);
const customersCache = ref(new Map()); // Cache untuk customer data
const processingOrders = ref([]);

const capacitySettings = ref({
  maxOrdersPerDay: 20,
  avgProcessingTime: 4,
});

const todayCapacity = ref({
  current: 8,
  max: 20,
});

// Computed
const sortedQueueOrders = computed(() => {
  return [...actualQueueOrders.value].sort(
    (a, b) => b.priorityScore - a.priorityScore
  );
});

const highPriorityCount = computed(() => {
  return actualQueueOrders.value.filter((order) => order.priorityScore >= 70)
    .length;
});

const averageProcessingTime = computed(() => {
  return capacitySettings.value.avgProcessingTime;
});

// Ganti computed todayProcessingCount dengan:
const todayProcessedCount = computed(() => {
  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    0,
    0,
    0,
    0
  );
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59,
    999
  );

  return processingOrders.value.filter((order) => {
    // Gunakan processingStartTime jika ada, atau orderTime sebagai fallback
    const processDate =
      order.processingStartTime || order.orderTime || order.createdAt;
    return processDate >= startOfDay && processDate <= endOfDay;
  }).length;
});

const actualTodayCapacity = computed(() => {
  return {
    current: todayProcessedCount.value,
    max: capacitySettings.value.maxOrdersPerDay,
  };
});

// Tambahkan computed untuk memisahkan queue dan processing orders
const actualQueueOrders = computed(() => {
  return queueOrders.value.filter((order) => order.status === "queue");
});

const actualProcessingOrders = computed(() => {
  return queueOrders.value.filter((order) => order.status === "processing");
});

// Methods
const getCustomerData = async (customerEmail) => {
  // Check cache first
  if (customersCache.value.has(customerEmail)) {
    return customersCache.value.get(customerEmail);
  }

  try {
    // Query customers collection by email
    const customersRef = collection($firebase.firestore, "customers");
    const q = query(customersRef, where("email", "==", customerEmail));

    return new Promise((resolve) => {
      const unsubscribe = onSnapshot(q, (snapshot) => {
        let customerData = { customerType: "regular" }; // default

        if (!snapshot.empty) {
          const customerDoc = snapshot.docs[0];
          customerData = customerDoc.data();
        }

        // Cache the result
        customersCache.value.set(customerEmail, customerData);
        unsubscribe(); // Stop listening after first result
        resolve(customerData);
      });
    });
  } catch (error) {
    console.error("Error fetching customer data:", error);
    return { customerType: "regular" };
  }
};

// Tambahkan setelah getCustomerData function
const getProductData = async (productId) => {
  // Check cache first
  if (customersCache.value.has(`product_${productId}`)) {
    return customersCache.value.get(`product_${productId}`);
  }

  try {
    const productRef = doc($firebase.firestore, "products", productId);
    const productSnap = await getDoc(productRef);

    let productData = { complexity: 5 }; // default complexity

    if (productSnap.exists()) {
      productData = productSnap.data();
    }

    // Cache the result
    customersCache.value.set(`product_${productId}`, productData);
    return productData;
  } catch (error) {
    console.error("Error fetching product data:", error);
    return { complexity: 5 }; // default fallback
  }
};

// Update loadQueueOrders function
const loadQueueOrders = async () => {
  const ordersRef = collection($firebase.firestore, "orders");
  // Ganti query ini:
  // const q = query(ordersRef, where("status", "==", "queue"));
  // Dengan query ini:
  const q = query(ordersRef, where("status", "in", ["queue", "processing"]));

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    const orders = [];

    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();

      // Get customer data to determine VIP status
      const customerData = await getCustomerData(data.customerEmail);

      // Get product complexity data for each product
      const productsWithComplexity = await Promise.all(
        (data.products || []).map(async (product) => {
          const productData = await getProductData(product.productId);
          return {
            ...product,
            complexity: productData.complexity || 5,
          };
        })
      );

      // Periksa apakah deadline adalah Timestamp
      const deadline =
        data.deadline && typeof data.deadline.toDate === "function"
          ? data.deadline.toDate()
          : new Date(data.deadline);

      const order = {
        id: docSnapshot.id,
        orderId: data.orderId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerType: customerData.customerType || "regular",
        products: productsWithComplexity, // Use products with complexity
        deadline: deadline,
        grandTotal: data.grandTotal || 0,
        orderTime: data.orderTime?.toDate() || new Date(data.orderTime),
        status: data.status,
        priorityScore: 0,
        scores: { deadline: 0, value: 0, complexity: 0, customer: 0, time: 0 },
      };
      orders.push(order);
    }

    queueOrders.value = orders.map(calculatePriorityScore);
  });

  return unsubscribe;
};

// Tambahkan setelah loadQueueOrders function
const loadProcessingOrders = async () => {
  const ordersRef = collection($firebase.firestore, "orders");
  // Ambil semua order yang pernah diproses (processing, completed, shipped, delivered)
  const q = query(
    ordersRef,
    where("status", "in", ["processing", "completed", "shipped", "delivered"])
  );

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    const orders = [];

    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();

      const order = {
        id: docSnapshot.id,
        orderId: data.orderId,
        status: data.status,
        orderTime: data.orderTime?.toDate() || new Date(data.orderTime),
        createdAt: data.createdAt?.toDate() || new Date(data.createdAt),
        processingStartTime: data.processingStartTime?.toDate() || null,
      };
      orders.push(order);
    }

    processingOrders.value = orders;
  });

  return unsubscribe;
};

const calculatePriorityScore = (order) => {
  const now = new Date();
  const deadline = order.deadline;
  const orderTime = order.orderTime;

  // 1. Deadline Score (40% weight) - Greedy: Most urgent first
  const hoursUntilDeadline = (deadline - now) / (1000 * 60 * 60);
  let deadlineScore = 0;
  if (hoursUntilDeadline <= 0)
    deadlineScore = 40; // Overdue gets highest priority
  else if (hoursUntilDeadline <= 24) deadlineScore = 35;
  else if (hoursUntilDeadline <= 48) deadlineScore = 25;
  else if (hoursUntilDeadline <= 72) deadlineScore = 15;
  else deadlineScore = 5;

  // 2. Value Score (25% weight) - Greedy: Highest value first
  let valueScore = 0;
  const totalValue = order.products.reduce(
    (sum, p) => sum + (p.subtotal || 0),
    0
  );
  if (totalValue >= 2000000) valueScore = 25;
  else if (totalValue >= 1000000) valueScore = 20;
  else if (totalValue >= 500000) valueScore = 15;
  else if (totalValue >= 200000) valueScore = 10;
  else valueScore = 5;

  // 3. Complexity Score (20% weight) - Greedy: Simplest first for throughput
  const avgComplexity =
    order.products.reduce((sum, p) => sum + (p.complexity || 5), 0) /
    Math.max(order.products.length, 1);
  let complexityScore = 0;
  if (avgComplexity <= 3) complexityScore = 20;
  else if (avgComplexity <= 5) complexityScore = 15;
  else if (avgComplexity <= 7) complexityScore = 10;
  else complexityScore = 5;

  // 4. Customer Score (10% weight) - Greedy: VIP first
  // Fixed: Now properly checks customerType from customers collection
  const customerScore = order.customerType === "vip" ? 10 : 5;

  // 5. Time Score (5% weight) - FIFO tie-breaker - IMPROVED
  const hoursFromOrder = (now - orderTime) / (1000 * 60 * 60);
  let timeScore = 0;

  // Berikan score yang lebih progresif
  if (hoursFromOrder >= 24) {
    timeScore = 5; // Maksimal setelah 24 jam
  } else if (hoursFromOrder >= 12) {
    timeScore = 4; // 4 poin setelah 12 jam
  } else if (hoursFromOrder >= 6) {
    timeScore = 3; // 3 poin setelah 6 jam
  } else if (hoursFromOrder >= 3) {
    timeScore = 2; // 2 poin setelah 3 jam
  } else if (hoursFromOrder >= 1) {
    timeScore = 1; // 1 poin setelah 1 jam
  } else {
    timeScore = hoursFromOrder; // Gradual dari 0-1 untuk jam pertama
  }

  const totalScore =
    deadlineScore + valueScore + complexityScore + customerScore + timeScore;

  return {
    ...order,
    priorityScore: totalScore,
    scores: {
      deadline: deadlineScore,
      value: valueScore,
      complexity: complexityScore,
      customer: customerScore,
      time: Math.round(timeScore * 10) / 10,
    },
  };
};

const recalculatePriorities = () => {
  queueOrders.value = queueOrders.value.map(calculatePriorityScore);
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID").format(price);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTimeUntilDeadline = (deadline) => {
  const now = new Date();
  const diffHours = Math.ceil((deadline - now) / (1000 * 60 * 60));
  if (diffHours < 0) return "Overdue";
  if (diffHours < 24) return `${diffHours}h left`;
  const days = Math.ceil(diffHours / 24);
  return `${days}d left`;
};

const getDeadlineClass = (deadline) => {
  const now = new Date();
  const diffHours = (deadline - now) / (1000 * 60 * 60);
  if (diffHours < 0) return "text-red-600 font-bold";
  if (diffHours <= 24) return "text-red-500 font-medium";
  if (diffHours <= 48) return "text-orange-500";
  return "text-gray-700";
};

const getPriorityRowClass = (score) => {
  if (score >= 80) return "bg-red-50 border-l-4 border-red-500";
  if (score >= 60) return "bg-orange-50 border-l-4 border-orange-500";
  if (score >= 40) return "bg-yellow-50 border-l-4 border-yellow-500";
  return "hover:bg-muted/50";
};

const getPriorityBarClass = (score) => {
  if (score >= 80) return "bg-red-500";
  if (score >= 60) return "bg-orange-500";
  if (score >= 40) return "bg-yellow-500";
  return "bg-green-500";
};

const getQueuePositionVariant = (position) => {
  if (position <= 3) return "destructive";
  if (position <= 6) return "secondary";
  return "outline";
};

const getStatusVariant = (status) => {
  switch (status) {
    case "queue":
      return "secondary";
    case "processing":
      return "default";
    case "completed":
      return "outline";
    default:
      return "secondary";
  }
};

const viewOrderDetails = (order) => {
  selectedOrder.value = order;
  showDetailsModal.value = true;
};

const startProcessing = async (orderId) => {
  // Cek apakah kapasitas sudah penuh
  if (actualTodayCapacity.value.current >= actualTodayCapacity.value.max) {
    alert(
      `Kapasitas hari ini sudah penuh (${actualTodayCapacity.value.max} order). Tidak bisa memproses order baru.`
    );
    return;
  }

  try {
    const orderRef = doc($firebase.firestore, "orders", orderId);
    await updateDoc(orderRef, {
      status: "processing",
      processingStartTime: serverTimestamp(),
    });

    // HAPUS bagian ini - biarkan Firebase listener yang update UI
    // const orderIndex = queueOrders.value.findIndex(o => o.id === orderId);
    // if (orderIndex !== -1) {
    //   queueOrders.value.splice(orderIndex, 1);
    // }
  } catch (error) {
    console.error("Error starting processing:", error);
  }
};

const moveToTop = (orderId) => {
  const order = queueOrders.value.find((o) => o.id === orderId);
  if (order) {
    order.priorityScore = 100; // Force to top
  }
};

const saveCapacitySettings = () => {
  todayCapacity.value.max = capacitySettings.value.maxOrdersPerDay;
  showCapacityModal.value = false;

  // Optional: Save to localStorage for persistence
  localStorage.setItem(
    "capacitySettings",
    JSON.stringify(capacitySettings.value)
  );
  localStorage.setItem("todayCapacity", JSON.stringify(todayCapacity.value));
};

// Initialize
onMounted(async () => {
  const savedCapacitySettings = localStorage.getItem("capacitySettings");
  const savedTodayCapacity = localStorage.getItem("todayCapacity");

  if (savedCapacitySettings) {
    capacitySettings.value = JSON.parse(savedCapacitySettings);
  }

  await loadQueueOrders();
  await loadProcessingOrders(); // Tambahkan ini
});
</script>

<style scoped>
/* Custom animations for priority changes */
.priority-animation {
  transition: all 0.3s ease-in-out;
}
</style>
