"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nexus/ui";
import { api } from "@nexus/trpc/react";

// Validation schema
const planSchema = z.object({
  name: z.string().min(1, "Plan name is required").max(100),
  pricingModel: z.enum(["tiered", "fixed", "usage"]),
  contractLength: z.number().min(1, "Contract length must be at least 1"),
  contractTimeUnit: z.enum(["month", "quarter", "year"]),
  billingCadence: z.enum(["monthly", "quarterly", "yearly"]),
  setupFee: z.number().min(0, "Setup fee cannot be negative"),
  prepaymentPercent: z.number().min(0, "Cannot be negative").max(100, "Cannot exceed 100%"),
  capAmount: z.number().min(0, "Cap amount cannot be negative"),
  overageCostRate: z.number().min(0, "Overage cost cannot be negative"),
});

type PlanFormValues = z.infer<typeof planSchema>;

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
};

interface PlanModalProps {
  mode: "create" | "edit";
  isOpen: boolean;
  onClose: () => void;
  plan: PlanData | null;
  onSuccess: () => void;
}

export function PlanModal({
  mode,
  isOpen,
  onClose,
  plan,
  onSuccess,
}: PlanModalProps) {
  // TRPC mutations
  const createPlanMutation = api.subscriptionPlans.create.useMutation({
    onSuccess: () => {
      reset();
      onSuccess();
    },
    onError: (error) => {
      console.error("Error creating plan:", error);
      alert(`Error creating plan: ${error.message}`);
    },
  });

  const updatePlanMutation = api.subscriptionPlans.update.useMutation({
    onSuccess: () => {
      reset();
      onSuccess();
    },
    onError: (error) => {
      console.error("Error updating plan:", error);
      alert(`Error updating plan: ${error.message}`);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: "",
      pricingModel: "fixed",
      contractLength: 1,
      contractTimeUnit: "month",
      billingCadence: "monthly",
      setupFee: 0,
      prepaymentPercent: 0,
      capAmount: 0,
      overageCostRate: 0,
    },
  });

  // Watch form values for selects
  const pricingModel = watch("pricingModel");
  const contractTimeUnit = watch("contractTimeUnit");
  const billingCadence = watch("billingCadence");

  // Reset form when modal opens/closes or plan changes
  useEffect(() => {
    if (isOpen && mode === "edit" && plan) {
      setValue("name", plan.name);
      setValue("pricingModel", plan.pricingModel);
      setValue("contractLength", plan.contractLength);
      setValue("contractTimeUnit", plan.contractTimeUnit);
      setValue("billingCadence", plan.billingCadence);
      setValue("setupFee", plan.setupFee);
      setValue("prepaymentPercent", plan.prepaymentPercent);
      setValue("capAmount", plan.capAmount);
      setValue("overageCostRate", plan.overageCostRate);
    } else if (isOpen && mode === "create") {
      reset();
    }
  }, [isOpen, mode, plan, setValue, reset]);

  const onSubmit = async (data: PlanFormValues) => {
    if (mode === "edit" && plan) {
      updatePlanMutation.mutate({
        id: plan.id,
        data,
      });
    } else {
      createPlanMutation.mutate(data);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isSubmitting = createPlanMutation.isPending || updatePlanMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Plan" : "Add New Plan"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Plan Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter plan name"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Pricing Model */}
            <div className="space-y-2">
              <Label htmlFor="pricingModel">Pricing Model</Label>
              <Select
                value={pricingModel}
                onValueChange={(value) => setValue("pricingModel", value as "tiered" | "fixed" | "usage")}
              >
                <SelectTrigger className={errors.pricingModel ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select pricing model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="tiered">Tiered</SelectItem>
                  <SelectItem value="usage">Usage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Contract Length */}
            <div className="space-y-2">
              <Label htmlFor="contractLength">Contract Length</Label>
              <div className="flex gap-2">
                <Input
                  id="contractLength"
                  type="number"
                  {...register("contractLength", { valueAsNumber: true })}
                  placeholder="12"
                  className={errors.contractLength ? "border-destructive" : ""}
                />
                <Select
                  value={contractTimeUnit}
                  onValueChange={(value) => setValue("contractTimeUnit", value as "month" | "quarter" | "year")}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="quarter">Quarter</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errors.contractLength && (
                <p className="text-sm text-destructive">{errors.contractLength.message}</p>
              )}
            </div>

            {/* Billing Cadence */}
            <div className="space-y-2">
              <Label htmlFor="billingCadence">Billing Cadence</Label>
              <Select
                value={billingCadence}
                onValueChange={(value) => setValue("billingCadence", value as "monthly" | "quarterly" | "yearly")}
              >
                <SelectTrigger className={errors.billingCadence ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select billing cadence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Setup Fee */}
            <div className="space-y-2">
              <Label htmlFor="setupFee">Setup Fee</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="setupFee"
                  type="number"
                  step="0.01"
                  {...register("setupFee", { valueAsNumber: true })}
                  placeholder="0"
                  className={`pl-8 ${errors.setupFee ? "border-destructive" : ""}`}
                />
              </div>
              {errors.setupFee && (
                <p className="text-sm text-destructive">{errors.setupFee.message}</p>
              )}
            </div>

            {/* Prepayment % */}
            <div className="space-y-2">
              <Label htmlFor="prepaymentPercent">Prepayment %</Label>
              <div className="relative">
                <Input
                  id="prepaymentPercent"
                  type="number"
                  step="0.01"
                  {...register("prepaymentPercent", { valueAsNumber: true })}
                  placeholder="0"
                  className={`pr-8 ${errors.prepaymentPercent ? "border-destructive" : ""}`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
              {errors.prepaymentPercent && (
                <p className="text-sm text-destructive">{errors.prepaymentPercent.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Cap Amount */}
            <div className="space-y-2">
              <Label htmlFor="capAmount">$ Cap</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="capAmount"
                  type="number"
                  step="0.01"
                  {...register("capAmount", { valueAsNumber: true })}
                  placeholder="0"
                  className={`pl-8 ${errors.capAmount ? "border-destructive" : ""}`}
                />
              </div>
              {errors.capAmount && (
                <p className="text-sm text-destructive">{errors.capAmount.message}</p>
              )}
            </div>

            {/* Overage Cost Rate */}
            <div className="space-y-2">
              <Label htmlFor="overageCostRate">Overage Cost</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="overageCostRate"
                  type="number"
                  step="0.01"
                  {...register("overageCostRate", { valueAsNumber: true })}
                  placeholder="0"
                  className={`pl-8 pr-12 ${errors.overageCostRate ? "border-destructive" : ""}`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">/hr</span>
              </div>
              {errors.overageCostRate && (
                <p className="text-sm text-destructive">{errors.overageCostRate.message}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting 
                ? (mode === "edit" ? "Updating..." : "Creating...") 
                : (mode === "edit" ? "Update Plan" : "Create Plan")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}