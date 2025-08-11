import { z } from "zod";

import {
  createTRPCRouter,
  adminProcedure,
  clientProcedure,
} from "../trpc";

export const dashboardRouter = createTRPCRouter({
  // Admin dashboard data
  getAdminDashboard: adminProcedure.query(async ({ ctx }) => {
    try {
      console.log('Fetching admin dashboard data via TRPC...');
      
      // Get dashboard metrics directly from database
      const [
        totalUsers,
        activeWorkflows,
        allExecutions,
        recentUsers,
        recentExecutions,
        companies,
        executionsWithTimeSaved
      ] = await Promise.all([
        // Total users count
        ctx.db.user.count(),
        
        // Active workflows count (using isActive field)
        ctx.db.workflow.count({
          where: { isActive: true }
        }),
        
        // Get all executions to calculate success rate
        ctx.db.workflowExecution.findMany({
          select: { status: true }
        }),
        
        // Recent user registrations (last 5)
        ctx.db.user.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { 
            id: true,
            firstName: true, 
            lastName: true, 
            email: true, 
            avatarUrl: true,
            createdAt: true,
            company: { select: { name: true } }
          }
        }),
        
        // Recent workflow executions (last 10)
        ctx.db.workflowExecution.findMany({
          take: 10,
          orderBy: { startedAt: 'desc' },
          include: { 
            workflow: { include: { company: true } }
          }
        }),
        
        // Get all companies for client table
        ctx.db.company.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { users: true }
            }
          }
        }),
        
        // Get executions with time saved data
        ctx.db.workflowExecution.findMany({
          select: { 
            timeSaved: true,
            status: true
          },
          where: {
            status: 'completed'
          }
        })
      ]);

      console.log(`Found ${totalUsers} users, ${activeWorkflows} active workflows, ${allExecutions.length} executions`);

      // Calculate success rate (completed = success)
      const totalExecutions = allExecutions.length;
      const successfulExecutions = allExecutions.filter(e => e.status === 'completed').length;
      const successRate = totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 0;
      
      // Calculate revenue (mock calculation based on executions)  
      const monthlyRevenue = Math.max(totalExecutions * 125, 15000); // $125 per execution average, minimum $15K
      
      // Calculate time saved from completed executions
      const totalTimeSaved = executionsWithTimeSaved.reduce((sum, execution) => {
        return sum + (execution.timeSaved || 0);
      }, 0);
      
      // Calculate active clients (companies with isActive: true)
      const activeClients = companies.filter(c => c.isActive).length;
      
      console.log(`Success rate: ${successRate}%, Revenue: $${monthlyRevenue}`);
      
      return {
        metrics: {
          totalUsers,
          activeWorkflows,
          totalExecutions,
          successRate,
          monthlyRevenue,
          timeSaved: totalTimeSaved,
          activeClients
        },
        companies: companies.map(company => ({
          id: company.id,
          name: company.name,
          domain: company.domain,
          industry: company.industry,
          isActive: company.isActive,
          createdAt: company.createdAt.toISOString(),
          userCount: company._count.users
        })),
        recentActivity: recentUsers.map(user => ({
          type: 'user_registered' as const,
          user: `${user.firstName} ${user.lastName}`,
          email: user.email,
          avatarUrl: user.avatarUrl,
          company: user.company?.name || 'No Company',
          timestamp: user.createdAt.toISOString()
        })),
        recentExecutions: recentExecutions.map(execution => ({
          type: execution.status === 'completed' ? 'execution_success' as const : 'execution_failed' as const,
          workflow: execution.workflow.name,
          company: execution.workflow.company.name,
          timestamp: execution.startedAt.toISOString(),
          success: execution.status === 'completed'
        }))
      };
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      // Return fallback data if query fails
      return {
        metrics: {
          totalUsers: 0,
          activeWorkflows: 0,
          totalExecutions: 0,
          successRate: 0,
          monthlyRevenue: 0,
          timeSaved: 0,
          activeClients: 0
        },
        companies: [],
        recentActivity: [],
        recentExecutions: [],
      };
    }
  }),

  // Client dashboard data  
  getClientDashboard: clientProcedure.query(async ({ ctx }) => {
    try {
      console.log("Starting client dashboard data fetch via TRPC...");
      
      // Get basic company info first
      const company = await ctx.db.company.findUnique({
        where: { id: ctx.companyId }
      });
      
      console.log("Company found:", company?.name);
      
      if (!company) {
        console.log("No company found, returning fallback data");
        return {
          company: { name: "Demo Company", id: "demo" },
          metrics: {
            activeWorkflows: 0,
            totalExecutions: 0,
            successRate: 0,
            estimatedSavings: 0,
            averageExecutionTime: 0
          },
          billing: {
            monthlyUsage: 0,
            monthlyLimit: 1000,
            costPerExecution: 2.50,
            currentCost: 0
          },
          recentExecutions: [],
          workflows: []
        };
      }
      
      // Get workflows for this company
      const workflows = await ctx.db.workflow.findMany({
        where: { companyId: company.id }
      });
      console.log(`Found ${workflows.length} workflows`);
      
      // Get executions for these workflows
      const workflowIds = workflows.map(w => w.id);
      const executions = await ctx.db.workflowExecution.findMany({
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
          activeWorkflows: workflows.filter(w => w.isActive).length,
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
          status: workflow.isActive ? 'active' : 'inactive',
          executionCount: executions.filter(e => e.workflowId === workflow.id).length,
          lastExecution: executions.find(e => e.workflowId === workflow.id)?.startedAt?.toISOString() || null
        }))
      };
      
      console.log("Client dashboard data fetched successfully");
      return result;
      
    } catch (error) {
      console.error("Client dashboard error:", error);
      // Return fallback data if API fails
      return {
        company: { name: "Demo Company", id: "demo" },
        metrics: {
          activeWorkflows: 0,
          totalExecutions: 0,
          successRate: 0,
          estimatedSavings: 0,
          averageExecutionTime: 0
        },
        billing: {
          monthlyUsage: 0,
          monthlyLimit: 1000,
          costPerExecution: 2.50,
          currentCost: 0
        },
        recentExecutions: [],
        workflows: []
      };
    }
  }),
});