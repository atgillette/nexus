import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding subscription plans...");

  // Create subscription plans
  const plans = await prisma.subscriptionPlan.createMany({
    data: [
      {
        name: "Enterprise Pro",
        pricingModel: "tiered",
        contractLength: 12,
        contractTimeUnit: "month",
        billingCadence: "monthly",
        setupFee: 5000,
        prepaymentPercent: 25,
        capAmount: 100000,
        overageCostRate: 150,
      },
      {
        name: "Business Plus",
        pricingModel: "fixed",
        contractLength: 6,
        contractTimeUnit: "month",
        billingCadence: "quarterly",
        setupFee: 2500,
        prepaymentPercent: 15,
        capAmount: 50000,
        overageCostRate: 125,
      },
      {
        name: "Starter",
        pricingModel: "usage",
        contractLength: 3,
        contractTimeUnit: "month",
        billingCadence: "monthly",
        setupFee: 1000,
        prepaymentPercent: 10,
        capAmount: 25000,
        overageCostRate: 100,
      },
    ],
  });

  // Get the created plans to assign to companies
  const starterPlan = await prisma.subscriptionPlan.findUnique({
    where: { name: "Starter" }
  });
  const businessPlan = await prisma.subscriptionPlan.findUnique({
    where: { name: "Business Plus" }
  });

  // Update existing companies with plans
  const companies = await prisma.company.findMany();
  console.log(`Found ${companies.length} companies`);

  if (companies.length > 0 && starterPlan) {
    await prisma.company.update({
      where: { id: companies[0].id },
      data: { subscriptionPlanId: starterPlan.id }
    });
    console.log(`Assigned Starter plan to ${companies[0].name}`);
  }
  
  if (companies.length > 1 && businessPlan) {
    await prisma.company.update({
      where: { id: companies[1].id },
      data: { subscriptionPlanId: businessPlan.id }
    });
    console.log(`Assigned Business Plus plan to ${companies[1].name}`);
  }

  console.log("✅ Subscription plans seeded successfully!");
  console.log(`📊 Created ${plans.count} subscription plans`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });