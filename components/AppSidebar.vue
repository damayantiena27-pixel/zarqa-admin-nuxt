<script setup lang="ts">
import {
  Command,
  LifeBuoy,
  PieChart,
  Send,
  Settings2,
  Package2,
  Users,
  ShoppingBasket,
  Shirt
} from "lucide-vue-next";

import NavMain from "@/components/NavMain.vue";
import NavSecondary from "@/components/NavSecondary.vue";
import NavUser from "@/components/NavUser.vue";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  type SidebarProps,
} from "@/components/ui/sidebar";

const props = withDefaults(defineProps<SidebarProps>(), {
  variant: "inset",
});

// Get User data
const { user }: any = useAuth();

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: Command,
      isActive: true,
    },
    {
      title: "Products",
      url: "/products/productDashboard",
      icon: Package2,
      isActive: false,
      items: [
        {
          title: "List Products",
          url: "/products/listProducts",
        },
        {
          title: "Add Product",
          url: "/products/addProduct",
        },
        {
          title: "Inventory",
          url: "/products/inventory",
        },
      ],
    },
    {
      title: "Orders",
      url: "/orders/orderDashboard",
      icon: ShoppingBasket,
      isActive: true,
      items: [
        {
          title: "List Orders",
          url: "/orders/listOrder",
        },
        {
          title: "Add Order",
          url: "/orders/addOrder",
        },
        {
          title: "History Order",
          url: "/orders/historyOrder",
        },
      ],
    },
    {
      title: "Customers",
      url: "/customers/customerDashboard",
      icon: Users,
      isActive: false,
      items: [
        {
          title: "List Customer",
          url: "/customers/listCustomer",
        },
        {
          title: "Add Customer",
          url: "/customers/addCustomer",
        },
      ],
    },
    {
      title: "Finance",
      url: "/finance/financeDashboard",
      icon: PieChart,
      isActive: true,
      items: [
        {
          title: "Expenses",
          url: "/finance/expenses",
        },
        {
          title: "Transactions",
          url: "/finance/transactions",
        },
        {
          title: "Approvals",
          url: "/finance/approval",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings/settings",
      icon: Settings2,
      items: [
        {
          title: "Team",
          url: "/settings/team",
        },
        {
          title: "Billing",
          url: "/settings/billing",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "/support",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "/feedback",
      icon: Send,
    },
  ],
};
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <NuxtLink to="/">
              <div
                class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
              >
                <Shirt class="size-4" />
              </div>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-medium">ZARQA</span>
                <span class="truncate text-xs">Enterprise</span>
              </div>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="data.navMain" />
      <NavSecondary :items="data.navSecondary" class="mt-auto" />
    </SidebarContent>
    <SidebarFooter>
      <!-- Kirim data user yang diambil dari FIrestore -->
      <NavUser
        :user="{
          name: user ? `${user.firstName} ${user.lastName}` : 'Guest',
          email: user?.email || 'No Email',
          avatar: '/avatars/shadcn.jpg', // default avatar sementara
        }"
      />
    </SidebarFooter>
  </Sidebar>
</template>
