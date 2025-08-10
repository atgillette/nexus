import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log("Testing database connection...");
    
    // Test basic counts
    const counts = {
      companies: await prisma.company.count(),
      workflows: await prisma.workflow.count(),
      executions: await prisma.workflowExecution.count(),
      users: await prisma.user.count()
    };
    
    console.log("Basic counts:", counts);
    
    // Test finding first company
    const firstCompany = await prisma.company.findFirst();
    console.log("First company:", firstCompany);
    
    // Test company with workflows
    const companyWithWorkflows = await prisma.company.findFirst({
      include: {
        workflows: true
      }
    });
    console.log("Company with workflows:", companyWithWorkflows);
    
    return NextResponse.json({
      success: true,
      debug: {
        counts,
        firstCompany,
        companyWithWorkflows
      }
    });
    
  } catch (error) {
    console.error("Debug API error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Debug failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}