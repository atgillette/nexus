import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // For now, we'll use the first client company's data
    // In a real app, this would be based on the authenticated user
    const clientCompany = await prisma.company.findFirst({
      include: {
        workflows: {
          include: {
            executions: {
              orderBy: { createdAt: 'desc' },
              take: 30 // Last 30 executions for ROI calc
            }
          }
        },
        users: true
      }
    });

    if (!clientCompany) {
      return NextResponse.json({ error: "No client company found" }, { status: 404 });
    }

    // Get billing usage separately (in case the relation has issues)
    const billingUsage = await prisma.billingUsage.findFirst({
      where: { companyId: clientCompany.id }
    });

    // Calculate ROI metrics
    const totalExecutions = clientCompany.workflows.reduce(
      (sum, workflow) => sum + workflow.executions.length, 0
    );
    
    const successfulExecutions = clientCompany.workflows.reduce(
      (sum, workflow) => sum + workflow.executions.filter((e: any) => e.success).length, 0
    );

    const successRate = totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 0;
    
    // Mock ROI calculation: successful executions save $50 each on average
    const estimatedSavings = successfulExecutions * 50;
    
    // Get recent workflow executions with details
    const recentExecutions = clientCompany.workflows
      .flatMap(workflow => 
        workflow.executions.map(execution => ({
          workflowName: workflow.name,
          success: execution.success,
          timestamp: execution.createdAt,
          executionTime: execution.executionTime || 0
        }))
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    // Get billing info
    const currentBilling = billingUsage || {
      monthlyUsage: totalExecutions, // Use actual executions as usage
      monthlyLimit: 1000,
      costPerExecution: 2.50
    };

    return NextResponse.json({
      company: {
        name: clientCompany.name,
        id: clientCompany.id
      },
      metrics: {
        activeWorkflows: clientCompany.workflows.filter(w => w.status === 'active').length,
        totalExecutions,
        successRate,
        estimatedSavings,
        averageExecutionTime: recentExecutions.length > 0 
          ? Math.round(recentExecutions.reduce((sum, e) => sum + e.executionTime, 0) / recentExecutions.length)
          : 0
      },
      billing: {
        monthlyUsage: billingUsage?.monthlyUsage || totalExecutions,
        monthlyLimit: billingUsage?.monthlyLimit || 1000,
        costPerExecution: billingUsage?.costPerExecution || 2.50,
        currentCost: (billingUsage?.monthlyUsage || totalExecutions) * (billingUsage?.costPerExecution || 2.50)
      },
      recentExecutions,
      workflows: clientCompany.workflows.map(workflow => ({
        id: workflow.id,
        name: workflow.name,
        status: workflow.status,
        executionCount: workflow.executions.length,
        lastExecution: workflow.executions[0]?.createdAt || null
      }))
    });
    
  } catch (error) {
    console.error("Client dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}