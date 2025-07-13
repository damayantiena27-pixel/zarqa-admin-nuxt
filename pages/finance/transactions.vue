<template>
  <div class="container mx-auto px-4 min-w-full">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <HeadersContent
        title="Transaction Management"
        description="Monitor all financial transactions and cash flow"
      />
      <div class="flex space-x-2">
        <Button variant="outline" @click="showFilters = !showFilters">
          <Filter class="mr-2 h-4 w-4" />
          Filters
        </Button>
        <Button variant="outline" @click="exportTransactions">
          <Download class="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button @click="showAddTransactionModal = true">
          <Plus class="mr-2 h-4 w-4" />
          Add Income Transaction
        </Button>
      </div>
    </div>

    <!-- Alert Messages -->
    <Alert
      v-if="message"
      :class="messageType === 'error' ? 'border-red-500' : 'border-green-500'"
      class="mb-6"
    >
      <AlertDescription>{{ message }}</AlertDescription>
    </Alert>

    <!-- Filters -->
    <Card v-if="showFilters" class="mb-6">
      <CardContent class="pt-6">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <Label>Transaction Type</Label>
            <Select v-model="filters.type">
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Category</Label>
            <Select v-model="filters.category">
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="commission">Commission</SelectItem>
                <SelectItem value="rental">Rental</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
                <SelectItem value="materials">Materials</SelectItem>
                <SelectItem value="labor">Labor costs</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="transportation">Transportation</SelectItem>
                <SelectItem value="others">Others</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select v-model="filters.status">
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Date From</Label>
            <Input type="date" v-model="filters.dateFrom" />
          </div>
          <div>
            <Label>Date To</Label>
            <Input type="date" v-model="filters.dateTo" />
          </div>
        </div>
        <div class="flex justify-between items-center mt-4">
          <div class="flex items-center space-x-2">
            <Label>Search:</Label>
            <Input
              v-model="filters.search"
              placeholder="Search transactions..."
              class="w-64"
            />
          </div>
          <div class="flex space-x-2">
            <Button variant="outline" @click="clearFilters">Clear</Button>
            <Button @click="applyFilters">Apply Filters</Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Enhanced Transaction Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0"
        >
          <CardTitle class="text-sm font-medium">Total Income</CardTitle>
          <TrendingUp class="text-green-500" />
        </CardHeader>
        <CardContent>
          <div class="text-xl font-bold text-green-600">
            Rp {{ formatPrice(transactionSummary.totalIncome) }}
          </div>
          <p class="text-xs text-muted-foreground">
            {{ transactionSummary.incomeCount }} completed transactions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0"
        >
          <CardTitle class="text-sm font-medium flex items-center">
            Total Expenses
          </CardTitle>
          <TrendingDown class="text-red-500" />
        </CardHeader>
        <CardContent>
          <div class="text-xl font-bold text-red-600">
            Rp {{ formatPrice(transactionSummary.totalExpenses) }}
          </div>
          <p class="text-xs text-muted-foreground">
            {{ transactionSummary.expenseCount }} completed transactions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0"
        >
          <CardTitle class="text-sm font-medium">Actual Cash Flow</CardTitle>
          <Wallet />
        </CardHeader>
        <CardContent>
          <div
            class="text-xl font-bold"
            :class="
              transactionSummary.actualCashFlow >= 0
                ? 'text-green-600'
                : 'text-red-600'
            "
          >
            Rp {{ formatPrice(transactionSummary.actualCashFlow) }}
          </div>
          <p class="text-xs text-muted-foreground">
            {{ getCompletionRate() }}% transactions completed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0"
        >
          <CardTitle class="text-sm font-medium">Pending</CardTitle>
          <Clock />
        </CardHeader>
        <CardContent>
          <div class="text-xl font-bold text-orange-600">
            {{ transactionSummary.pendingCount }}
          </div>
          <p class="text-xs text-muted-foreground">
            Rp {{ formatPrice(transactionSummary.pendingValue) }} pending
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Business Metrics -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardHeader>
          <CardTitle>Financial Health</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="flex justify-between">
            <span class="text-sm text-muted-foreground">Net Profit</span>
            <span
              class="font-medium"
              :class="
                transactionSummary.netProfit >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              "
            >
              Rp {{ formatPrice(transactionSummary.netProfit) }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-muted-foreground">Profit Margin</span>
            <span class="font-medium">{{ getProfitMargin() }}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-muted-foreground">Operating Ratio</span>
            <span class="font-medium">{{ getOperatingRatio() }}%</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Status</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="flex justify-between">
            <span class="text-sm text-muted-foreground">Cash Inflow</span>
            <span class="font-medium text-green-600">
              Rp {{ formatPrice(transactionSummary.cashInflow) }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-muted-foreground">Cash Outflow</span>
            <span class="font-medium text-red-600">
              Rp {{ formatPrice(transactionSummary.cashOutflow) }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-muted-foreground">Net Cash Flow</span>
            <span
              class="font-medium"
              :class="
                transactionSummary.actualCashFlow >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              "
            >
              Rp {{ formatPrice(transactionSummary.actualCashFlow) }}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Stats</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="flex justify-between">
            <span class="text-sm text-muted-foreground"
              >Total Transactions</span
            >
            <span class="font-medium">{{ filteredTransactions.length }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-muted-foreground">Avg Transaction</span>
            <span class="font-medium">
              Rp {{ formatPrice(getAverageTransactionValue()) }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-muted-foreground">Success Rate</span>
            <span class="font-medium">{{ getSuccessRate() }}%</span>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Transactions Table -->
    <Card class="mb-4">
      <CardHeader class="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            Showing {{ filteredTransactions.length }} of
            {{ transactions.length }} transactions
          </CardDescription>
        </div>
        <div class="flex items-center space-x-2">
          <Select v-model="itemsPerPage">
            <SelectTrigger class="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span class="text-sm text-muted-foreground">per page</span>
        </div>
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
        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead class="w-32">Transaction ID</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="transaction in paginatedTransactions"
              :key="transaction.id"
            >
              <TableCell class="font-mono text-sm">
                {{ transaction.transactionId }}
              </TableCell>
              <TableCell>
                <div class="flex items-center space-x-3">
                  <div
                    class="p-2 rounded-full"
                    :class="
                      transaction.type === 'income'
                        ? 'bg-green-100'
                        : 'bg-red-100'
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
                    <div
                      v-if="transaction.entity"
                      class="text-sm text-muted-foreground"
                    >
                      {{ transaction.entity }}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  :variant="
                    transaction.type === 'income' ? 'default' : 'secondary'
                  "
                >
                  {{ transaction.type }}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{{
                  getCategoryLabel(transaction.category)
                }}</Badge>
              </TableCell>
              <TableCell
                class="font-bold"
                :class="
                  transaction.type === 'income'
                    ? 'text-green-600'
                    : 'text-red-600'
                "
              >
                {{ transaction.type === "income" ? "+" : "-" }}Rp
                {{ formatPrice(transaction.amount) }}
              </TableCell>
              <TableCell>
                <div class="text-sm">
                  {{ formatDate(transaction.date) }}
                </div>
                <div class="text-xs text-muted-foreground">
                  {{ formatTime(transaction.date) }}
                </div>
              </TableCell>
              <TableCell>
                <div class="flex items-center space-x-2">
                  <component
                    :is="getPaymentIcon(transaction.paymentMethod)"
                    class="h-4 w-4 text-muted-foreground"
                  />
                  <span class="text-sm">{{
                    getPaymentMethodLabel(transaction.paymentMethod)
                  }}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge :variant="getStatusVariant(transaction.status)">
                  {{ transaction.status }}
                </Badge>
              </TableCell>
              <TableCell>
                <div class="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="viewTransaction(transaction)"
                  >
                    <Eye class="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="editTransaction(transaction)"
                  >
                    <Edit class="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="deleteTransaction(transaction.id)"
                    class="text-red-600"
                  >
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <!-- Pagination -->
        <div class="flex items-center justify-between mt-4">
          <div class="text-sm text-muted-foreground">
            Showing {{ (currentPage - 1) * parseInt(itemsPerPage) + 1 }} to
            {{
              Math.min(
                currentPage * parseInt(itemsPerPage),
                filteredTransactions.length
              )
            }}
            of {{ filteredTransactions.length }} results
          </div>
          <div class="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              @click="previousPage"
              :disabled="currentPage === 1"
            >
              <ChevronLeft class="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              @click="nextPage"
              :disabled="currentPage === totalPages"
            >
              Next
              <ChevronRight class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Add/Edit Transaction Modal -->
    <Dialog v-model:open="showAddTransactionModal" :key="modalKey">
      <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto min-w-2xl">
        <DialogHeader>
          <DialogTitle>{{
            editingTransaction
              ? "Edit Income Transaction"
              : "Add New Income Transaction"
          }}</DialogTitle>
          <p class="text-sm text-muted-foreground">
            Record income transactions like sales, services, commissions, etc.
          </p>
        </DialogHeader>

        <div class="max-h-[70vh] overflow-y-auto px-1">
          <form @submit.prevent="saveTransaction" class="space-y-4">
            <!-- Loading Status -->
            <div v-if="uploadingStatus" class="text-center py-4">
              <div
                class="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"
              ></div>
              <p class="mt-2 text-sm text-muted-foreground">
                {{ uploadingStatus }}
              </p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label for="category" class="mb-2">Income Category *</Label>
                <Select
                  v-model="transactionForm.category"
                  :disabled="isLoading"
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select income category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales Revenue</SelectItem>
                    <SelectItem value="service">Service Income</SelectItem>
                    <SelectItem value="commission">Commission</SelectItem>
                    <SelectItem value="rental">Rental Income</SelectItem>
                    <SelectItem value="investment"
                      >Investment Returns</SelectItem
                    >
                    <SelectItem value="others">Other Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label for="amount" class="mb-2">Amount (Rp) *</Label>
                <Input
                  id="amount"
                  type="number"
                  v-model="transactionForm.amount"
                  :disabled="isLoading"
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label for="entity" class="mb-2">Customer/Client *</Label>
                <Input
                  id="entity"
                  v-model="transactionForm.entity"
                  :disabled="isLoading"
                  placeholder="Customer or client name"
                  required
                />
              </div>
              <div>
                <Label for="description" class="mb-2">Description *</Label>
                <Input
                  id="description"
                  v-model="transactionForm.description"
                  :disabled="isLoading"
                  placeholder="Brief description of income"
                  required
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label for="date" class="mb-2">Transaction Date *</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  v-model="transactionForm.date"
                  :disabled="isLoading"
                  required
                />
              </div>
              <div>
                <Label for="paymentMethod" class="mb-2">Payment Method *</Label>
                <Select
                  v-model="transactionForm.paymentMethod"
                  :disabled="isLoading"
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="How was payment received?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="debit_card">Debit Card</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="digital_wallet"
                      >Digital Wallet</SelectItem
                    >
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label for="status" class="mb-2">Transaction Status</Label>
                <Select v-model="transactionForm.status" :disabled="isLoading">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label for="reference" class="mb-2">Reference Number</Label>
                <Input
                  id="reference"
                  v-model="transactionForm.reference"
                  :disabled="isLoading"
                  placeholder="INV-2025-001, ORD-001, etc."
                />
              </div>
            </div>

            <div>
              <Label for="notes" class="mb-2">Additional Notes</Label>
              <Textarea
                id="notes"
                v-model="transactionForm.notes"
                :disabled="isLoading"
                rows="3"
                placeholder="Any additional information about this income transaction..."
              />
            </div>

            <div>
              <Label for="receipt" class="mb-2">Receipt/Invoice</Label>
              <Input
                id="receipt"
                type="file"
                accept="image/*,application/pdf"
                :disabled="isLoading"
                @change="handleFileUpload"
              />
              <p class="text-sm text-muted-foreground mt-1">
                Maximum file size: 5MB. Supported formats: JPG, PNG, PDF
              </p>
            </div>
          </form>
        </div>

        <div class="flex justify-end space-x-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            :disabled="isLoading"
            @click="handleCancelTransaction"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            :disabled="isLoading"
            @click="saveTransaction"
            class="bg-green-600 hover:bg-green-700"
          >
            {{ editingTransaction ? "Update" : "Save" }} Income Transaction
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <!-- View Transaction Modal -->
    <Dialog v-model:open="showViewModal">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>
        <div v-if="selectedTransaction" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="font-medium mb-2">Transaction ID</Label>
              <p class="font-mono">{{ selectedTransaction.transactionId }}</p>
            </div>
            <div>
              <Label class="font-medium mb-2">Type</Label>
              <Badge
                :variant="
                  selectedTransaction.type === 'income'
                    ? 'default'
                    : 'secondary'
                "
              >
                {{ selectedTransaction.type }}
              </Badge>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="font-medium mb-2">Amount</Label>
              <p
                class="text-lg font-bold"
                :class="
                  selectedTransaction.type === 'income'
                    ? 'text-green-600'
                    : 'text-red-600'
                "
              >
                {{ selectedTransaction.type === "income" ? "+" : "-" }}Rp
                {{ formatPrice(selectedTransaction.amount) }}
              </p>
            </div>
            <div>
              <Label class="font-medium mb-2">Status</Label>
              <Badge :variant="getStatusVariant(selectedTransaction.status)">
                {{ selectedTransaction.status }}
              </Badge>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="font-medium mb-2">Customer/Client</Label>
              <p>{{ selectedTransaction.entity }}</p>
            </div>
            <div>
              <Label class="font-medium mb-2">Description</Label>
              <p>{{ selectedTransaction.description }}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="font-medium mb-2">Category</Label>
              <p>{{ getCategoryLabel(selectedTransaction.category) }}</p>
            </div>
            <div>
              <Label class="font-medium mb-2">Payment Method</Label>
              <p>
                {{ getPaymentMethodLabel(selectedTransaction.paymentMethod) }}
              </p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="font-medium mb-2">Date</Label>
              <p>
                {{ formatDate(selectedTransaction.date) }}
                {{ formatTime(selectedTransaction.date) }}
              </p>
            </div>
            <div v-if="selectedTransaction.reference">
              <Label class="font-medium mb-2">Reference</Label>
              <p>{{ selectedTransaction.reference }}</p>
            </div>
          </div>
          <div v-if="selectedTransaction.notes">
            <Label class="font-medium mb-2">Notes</Label>
            <p class="text-sm text-muted-foreground">
              {{ selectedTransaction.notes }}
            </p>
          </div>
          <div v-if="selectedTransaction.receiptUrl">
            <Label class="font-medium mb-2">Receipt/Invoice</Label>
            <a
              :href="selectedTransaction.receiptUrl"
              target="_blank"
              class="text-blue-600 underline"
              >View Receipt</a
            >
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from "vue";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Truck,
  Users,
  Settings,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  FileText,
  Zap,
  Car,
  Briefcase,
  Home,
  TrendingUpIcon,
} from "lucide-vue-next";
import HeadersContent from "~/components/ui/HeadersContent.vue";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

definePageMeta({
  middleware: "auth",
});

const config = useRuntimeConfig();
const { user } = useAuth();

// State
const showFilters = ref(false);
const showAddTransactionModal = ref(false);
const showViewModal = ref(false);
const editingTransaction = ref(null);
const selectedTransaction = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref("25");
const uploadingStatus = ref("");
const message = ref("");
const messageType = ref("");
const isLoading = ref(false);
const loadingTransactions = ref(false);
const modalKey = ref(0);

const filters = reactive({
  type: "all",
  category: "all",
  status: "all",
  dateFrom: "",
  dateTo: "",
  search: "",
});

// Form State - Default to income
const transactionForm = reactive({
  type: "income",
  category: "",
  entity: "",
  description: "",
  amount: "",
  date: "",
  paymentMethod: "",
  status: "completed",
  reference: "",
  notes: "",
  receiptFile: null,
});

const transactions = ref([]);

// Function to upload receipt to Cloudinary
const uploadToCloudinary = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", config.public.cloudinaryUploadPreset);
    formData.append("folder", "TokoKueDlillah/transactions/receipts");

    const timestamp = new Date().getTime();
    const filename = `receipt_${timestamp}_${file.name.replace(
      /[^a-zA-Z0-9.]/g,
      "_"
    )}`;
    formData.append(
      "public_id",
      `TokoKueDlillah/transactions/receipts/${filename}`
    );

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.public.cloudinaryCloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error(`Failed to upload receipt: ${error.message}`);
  }
};

// Function to generate transaction ID
const generateTransactionId = async () => {
  try {
    const { $firebase } = useNuxtApp();
    const currentYear = new Date().getFullYear();
    const yearPrefix = `TXN-${currentYear}`;

    const transactionsQuery = query(
      collection($firebase.firestore, "transactions"),
      where("transactionId", ">=", `${yearPrefix}-001`),
      where("transactionId", "<", `${yearPrefix}-999`),
      orderBy("transactionId", "desc"),
      limit(1)
    );

    const querySnapshot = await getDocs(transactionsQuery);
    let nextNumber = 1;

    if (!querySnapshot.empty) {
      const lastTransaction = querySnapshot.docs[0].data();
      const lastId = lastTransaction.transactionId;
      const parts = lastId.split("-");
      if (parts.length === 3) {
        const lastNumber = parseInt(parts[2]) || 0;
        nextNumber = lastNumber + 1;
      }
    }

    const formattedNumber = nextNumber.toString().padStart(3, "0");
    return `${yearPrefix}-${formattedNumber}`;
  } catch (error) {
    console.error("Error generating transaction ID:", error);
    return `TXN-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`;
  }
};

// Function to fetch transactions from Firestore
const fetchTransactions = async () => {
  try {
    loadingTransactions.value = true;
    const { $firebase } = useNuxtApp();

    const transactionsQuery = query(
      collection($firebase.firestore, "transactions"),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(transactionsQuery);
    transactions.value = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate()
          : new Date(),
      };
    });

    console.log("Fetched transactions:", transactions.value);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    showMessage("Failed to load transactions", "error");
  } finally {
    loadingTransactions.value = false;
  }
};

// Computed
const filteredTransactions = computed(() => {
  let filtered = transactions.value;

  if (filters.type !== "all") {
    filtered = filtered.filter((t) => t.type === filters.type);
  }

  if (filters.category !== "all") {
    filtered = filtered.filter((t) => t.category === filters.category);
  }

  if (filters.status !== "all") {
    filtered = filtered.filter((t) => t.status === filters.status);
  }

  if (filters.dateFrom) {
    filtered = filtered.filter(
      (t) => new Date(t.date) >= new Date(filters.dateFrom)
    );
  }

  if (filters.dateTo) {
    filtered = filtered.filter(
      (t) => new Date(t.date) <= new Date(filters.dateTo)
    );
  }

  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.description.toLowerCase().includes(search) ||
        t.transactionId.toLowerCase().includes(search) ||
        (t.reference && t.reference.toLowerCase().includes(search)) ||
        (t.entity && t.entity.toLowerCase().includes(search))
    );
  }

  return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
});

const totalPages = computed(() => {
  return Math.ceil(
    filteredTransactions.value.length / parseInt(itemsPerPage.value)
  );
});

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * parseInt(itemsPerPage.value);
  const end = start + parseInt(itemsPerPage.value);
  return filteredTransactions.value.slice(start, end);
});

// Enhanced transaction summary
const transactionSummary = computed(() => {
  // Only completed transactions for accurate cash flow
  const completedTransactions = filteredTransactions.value.filter(
    (t) => t.status === "completed"
  );
  const pendingTransactions = filteredTransactions.value.filter(
    (t) => t.status === "pending"
  );

  const income = completedTransactions.filter((t) => t.type === "income");
  const expenses = completedTransactions.filter((t) => t.type === "expense");

  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  const pendingValue = pendingTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  // Actual cash flow = only completed transactions
  const actualCashFlow = totalIncome - totalExpenses;
  const netProfit = totalIncome - totalExpenses; // Same as actual cash flow for completed transactions

  return {
    totalIncome,
    totalExpenses,
    netProfit,
    actualCashFlow,
    cashInflow: totalIncome, // Completed income transactions
    cashOutflow: totalExpenses, // Completed expense transactions
    incomeCount: income.length,
    expenseCount: expenses.length,
    pendingCount: pendingTransactions.length,
    pendingValue,
  };
});

// Business metrics methods
const getProfitMargin = () => {
  if (transactionSummary.value.totalIncome === 0) return "0.0";
  return (
    (transactionSummary.value.netProfit /
      transactionSummary.value.totalIncome) *
    100
  ).toFixed(1);
};

const getOperatingRatio = () => {
  if (transactionSummary.value.totalIncome === 0) return "0.0";
  return (
    (transactionSummary.value.totalExpenses /
      transactionSummary.value.totalIncome) *
    100
  ).toFixed(1);
};

const getCompletionRate = () => {
  const total = filteredTransactions.value.length;
  if (total === 0) return "0";
  const completed = filteredTransactions.value.filter(
    (t) => t.status === "completed"
  ).length;
  return ((completed / total) * 100).toFixed(0);
};

const getAverageTransactionValue = () => {
  const completed = filteredTransactions.value.filter(
    (t) => t.status === "completed"
  );
  if (completed.length === 0) return 0;
  const total = completed.reduce((sum, t) => sum + t.amount, 0);
  return total / completed.length;
};

const getSuccessRate = () => {
  const total = filteredTransactions.value.length;
  if (total === 0) return "0";
  const successful = filteredTransactions.value.filter(
    (t) => t.status === "completed"
  ).length;
  return ((successful / total) * 100).toFixed(0);
};

// Methods
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

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getCategoryLabel = (category) => {
  const labels = {
    sales: "Sales Revenue",
    service: "Service Income",
    commission: "Commission",
    rental: "Rental Income",
    investment: "Investment Returns",
    materials: "Materials",
    labor: "Labor",
    operational: "Operational",
    marketing: "Marketing",
    utilities: "Utilities",
    transportation: "Transportation",
    others: "Others",
  };
  return labels[category] || category;
};

const getPaymentMethodLabel = (method) => {
  const labels = {
    cash: "Cash",
    bank_transfer: "Bank Transfer",
    credit_card: "Credit Card",
    debit_card: "Debit Card",
    check: "Check",
    digital_wallet: "Digital Wallet",
  };
  return labels[method] || method;
};

const getStatusVariant = (status) => {
  const variants = {
    completed: "default",
    pending: "secondary",
    cancelled: "destructive",
  };
  return variants[status] || "secondary";
};

const getTransactionIcon = (category) => {
  const icons = {
    sales: ShoppingCart,
    service: Briefcase,
    commission: TrendingUpIcon,
    rental: Home,
    investment: TrendingUp,
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

const getPaymentIcon = (method) => {
  const icons = {
    cash: Banknote,
    bank_transfer: Building,
    credit_card: CreditCard,
    debit_card: CreditCard,
    check: FileText,
    digital_wallet: Smartphone,
  };
  return icons[method] || CreditCard;
};

const showMessage = (msg, type) => {
  message.value = msg;
  messageType.value = type;
  setTimeout(() => {
    message.value = "";
    messageType.value = "";
  }, 5000);
};

const clearFilters = () => {
  Object.assign(filters, {
    type: "all",
    category: "all",
    status: "all",
    dateFrom: "",
    dateTo: "",
    search: "",
  });
  currentPage.value = 1;
};

const applyFilters = () => {
  currentPage.value = 1;
  showFilters.value = false;
};

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const viewTransaction = (transaction) => {
  selectedTransaction.value = transaction;
  showViewModal.value = true;
};

const editTransaction = (transaction) => {
  editingTransaction.value = transaction;
  Object.assign(transactionForm, {
    type: transaction.type,
    category: transaction.category,
    entity: transaction.entity,
    description: transaction.description,
    amount: transaction.amount,
    date: new Date(transaction.date).toISOString().slice(0, 16),
    paymentMethod: transaction.paymentMethod,
    status: transaction.status,
    reference: transaction.reference || "",
    notes: transaction.notes || "",
  });
  showAddTransactionModal.value = true;
};

const deleteTransaction = async (transactionId) => {
  if (confirm("Are you sure you want to delete this transaction?")) {
    try {
      const { $firebase } = useNuxtApp();
      await deleteDoc(doc($firebase.firestore, "transactions", transactionId));

      transactions.value = transactions.value.filter(
        (t) => t.id !== transactionId
      );
      showMessage("Transaction deleted successfully!", "success");
    } catch (error) {
      console.error("Delete error:", error);
      showMessage("Failed to delete transaction", "error");
    }
  }
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showMessage("File size must be less than 5MB", "error");
    return;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];
  if (!allowedTypes.includes(file.type)) {
    showMessage("Please select a valid image (JPG, PNG) or PDF file", "error");
    return;
  }

  transactionForm.receiptFile = file;
};

const validateForm = () => {
  if (
    !transactionForm.category ||
    !transactionForm.entity ||
    !transactionForm.description ||
    !transactionForm.amount ||
    !transactionForm.date ||
    !transactionForm.paymentMethod
  ) {
    showMessage("Please fill in all required fields", "error");
    return false;
  }

  if (transactionForm.amount <= 0) {
    showMessage("Amount must be greater than 0", "error");
    return false;
  }

  return true;
};

const saveTransaction = async () => {
  console.log("Starting saveTransaction...");
  if (!validateForm()) {
    console.log("Form validation failed");
    return;
  }

  isLoading.value = true;
  try {
    const { $firebase } = useNuxtApp();

    // Generate transaction ID
    const transactionId = await generateTransactionId();
    console.log("Generated transaction ID:", transactionId);

    // Upload receipt if exists
    let receiptUrl = "";
    if (transactionForm.receiptFile) {
      try {
        uploadingStatus.value = "Uploading receipt...";
        receiptUrl = await uploadToCloudinary(transactionForm.receiptFile);
        console.log("Receipt uploaded successfully:", receiptUrl);
      } catch (error) {
        console.error("Receipt upload failed:", error);
        showMessage(`Failed to upload receipt: ${error.message}`, "error");
        return;
      }
    }

    uploadingStatus.value = "Saving transaction...";

    if (editingTransaction.value) {
      // Update existing transaction
      const transactionData = {
        type: "income", // Force income type
        category: transactionForm.category,
        entity: transactionForm.entity,
        description: transactionForm.description,
        amount: Number(transactionForm.amount),
        date: new Date(transactionForm.date),
        paymentMethod: transactionForm.paymentMethod,
        status: transactionForm.status,
        reference: transactionForm.reference || "",
        notes: transactionForm.notes || "",
        receiptUrl: receiptUrl || editingTransaction.value.receiptUrl,
        updatedAt: serverTimestamp(),
      };

      await setDoc(
        doc($firebase.firestore, "transactions", editingTransaction.value.id),
        transactionData,
        { merge: true }
      );

      // Update local state
      const index = transactions.value.findIndex(
        (t) => t.id === editingTransaction.value.id
      );
      if (index !== -1) {
        transactions.value[index] = {
          ...transactions.value[index],
          ...transactionData,
          date: new Date(transactionForm.date),
          updatedAt: new Date(),
        };
      }

      showMessage("Income transaction updated successfully!", "success");
    } else {
      // Add new transaction
      const transactionData = {
        transactionId: transactionId,
        type: "income", // Force income type
        category: transactionForm.category,
        entity: transactionForm.entity,
        description: transactionForm.description,
        amount: Number(transactionForm.amount),
        date: new Date(transactionForm.date),
        paymentMethod: transactionForm.paymentMethod,
        status: transactionForm.status,
        reference: transactionForm.reference || "",
        notes: transactionForm.notes || "",
        receiptUrl: receiptUrl,
        submittedBy:
          user.value?.firstName + " " + user.value?.lastName ||
          user.value?.email ||
          "Unknown",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      console.log("Saving new income transaction data:", transactionData);
      const docRef = await addDoc(
        collection($firebase.firestore, "transactions"),
        transactionData
      );

      // Add to local state
      const newTransaction = {
        id: docRef.id,
        ...transactionData,
        date: new Date(transactionForm.date),
        createdAt: new Date(),
      };
      transactions.value.unshift(newTransaction);

      showMessage("Income transaction added successfully!", "success");
    }

    // Close modal with delay
    setTimeout(async () => {
      await closeTransactionModal();
    }, 500);
  } catch (error) {
    console.error("Error saving transaction:", error);
    showMessage("Failed to save transaction. Please try again.", "error");
  } finally {
    isLoading.value = false;
    uploadingStatus.value = "";
  }
};

const closeTransactionModal = async () => {
  console.log("Closing transaction modal...");
  showAddTransactionModal.value = false;
  editingTransaction.value = null;
  uploadingStatus.value = "";

  // Reset form
  Object.assign(transactionForm, {
    type: "income",
    category: "",
    entity: "",
    description: "",
    amount: "",
    date: "",
    paymentMethod: "",
    status: "completed",
    reference: "",
    notes: "",
    receiptFile: null,
  });

  // Reset file input
  await nextTick();
  const fileInput = document.getElementById("receipt");
  if (fileInput) {
    fileInput.value = "";
  }

  modalKey.value++;
};

const handleCancelTransaction = async () => {
  console.log("Cancel button clicked");
  await closeTransactionModal();
};

const exportTransactions = () => {
  try {
    // Prepare CSV data
    const csvData = [
      [
        "Transaction ID",
        "Date",
        "Type",
        "Category",
        "Description",
        "Customer/Client",
        "Amount",
        "Payment Method",
        "Status",
        "Reference",
        "Notes",
      ],
    ];

    filteredTransactions.value.forEach((transaction) => {
      csvData.push([
        transaction.transactionId,
        formatDate(transaction.date),
        transaction.type,
        getCategoryLabel(transaction.category),
        transaction.description,
        transaction.entity,
        transaction.amount,
        getPaymentMethodLabel(transaction.paymentMethod),
        transaction.status,
        transaction.reference || "",
        transaction.notes || "",
      ]);
    });

    // Convert to CSV string
    const csvContent = csvData
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `transactions_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showMessage("Transactions exported successfully!", "success");
  } catch (error) {
    console.error("Export error:", error);
    showMessage("Failed to export transactions", "error");
  }
};

watch(showAddTransactionModal, (newVal, oldVal) => {
  console.log(`Modal state changed from ${oldVal} to ${newVal}`);
});

onMounted(() => {
  console.log("Transaction management loaded");
  fetchTransactions();
});
</script>
