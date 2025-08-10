import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Test database connection by counting records
    const stats = {
      users: await prisma.user.count(),
      companies: await prisma.company.count(),
      workflows: await prisma.workflow.count(),
      executions: await prisma.workflowExecution.count(),
    };
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful!",
      stats,
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Database connection failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}