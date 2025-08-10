import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log("Starting admin dashboard API...");
    
    // Get dashboard metrics
    const [
      totalUsers,
      activeWorkflows,
      allExecutions,
      recentUsers,
      recentExecutions,
    ] = await Promise.all([
      // Total users count
      prisma.user.count(),
      
      // Active workflows count (using isActive field)
      prisma.workflow.count({
        where: { isActive: true }
      }),
      
      // Get all executions to calculate success rate
      prisma.workflowExecution.findMany({
        select: { status: true }
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
        orderBy: { startedAt: 'desc' },
        include: { 
          workflow: { include: { company: true } }
        }
      })
    ]);

    console.log(`Found ${totalUsers} users, ${activeWorkflows} active workflows, ${allExecutions.length} executions`);

    // Calculate success rate (completed = success)
    const totalExecutions = allExecutions.length;
    const successfulExecutions = allExecutions.filter((e: { status: string }) => e.status === 'completed').length;
    const successRate = totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 0;
    
    // Calculate revenue (mock calculation based on executions)
    const monthlyRevenue = totalExecutions * 12.50; // $12.50 per execution average
    
    console.log(`Success rate: ${successRate}%, Revenue: $${monthlyRevenue}`);
    
    return NextResponse.json({
      metrics: {
        totalUsers,
        activeWorkflows,
        totalExecutions,
        successRate,
        monthlyRevenue,
      },
      recentActivity: recentUsers.map(user => ({
        type: 'user_registered',
        user: `${user.firstName} ${user.lastName}`,
        email: user.email,
        company: user.company?.name || 'No Company',
        timestamp: user.createdAt
      })),
      recentExecutions: recentExecutions.map(execution => ({
        type: execution.status === 'completed' ? 'execution_success' : 'execution_failed',
        workflow: execution.workflow.name,
        company: execution.workflow.company.name,
        timestamp: execution.startedAt,
        success: execution.status === 'completed'
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