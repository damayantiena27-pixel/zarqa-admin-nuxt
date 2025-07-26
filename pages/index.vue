<script setup lang="ts">
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
                <div class="text-xl font-bold">Rp 45,231.89</div>
                <p class="text-xs text-muted-foreground">
                  +20.1% dari bulan sebelumnya
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
                <div class="text-xl font-bold">4000</div>
                <p class="text-xs text-muted-foreground">
                  +39.1% dari bulan sebelumnya
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
                <div class="text-xl font-bold">24</div>
                <p class="text-xs text-muted-foreground">
                  +20.1% dari bulan sebelumnya
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
                <div class="text-xl font-bold">Rp 100,231.89</div>
                <p class="text-xs text-muted-foreground">
                  +100.1% dari bulan sebelumnya
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
                  >Anda mendapat 265 penjualan bulan ini.</CardDescription
                >
              </CardHeader>
              <CardContent>
                <div class="space-y-4">
                  <div class="flex items-center space-x-4">
                    <div
                      class="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center"
                    >
                      <span class="text-sm font-medium text-green-700">OM</span>
                    </div>
                    <div class="flex-1 space-y-1">
                      <p class="text-sm font-medium">Olivia Martin</p>
                      <p class="text-xs text-muted-foreground">
                        olivia.martin@email.com
                      </p>
                    </div>
                    <div class="text-sm font-medium text-green-600">
                      +Rp1.999.000
                    </div>
                  </div>

                  <div class="flex items-center space-x-4">
                    <div
                      class="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center"
                    >
                      <span class="text-sm font-medium text-blue-700">JL</span>
                    </div>
                    <div class="flex-1 space-y-1">
                      <p class="text-sm font-medium">Jackson Lee</p>
                      <p class="text-xs text-muted-foreground">
                        jackson.lee@email.com
                      </p>
                    </div>
                    <div class="text-sm font-medium text-green-600">
                      +Rp39.000
                    </div>
                  </div>

                  <div class="flex items-center space-x-4">
                    <div
                      class="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center"
                    >
                      <span class="text-sm font-medium text-purple-700"
                        >IN</span
                      >
                    </div>
                    <div class="flex-1 space-y-1">
                      <p class="text-sm font-medium">Isabella Nguyen</p>
                      <p class="text-xs text-muted-foreground">
                        isabella.nguyen@email.com
                      </p>
                    </div>
                    <div class="text-sm font-medium text-green-600">
                      +Rp299.000
                    </div>
                  </div>

                  <div class="flex items-center space-x-4">
                    <div
                      class="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center"
                    >
                      <span class="text-sm font-medium text-orange-700"
                        >WK</span
                      >
                    </div>
                    <div class="flex-1 space-y-1">
                      <p class="text-sm font-medium">William Kim</p>
                      <p class="text-xs text-muted-foreground">
                        will@email.com
                      </p>
                    </div>
                    <div class="text-sm font-medium text-green-600">
                      +Rp99.000
                    </div>
                  </div>

                  <div class="flex items-center space-x-4">
                    <div
                      class="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center"
                    >
                      <span class="text-sm font-medium text-red-700">SD</span>
                    </div>
                    <div class="flex-1 space-y-1">
                      <p class="text-sm font-medium">Sofia Davis</p>
                      <p class="text-xs text-muted-foreground">
                        sofia.davis@email.com
                      </p>
                    </div>
                    <div class="text-sm font-medium text-green-600">
                      +Rp39.000
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
