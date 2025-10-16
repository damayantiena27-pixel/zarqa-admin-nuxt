<template>
  <div class="container mx-auto">
    <!-- Header -->
    <div class="px-4 mb-6">
      <HeadersContent
        title="Settings"
        description="Manage your account and application preferences"
      />
    </div>

    <div class="max-w-6xl mx-auto px-4 mb-4">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Settings Navigation -->
        <Card class="lg:col-span-1">
          <CardContent class="p-0">
            <nav class="space-y-1">
              <button
                v-for="section in settingSections"
                :key="section.id"
                @click="activeSection = section.id"
                :class="[
                  'w-full flex items-center px-4 py-3 text-left text-sm font-medium rounded-none border-r-2 transition-colors',
                  activeSection === section.id
                    ? 'bg-primary/10 text-primary border-primary'
                    : 'text-muted-foreground border-transparent hover:bg-muted/50',
                ]"
              >
                <component :is="section.icon" class="mr-3 h-4 w-4" />
                {{ section.name }}
                <Badge
                  v-if="section.badge"
                  :variant="section.badgeVariant"
                  class="ml-auto"
                >
                  {{ section.badge }}
                </Badge>
              </button>
            </nav>
          </CardContent>
        </Card>

        <!-- Settings Content -->
        <div class="lg:col-span-3 space-y-6">
          <!-- Account Settings -->
          <Card v-if="activeSection === 'account'">
            <CardHeader>
              <CardTitle class="flex items-center">
                <User class="mr-2 h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription
                >Manage your personal information and profile
                settings</CardDescription
              >
            </CardHeader>
            <CardContent class="space-y-6">
              <!-- Profile Overview -->
              <div
                class="flex items-center space-x-6 p-4 bg-muted/50 rounded-lg"
              >
                <!-- Profile Picture -->
                <div class="relative">
                  <div
                    class="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                  >
                    <span class="text-xl font-bold text-white">
                      {{ user.firstName.charAt(0).toUpperCase()
                      }}{{ user.lastName.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <button
                    @click="showAvatarModal = true"
                    class="absolute -bottom-1 -right-1 h-6 w-6 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
                  >
                    <Camera class="h-3 w-3 text-primary-foreground" />
                  </button>
                </div>

                <!-- Basic Info -->
                <div class="flex-1">
                  <h3 class="text-lg font-semibold">
                    {{ user.firstName }} {{ user.lastName }}
                  </h3>
                  <p class="text-muted-foreground">
                    {{ user.email }}
                  </p>
                  <div class="flex items-center space-x-3 mt-2">
                    <Badge variant="default">{{ user.plan }} Plan</Badge>
                    <Badge variant="outline">{{ user.role }}</Badge>
                    <span class="text-sm text-muted-foreground">
                      Member since {{ formatDate(user.createdAt) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Personal Information -->
              <div class="space-y-4">
                <h3 class="text-lg font-medium">Personal Information</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label for="firstName" class="mb-2">First Name</Label>
                    <Input
                      id="firstName"
                      v-model="user.firstName"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <Label for="lastName" class="mb-2">Last Name</Label>
                    <Input
                      id="lastName"
                      v-model="user.lastName"
                      placeholder="Enter your last name"
                    />
                  </div>
                  <div>
                    <Label for="email" class="mb-2">Email Address</Label>
                    <Input
                      id="email"
                      v-model="user.email"
                      type="email"
                      placeholder="your@email.com"
                    />
                    <p class="text-xs text-muted-foreground mt-1">
                      We'll send a verification email if you change this
                    </p>
                  </div>
                  <div>
                    <Label for="phone" class="mb-2">Phone Number</Label>
                    <Input
                      id="phone"
                      v-model="user.phoneNumber"
                      placeholder="+62 "
                    />
                  </div>
                </div>
              </div>

              <!-- Business Information -->
              <div class="space-y-4 border-t pt-6">
                <h3 class="text-lg font-medium">Business Information</h3>
                <div class="space-y-4">
                  <div>
                    <Label for="businessName" class="mb-2">Business Name</Label>
                    <Input
                      id="businessName"
                      v-model="userProfile.businessName"
                      placeholder="Your bakery name"
                    />
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label for="businessType" class="mb-2"
                        >Business Type</Label
                      >
                      <Select v-model="userProfile.businessType">
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bakery">Bakery</SelectItem>
                          <SelectItem value="cafe">Cafe</SelectItem>
                          <SelectItem value="restaurant">Restaurant</SelectItem>
                          <SelectItem value="catering">Catering</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label for="businessPhone" class="mb-2"
                        >Business Phone</Label
                      >
                      <Input
                        id="businessPhone"
                        v-model="userProfile.businessPhone"
                        placeholder="+62 21-1234-5678"
                      />
                    </div>
                  </div>
                  <div>
                    <Label for="businessAddress" class="mb-2"
                      >Business Address</Label
                    >
                    <Textarea
                      id="businessAddress"
                      v-model="userProfile.businessAddress"
                      placeholder="Complete business address"
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              <!-- Account Status & Subscription -->
              <div class="space-y-4 border-t pt-6">
                <h3 class="text-lg font-medium">Account Status</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="p-4 border rounded-lg">
                    <Label class="text-sm text-muted-foreground"
                      >Current Plan</Label
                    >
                    <p class="text-lg font-semibold">{{ userProfile.plan }}</p>
                    <p class="text-sm text-muted-foreground">
                      {{ userProfile.planStatus }}
                    </p>
                  </div>
                  <div class="p-4 border rounded-lg">
                    <Label class="text-sm text-muted-foreground"
                      >Next Billing</Label
                    >
                    <p class="text-lg font-semibold">
                      {{ formatDate(userProfile.nextBilling) }}
                    </p>
                    <p class="text-sm text-muted-foreground">
                      Auto-renewal enabled
                    </p>
                  </div>
                  <div class="p-4 border rounded-lg">
                    <Label class="text-sm text-muted-foreground"
                      >Account Status</Label
                    >
                    <div class="flex items-center space-x-2">
                      <div class="h-2 w-2 bg-green-500 rounded-full"></div>
                      <p class="text-lg font-semibold">Active</p>
                    </div>
                    <p class="text-sm text-muted-foreground">
                      All features enabled
                    </p>
                  </div>
                </div>
              </div>

              <!-- Account Actions -->
              <div class="space-y-4 border-t pt-6">
                <h3 class="text-lg font-medium">Account Actions</h3>
                <div class="flex flex-wrap gap-3">
                  <Button @click="saveAccountInfo">
                    <Save class="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button variant="outline" @click="activeSection = 'security'">
                    <Shield class="mr-2 h-4 w-4" />
                    Security Settings
                  </Button>
                  <Button variant="outline" @click="exportAccountData">
                    <Download class="mr-2 h-4 w-4" />
                    Export Data
                  </Button>
                  <Button
                    variant="destructive"
                    @click="showDeleteAccountModal = true"
                  >
                    <Trash2 class="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Notifications Settings -->
          <Card v-if="activeSection === 'notifications'">
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription
                >Configure how you receive notifications</CardDescription
              >
            </CardHeader>
            <CardContent class="space-y-6">
              <!-- Email Notifications -->
              <div class="space-y-4">
                <h3 class="text-lg font-medium">Email Notifications</h3>
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <div>
                      <Label class="text-base">New Orders</Label>
                      <p class="text-sm text-muted-foreground">
                        Get notified when new orders are placed
                      </p>
                    </div>
                    <Switch v-model="settings.notifications.email.newOrders" />
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <Label class="text-base">Order Updates</Label>
                      <p class="text-sm text-muted-foreground">
                        Get notified when order status changes
                      </p>
                    </div>
                    <Switch
                      v-model="settings.notifications.email.orderUpdates"
                    />
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <Label class="text-base">Low Stock Alerts</Label>
                      <p class="text-sm text-muted-foreground">
                        Get notified when products are running low
                      </p>
                    </div>
                    <Switch v-model="settings.notifications.email.lowStock" />
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <Label class="text-base">Daily Reports</Label>
                      <p class="text-sm text-muted-foreground">
                        Receive daily sales and performance reports
                      </p>
                    </div>
                    <Switch
                      v-model="settings.notifications.email.dailyReports"
                    />
                  </div>
                </div>
              </div>

              <!-- Push Notifications -->
              <div class="space-y-4">
                <h3 class="text-lg font-medium">Push Notifications</h3>
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <div>
                      <Label class="text-base">Browser Notifications</Label>
                      <p class="text-sm text-muted-foreground">
                        Show notifications in your browser
                      </p>
                    </div>
                    <Switch v-model="settings.notifications.push.browser" />
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <Label class="text-base">Mobile App Notifications</Label>
                      <p class="text-sm text-muted-foreground">
                        Send notifications to mobile app
                      </p>
                    </div>
                    <Switch v-model="settings.notifications.push.mobile" />
                  </div>
                </div>
              </div>

              <!-- SMS Notifications -->
              <div class="space-y-4">
                <h3 class="text-lg font-medium">SMS Notifications</h3>
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <div>
                      <Label class="text-base">Critical Alerts</Label>
                      <p class="text-sm text-muted-foreground">
                        Urgent notifications via SMS
                      </p>
                    </div>
                    <Switch v-model="settings.notifications.sms.critical" />
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <Label class="text-base">Order Confirmations</Label>
                      <p class="text-sm text-muted-foreground">
                        SMS confirmation for new orders
                      </p>
                    </div>
                    <Switch v-model="settings.notifications.sms.orders" />
                  </div>
                </div>
              </div>

              <div class="flex justify-end">
                <Button @click="saveNotificationSettings">
                  <Save class="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <!-- Security Settings -->
          <Card v-if="activeSection === 'security'">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription
                >Manage your account security and privacy</CardDescription
              >
            </CardHeader>
            <CardContent class="space-y-6">
              <!-- Password Change -->
              <div class="space-y-4">
                <h3 class="text-lg font-medium">Change Password</h3>
                <div class="space-y-3 max-w-md">
                  <div>
                    <Label for="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      v-model="passwordForm.current"
                      type="password"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <Label for="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      v-model="passwordForm.new"
                      type="password"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <Label for="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      v-model="passwordForm.confirm"
                      type="password"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <Button @click="changePassword" class="w-full">
                    <Lock class="mr-2 h-4 w-4" />
                    Update Password
                  </Button>
                </div>
              </div>

              <!-- Two-Factor Authentication -->
              <div class="space-y-4">
                <h3 class="text-lg font-medium">Two-Factor Authentication</h3>
                <div
                  class="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <Label class="text-base">Enable 2FA</Label>
                    <p class="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <Badge
                      :variant="
                        settings.security.twoFactorEnabled
                          ? 'default'
                          : 'secondary'
                      "
                    >
                      {{
                        settings.security.twoFactorEnabled
                          ? "Enabled"
                          : "Disabled"
                      }}
                    </Badge>
                    <Button variant="outline" size="sm" @click="toggle2FA">
                      {{
                        settings.security.twoFactorEnabled
                          ? "Disable"
                          : "Enable"
                      }}
                    </Button>
                  </div>
                </div>
              </div>

              <!-- Session Management -->
              <div class="space-y-4">
                <h3 class="text-lg font-medium">Active Sessions</h3>
                <div class="space-y-3">
                  <div
                    v-for="session in activeSessions"
                    :key="session.id"
                    class="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div class="flex items-center space-x-3">
                      <Monitor class="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div class="font-medium">{{ session.device }}</div>
                        <div class="text-sm text-muted-foreground">
                          {{ session.location }} • {{ session.lastActive }}
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <Badge
                        :variant="session.current ? 'default' : 'secondary'"
                      >
                        {{ session.current ? "Current" : "Active" }}
                      </Badge>
                      <Button
                        v-if="!session.current"
                        variant="outline"
                        size="sm"
                        @click="revokeSession(session.id)"
                      >
                        Revoke
                      </Button>
                    </div>
                  </div>
                </div>
                <Button variant="outline" @click="revokeAllSessions">
                  <LogOut class="mr-2 h-4 w-4" />
                  Revoke All Other Sessions
                </Button>
              </div>

              <!-- API Keys -->
              <div class="space-y-4">
                <h3 class="text-lg font-medium">API Keys</h3>
                <div class="space-y-3">
                  <div
                    v-for="apiKey in apiKeys"
                    :key="apiKey.id"
                    class="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div class="font-medium">{{ apiKey.name }}</div>
                      <div class="text-sm text-muted-foreground">
                        Created {{ apiKey.created }} • Last used
                        {{ apiKey.lastUsed }}
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <Badge
                        :variant="
                          apiKey.status === 'active' ? 'default' : 'secondary'
                        "
                      >
                        {{ apiKey.status }}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        @click="revokeApiKey(apiKey.id)"
                      >
                        Revoke
                      </Button>
                    </div>
                  </div>
                </div>
                <Button @click="createApiKey">
                  <Plus class="mr-2 h-4 w-4" />
                  Create New API Key
                </Button>
              </div>
            </CardContent>
          </Card>

          <!-- Integrations Settings -->
          <Card v-if="activeSection === 'integrations'">
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription
                >Connect with third-party services and tools</CardDescription
              >
            </CardHeader>
            <CardContent class="space-y-6">
              <!-- Payment Gateways -->
              <div class="space-y-4">
                <h3 class="text-lg font-medium">Payment Gateways</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="gateway in paymentGateways"
                    :key="gateway.id"
                    class="border rounded-lg p-4"
                  >
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center space-x-3">
                        <div
                          class="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center"
                        >
                          <component :is="gateway.icon" class="h-6 w-6" />
                        </div>
                        <div>
                          <div class="font-medium">{{ gateway.name }}</div>
                          <div class="text-sm text-muted-foreground">
                            {{ gateway.description }}
                          </div>
                        </div>
                      </div>
                      <Switch
                        v-model="gateway.enabled"
                        @update:modelValue="togglePaymentGateway(gateway.id)"
                      />
                    </div>
                    <div v-if="gateway.enabled" class="space-y-2">
                      <Input v-model="gateway.apiKey" placeholder="API Key" />
                      <Input
                        v-model="gateway.secretKey"
                        placeholder="Secret Key"
                        type="password"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Email Services -->
              <div class="space-y-4">
                <h3 class="text-lg font-medium">Email Services</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="service in emailServices"
                    :key="service.id"
                    class="border rounded-lg p-4"
                  >
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center space-x-3">
                        <div
                          class="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center"
                        >
                          <Mail class="h-6 w-6" />
                        </div>
                        <div>
                          <div class="font-medium">{{ service.name }}</div>
                          <div class="text-sm text-muted-foreground">
                            {{ service.description }}
                          </div>
                        </div>
                      </div>
                      <Switch
                        v-model="service.enabled"
                        @update:modelValue="toggleEmailService(service.id)"
                      />
                    </div>
                    <div v-if="service.enabled" class="space-y-2">
                      <Input v-model="service.apiKey" placeholder="API Key" />
                      <Input
                        v-model="service.fromEmail"
                        placeholder="From Email"
                        type="email"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Analytics -->
              <div class="space-y-4">
                <h3 class="text-lg font-medium">Analytics & Tracking</h3>
                <div class="space-y-3">
                  <div
                    class="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <Label class="text-base">Google Analytics</Label>
                      <p class="text-sm text-muted-foreground">
                        Track website and app analytics
                      </p>
                    </div>
                    <Switch
                      v-model="settings.integrations.googleAnalytics.enabled"
                    />
                  </div>
                  <div v-if="settings.integrations.googleAnalytics.enabled">
                    <Input
                      v-model="settings.integrations.googleAnalytics.trackingId"
                      placeholder="GA Tracking ID"
                    />
                  </div>
                </div>
              </div>

              <div class="flex justify-end">
                <Button @click="saveIntegrationSettings">
                  <Save class="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <!-- Backup & Export -->
          <Card v-if="activeSection === 'backup'">
            <CardHeader>
              <CardTitle>Backup & Export</CardTitle>
              <CardDescription
                >Manage your data backups and exports</CardDescription
              >
            </CardHeader>
            <CardContent class="space-y-6">
              <!-- Automatic Backups -->
              <div class="space-y-4">
                <h3 class="text-lg font-medium">Automatic Backups</h3>
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <div>
                      <Label class="text-base">Enable Automatic Backups</Label>
                      <p class="text-sm text-muted-foreground">
                        Automatically backup your data daily
                      </p>
                    </div>
                    <Switch v-model="settings.backup.autoBackup" />
                  </div>
                  <div v-if="settings.backup.autoBackup">
                    <Label for="backupTime">Backup Time</Label>
                    <Select v-model="settings.backup.backupTime">
                      <SelectTrigger class="w-48">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="00:00">12:00 AM</SelectItem>
                        <SelectItem value="02:00">2:00 AM</SelectItem>
                        <SelectItem value="04:00">4:00 AM</SelectItem>
                        <SelectItem value="06:00">6:00 AM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <!-- Recent Backups -->
              <div class="space-y-4">
                <h3 class="text-lg font-medium">Recent Backups</h3>
                <div class="space-y-3">
                  <div
                    v-for="backup in recentBackups"
                    :key="backup.id"
                    class="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div class="flex items-center space-x-3">
                      <Database class="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div class="font-medium">{{ backup.name }}</div>
                        <div class="text-sm text-muted-foreground">
                          {{ backup.date }} • {{ backup.size }}
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <Badge
                        :variant="
                          backup.status === 'completed'
                            ? 'default'
                            : 'secondary'
                        "
                      >
                        {{ backup.status }}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        @click="downloadBackup(backup.id)"
                      >
                        <Download class="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Manual Backup -->
              <div class="space-y-4">
                <h3 class="text-lg font-medium">Manual Backup</h3>
                <div class="flex items-center space-x-4">
                  <Button @click="createBackup">
                    <Database class="mr-2 h-4 w-4" />
                    Create Backup Now
                  </Button>
                  <Button variant="outline" @click="exportData">
                    <Download class="mr-2 h-4 w-4" />
                    Export All Data
                  </Button>
                </div>
              </div>

              <!-- Data Import -->
              <div class="space-y-4">
                <h3 class="text-lg font-medium">Data Import</h3>
                <div
                  class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
                >
                  <Upload class="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p class="text-lg font-medium mb-2">Import Data</p>
                  <p class="text-sm text-muted-foreground mb-4">
                    Upload a backup file to restore your data
                  </p>
                  <Button @click="importData">
                    <Upload class="mr-2 h-4 w-4" />
                    Choose File
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    <!-- Avatar Upload Modal -->
    <Dialog v-model:open="showAvatarModal">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
          <DialogDescription>
            Upload a new profile picture or choose from our avatars
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="text-center">
            <div
              class="h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4"
            >
              <span class="text-4xl font-bold text-white">
                {{ userProfile.firstName.charAt(0).toUpperCase()
                }}{{ userProfile.lastName.charAt(0).toUpperCase() }}
              </span>
            </div>
            <Input type="file" accept="image/*" class="mb-4" />
            <p class="text-xs text-muted-foreground">
              Recommended: Square image, at least 200x200px
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showAvatarModal = false">
            Cancel
          </Button>
          <Button @click="updateAvatar">
            <Upload class="mr-2 h-4 w-4" />
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Delete Account Modal -->
    <Dialog v-model:open="showDeleteAccountModal">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle class="text-red-600">Delete Account</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and all associated data.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 class="font-medium text-red-800 mb-2">What will be deleted:</h4>
            <ul class="text-sm text-red-700 space-y-1">
              <li>• All your orders and customer data</li>
              <li>• Team members and permissions</li>
              <li>• Billing history and invoices</li>
              <li>• API keys and integrations</li>
              <li>• All settings and preferences</li>
            </ul>
          </div>
          <div>
            <Label for="confirmDelete">Type "DELETE" to confirm</Label>
            <Input
              id="confirmDelete"
              v-model="deleteConfirmation"
              placeholder="DELETE"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showDeleteAccountModal = false">
            Cancel
          </Button>
          <Button
            variant="destructive"
            :disabled="deleteConfirmation !== 'DELETE'"
            @click="deleteAccount"
          >
            <Trash2 class="mr-2 h-4 w-4" />
            Delete Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import HeadersContent from "~/components/ui/HeadersContent.vue";
import { ref, reactive } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Plug,
  Database,
  Save,
  Lock,
  Monitor,
  LogOut,
  Plus,
  Mail,
  Download,
  Upload,
  CreditCard,
  Smartphone,
  Camera,
  Trash2,
} from "lucide-vue-next";

definePageMeta({
  middleware: "auth",
});

// Get User Data
const { user } = useAuth();

// Active section
const activeSection = ref("account");

// Modals
const showAvatarModal = ref(false);
const showDeleteAccountModal = ref(false);
const deleteConfirmation = ref("");

// Setting sections - Account added as first section
const settingSections = [
  {
    id: "account",
    name: "Account",
    icon: User,
    badge: "2FA",
    badgeVariant: "default",
  },
  { id: "general", name: "General", icon: SettingsIcon },
  { id: "notifications", name: "Notifications", icon: Bell },
  { id: "security", name: "Security", icon: Shield },
  { id: "integrations", name: "Integrations", icon: Plug },
  { id: "backup", name: "Backup & Export", icon: Database },
];

// User profile data
const userProfile = reactive({
  firstName: "Damayanti",
  lastName: "Nur Aisyah",
  email: "admin@gmail.com",
  phone: "+62 812-3456-7890",
  timezone: "Asia/Jakarta",
  language: "id",
  businessName: "Zarqa",
  businessType: "fashion",
  businessPhone: "+62 21-1234-5678",
  businessAddress: "Jl. Babakan Cijeruk, Ciwidey, Bandung, Jawa Barat",
  plan: "Professional",
  planStatus: "Active",
  role: "Owner",
  joinedAt: "2023-01-15T08:00:00Z",
  nextBilling: "2024-02-17T00:00:00Z",
});

// Settings data
const settings = reactive({
  general: {
    businessName: "Zarqa",
    businessType: "fashion",
    businessEmail: "admin@gmail.com",
    businessPhone: "+62 21-1234-5678",
    businessAddress: "Jl. Babakan Cijeruk, Ciwidey, Bandung, Jawa Barat",
    timezone: "Asia/Jakarta",
    currency: "IDR",
    language: "id",
    dateFormat: "DD/MM/YYYY",
  },
  notifications: {
    email: {
      newOrders: true,
      orderUpdates: true,
      lowStock: true,
      dailyReports: false,
    },
    push: {
      browser: true,
      mobile: false,
    },
    sms: {
      critical: true,
      orders: false,
    },
  },
  security: {
    twoFactorEnabled: true,
  },
  integrations: {
    googleAnalytics: {
      enabled: false,
      trackingId: "",
    },
  },
  backup: {
    autoBackup: true,
    backupTime: "02:00",
  },
});

// Password form
const passwordForm = reactive({
  current: "",
  new: "",
  confirm: "",
});

// Sample data
const activeSessions = ref([
  {
    id: "1",
    device: "Chrome on Windows",
    location: "Ciwidey, Indonesia",
    lastActive: "Active now",
    current: true,
  },
  {
    id: "2",
    device: "Safari on iPhone",
    location: "Ciwidey, Indonesia",
    lastActive: "2 hours ago",
    current: false,
  },
]);

const apiKeys = ref([
  {
    id: "1",
    name: "Production API",
    created: "Jan 15, 2024",
    lastUsed: "2 hours ago",
    status: "active",
  },
  {
    id: "2",
    name: "Development API",
    created: "Jan 10, 2024",
    lastUsed: "1 week ago",
    status: "active",
  },
]);

const paymentGateways = ref([
  {
    id: "midtrans",
    name: "Midtrans",
    description: "Indonesian payment gateway",
    icon: CreditCard,
    enabled: true,
    apiKey: "",
    secretKey: "",
  },
  {
    id: "xendit",
    name: "Xendit",
    description: "Southeast Asian payment platform",
    icon: CreditCard,
    enabled: false,
    apiKey: "",
    secretKey: "",
  },
]);

const emailServices = ref([
  {
    id: "sendgrid",
    name: "SendGrid",
    description: "Email delivery service",
    enabled: true,
    apiKey: "",
    fromEmail: "",
  },
  {
    id: "mailgun",
    name: "Mailgun",
    description: "Email automation service",
    enabled: false,
    apiKey: "",
    fromEmail: "",
  },
]);

const recentBackups = ref([
  {
    id: "1",
    name: "Daily Backup - January 17, 2024",
    date: "Jan 17, 2024 02:00 AM",
    size: "45.2 MB",
    status: "completed",
  },
  {
    id: "2",
    name: "Daily Backup - January 16, 2024",
    date: "Jan 16, 2024 02:00 AM",
    size: "44.8 MB",
    status: "completed",
  },
  {
    id: "3",
    name: "Manual Backup - January 15, 2024",
    date: "Jan 15, 2024 10:30 AM",
    size: "44.5 MB",
    status: "completed",
  },
]);

// Utility functions
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Account methods
const saveAccountInfo = () => {
  console.log("Saving account information:", userProfile);
};

const updateAvatar = () => {
  console.log("Updating avatar");
  showAvatarModal.value = false;
};

const exportAccountData = () => {
  console.log("Exporting account data");
};

const deleteAccount = () => {
  console.log("Deleting account");
  showDeleteAccountModal.value = false;
  deleteConfirmation.value = "";
};

// Settings methods
const saveGeneralSettings = () => {
  console.log("Saving general settings:", settings.general);
};

const saveNotificationSettings = () => {
  console.log("Saving notification settings:", settings.notifications);
};

const changePassword = () => {
  console.log("Changing password");
  // Reset form
  Object.assign(passwordForm, {
    current: "",
    new: "",
    confirm: "",
  });
};

const toggle2FA = () => {
  settings.security.twoFactorEnabled = !settings.security.twoFactorEnabled;
  console.log("2FA toggled:", settings.security.twoFactorEnabled);
};

const revokeSession = (sessionId) => {
  console.log("Revoking session:", sessionId);
};

const revokeAllSessions = () => {
  console.log("Revoking all sessions");
};

const createApiKey = () => {
  console.log("Creating new API key");
};

const revokeApiKey = (keyId) => {
  console.log("Revoking API key:", keyId);
};

const togglePaymentGateway = (gatewayId) => {
  console.log("Toggling payment gateway:", gatewayId);
};

const toggleEmailService = (serviceId) => {
  console.log("Toggling email service:", serviceId);
};

const saveIntegrationSettings = () => {
  console.log("Saving integration settings");
};

const createBackup = () => {
  console.log("Creating manual backup");
};

const downloadBackup = (backupId) => {
  console.log("Downloading backup:", backupId);
};

const exportData = () => {
  console.log("Exporting all data");
};

const importData = () => {
  console.log("Importing data");
};
</script>

<style scoped>
/* Custom styles */
</style>
