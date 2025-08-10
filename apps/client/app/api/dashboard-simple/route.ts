import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log("Starting simple dashboard API...");
    
    // Get basic company info first
    const company = await prisma.company.findFirst();
    console.log("Company found:", company?.name);
    
    if (!company) {
      return NextResponse.json({ error: "No company found" }, { status: 404 });
    }
    
    // Get workflows for this company
    const workflows = await prisma.workflow.findMany({
      where: { companyId: company.id }
    });
    console.log(`Found ${workflows.length} workflows`);
    
    // Get executions for these workflows
    const workflowIds = workflows.map(w => w.id);
    const executions = await prisma.workflowExecution.findMany({
      where: { workflowId: { in: workflowIds } },
      orderBy: { startedAt: 'desc' },
      take: 30
    });
    console.log(`Found ${executions.length} executions`);
    
    // Calculate metrics (success = completed status)
    const totalExecutions = executions.length;
    const successfulExecutions = executions.filter(e => e.status === 'completed').length;
    const successRate = totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 0;
    const estimatedSavings = successfulExecutions * 50; // $50 per successful execution
    
    const result = {
      company: {
        name: company.name,
        id: company.id
      },
      metrics: {
        activeWorkflows: workflows.filter(w => w.status === 'active').length,
        totalExecutions,
        successRate,
        estimatedSavings,
        averageExecutionTime: 0 // Simplified for now
      },
      billing: {
        monthlyUsage: totalExecutions,
        monthlyLimit: 1000,
        costPerExecution: 2.50,
        currentCost: totalExecutions * 2.50
      },
      recentExecutions: executions.slice(0, 10).map(execution => ({
        workflowName: workflows.find(w => w.id === execution.workflowId)?.name || 'Unknown',
        success: execution.status === 'completed',
        timestamp: execution.startedAt.toISOString(),
        executionTime: execution.duration || 0
      })),
      workflows: workflows.map(workflow => ({
        id: workflow.id,
        name: workflow.name,
        status: workflow.status || 'active',
        executionCount: executions.filter(e => e.workflowId === workflow.id).length,
        lastExecution: executions.find(e => e.workflowId === workflow.id)?.startedAt?.toISOString() || null
      }))
    };
    
    console.log("Returning result:", JSON.stringify(result, null, 2));
    return NextResponse.json(result);
    
  } catch (error) {
    console.error("Simple dashboard API error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch dashboard data",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}