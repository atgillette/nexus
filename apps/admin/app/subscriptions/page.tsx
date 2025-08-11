"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout, Button, Card, CardContent } from "@nexus/ui";
import { Plus } from "lucide-react";
import { api } from "@nexus/trpc/react";
import { PlanModal } from "./components/PlanModal";

export default function SubscriptionsPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  type PlanData = {
    id: string;
    name: string;
    pricingModel: "tiered" | "fixed" | "usage";
    contractLength: number;
    contractTimeUnit: "month" | "quarter" | "year";
    billingCadence: "monthly" | "quarterly" | "yearly";
    setupFee: number;
    prepaymentPercent: number;
    capAmount: number;
    overageCostRate: number;
    clientCount: number;
  };
  
  const [selectedPlan, setSelectedPlan] = useState<PlanData | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  // Fetch data
  const { data: profileData } = api.profile.getProfile.useQuery();
  const { data: plans, isLoading, error } = api.subscriptionPlans.getAll.useQuery();

  const utils = api.useUtils();

  const handleAddPlan = () => {
    setSelectedPlan(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleEditPlan = (plan: PlanData) => {
    setSelectedPlan(plan);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const formatContractLength = (length: number, unit: string) => {
    const unitDisplay = length === 1 ? unit : unit + "s";
    return `${length} ${unitDisplay}`;
  };

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <AppLayout title="Plan Manager" activeNavItem="subscriptions">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading plans...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Plan Manager" activeNavItem="subscriptions">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">Error loading plans: {error.message}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Plan Manager"
      activeNavItem="subscriptions"
      userRole="admin"
      userAvatar={profileData?.avatarUrl || undefined}
      userName={profileData ? `${profileData.firstName} ${profileData.lastName}` : undefined}
      onNavigate={(href) => router.push(href)}
      onProfileClick={() => router.push('/profile')}
      onNotificationsClick={() => console.log('Notifications clicked')}
    >
      <div className="pt-16">
        <div className="px-4 py-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground">Plan Manager</h1>
            <Button
              onClick={handleAddPlan}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Plan
            </Button>
          </div>

          {/* Plans Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-medium">Name</th>
                      <th className="text-left p-4 font-medium">Pricing Model</th>
                      <th className="text-left p-4 font-medium">Contract Length</th>
                      <th className="text-left p-4 font-medium">Billing Cadence</th>
                      <th className="text-left p-4 font-medium">Setup Fee</th>
                      <th className="text-left p-4 font-medium">Prepayment %</th>
                      <th className="text-left p-4 font-medium">$ Cap</th>
                      <th className="text-left p-4 font-medium">Overage Cost</th>
                      <th className="text-left p-4 font-medium"># Clients</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans?.map((plan, index) => (
                      <tr key={plan.id} className={index > 0 ? "border-t" : ""}>
                        <td className="p-4 font-medium">{plan.name}</td>
                        <td className="p-4 capitalize">{plan.pricingModel}</td>
                        <td className="p-4">{formatContractLength(plan.contractLength, plan.contractTimeUnit)}</td>
                        <td className="p-4 capitalize">{plan.billingCadence.replace('ly', ' ')}</td>
                        <td className="p-4">{formatCurrency(plan.setupFee)}</td>
                        <td className="p-4">{plan.prepaymentPercent}%</td>
                        <td className="p-4">{formatCurrency(plan.capAmount)}</td>
                        <td className="p-4">${plan.overageCostRate}/hr</td>
                        <td className="p-4">{plan.clientCount}</td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPlan(plan)}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add/Edit Plan Modal */}
      <PlanModal
        mode={modalMode}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plan={selectedPlan}
        onSuccess={() => {
          setIsModalOpen(false);
          utils.subscriptionPlans.getAll.invalidate();
        }}
      />
    </AppLayout>
  );
}