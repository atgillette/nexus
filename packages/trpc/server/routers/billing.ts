import { z } from "zod";
import { createTRPCRouter, clientProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const billingRouter = createTRPCRouter({
  getBillingOverview: clientProcedure.query(async ({ ctx }) => {
    try {
      // Get company with subscription plan
      const company = await ctx.db.company.findUnique({
        where: { id: ctx.companyId },
        include: {
          subscriptionPlan: true,
          paymentMethod: true,
        },
      });

      if (!company) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company not found",
        });
      }

      // Get current month's usage
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const currentUsage = await ctx.db.billingUsage.findUnique({
        where: {
          companyId_month_year: {
            companyId: ctx.companyId,
            month: currentMonth,
            year: currentYear,
          },
        },
      });

      // Get recent invoices (last 3)
      const recentInvoices = await ctx.db.invoice.findMany({
        where: { companyId: ctx.companyId },
        orderBy: { createdAt: "desc" },
        take: 3,
      });

      // Count active users for this company
      const activeUsers = await ctx.db.user.count({
        where: { companyId: ctx.companyId },
      });

      // Get total storage (mock for now)
      const storageUsedGB = 1200; // 1.2 TB in GB

      // Calculate SE hours (mock for now)
      const seHoursUsed = 12.5;
      const seHoursTotal = 20;

      // Calculate renewal date (mock - 1 year from creation)
      const renewalDate = new Date(company.createdAt);
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);

      return {
        company: {
          name: company.name,
          id: company.id,
        },
        subscriptionPlan: company.subscriptionPlan ? {
          name: company.subscriptionPlan.name,
          price: calculatePlanPrice(company.subscriptionPlan),
          billingCadence: company.subscriptionPlan.billingCadence,
        } : {
          name: "Enterprise",
          price: 2000,
          billingCadence: "monthly",
        },
        renewalDate: renewalDate.toISOString(),
        paymentMethod: company.paymentMethod ? {
          brand: company.paymentMethod.brand,
          last4: company.paymentMethod.last4,
          expiryMonth: company.paymentMethod.expiryMonth,
          expiryYear: company.paymentMethod.expiryYear,
        } : null,
        currentUsage: {
          apiCalls: currentUsage?.executionCount || 0,
          storageUsedGB,
          activeUsers,
        },
        seHours: {
          used: seHoursUsed,
          total: seHoursTotal,
          remaining: seHoursTotal - seHoursUsed,
        },
        recentInvoices: recentInvoices.map(invoice => ({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.amount,
          status: invoice.status,
          dueDate: invoice.dueDate.toISOString(),
          paidDate: invoice.paidDate?.toISOString() || null,
          billingPeriodStart: invoice.billingPeriodStart.toISOString(),
          billingPeriodEnd: invoice.billingPeriodEnd.toISOString(),
        })),
      };
    } catch (error) {
      console.error("Error fetching billing overview:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch billing data",
      });
    }
  }),

  getAllInvoices: clientProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      pageSize: z.number().min(10).max(100).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.pageSize;

      const [invoices, totalCount] = await Promise.all([
        ctx.db.invoice.findMany({
          where: { companyId: ctx.companyId },
          orderBy: { createdAt: "desc" },
          skip,
          take: input.pageSize,
        }),
        ctx.db.invoice.count({
          where: { companyId: ctx.companyId },
        }),
      ]);

      return {
        invoices: invoices.map(invoice => ({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.amount,
          status: invoice.status,
          dueDate: invoice.dueDate.toISOString(),
          paidDate: invoice.paidDate?.toISOString() || null,
          billingPeriodStart: invoice.billingPeriodStart.toISOString(),
          billingPeriodEnd: invoice.billingPeriodEnd.toISOString(),
        })),
        pagination: {
          page: input.page,
          pageSize: input.pageSize,
          totalPages: Math.ceil(totalCount / input.pageSize),
          totalCount,
        },
      };
    }),

  getUsageDetails: clientProcedure
    .input(z.object({
      month: z.number().min(1).max(12),
      year: z.number().min(2024).max(2030),
    }))
    .query(async ({ ctx, input }) => {
      const usage = await ctx.db.billingUsage.findUnique({
        where: {
          companyId_month_year: {
            companyId: ctx.companyId,
            month: input.month,
            year: input.year,
          },
        },
      });

      if (!usage) {
        return {
          executionCount: 0,
          totalTimeSaved: 0,
          totalCostSaved: 0,
          billingAmount: 0,
        };
      }

      return {
        executionCount: usage.executionCount,
        totalTimeSaved: usage.totalTimeSaved,
        totalCostSaved: usage.totalCostSaved,
        billingAmount: usage.billingAmount,
      };
    }),

  updatePaymentMethod: clientProcedure
    .input(z.object({
      brand: z.string(),
      last4: z.string().length(4),
      expiryMonth: z.number().min(1).max(12),
      expiryYear: z.number().min(new Date().getFullYear()),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if payment method exists
      const existing = await ctx.db.paymentMethod.findUnique({
        where: { companyId: ctx.companyId },
      });

      if (existing) {
        return await ctx.db.paymentMethod.update({
          where: { id: existing.id },
          data: input,
        });
      } else {
        return await ctx.db.paymentMethod.create({
          data: {
            companyId: ctx.companyId,
            ...input,
          },
        });
      }
    }),
});

// Helper function to calculate plan price based on pricing model
function calculatePlanPrice(plan: any): number {
  // Simplified calculation - in real app this would be more complex
  switch (plan.pricingModel) {
    case "flat_rate":
      return plan.capAmount || 2000;
    case "usage_based":
      return 0; // Calculated based on usage
    case "tiered":
      return plan.capAmount || 2000;
    default:
      return 2000;
  }
}