import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

// Validation schema for plan creation/update
const planInputSchema = z.object({
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

export const subscriptionPlansRouter = createTRPCRouter({
  // Get all subscription plans with client counts
  getAll: adminProcedure.query(async ({ ctx }) => {
    const plans = await ctx.db.subscriptionPlan.findMany({
      where: { isActive: true },
      include: {
        companies: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform data to include client count
    return plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      pricingModel: plan.pricingModel,
      contractLength: plan.contractLength,
      contractTimeUnit: plan.contractTimeUnit,
      billingCadence: plan.billingCadence,
      setupFee: plan.setupFee,
      prepaymentPercent: plan.prepaymentPercent,
      capAmount: plan.capAmount,
      overageCostRate: plan.overageCostRate,
      clientCount: plan.companies.length,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    }));
  }),

  // Get a single plan by ID
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const plan = await ctx.db.subscriptionPlan.findUnique({
        where: { id: input.id },
        include: {
          companies: {
            select: {
              id: true,
              name: true,
              domain: true,
            },
          },
        },
      });

      if (!plan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription plan not found",
        });
      }

      return plan;
    }),

  // Create a new subscription plan
  create: adminProcedure
    .input(planInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if plan name already exists
      const existingPlan = await ctx.db.subscriptionPlan.findUnique({
        where: { name: input.name },
      });

      if (existingPlan) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A plan with this name already exists",
        });
      }

      // Create the plan
      const plan = await ctx.db.subscriptionPlan.create({
        data: {
          name: input.name,
          pricingModel: input.pricingModel,
          contractLength: input.contractLength,
          contractTimeUnit: input.contractTimeUnit,
          billingCadence: input.billingCadence,
          setupFee: input.setupFee,
          prepaymentPercent: input.prepaymentPercent,
          capAmount: input.capAmount,
          overageCostRate: input.overageCostRate,
        },
      });

      return plan;
    }),

  // Update an existing subscription plan
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        data: planInputSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if plan exists
      const existingPlan = await ctx.db.subscriptionPlan.findUnique({
        where: { id: input.id },
      });

      if (!existingPlan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription plan not found",
        });
      }

      // Check if new name conflicts with another plan
      if (input.data.name !== existingPlan.name) {
        const nameConflict = await ctx.db.subscriptionPlan.findUnique({
          where: { name: input.data.name },
        });

        if (nameConflict) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A plan with this name already exists",
          });
        }
      }

      // Update the plan
      const plan = await ctx.db.subscriptionPlan.update({
        where: { id: input.id },
        data: {
          name: input.data.name,
          pricingModel: input.data.pricingModel,
          contractLength: input.data.contractLength,
          contractTimeUnit: input.data.contractTimeUnit,
          billingCadence: input.data.billingCadence,
          setupFee: input.data.setupFee,
          prepaymentPercent: input.data.prepaymentPercent,
          capAmount: input.data.capAmount,
          overageCostRate: input.data.overageCostRate,
        },
      });

      return plan;
    }),
});