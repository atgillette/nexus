import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create companies
  const acmeCompany = await prisma.company.create({
    data: {
      name: "Acme Corporation",
      domain: "acme.com",
      industry: "Manufacturing",
    },
  });

  const techStartup = await prisma.company.create({
    data: {
      name: "TechFlow Solutions",
      domain: "techflow.io",
      industry: "Technology",
    },
  });

  // Create admin users
  const admin = await prisma.user.create({
    data: {
      email: "admin@braintrust.dev",
      firstName: "Admin",
      lastName: "User",
      role: UserRole.admin,
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
  });

  const salesEngineer = await prisma.user.create({
    data: {
      email: "se@braintrust.dev",
      firstName: "Sales",
      lastName: "Engineer",
      role: UserRole.se,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
  });

  // Create client users
  const acmeClient = await prisma.user.create({
    data: {
      email: "john.doe@acmecorp.com",
      firstName: "John",
      lastName: "Doe",
      role: UserRole.client,
      companyId: acmeCompany.id,
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    },
  });

  const techClient = await prisma.user.create({
    data: {
      email: "jane.smith@techflow.io",
      firstName: "Jane",
      lastName: "Smith",
      role: UserRole.client,
      companyId: techStartup.id,
      avatarUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b29c?w=150&h=150&fit=crop&crop=face",
    },
  });

  // Create workflows
  const dataProcessingWorkflow = await prisma.workflow.create({
    data: {
      name: "Daily Data Processing",
      description: "Automated daily data processing and reporting",
      companyId: acmeCompany.id,
      config: {
        schedule: "daily",
        source: "salesforce",
        destination: "warehouse",
      },
    },
  });

  const emailCampaignWorkflow = await prisma.workflow.create({
    data: {
      name: "Email Campaign Automation",
      description: "Automated email campaigns based on user behavior",
      companyId: techStartup.id,
      config: {
        triggers: ["user_signup", "purchase_completed"],
        email_templates: ["welcome", "thank_you"],
      },
    },
  });

  // Create workflow executions with realistic metrics
  const executions = [];
  const now = new Date();
  
  // Create 30 days of execution history
  for (let i = 0; i < 30; i++) {
    const executionDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const isSuccess = Math.random() > 0.1; // 90% success rate
    
    executions.push({
      workflowId: dataProcessingWorkflow.id,
      status: isSuccess ? "completed" : "failed",
      startedAt: executionDate,
      completedAt: isSuccess ? new Date(executionDate.getTime() + Math.random() * 600000) : undefined,
      duration: isSuccess ? Math.floor(Math.random() * 600000) + 60000 : undefined, // 1-10 minutes
      itemsProcessed: isSuccess ? Math.floor(Math.random() * 1000) + 100 : 0,
      timeSaved: isSuccess ? Math.floor(Math.random() * 120) + 30 : 0, // 30-150 minutes
      costSavings: isSuccess ? Math.random() * 500 + 50 : 0, // $50-$550
      error: isSuccess ? null : "Connection timeout",
    });

    executions.push({
      workflowId: emailCampaignWorkflow.id,
      status: isSuccess ? "completed" : "failed",
      startedAt: new Date(executionDate.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
      completedAt: isSuccess ? new Date(executionDate.getTime() + 2 * 60 * 60 * 1000 + Math.random() * 300000) : undefined,
      duration: isSuccess ? Math.floor(Math.random() * 300000) + 30000 : undefined, // 30s-5min
      itemsProcessed: isSuccess ? Math.floor(Math.random() * 500) + 50 : 0,
      timeSaved: isSuccess ? Math.floor(Math.random() * 60) + 15 : 0, // 15-75 minutes
      costSavings: isSuccess ? Math.random() * 200 + 25 : 0, // $25-$225
      error: isSuccess ? null : "Template rendering error",
    });
  }

  await prisma.workflowExecution.createMany({
    data: executions as any,
  });

  // Create credentials
  await prisma.credential.create({
    data: {
      name: "Default",
      service: "salesforce",
      companyId: acmeCompany.id,
      config: {
        instanceUrl: "https://acme.my.salesforce.com",
        domain: "acme"
      },
    },
  });

  await prisma.credential.create({
    data: {
      name: "Default",
      service: "slack",
      companyId: techStartup.id,
      config: {
        workspaceUrl: "techstartup.slack.com"
      },
    },
  });

  // Create billing usage records
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  await prisma.billingUsage.create({
    data: {
      companyId: acmeCompany.id,
      month: currentMonth,
      year: currentYear,
      executionCount: 30,
      totalTimeSaved: 2400, // 40 hours
      totalCostSaved: 12000, // $12,000
      billingAmount: 299, // $299/month
      isPaid: true,
    },
  });

  await prisma.billingUsage.create({
    data: {
      companyId: techStartup.id,
      month: currentMonth,
      year: currentYear,
      executionCount: 25,
      totalTimeSaved: 1800, // 30 hours
      totalCostSaved: 8500, // $8,500
      billingAmount: 199, // $199/month
      isPaid: false,
    },
  });

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: acmeClient.id,
        title: "Workflow Completed",
        message: "Daily Data Processing workflow completed successfully",
        type: "success",
      },
      {
        userId: techClient.id,
        title: "New Feature Available",
        message: "Email template customization is now available",
        type: "info",
        isRead: true,
      },
      {
        userId: acmeClient.id,
        title: "Action Required",
        message: "Please update your Salesforce credentials",
        type: "warning",
      },
    ],
  });

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

  // Assign plans to existing companies
  if (starterPlan) {
    await prisma.company.update({
      where: { domain: "techcorp.com" },
      data: { subscriptionPlanId: starterPlan.id }
    });
  }
  if (businessPlan) {
    await prisma.company.update({
      where: { domain: "innovate.com" },
      data: { subscriptionPlanId: businessPlan.id }
    });
  }

  console.log("✅ Database seeded successfully!");
  console.log(`📊 Created:`);
  console.log(`   - 2 companies`);
  console.log(`   - 4 users (1 admin, 1 SE, 2 clients)`);
  console.log(`   - 2 workflows`);
  console.log(`   - ${executions.length} workflow executions`);
  console.log(`   - 2 credentials`);
  console.log(`   - 2 billing records`);
  console.log(`   - 3 notifications`);
  console.log(`   - 3 subscription plans`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });