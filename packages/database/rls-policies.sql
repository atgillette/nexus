-- Row Level Security Policies for Braintrust Nexus
-- This file contains all RLS policies for secure data access

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- USERS TABLE POLICIES
-- ===========================================

-- Admins and SEs can view all users
CREATE POLICY "admin_se_view_all_users" ON users
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'se')
    )
  );

-- Clients can only view users in their company
CREATE POLICY "clients_view_company_users" ON users
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM users 
      WHERE id = auth.uid() 
      AND role = 'client'
    )
    AND "companyId" IN (
      SELECT "companyId" FROM users 
      WHERE id = auth.uid()
    )
  );

-- Users can update their own profile
CREATE POLICY "users_update_own_profile" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Only admins can insert new users
CREATE POLICY "admins_insert_users" ON users
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Only admins can delete users
CREATE POLICY "admins_delete_users" ON users
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ===========================================
-- COMPANIES TABLE POLICIES
-- ===========================================

-- Admins and SEs can view all companies
CREATE POLICY "admin_se_view_all_companies" ON companies
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'se')
    )
  );

-- Clients can only view their own company
CREATE POLICY "clients_view_own_company" ON companies
  FOR SELECT
  USING (
    id IN (
      SELECT "companyId" FROM users 
      WHERE id = auth.uid() 
      AND role = 'client'
    )
  );

-- Only admins can manage companies
CREATE POLICY "admins_manage_companies" ON companies
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ===========================================
-- WORKFLOWS TABLE POLICIES
-- ===========================================

-- Admins and SEs can view all workflows
CREATE POLICY "admin_se_view_all_workflows" ON workflows
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'se')
    )
  );

-- Clients can only view their company's workflows
CREATE POLICY "clients_view_company_workflows" ON workflows
  FOR SELECT
  USING (
    "companyId" IN (
      SELECT "companyId" FROM users 
      WHERE id = auth.uid() 
      AND role = 'client'
    )
  );

-- Admins and SEs can manage all workflows
CREATE POLICY "admin_se_manage_workflows" ON workflows
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'se')
    )
  );

-- ===========================================
-- WORKFLOW_EXECUTIONS TABLE POLICIES
-- ===========================================

-- Admins and SEs can view all executions
CREATE POLICY "admin_se_view_all_executions" ON workflow_executions
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'se')
    )
  );

-- Clients can view executions for their company's workflows
CREATE POLICY "clients_view_company_executions" ON workflow_executions
  FOR SELECT
  USING (
    "workflowId" IN (
      SELECT id FROM workflows 
      WHERE "companyId" IN (
        SELECT "companyId" FROM users 
        WHERE id = auth.uid() 
        AND role = 'client'
      )
    )
  );

-- Only system/admins can insert executions
CREATE POLICY "system_insert_executions" ON workflow_executions
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'se')
    )
  );

-- ===========================================
-- CREDENTIALS TABLE POLICIES
-- ===========================================

-- Only admins and SEs can view credentials
CREATE POLICY "admin_se_view_credentials" ON credentials
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'se')
    )
  );

-- Clients can view their company's credential metadata (not the actual credentials)
CREATE POLICY "clients_view_company_credentials" ON credentials
  FOR SELECT
  USING (
    "companyId" IN (
      SELECT "companyId" FROM users 
      WHERE id = auth.uid() 
      AND role = 'client'
    )
  );

-- Only admins can manage credentials
CREATE POLICY "admins_manage_credentials" ON credentials
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ===========================================
-- BILLING_USAGE TABLE POLICIES
-- ===========================================

-- Admins can view all billing data
CREATE POLICY "admins_view_all_billing" ON billing_usage
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Clients can view their company's billing
CREATE POLICY "clients_view_company_billing" ON billing_usage
  FOR SELECT
  USING (
    "companyId" IN (
      SELECT "companyId" FROM users 
      WHERE id = auth.uid() 
      AND role = 'client'
    )
  );

-- Only admins can manage billing
CREATE POLICY "admins_manage_billing" ON billing_usage
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ===========================================
-- NOTIFICATIONS TABLE POLICIES
-- ===========================================

-- Users can only view their own notifications
CREATE POLICY "users_view_own_notifications" ON notifications
  FOR SELECT
  USING (auth.uid() = "userId");

-- Users can update their own notifications (mark as read)
CREATE POLICY "users_update_own_notifications" ON notifications
  FOR UPDATE
  USING (auth.uid() = "userId")
  WITH CHECK (auth.uid() = "userId");

-- System and admins can create notifications
CREATE POLICY "system_create_notifications" ON notifications
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'se')
    )
  );

-- Users can delete their own notifications
CREATE POLICY "users_delete_own_notifications" ON notifications
  FOR DELETE
  USING (auth.uid() = "userId");

-- ===========================================
-- SERVICE ROLE BYPASS
-- ===========================================
-- Note: Service role key bypasses all RLS policies
-- This is used for server-side operations and seeding