import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get dashboard metrics
    const [
      totalUsers,
      activeWorkflows,
      totalExecutions,
      recentUsers,
      recentExecutions,
    ] = await Promise.all([
      // Total users count
      prisma.user.count(),
      
      // Active workflows count  
      prisma.workflow.count({
        where: { status: "active" }
      }),
      
      // Total executions with success rate
      prisma.workflowExecution.aggregate({
        _count: { id: true },
        _avg: { success: true }
      }),
      
      // Recent user registrations (last 5)
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { company: true }
      }),
      
      // Recent workflow executions (last 10)
      prisma.workflowExecution.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { 
          workflow: { include: { company: true } }
        }
      })
    ]);

    // Calculate success rate
    const successRate = Math.round((totalExecutions._avg.success || 0) * 100);
    
    // Calculate revenue (mock calculation based on executions)
    const monthlyRevenue = totalExecutions._count.id * 12.50; // $12.50 per execution average
    
    return NextResponse.json({
      metrics: {
        totalUsers,
        activeWorkflows,
        totalExecutions: totalExecutions._count.id,
        successRate,
        monthlyRevenue,
      },
      recentActivity: recentUsers.map(user => ({
        type: 'user_registered',
        user: `${user.firstName} ${user.lastName}`,
        email: user.email,
        company: user.company.name,
        timestamp: user.createdAt
      })),
      recentExecutions: recentExecutions.map(execution => ({
        type: execution.success ? 'execution_success' : 'execution_failed',
        workflow: execution.workflow.name,
        company: execution.workflow.company.name,
        timestamp: execution.createdAt,
        success: execution.success
      }))
    });
    
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}