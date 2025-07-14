<template>
  <div class="container mx-auto px-4 min-w-full">
    <div class="mx-auto">
      <!-- Header -->
      <HeadersContent
        title="Add New Order"
        description="Fill in the order details below"
      />
      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Customer Information Card -->
        <Card class="p-6">
          <CardHeader class="px-0 pt-0">
            <CardTitle class="text-lg">Customer Information</CardTitle>
          </CardHeader>
          <CardContent class="px-0 pb-0">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Order ID - Auto Generated -->
              <div>
                <Label class="pb-2" for="orderId">Order ID</Label>
                <Input
                  id="orderId"
                  v-model="form.orderId"
                  type="text"
                  readonly
                  class="bg-gray-100"
                  placeholder="Auto-generated"
                />
                <p class="text-xs text-gray-500 mt-1">
                  Auto-generated based on date
                </p>
              </div>
              <!-- Customer Selection with Combobox -->
              <div>
                <Label class="pb-2" for="customer">Customer</Label>
                <div class="relative">
                  <Input
                    id="customer"
                    v-model="customerInput"
                    type="text"
                    placeholder="Type customer name or select from list"
                    @input="handleCustomerInput"
                    @focus="showCustomerDropdown = true"
                    @blur="handleCustomerBlur"
                    required
                    class="w-full"
                  />
                  <!-- Dropdown List -->
                  <div
                    v-if="showCustomerDropdown && filteredCustomers.length > 0"
                    class="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto mt-1"
                  >
                    <div
                      v-for="customer in filteredCustomers"
                      :key="customer.id"
                      @mousedown="selectCustomer(customer)"
                      class="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      {{ customer.name }} ({{ customer.email }})
                    </div>
                  </div>
                </div>
                <p class="text-xs text-gray-500 mt-1">
                  Start typing to search existing customers or enter new
                  customer name
                </p>
              </div>
              <!-- Deadline Date -->
              <div>
                <Label class="pb-2" for="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  v-model="form.deadlineDate"
                  type="datetime-local"
                  required
                />
                <p class="text-xs text-gray-500 mt-1">
                  Set the deadline for this order
                </p>
              </div>
              <!-- Order Status -->
              <div>
                <Label class="pb-2" for="status">Order Status</Label>
                <Select v-model="form.status" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="queue">Queue</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        <!-- Products Card -->
        <Card class="p-6">
          <CardHeader class="px-0 pt-0">
            <CardTitle class="text-lg flex items-center justify-between">
              Order Items
              <Button
                type="button"
                @click="addProduct"
                variant="outline"
                size="sm"
              >
                <PlusIcon class="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent class="px-0 pb-0">
            <div
              v-if="form.products.length === 0"
              class="text-center py-8 text-muted-foreground"
            >
              <PackageIcon class="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No products added yet</p>
              <p class="text-sm">
                Click "Add Product" to start adding items to this order
              </p>
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="(product, index) in form.products"
                :key="index"
                class="border rounded-lg p-4 bg-gray-50"
              >
                <!-- Desktop Layout (md and up) -->
                <div class="hidden md:grid md:grid-cols-12 gap-4 items-end">
                  <!-- Product Selection -->
                  <div class="col-span-4">
                    <Label class="pb-2">Product</Label>
                    <div class="w-full relative">
                      <Input
                        v-model="productInputs[index]"
                        type="text"
                        placeholder="Type product name"
                        @input="showProductDropdown[index] = true"
                        @focus="showProductDropdown[index] = true"
                        @blur="hideProductDropdown(index)"
                        required
                        class="w-full"
                      />
                      <!-- Dropdown List -->
                      <div
                        v-if="
                          showProductDropdown[index] &&
                          filteredProducts(index).length > 0
                        "
                        class="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto mt-1"
                      >
                        <div
                          v-for="product in filteredProducts(index)"
                          :key="product.id"
                          @mousedown="selectProduct(index, product)"
                          class="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                          {{ product.title }} - Rp{{
                            formatPrice(product.price)
                          }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Quantity -->
                  <div class="col-span-2">
                    <Label class="pb-2">Qty</Label>
                    <Input
                      v-model="product.quantity"
                      type="number"
                      min="1"
                      placeholder="1"
                      @input="calculateSubtotal(index)"
                    />
                  </div>
                  <!-- Unit Price -->
                  <div class="col-span-2">
                    <Label class="pb-2">Price</Label>
                    <Input
                      v-model="product.unitPrice"
                      type="number"
                      readonly
                      class="bg-gray-100"
                    />
                  </div>
                  <!-- Subtotal -->
                  <div class="col-span-2">
                    <Label class="pb-2">Subtotal</Label>
                    <div
                      class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-medium"
                    >
                      Rp{{ formatPrice(product.subtotal) }}
                    </div>
                  </div>
                  <!-- Actions -->
                  <div class="col-span-2">
                    <Button
                      variant="destructive"
                      @click="removeProduct(index)"
                      class="w-full"
                    >
                      <TrashIcon class="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
                <!-- Mobile Layout (sm and below) -->
                <div class="md:hidden space-y-4">
                  <!-- Product Selection -->
                  <div>
                    <Label class="pb-2">Product</Label>
                    <div class="w-full relative">
                      <Input
                        v-model="productInputs[index]"
                        type="text"
                        placeholder="Type product name"
                        @input="showProductDropdown[index] = true"
                        @focus="showProductDropdown[index] = true"
                        @blur="hideProductDropdown(index)"
                        required
                        class="w-full"
                      />
                      <!-- Dropdown List -->
                      <div
                        v-if="
                          showProductDropdown[index] &&
                          filteredProducts(index).length > 0
                        "
                        class="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto mt-1"
                      >
                        <div
                          v-for="product in filteredProducts(index)"
                          :key="product.id"
                          @mousedown="selectProduct(index, product)"
                          class="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                          {{ product.title }} - Rp{{
                            formatPrice(product.price)
                          }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Quantity and Price Row -->
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <Label class="pb-2">Qty</Label>
                      <Input
                        v-model="product.quantity"
                        type="number"
                        min="1"
                        placeholder="1"
                        @input="calculateSubtotal(index)"
                      />
                    </div>
                    <div>
                      <Label class="pb-2">Price</Label>
                      <Input
                        v-model="product.unitPrice"
                        type="number"
                        readonly
                        class="bg-gray-100"
                      />
                    </div>
                  </div>
                  <!-- Subtotal and Actions Row -->
                  <div
                    class="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                  >
                    <div class="text-sm font-medium">
                      Subtotal:
                      <span class="text-lg font-bold text-green-600"
                        >Rp{{ formatPrice(product.subtotal) }}</span
                      >
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      @click="removeProduct(index)"
                    >
                      <TrashIcon class="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <!-- Order Summary Card -->
        <Card class="p-6">
          <CardHeader class="px-0 pt-0">
            <CardTitle class="text-lg">Order Summary</CardTitle>
          </CardHeader>
          <CardContent class="px-0 pb-0">
            <div class="space-y-4">
              <!-- Shipping Address -->
              <div>
                <Label class="pb-2" for="shippingAddress"
                  >Shipping Address</Label
                >
                <Textarea
                  id="shippingAddress"
                  v-model="form.shippingAddress"
                  placeholder="Enter complete shipping address"
                  rows="3"
                  required
                />
              </div>
              <!-- Notes -->
              <div>
                <Label class="pb-2" for="notes">Order Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  v-model="form.notes"
                  placeholder="Any special instructions or notes"
                  rows="2"
                />
              </div>
              <!-- Total Calculation -->
              <div class="border-t pt-4">
                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>Rp {{ formatPrice(calculateTotal()) }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span>Rp {{ formatPrice(form.shippingCost) }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span>Tax (11%):</span>
                    <span>Rp {{ formatPrice(calculateTax()) }}</span>
                  </div>
                  <Separator />
                  <div class="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>Rp {{ formatPrice(calculateGrandTotal()) }}</span>
                  </div>
                </div>
              </div>
              <!-- Shipping Cost -->
              <div>
                <Label class="pb-2" for="shippingCost"
                  >Shipping Cost (Rp)</Label
                >
                <Input
                  id="shippingCost"
                  v-model="form.shippingCost"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <!-- Action Buttons -->
        <div class="flex justify-end space-x-4 pb-4">
          <Button type="button" variant="outline" @click="handleCancel">
            Cancel
          </Button>
          <Button
            type="button"
            variant="secondary"
            @click="showPreview = !showPreview"
          >
            {{ showPreview ? "Hide Preview" : "Show Preview" }}
          </Button>
          <Button
            type="submit"
            :disabled="isLoading || form.products.length === 0"
          >
            <span v-if="isLoading" class="flex items-center">
              <svg
                class="animate-spin -ml-1 mr-3 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Creating Order...
            </span>
            <span v-else>Create Order</span>
          </Button>
        </div>
      </form>
      <!-- Alert -->
      <Alert
        v-if="message"
        :class="
          messageType === 'success'
            ? 'border-green-200 bg-green-50'
            : 'border-red-200 bg-red-50'
        "
        class="mt-4 mb-4"
      >
        <AlertTitle>{{
          messageType === "success" ? "Success" : "Error"
        }}</AlertTitle>
        <AlertDescription>{{ message }}</AlertDescription>
      </Alert>
      <!-- Preview -->
      <Card v-if="showPreview" class="my-4 p-6">
        <CardHeader>
          <CardTitle>Order Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><strong>Order ID:</strong> {{ form.orderId }}</div>
              <div>
                <strong>Customer:</strong>
                {{ customerInput }}
              </div>
              <div>
                <strong>Deadline:</strong>
                {{ formatDateTime(form.deadlineDate) }}
              </div>
              <div><strong>Status:</strong> {{ form.status }}</div>
            </div>
            <div>
              <strong>Products:</strong>
              <div class="mt-2 space-y-2">
                <div
                  v-for="(product, index) in form.products"
                  :key="index"
                  class="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <span
                    >{{ getProductName(product.productId) }} x{{
                      product.quantity
                    }}</span
                  >
                  <span>Rp {{ formatPrice(product.subtotal || 0) }}</span>
                </div>
              </div>
            </div>
            <div>
              <strong>Shipping Address:</strong> {{ form.shippingAddress }}
            </div>
            <div v-if="form.notes">
              <strong>Notes:</strong> {{ form.notes }}
            </div>
            <div class="text-lg font-bold">
              <strong>Grand Total:</strong> Rp
              {{ formatPrice(calculateGrandTotal()) }}
            </div>
          </div>
          <Button variant="ghost" @click="showPreview = false" class="mt-4">
            Hide Preview
          </Button>
        </CardContent>
      </Card>
    </div>
    <!-- Success Modal -->
    <Dialog v-model:open="showSuccessModal">
      <DialogContent>
        <DialogHeader>
          <DialogTitle class="flex items-center text-green-600">
            <CheckCircle class="mr-2 h-5 w-5" />
            Order Created Successfully!
          </DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <p>
            Order <strong>{{ form.orderId }}</strong> for customer
            <strong>{{ customerInput }}</strong> has been created successfully.
          </p>
          <div class="bg-gray-50 p-3 rounded-md">
            <p class="text-sm text-gray-600">
              Order ID: <strong>{{ form.orderId }}</strong>
            </p>
            <p class="text-sm text-gray-600">
              Total Amount:
              <strong>Rp {{ formatPrice(calculateGrandTotal()) }}</strong>
            </p>
          </div>
          <div class="flex justify-end space-x-2">
            <Button variant="outline" @click="createAnother">
              Create Another Order
            </Button>
            <Button @click="viewOrder"> View Order </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    <!-- Error Toast -->
    <div
      v-if="errorMessage"
      class="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50"
    >
      <div class="flex items-center">
        <span>{{ errorMessage }}</span>
        <button
          @click="errorMessage = ''"
          class="ml-2 text-white hover:text-gray-200"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlusIcon, TrashIcon, PackageIcon, CheckCircle } from "lucide-vue-next";
import HeadersContent from "~/components/ui/HeadersContent.vue";
import { useNuxtApp } from "#app";
import { navigateTo } from "#app";

// Firebase imports
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

definePageMeta({
  middleware: "auth",
});

const { $firebase } = useNuxtApp();

// Helper function to get default deadline (24 hours from now)
const getDefaultDeadline = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().slice(0, 16); // Format for datetime-local input
};

// State
const form = reactive({
  orderId: "",
  customerName: "",
  customerEmail: "",
  deadlineDate: getDefaultDeadline(), // Use datetime-local format
  status: "pending",
  products: [],
  shippingAddress: "",
  notes: "",
  shippingCost: 0,
});

// Customer dropdown state
const customerInput = ref("");
const productInputs = ref([]);
const showCustomerDropdown = ref(false);
const showProductDropdown = ref([]);
const customers = ref([]);
const products = ref({});
const isLoading = ref(false);
const message = ref("");
const messageType = ref("");
const showPreview = ref(false);

// Modal state
const showSuccessModal = ref(false);
const errorMessage = ref("");

// Product data for reference
const loadProducts = async () => {
  try {
    const productsRef = collection($firebase.firestore, "products");
    const querySnapshot = await getDocs(productsRef);
    products.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title,
      price: doc.data().price,
    }));
    console.log("Products loaded:", products.value);
    if (Object.keys(products.value).length === 0) {
      products.value = {
        PRD_000: { title: "No Product", price: 0 },
      };
    }
  } catch (error) {
    console.error("Error loading products:", error);
    products.value = {
      PRD_000: { title: "No Product", price: 0 },
    };
  }
};

const hideProductDropdown = (index) => {
  setTimeout(() => {
    showProductDropdown.value[index] = false;
  }, 200);
};

const selectProduct = (index, product) => {
  form.products[index].productId = product.id;
  form.products[index].productName = product.title;
  form.products[index].unitPrice = product.price;
  form.products[index].subtotal = form.products[index].quantity * product.price;
  productInputs.value[index] = product.title;
  showProductDropdown.value[index] = false;
};

// Computed properties
const filteredCustomers = computed(() => {
  if (!customerInput.value) return customers.value;
  return customers.value.filter(
    (customer) =>
      customer.name.toLowerCase().includes(customerInput.value.toLowerCase()) ||
      customer.email.toLowerCase().includes(customerInput.value.toLowerCase())
  );
});

// Methods
const loadCustomers = async () => {
  try {
    const customersRef = collection($firebase.firestore, "customers");
    const querySnapshot = await getDocs(customersRef);
    customers.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().fullName,
      email: doc.data().email,
    }));
    if (customers.value.length === 0) {
      customers.value = [
        {
          id: "cust-001",
          name: "Olivia Martin",
          email: "olivia.martin@email.com",
        },
        { id: "cust-002", name: "Jackson Lee", email: "jackson.lee@email.com" },
        {
          id: "cust-003",
          name: "Isabella Nguyen",
          email: "isabella.nguyen@email.com",
        },
        { id: "cust-004", name: "William Kim", email: "will@email.com" },
        { id: "cust-005", name: "Sofia Davis", email: "sofia.davis@email.com" },
      ];
    }
  } catch (error) {
    console.error("Error loading customers:", error);
    customers.value = [
      {
        id: "cust-001",
        name: "Olivia Martin",
        email: "olivia.martin@email.com",
      },
      { id: "cust-002", name: "Jackson Lee", email: "jackson.lee@email.com" },
      {
        id: "cust-003",
        name: "Isabella Nguyen",
        email: "isabella.nguyen@email.com",
      },
      { id: "cust-004", name: "William Kim", email: "will@email.com" },
      { id: "cust-005", name: "Sofia Davis", email: "sofia.davis@email.com" },
    ];
  }
};

const generateOrderId = async () => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const startDate = Timestamp.fromDate(startOfDay);
    const endDate = Timestamp.fromDate(endOfDay);

    const ordersRef = collection($firebase.firestore, "orders");
    const q = query(
      ordersRef,
      where("createdAt", ">=", startDate),
      where("createdAt", "<=", endDate)
    );
    const querySnapshot = await getDocs(q);
    let orderCount = querySnapshot.size + 1;

    const existingOrderIds = querySnapshot.docs.map(
      (doc) => doc.data().orderId
    );
    while (
      existingOrderIds.includes(`ORD-${orderCount.toString().padStart(3, "0")}`)
    ) {
      orderCount++;
    }
    form.orderId = `ORD-${orderCount.toString().padStart(3, "0")}`;
  } catch (error) {
    console.error("Error generating order ID:", error);
    const fallbackId = Math.floor(Math.random() * 999) + 1;
    form.orderId = `ORD-${fallbackId.toString().padStart(3, "0")}`;
  }
};

const handleCustomerInput = () => {
  // ✅ PERBAIKAN: Cek apakah input customer cocok dengan customer yang ada
  const exactMatch = customers.value.find(
    (customer) =>
      customer.name.toLowerCase() === customerInput.value.toLowerCase()
  );

  if (!exactMatch) {
    // Jika tidak ada yang cocok persis, kosongkan email
    form.customerEmail = "";
    form.customerName = customerInput.value;
  }
  showCustomerDropdown.value = true;
};

const handleCustomerBlur = () => {
  setTimeout(() => {
    showCustomerDropdown.value = false;
  }, 200);
};

const selectCustomer = (customer) => {
  customerInput.value = customer.name;
  form.customerName = customer.name;
  form.customerEmail = customer.email;
  showCustomerDropdown.value = false;
};

const addProduct = () => {
  form.products.push({
    productId: "",
    quantity: 1,
    unitPrice: 0,
    subtotal: 0,
  });
  productInputs.value.push("");
  showProductDropdown.value.push(false);
};

const filteredProducts = (index) => {
  if (!productInputs.value[index]) return products.value;
  return products.value.filter((product) =>
    product.title
      .toLowerCase()
      .includes(productInputs.value[index].toLowerCase())
  );
};

const removeProduct = (index) => {
  form.products.splice(index, 1);
};

const calculateSubtotal = (index) => {
  const product = form.products[index];
  product.subtotal = (product.quantity || 0) * (product.unitPrice || 0);
};

const calculateTotal = () => {
  return form.products.reduce(
    (total, product) => total + (product.subtotal || 0),
    0
  );
};

const calculateTax = () => {
  return Math.round(calculateTotal() * 0.11);
};

const calculateGrandTotal = () => {
  return calculateTotal() + (form.shippingCost || 0) + calculateTax();
};

const getProductName = (productId) => {
  const product = products.value.find((p) => p.id === productId);
  return product ? product.title : "Unknown Product";
};

const formatPrice = (price) => {
  if (!price) return "0";
  return new Intl.NumberFormat("id-ID").format(price);
};

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return "";
  return new Date(dateTimeString).toLocaleString("id-ID");
};

const showMessage = (msg, type) => {
  message.value = msg;
  messageType.value = type;
  setTimeout(() => {
    message.value = "";
    messageType.value = "";
  }, 5000);
};

const validateForm = () => {
  if (
    !form.orderId ||
    !customerInput.value ||
    !form.deadlineDate ||
    !form.status ||
    !form.shippingAddress
  ) {
    errorMessage.value = "Please fill in all required fields";
    setTimeout(() => {
      errorMessage.value = "";
    }, 3000);
    return false;
  }
  if (form.products.length === 0) {
    errorMessage.value = "Please add at least one product to the order";
    setTimeout(() => {
      errorMessage.value = "";
    }, 3000);
    return false;
  }
  for (let i = 0; i < form.products.length; i++) {
    const product = form.products[i];
    if (!product.productId || !product.quantity || product.quantity <= 0) {
      errorMessage.value = `Please complete product information for item ${
        i + 1
      }`;
      setTimeout(() => {
        errorMessage.value = "";
      }, 3000);
      return false;
    }
  }
  return true;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  isLoading.value = true;
  try {
    // Convert deadline string to Timestamp
    const deadlineTimestamp = Timestamp.fromDate(new Date(form.deadlineDate));

    // Prepare order data
    const orderData = {
      orderId: form.orderId,
      customerName: customerInput.value,
      customerEmail: form.customerEmail || "",
      deadline: deadlineTimestamp, // ✅ Proper deadline timestamp
      orderTime: serverTimestamp(), // ✅ When order was created (for FIFO)
      status: form.status,
      products: form.products.map((product) => ({
        productId: product.productId,
        productName: getProductName(product.productId),
        quantity: Number(product.quantity),
        unitPrice: Number(product.unitPrice),
        subtotal: Number(product.subtotal),
      })),
      shippingAddress: form.shippingAddress,
      notes: form.notes,
      shippingCost: Number(form.shippingCost),
      subtotal: calculateTotal(),
      tax: calculateTax(),
      grandTotal: calculateGrandTotal(),
      createdAt: serverTimestamp(), // ✅ Document creation time
    };

    // Save to Firestore
    const docRef = await addDoc(
      collection($firebase.firestore, "orders"),
      orderData
    );
    console.log("Order saved with ID: ", docRef.id);

    // Show success modal
    showSuccessModal.value = true;
    showPreview.value = false;
  } catch (error) {
    console.error("Error creating order:", error);
    errorMessage.value = "Failed to create order. Please try again.";
    setTimeout(() => {
      errorMessage.value = "";
    }, 3000);
  } finally {
    isLoading.value = false;
  }
};

const handleCancel = () => {
  if (confirm("Are you sure you want to cancel? All data will be lost.")) {
    Object.assign(form, {
      orderId: "",
      customerName: "",
      customerEmail: "",
      deadlineDate: getDefaultDeadline(),
      status: "pending",
      products: [],
      shippingAddress: "",
      notes: "",
      shippingCost: 0,
    });
    customerInput.value = "";
    showPreview.value = false;
    generateOrderId();
  }
};

// Modal action methods
const createAnother = () => {
  showSuccessModal.value = false;
  Object.assign(form, {
    orderId: "",
    customerName: "",
    customerEmail: "",
    deadlineDate: getDefaultDeadline(),
    status: "pending",
    products: [],
    shippingAddress: "",
    notes: "",
    shippingCost: 0,
  });
  customerInput.value = "";
  showPreview.value = false;
  generateOrderId();
};

const viewOrder = () => {
  showSuccessModal.value = false;
  navigateTo(`/orders/${form.orderId}`);
};

// Initialize component
onMounted(async () => {
  await loadCustomers();
  await loadProducts();
  await generateOrderId();
});
</script>

<style scoped>
/* Custom styles if needed */
</style>
