<template>
  <div class="container mx-auto px-4 min-w-full">
    <!-- Access Control Check -->
    <div
      v-if="!hasApprovalAccess"
      class="flex items-center justify-center min-h-[60vh]"
    >
      <Card class="max-w-md text-center">
        <CardContent class="pt-6">
          <ShieldX class="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 class="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p class="text-muted-foreground mb-4">
            You don't have permission to access this page. Only Owners and
            Managers can approve expenses.
          </p>
          <p class="text-sm text-muted-foreground">
            Your current role: <Badge variant="outline">{{ user?.role }}</Badge>
          </p>
          <Button @click="$router.push('/admin/finance')" class="mt-4">
            Back to Finance Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>

    <!-- Approval Interface (Only for Owner/Manager) -->
    <div v-else>
      <!-- Header -->
      <div class="flex items-center justify-between">
        <HeadersContent
          title="Expense Approval Center"
          description="Review and approve pending expense requests"
        />
        <div class="flex items-center space-x-2">
          <Badge variant="outline" class="px-3 py-1">
            <Shield class="mr-1 h-3 w-3" />
            {{ user?.role }}
          </Badge>
          <Button variant="outline" @click="refreshData">
            <RefreshCw class="mr-2 h-4 w-4" />
            Refresh
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

      <!-- Enhanced Approval Summary -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <!-- Pending Expenses -->
        <Card>
          <CardHeader
            class="flex flex-row items-center justify-between space-y-0"
          >
            <CardTitle class="text-sm font-medium">Pending Review</CardTitle>
            <Clock />
          </CardHeader>
          <CardContent>
            <div class="text-xl font-bold">
              {{ pendingExpenses.length }}
            </div>
            <p class="text-xs text-muted-foreground">
              Rp {{ formatPrice(totalPendingAmount) }} total value
            </p>
          </CardContent>
        </Card>

        <!-- Aging Analysis -->
        <Card>
          <CardHeader
            class="flex flex-row items-center justify-between space-y-0"
          >
            <CardTitle class="text-sm font-medium">Urgent Items</CardTitle>
            <AlertTriangle class="text-orange-500" />
          </CardHeader>
          <CardContent>
            <div class="text-xl font-bold text-orange-600">
              {{ agingAnalysis.urgent }}
            </div>
            <p class="text-xs text-muted-foreground">
              {{ agingAnalysis.overdue }} overdue items
            </p>
          </CardContent>
        </Card>

        <!-- Approved Today -->
        <Card>
          <CardHeader
            class="flex flex-row items-center justify-between space-y-0"
          >
            <CardTitle class="text-sm font-medium">Approved Today</CardTitle>
            <CheckCircle class="text-green-500" />
          </CardHeader>
          <CardContent>
            <div class="text-xl font-bold text-green-600">
              {{ todayApprovedCount }}
            </div>
            <p class="text-xs text-muted-foreground">
              Rp {{ formatPrice(todayApprovedValue) }} approved
            </p>
          </CardContent>
        </Card>

        <!-- Rejected Today -->
        <Card>
          <CardHeader
            class="flex flex-row items-center justify-between space-y-0"
          >
            <CardTitle class="text-sm font-medium">Rejected Today</CardTitle>
            <XCircle class="text-red-500" />
          </CardHeader>
          <CardContent>
            <div class="text-xl font-bold text-red-600">
              {{ todayRejectedCount }}
            </div>
            <p class="text-xs text-muted-foreground">
              Rp {{ formatPrice(todayRejectedValue) }} rejected
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- Approval Analytics -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Approval Metrics</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-muted-foreground">Approval Rate</span>
              <span class="font-medium">{{ getApprovalRate() }}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-muted-foreground">Avg Processing</span>
              <span class="font-medium"
                >{{ getAvgProcessingTime() }} hours</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-muted-foreground">Rejection Rate</span>
              <span class="font-medium">{{ getRejectionRate() }}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending by Category</CardTitle>
          </CardHeader>
          <CardContent class="space-y-2">
            <div
              v-for="(count, category) in categoryBreakdown"
              :key="category"
              class="flex justify-between text-sm"
            >
              <span>{{ getCategoryLabel(category) }}</span>
              <Badge variant="outline">{{ count }}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent class="space-y-2">
            <div class="flex justify-between text-sm">
              <span>High Priority</span>
              <Badge variant="destructive">{{
                getPriorityCount("high")
              }}</Badge>
            </div>
            <div class="flex justify-between text-sm">
              <span>Normal Priority</span>
              <Badge variant="outline">{{ getPriorityCount("normal") }}</Badge>
            </div>
            <div class="flex justify-between text-sm">
              <span>Low Priority</span>
              <Badge variant="secondary">{{ getPriorityCount("low") }}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Pending Expenses Table -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center">
            <AlertTriangle class="mr-2 h-5 w-5 text-orange-600" />
            Pending Expense Approvals
          </CardTitle>
          <CardDescription>
            Review and approve/reject expense requests from your team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div v-if="loadingExpenses" class="text-center py-8">
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"
            ></div>
            <p class="mt-2 text-sm text-muted-foreground">
              Loading expenses...
            </p>
          </div>
          <div
            v-else-if="pendingExpenses.length === 0"
            class="text-center py-8"
          >
            <CheckCircle class="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-green-600 mb-2">
              All Caught Up!
            </h3>
            <p class="text-muted-foreground">
              No pending expenses to review at the moment.
            </p>
          </div>

          <Table v-else>
            <TableHeader>
              <TableRow>
                <TableHead>Expense Details</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead class="text-right">Amount</TableHead>
                <TableHead>Date Submitted</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="expense in pendingExpenses"
                :key="expense.id"
                class="hover:bg-muted/50"
              >
                <TableCell>
                  <div class="space-y-1">
                    <div class="font-medium">{{ expense.description }}</div>
                    <div class="flex items-center space-x-2">
                      <Badge variant="outline" class="text-xs">{{
                        getCategoryLabel(expense.category)
                      }}</Badge>
                      <span
                        v-if="expense.vendor"
                        class="text-xs text-muted-foreground"
                      >
                        Vendor: {{ expense.vendor }}
                      </span>
                    </div>
                    <div
                      v-if="expense.notes"
                      class="text-xs text-muted-foreground"
                    >
                      {{ expense.notes }}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex items-center space-x-2">
                    <div
                      class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                    >
                      <span class="text-xs font-medium">{{
                        expense.submittedBy.charAt(0)
                      }}</span>
                    </div>
                    <div>
                      <div class="font-medium text-sm">
                        {{ expense.submittedBy }}
                      </div>
                      <div class="text-xs text-muted-foreground">
                        {{ expense.department || "N/A" }}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="font-bold text-md">
                    Rp {{ formatPrice(expense.amount) }}
                  </div>
                  <div class="text-xs text-muted-foreground">
                    {{ getPaymentMethodLabel(expense.paymentMethod) }}
                  </div>
                </TableCell>
                <TableCell>
                  <div class="text-sm">
                    {{ formatDate(expense.createdAt) }}
                  </div>
                  <div
                    class="text-xs"
                    :class="getAgingColor(expense.createdAt)"
                  >
                    {{ getTimeAgo(expense.createdAt) }}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    :variant="getPriorityVariant(expense.priority)"
                    class="text-xs"
                  >
                    {{ expense.priority || "Normal" }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div class="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="viewExpenseDetails(expense)"
                    >
                      <Eye class="h-4 w-4" />
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      @click="approveExpense(expense)"
                      class="bg-green-600 hover:bg-green-700"
                    >
                      <Check class="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      @click="rejectExpense(expense)"
                    >
                      <X class="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <!-- Recent Approval History -->
      <Card class="mt-6 mb-4">
        <CardHeader>
          <CardTitle class="flex items-center">
            <History class="mr-2 h-5 w-5" />
            Recent Approval History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div
              v-for="history in recentApprovalHistory"
              :key="history.id"
              class="flex items-center justify-between p-3 border rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="p-2 rounded-full"
                  :class="
                    history.action === 'approved'
                      ? 'bg-green-100'
                      : 'bg-red-100'
                  "
                >
                  <component
                    :is="history.action === 'approved' ? CheckCircle : XCircle"
                    :class="
                      history.action === 'approved'
                        ? 'text-green-600'
                        : 'text-red-600'
                    "
                    class="h-4 w-4"
                  />
                </div>
                <div>
                  <div class="font-medium">
                    {{ history.expenseDescription }}
                  </div>
                  <div class="text-sm text-muted-foreground">
                    {{
                      history.action === "approved" ? "Approved" : "Rejected"
                    }}
                    by {{ history.approvedBy }}
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div
                  class="font-bold"
                  :class="
                    history.action === 'approved'
                      ? 'text-green-600'
                      : 'text-red-600'
                  "
                >
                  Rp {{ formatPrice(history.amount) }}
                </div>
                <div class="text-xs text-muted-foreground">
                  {{ formatDate(history.actionDate) }}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Expense Details Modal -->
    <Dialog v-model:open="showDetailsModal">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Expense Approval Review</DialogTitle>
        </DialogHeader>
        <div v-if="selectedExpense" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="font-medium">Expense ID</Label>
              <p class="font-mono">{{ selectedExpense.expenseId }}</p>
            </div>
            <div>
              <Label class="font-medium">Amount</Label>
              <p class="text-lg font-bold">
                Rp {{ formatPrice(selectedExpense.amount) }}
              </p>
            </div>
          </div>
          <div>
            <Label class="font-medium">Description</Label>
            <p>{{ selectedExpense.description }}</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="font-medium">Category</Label>
              <Badge variant="outline">{{
                getCategoryLabel(selectedExpense.category)
              }}</Badge>
            </div>
            <div>
              <Label class="font-medium">Submitted By</Label>
              <p>{{ selectedExpense.submittedBy }}</p>
            </div>
          </div>
          <div v-if="selectedExpense.vendor">
            <Label class="font-medium">Vendor/Supplier</Label>
            <p>{{ selectedExpense.vendor }}</p>
          </div>
          <div v-if="selectedExpense.notes">
            <Label class="font-medium">Notes</Label>
            <p class="text-sm text-muted-foreground">
              {{ selectedExpense.notes }}
            </p>
          </div>
          <div v-if="selectedExpense.receiptUrl">
            <Label class="font-medium">Receipt/Invoice</Label>
            <a
              :href="selectedExpense.receiptUrl"
              target="_blank"
              class="text-blue-600 underline"
            >
              View Receipt
            </a>
          </div>
          <div class="flex justify-end space-x-2 pt-4">
            <Button variant="outline" @click="showDetailsModal = false"
              >Close</Button
            >
            <Button variant="destructive" @click="rejectExpenseFromModal">
              <X class="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button
              @click="approveExpenseFromModal"
              class="bg-green-600 hover:bg-green-700"
            >
              <Check class="mr-2 h-4 w-4" />
              Approve
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Rejection Reason Modal -->
    <Dialog v-model:open="showRejectionModal">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Expense</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div>
            <Label for="rejectionReason">Reason for Rejection *</Label>
            <Textarea
              id="rejectionReason"
              v-model="rejectionReason"
              placeholder="Please provide a reason for rejecting this expense..."
              rows="4"
              required
            />
          </div>
          <div class="flex justify-end space-x-2">
            <Button variant="outline" @click="showRejectionModal = false"
              >Cancel</Button
            >
            <Button variant="destructive" @click="confirmRejection">
              <X class="mr-2 h-4 w-4" />
              Reject Expense
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, ref, reactive, onMounted } from "vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, ShieldX, RefreshCw } from "lucide-vue-next";
import HeadersContent from "~/components/ui/HeadersContent.vue";
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Check,
  X,
  History,
} from "lucide-vue-next";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  setDoc,
  serverTimestamp,
  limit,
} from "firebase/firestore";

// Set page meta for role-based access
definePageMeta({
  middleware: "auth",
});

const { user } = useAuth();

// Access control computed
const hasApprovalAccess = computed(() => {
  return (
    user.value && ["owner", "manager"].includes(user.value.role?.toLowerCase())
  );
});

// State
const showDetailsModal = ref(false);
const showRejectionModal = ref(false);
const selectedExpense = ref(null);
const rejectionReason = ref("");
const expenseToReject = ref(null);
const loadingExpenses = ref(false);
const message = ref("");
const messageType = ref("");
const pendingExpenses = ref([]);
const recentApprovalHistory = ref([]);

// Enhanced analytics state
const agingAnalysis = reactive({
  urgent: 0, // high priority items
  overdue: 0, // > 7 days old
});

// Function to fetch pending expenses from Firestore
const fetchPendingExpenses = async () => {
  try {
    loadingExpenses.value = true;
    const { $firebase } = useNuxtApp();

    const expensesQuery = query(
      collection($firebase.firestore, "expenses"),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(expensesQuery);
    pendingExpenses.value = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate()
          : new Date(),
        priority: data.priority || "normal",
        department: data.department || "N/A",
      };
    });

    calculateAgingAnalysis();
    console.log("Fetched pending expenses:", pendingExpenses.value);
  } catch (error) {
    console.error("Error fetching pending expenses:", error);
    showMessage("Failed to load pending expenses", "error");
  } finally {
    loadingExpenses.value = false;
  }
};

// Function to fetch approval history
const fetchApprovalHistory = async () => {
  try {
    const { $firebase } = useNuxtApp();

    const historyQuery = query(
      collection($firebase.firestore, "expenses"),
      where("status", "in", ["approved", "rejected"]),
      orderBy("updatedAt", "desc"),
      limit(10)
    );

    const querySnapshot = await getDocs(historyQuery);
    recentApprovalHistory.value = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        expenseDescription: data.description,
        amount: data.amount,
        action: data.status,
        approvedBy: data.approvedBy || "System",
        actionDate: data.updatedAt?.toDate
          ? data.updatedAt.toDate()
          : new Date(),
      };
    });

    console.log("Fetched approval history:", recentApprovalHistory.value);
  } catch (error) {
    console.error("Error fetching approval history:", error);
  }
};

// Enhanced aging analysis
const calculateAgingAnalysis = () => {
  const now = new Date();
  agingAnalysis.urgent = pendingExpenses.value.filter(
    (expense) => expense.priority === "high" || expense.priority === "urgent"
  ).length;

  agingAnalysis.overdue = pendingExpenses.value.filter((expense) => {
    const daysDiff = Math.floor(
      (now - new Date(expense.createdAt)) / (1000 * 60 * 60 * 24)
    );
    return daysDiff > 7;
  }).length;
};

// Computed
const totalPendingAmount = computed(() => {
  return pendingExpenses.value.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
});

const todayApprovedCount = computed(() => {
  const today = new Date().toDateString();
  return recentApprovalHistory.value.filter(
    (h) => h.action === "approved" && h.actionDate.toDateString() === today
  ).length;
});

const todayApprovedValue = computed(() => {
  const today = new Date().toDateString();
  return recentApprovalHistory.value
    .filter(
      (h) => h.action === "approved" && h.actionDate.toDateString() === today
    )
    .reduce((sum, h) => sum + h.amount, 0);
});

const todayRejectedCount = computed(() => {
  const today = new Date().toDateString();
  return recentApprovalHistory.value.filter(
    (h) => h.action === "rejected" && h.actionDate.toDateString() === today
  ).length;
});

const todayRejectedValue = computed(() => {
  const today = new Date().toDateString();
  return recentApprovalHistory.value
    .filter(
      (h) => h.action === "rejected" && h.actionDate.toDateString() === today
    )
    .reduce((sum, h) => sum + h.amount, 0);
});

const categoryBreakdown = computed(() => {
  const breakdown = {};
  pendingExpenses.value.forEach((expense) => {
    breakdown[expense.category] = (breakdown[expense.category] || 0) + 1;
  });
  return breakdown;
});

// Business metrics methods
const getApprovalRate = () => {
  const total = recentApprovalHistory.value.length;
  if (total === 0) return "0";
  const approved = recentApprovalHistory.value.filter(
    (h) => h.action === "approved"
  ).length;
  return ((approved / total) * 100).toFixed(0);
};

const getRejectionRate = () => {
  const total = recentApprovalHistory.value.length;
  if (total === 0) return "0";
  const rejected = recentApprovalHistory.value.filter(
    (h) => h.action === "rejected"
  ).length;
  return ((rejected / total) * 100).toFixed(0);
};

const getAvgProcessingTime = () => {
  // This would need processing time tracking in actual implementation
  return "2.5"; // Placeholder
};

const getPriorityCount = (priority) => {
  return pendingExpenses.value.filter(
    (expense) => (expense.priority || "normal") === priority
  ).length;
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

const getTimeAgo = (date) => {
  const now = new Date();
  const diffHours = Math.floor((now - new Date(date)) / (1000 * 60 * 60));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const getAgingColor = (date) => {
  const now = new Date();
  const diffDays = Math.floor((now - new Date(date)) / (1000 * 60 * 60 * 24));
  if (diffDays > 7) return "text-red-600";
  if (diffDays > 3) return "text-orange-600";
  return "text-muted-foreground";
};

const getCategoryLabel = (category) => {
  const labels = {
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

const getPriorityVariant = (priority) => {
  const variants = {
    urgent: "destructive",
    high: "destructive",
    normal: "outline",
    low: "secondary",
  };
  return variants[priority] || "outline";
};

const showMessage = (msg, type) => {
  message.value = msg;
  messageType.value = type;
  setTimeout(() => {
    message.value = "";
    messageType.value = "";
  }, 5000);
};

const viewExpenseDetails = (expense) => {
  selectedExpense.value = expense;
  showDetailsModal.value = true;
};

const approveExpense = async (expense) => {
  try {
    const { $firebase } = useNuxtApp();

    // Update expense status to approved
    await setDoc(
      doc($firebase.firestore, "expenses", expense.id),
      {
        status: "approved",
        approvedBy:
          user.value?.firstName + " " + user.value?.lastName ||
          user.value?.email,
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // Remove from pending list
    const index = pendingExpenses.value.findIndex((e) => e.id === expense.id);
    if (index !== -1) {
      pendingExpenses.value.splice(index, 1);
    }

    // Add to approval history
    recentApprovalHistory.value.unshift({
      id: expense.id,
      expenseDescription: expense.description,
      amount: expense.amount,
      action: "approved",
      approvedBy:
        user.value?.firstName + " " + user.value?.lastName || user.value?.email,
      actionDate: new Date(),
    });

    calculateAgingAnalysis();
    showMessage(
      `Expense ${expense.expenseId} has been approved successfully!`,
      "success"
    );
  } catch (error) {
    console.error("Error approving expense:", error);
    showMessage("Failed to approve expense. Please try again.", "error");
  }
};

const rejectExpense = (expense) => {
  expenseToReject.value = expense;
  rejectionReason.value = "";
  showRejectionModal.value = true;
};

const confirmRejection = async () => {
  if (!rejectionReason.value.trim()) {
    showMessage("Please provide a reason for rejection.", "error");
    return;
  }

  try {
    const { $firebase } = useNuxtApp();
    const expense = expenseToReject.value;

    // Update expense status to rejected
    await setDoc(
      doc($firebase.firestore, "expenses", expense.id),
      {
        status: "rejected",
        rejectedBy:
          user.value?.firstName + " " + user.value?.lastName ||
          user.value?.email,
        rejectionReason: rejectionReason.value,
        rejectedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // Remove from pending list
    const index = pendingExpenses.value.findIndex((e) => e.id === expense.id);
    if (index !== -1) {
      pendingExpenses.value.splice(index, 1);
    }

    // Add to approval history
    recentApprovalHistory.value.unshift({
      id: expense.id,
      expenseDescription: expense.description,
      amount: expense.amount,
      action: "rejected",
      approvedBy:
        user.value?.firstName + " " + user.value?.lastName || user.value?.email,
      actionDate: new Date(),
    });

    showRejectionModal.value = false;
    calculateAgingAnalysis();
    showMessage(`Expense ${expense.expenseId} has been rejected.`, "success");
  } catch (error) {
    console.error("Error rejecting expense:", error);
    showMessage("Failed to reject expense. Please try again.", "error");
  }
};

const approveExpenseFromModal = () => {
  approveExpense(selectedExpense.value);
  showDetailsModal.value = false;
};

const rejectExpenseFromModal = () => {
  showDetailsModal.value = false;
  rejectExpense(selectedExpense.value);
};

const refreshData = () => {
  fetchPendingExpenses();
  fetchApprovalHistory();
  showMessage("Data refreshed successfully!", "success");
};

onMounted(() => {
  if (hasApprovalAccess.value) {
    fetchPendingExpenses();
    fetchApprovalHistory();
  }
});
</script>
