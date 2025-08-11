import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedBilling() {
  try {
    console.log("Seeding billing data...");

    // Get the first company
    const company = await prisma.company.findFirst();
    
    if (!company) {
      console.log("No company found. Please run the main seed script first.");
      return;
    }

    console.log(`Adding billing data for company: ${company.name}`);

    // Add payment method
    const paymentMethod = await prisma.paymentMethod.upsert({
      where: { companyId: company.id },
      update: {},
      create: {
        companyId: company.id,
        type: "card",
        brand: "Visa",
        last4: "4242",
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true,
      },
    });
    console.log("✓ Payment method added");

    // Add some invoices
    const currentDate = new Date();
    const invoices = [];
    
    for (let i = 3; i >= 1; i--) {
      const invoiceDate = new Date(currentDate);
      invoiceDate.setMonth(currentDate.getMonth() - i);
      
      const billingPeriodStart = new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), 1);
      const billingPeriodEnd = new Date(invoiceDate.getFullYear(), invoiceDate.getMonth() + 1, 0);
      
      const invoice = await prisma.invoice.create({
        data: {
          companyId: company.id,
          invoiceNumber: `2025-${String(invoiceDate.getMonth() + 1).padStart(2, '0')}`,
          amount: 2450.00,
          status: i === 3 ? "paid" : i === 2 ? "paid" : "pending",
          dueDate: new Date(invoiceDate.getFullYear(), invoiceDate.getMonth() + 1, 15),
          paidDate: i <= 2 ? new Date(invoiceDate.getFullYear(), invoiceDate.getMonth() + 1, 10) : null,
          billingPeriodStart,
          billingPeriodEnd,
          description: `Monthly subscription - ${billingPeriodStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        },
      });
      invoices.push(invoice);
    }
    console.log(`✓ ${invoices.length} invoices added`);

    // Add billing usage for current month
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    const billingUsage = await prisma.billingUsage.upsert({
      where: {
        companyId_month_year: {
          companyId: company.id,
          month: currentMonth,
          year: currentYear,
        },
      },
      update: {
        executionCount: 245678,
        totalTimeSaved: 1250,
        totalCostSaved: 125000,
        billingAmount: 2450.00,
      },
      create: {
        companyId: company.id,
        month: currentMonth,
        year: currentYear,
        executionCount: 245678,
        totalTimeSaved: 1250,
        totalCostSaved: 125000,
        billingAmount: 2450.00,
        isPaid: false,
      },
    });
    console.log("✓ Billing usage data added");

    console.log("\n✅ Billing data seeded successfully!");
    
  } catch (error) {
    console.error("Error seeding billing data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedBilling().catch((error) => {
  console.error(error);
  process.exit(1);
});