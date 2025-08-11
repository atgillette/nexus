"use client";

import { useRouter } from "next/navigation";
import { AppLayout, Button, Card } from "@nexus/ui";
import { api } from "@/trpc/react";
import { CreditCard, Download, ChevronRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function BillingPage() {
  const router = useRouter();
  const { data, isLoading, error } = api.billing.getBillingOverview.useQuery();

  const handleUpdatePaymentMethod = () => {
    toast.info("Payment method update coming soon");
  };

  const handleDownloadContract = () => {
    toast.info("Contract download coming soon");
  };

  const handleContactSupport = () => {
    toast.info("Contact support coming soon");
  };

  const handleViewDetailedReport = () => {
    toast.info("Detailed report coming soon");
  };

  const handleViewAllInvoices = () => {
    toast.info("All invoices view coming soon");
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast.info(`Download invoice ${invoiceId} coming soon`);
  };

  if (isLoading) {
    return (
      <AppLayout
        title="Billing"
        activeNavItem="billing"
        userRole="client"
        onNavigate={(href) => router.push(href)}
        onProfileClick={() => router.push('/profile')}
        onNotificationsClick={() => console.log('Notifications clicked')}
        onLogoutClick={() => router.push('/auth/logout')}
      >
        <div className="pt-16">
          <div className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading billing data...</p>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout
        title="Billing"
        activeNavItem="billing"
        userRole="client"
        onNavigate={(href) => router.push(href)}
        onProfileClick={() => router.push('/profile')}
        onNotificationsClick={() => console.log('Notifications clicked')}
        onLogoutClick={() => router.push('/auth/logout')}
      >
        <div className="pt-16">
          <div className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-2" />
                <p className="text-destructive">Error loading billing data</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {error?.message || "Please try again later"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatInvoiceDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const formatStorageSize = (sizeInGB: number) => {
    if (sizeInGB >= 1000) {
      return `${(sizeInGB / 1000).toFixed(1)} TB`;
    }
    return `${sizeInGB} GB`;
  };

  return (
    <AppLayout
      title="Billing"
      activeNavItem="billing"
      userRole="client"
      onNavigate={(href) => router.push(href)}
      onProfileClick={() => router.push('/profile')}
      onNotificationsClick={() => console.log('Notifications clicked')}
      onLogoutClick={() => router.push('/auth/logout')}
    >
      <div className="pt-16">
        <div className="p-6 max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Billing Overview</h1>

          {/* Plan and SE Hours Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Current Plan */}
            <Card className="p-6">
              <h3 className="text-sm text-muted-foreground mb-2">Current Plan</h3>
              <p className="text-2xl font-bold">{data.subscriptionPlan.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {formatCurrency(data.subscriptionPlan.price)}/month base fee
              </p>
            </Card>

            {/* Credits Remaining - Placeholder for now */}
            <Card className="p-6">
              <h3 className="text-sm text-muted-foreground mb-2">Credits Remaining</h3>
              <p className="text-2xl font-bold">-</p>
              <p className="text-sm text-muted-foreground mt-1">
                Renews on {formatDate(data.renewalDate)}
              </p>
            </Card>

            {/* SE Hours This Month */}
            <Card className="p-6">
              <h3 className="text-sm text-muted-foreground mb-2">SE Hours This Month</h3>
              <p className="text-2xl font-bold">
                {data.seHours.used} / {data.seHours.total}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {data.seHours.remaining} hours remaining
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Usage Summary */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Usage Summary</h2>
                <button
                  onClick={handleViewDetailedReport}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  View detailed report
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-muted-foreground">API Calls</span>
                  <span className="font-semibold">
                    {data.currentUsage.apiCalls.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-muted-foreground">Storage Used</span>
                  <span className="font-semibold">
                    {formatStorageSize(data.currentUsage.storageUsedGB)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3">
                  <span className="text-muted-foreground">Active Users</span>
                  <span className="font-semibold">
                    {data.currentUsage.activeUsers}
                  </span>
                </div>
              </div>
            </Card>

            {/* Recent Invoices */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Recent Invoices</h2>
                <button
                  onClick={handleViewAllInvoices}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  View all invoices
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {data.recentInvoices.length > 0 ? (
                  data.recentInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between py-3 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium">
                          {new Date(invoice.billingPeriodStart).toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Invoice #{invoice.invoiceNumber}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">{formatCurrency(invoice.amount)}</span>
                        <button
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No invoices yet</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Billing Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Payment Method */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
              
              {data.paymentMethod ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-muted rounded flex items-center justify-center">
                      <CreditCard className="w-6 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {data.paymentMethod.brand} ending in {data.paymentMethod.last4}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Expires {data.paymentMethod.expiryMonth}/{data.paymentMethod.expiryYear}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleUpdatePaymentMethod}
                    className="text-primary hover:underline text-sm"
                  >
                    Update payment method
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground">No payment method on file</p>
                  <Button onClick={handleUpdatePaymentMethod}>
                    Add Payment Method
                  </Button>
                </div>
              )}
            </Card>

            {/* Need Help? */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Need Help?</h2>
              
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-center"
                  onClick={handleDownloadContract}
                >
                  Download Contract
                </Button>
                
                <Button
                  className="w-full justify-center"
                  onClick={handleContactSupport}
                >
                  Contact Support
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}