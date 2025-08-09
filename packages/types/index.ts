// User roles and permissions
export type UserRole = 'admin' | 'se' | 'client';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  domain: string;
  industry?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  isActive: boolean;
  config: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  result?: Record<string, any>;
  error?: string;
  metrics: {
    itemsProcessed: number;
    timeSaved: number;
    costSavings: number;
  };
}

export interface Credential {
  id: string;
  name: string;
  type: string;
  companyId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

// Dashboard metrics
export interface DashboardMetrics {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  successRate: number;
  avgExecutionTime: number;
  totalTimeSaved: number;
  totalCostSavings: number;
}

// ROI calculation types
export interface ROIMetrics {
  period: 'week' | 'month' | 'quarter' | 'year';
  timeSaved: number;
  costSavings: number;
  executionCount: number;
  successRate: number;
  efficiency: number;
}