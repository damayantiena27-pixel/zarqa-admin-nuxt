<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

definePageMeta({
  middleware: "auth",
});

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DateRangePicker from "@/components/DateRangePicker.vue";
import {
  BanknoteArrowDown,
  ShoppingCart,
  Users,
  BanknoteArrowUp,
} from "lucide-vue-next";
import OverviewChart from "@/components/chart/OverviewChart.vue";
import OverviewChartLine from "@/components/chart/OverviewChartLine.vue";

const { $firebase } = useNuxtApp()

// State for dashboard stats
const stats = ref({
  totalRevenue: 0,
  totalSales: 0,
  totalCustomers: 0,
  totalExpenses: 0,
  previousRevenue: 0,
  previousSales: 0,
  previousCustomers: 0,
  previousExpenses: 0
})

const isLoading = ref(true)
const recentOrders = ref([])

// Fetch dashboard data
const fetchDashboardData = async () => {
  try {
    isLoading.value = true

    // Get current month range
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    const startTimestamp = Timestamp.fromDate(startOfMonth)
    const endTimestamp = Timestamp.fromDate(endOfMonth)

    // Get previous month range
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
    const prevStartTimestamp = Timestamp.fromDate(startOfPrevMonth)
    const prevEndTimestamp = Timestamp.fromDate(endOfPrevMonth)

    // 1. Get current month orders
    const ordersRef = collection($firebase.firestore, 'orders')
    const currentMonthQuery = query(
      ordersRef,
      where('createdAt', '>=', startTimestamp),
      where('createdAt', '<=', endTimestamp)
    )
    const currentMonthSnapshot = await getDocs(currentMonthQuery)

    let currentRevenue = 0
    currentMonthSnapshot.docs.forEach(doc => {
      const order = doc.data()
      currentRevenue += order.grandTotal || order.total || 0
    })
    stats.value.totalRevenue = currentRevenue
    stats.value.totalSales = currentMonthSnapshot.size

    // 2. Get previous month orders
    const prevMonthQuery = query(
      ordersRef,
      where('createdAt', '>=', prevStartTimestamp),
      where('createdAt', '<=', prevEndTimestamp)
    )
    const prevMonthSnapshot = await getDocs(prevMonthQuery)

    let prevRevenue = 0
    prevMonthSnapshot.docs.forEach(doc => {
      const order = doc.data()
      prevRevenue += order.grandTotal || order.total || 0
    })
    stats.value.previousRevenue = prevRevenue
    stats.value.previousSales = prevMonthSnapshot.size

    // 3. Get total customers
    const customersRef = collection($firebase.firestore, 'customers')
    const customersSnapshot = await getDocs(customersRef)
    stats.value.totalCustomers = customersSnapshot.size

    // 4. Get current month expenses
    const expensesRef = collection($firebase.firestore, 'expenses')
    const currentExpensesQuery = query(
      expensesRef,
      where('date', '>=', startTimestamp),
      where('date', '<=', endTimestamp)
    )
    const currentExpensesSnapshot = await getDocs(currentExpensesQuery)

    let currentExpenses = 0
    currentExpensesSnapshot.docs.forEach(doc => {
      const expense = doc.data()
      currentExpenses += expense.amount || 0
    })
    stats.value.totalExpenses = currentExpenses

    // 5. Get recent orders for "Penjualan Terbaru" section
    const recentOrdersQuery = query(
      ordersRef,
      where('createdAt', '>=', startTimestamp),
      where('createdAt', '<=', endTimestamp)
    )
    const recentSnapshot = await getDocs(recentOrdersQuery)
    recentOrders.value = recentSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt)
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt)
        return dateB - dateA
      })
      .slice(0, 5)

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  } finally {
    isLoading.value = false
  }
}

const calculatePercentageChange = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID').format(price)
}

const getInitials = (name: string) => {
  if (!name) return 'N/A'
  const words = name.split(' ')
  return words.map(word => word.charAt(0).toUpperCase()).join('')
}

onMounted(() => {
  fetchDashboardData()
})

// Data untuk chart
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
      label: "Pemasukan",
      data: Array.from(
        { length: 12 },
        () => Math.floor(Math.random() * 1000) + 500
      ),
      backgroundColor: "#FF4F0F",
      borderRadius: 4,
      borderSkipped: false,
    },
  ],
});
</script>

<template>
  <div class="p-4">
    <Tabs defaultValue="overview" class="w-full">
      <!-- Top Bar (Tabs Menu & Date Range Picker & Download Button) -->
      <div class="flex items-center justify-between gap-4 pb-4 px-4">
        <div>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="queue">Queue</TabsTrigger>
          </TabsList>
        </div>
        <div class="flex items-center justify-end gap-4">
          <DateRangePicker />
          <Button>Download</Button>
        </div>
      </div>

      <!-- Tabs Content - Konten untuk setiap tab -->
      <TabsContent value="overview">
        <!-- Content Dashboard untuk Overview -->
        <div class="flex flex-1 flex-col gap-8 pt-0">
          <div class="grid auto-rows-min gap-4 md:grid-cols-4">
            <!-- Total Pemasukan  -->
            <Card>
              <CardHeader
                class="flex flex-row items-center justify-between space-y-0"
              >
                <CardTitle class="text-sm font-medium">
                  Total Pemasukan
                </CardTitle>
                <BanknoteArrowUp />
              </CardHeader>
              <CardContent>
                <div class="text-xl font-bold">
                  <span v-if="isLoading">Loading...</span>
                  <span v-else>Rp {{ formatPrice(stats.totalRevenue) }}</span>
                </div>
                <p class="text-xs text-muted-foreground">
                  <span v-if="!isLoading">
                    {{ calculatePercentageChange(stats.totalRevenue, stats.previousRevenue) >= 0 ? '+' : '' }}{{ calculatePercentageChange(stats.totalRevenue, stats.previousRevenue) }}% dari bulan sebelumnya
                  </span>
                </p>
              </CardContent>
            </Card>

            <!-- Sales -->
            <Card>
              <CardHeader
                class="flex flex-row items-center justify-between space-y-0"
              >
                <CardTitle class="text-sm font-medium"> Penjualan </CardTitle>
                <ShoppingCart />
              </CardHeader>
              <CardContent>
                <div class="text-xl font-bold">
                  <span v-if="isLoading">Loading...</span>
                  <span v-else>{{ stats.totalSales }}</span>
                </div>
                <p class="text-xs text-muted-foreground">
                  <span v-if="!isLoading">
                    {{ calculatePercentageChange(stats.totalSales, stats.previousSales) >= 0 ? '+' : '' }}{{ calculatePercentageChange(stats.totalSales, stats.previousSales) }}% dari bulan sebelumnya
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                class="flex flex-row items-center justify-between space-y-0"
              >
                <CardTitle class="text-sm font-medium"> Customers </CardTitle>
                <Users />
              </CardHeader>
              <CardContent>
                <div class="text-xl font-bold">
                  <span v-if="isLoading">Loading...</span>
                  <span v-else>{{ stats.totalCustomers }}</span>
                </div>
                <p class="text-xs text-muted-foreground">
                  Total customers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                class="flex flex-row items-center justify-between space-y-0"
              >
                <CardTitle class="text-sm font-medium">
                  Total Pengeluaran
                </CardTitle>
                <BanknoteArrowDown />
              </CardHeader>
              <CardContent>
                <div class="text-xl font-bold">
                  <span v-if="isLoading">Loading...</span>
                  <span v-else>Rp {{ formatPrice(stats.totalExpenses) }}</span>
                </div>
                <p class="text-xs text-muted-foreground">
                  Bulan ini
                </p>
              </CardContent>
            </Card>
          </div>
          <!-- Charts and Recent Activity -->
          <div class="grid gap-4 md:grid-cols-3">
            <!-- Sales Overview Chart -->
            <Card class="md:col-span-2">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>Grafik penjualan bulanan</CardDescription>
              </CardHeader>
              <CardContent>
                <div class="h-80">
                  <OverviewChart :chart-data="chartData" />
                </div>
              </CardContent>
            </Card>

            <!-- Recent Sales -->
            <Card>
              <CardHeader>
                <CardTitle>Penjualan Terbaru</CardTitle>
                <CardDescription
                  >Anda mendapat {{ stats.totalSales }} penjualan bulan ini.</CardDescription
                >
              </CardHeader>
              <CardContent>
                <div v-if="isLoading" class="space-y-4">
                  <div class="text-center text-muted-foreground">Loading...</div>
                </div>
                <div v-else-if="recentOrders.length === 0" class="space-y-4">
                  <div class="text-center text-muted-foreground">Belum ada penjualan</div>
                </div>
                <div v-else class="space-y-4">
                  <div v-for="(order, index) in recentOrders" :key="order.id" class="flex items-center space-x-4">
                    <div
                      :class="[
                        'w-9 h-9 rounded-full flex items-center justify-center',
                        index === 0 ? 'bg-green-100' : '',
                        index === 1 ? 'bg-blue-100' : '',
                        index === 2 ? 'bg-purple-100' : '',
                        index === 3 ? 'bg-orange-100' : '',
                        index === 4 ? 'bg-red-100' : ''
                      ]"
                    >
                      <span :class="[
                        'text-sm font-medium',
                        index === 0 ? 'text-green-700' : '',
                        index === 1 ? 'text-blue-700' : '',
                        index === 2 ? 'text-purple-700' : '',
                        index === 3 ? 'text-orange-700' : '',
                        index === 4 ? 'text-red-700' : ''
                      ]">{{ getInitials(order.customerName) }}</span>
                    </div>
                    <div class="flex-1 space-y-1">
                      <p class="text-sm font-medium">{{ order.customerName }}</p>
                      <p class="text-xs text-muted-foreground">
                        {{ order.customerEmail }}
                      </p>
                    </div>
                    <div class="text-sm font-medium text-green-600">
                      +Rp{{ formatPrice(order.grandTotal || order.total || 0) }}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="analytics">
        <!-- Content Dashboard untuk Analytics -->
        <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                View detailed analytics and metrics for your application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div class="grid gap-4 md:grid-cols-2">
                <div
                  class="aspect-video rounded-xl bg-muted/50 flex items-center justify-center"
                >
                  <span class="text-muted-foreground">Analytics Chart 1</span>
                </div>
                <div
                  class="aspect-video rounded-xl bg-muted/50 flex items-center justify-center"
                >
                  <span class="text-muted-foreground">Analytics Chart 2</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="queue">
        <!-- Content Dashboard untuk Queue -->
        <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Card>
            <CardHeader>
              <CardTitle>Queue Management</CardTitle>
              <CardDescription>
                Monitor and manage your application queue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div class="rounded-xl bg-muted/50 p-4">
                  <div class="flex items-center justify-between">
                    <span>Queue Item 1</span>
                    <span class="text-sm text-muted-foreground">Pending</span>
                  </div>
                </div>
                <div class="rounded-xl bg-muted/50 p-4">
                  <div class="flex items-center justify-between">
                    <span>Queue Item 2</span>
                    <span class="text-sm text-muted-foreground"
                      >Processing</span
                    >
                  </div>
                </div>
                <div class="rounded-xl bg-muted/50 p-4">
                  <div class="flex items-center justify-between">
                    <span>Queue Item 3</span>
                    <span class="text-sm text-muted-foreground">Completed</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  </div>
</template>
