# Braintrust Nexus Implementation Plan

## Project Overview
Building a workflow automation platform with two separate applications:
- **Admin App**: For Braintrust staff to manage users, clients, workflows, and billing
- **Client App**: For end-users to view dashboards, ROI metrics, and manage credentials

## Architecture Decision
**Monorepo Structure** using Turborepo with two separate Next.js applications sharing common packages.

### Repository Structure
```
nexus/
├── apps/
│   ├── admin/          # Admin Next.js app
│   └── client/         # Client Next.js app
├── packages/
│   ├── ui/            # Shared UI components
│   ├── database/      # Prisma schema & utilities
│   ├── auth/          # Authentication logic
│   └── types/         # Shared TypeScript types
├── turbo.json         # Turborepo configuration
└── package.json       # Root package.json
```

## Technical Stack
- **Framework**: Next.js 15+ with App Router
- **Database**: Supabase (PostgreSQL with real-time capabilities)
- **ORM**: Prisma for type-safe database access
- **Authentication**: Supabase Auth with Row Level Security (RLS)
- **API**: TRPC for type-safe endpoints
- **UI**: shadcn/ui components with Tailwind CSS
- **Build System**: Turborepo for monorepo management
- **Deployment**: Separate Vercel deployments for each app

## User Roles & Access Control
- **Admin**: Full access to admin app, no client app access
- **SE (Sales Engineer)**: Limited admin access, no client app access  
- **Client**: Access to client app only, no admin access

## Implementation Phases (3-Day Timeline)

### Phase 1: Foundation Setup (Day 1 Morning) ✅ COMPLETED
1. ✅ Configure Turborepo monorepo structure
2. ✅ Set up two Next.js applications (admin & client)
3. ✅ Configure shared packages (ui, database, auth, types)
4. ✅ Set up Prisma with Supabase integration
5. ⏳ Configure authentication system with role-based access

### Phase 2: Database Schema & Core Features (Day 1 Afternoon - Day 2) ✅ COMPLETED
1. ✅ Design and implement Prisma schema for:
   - ✅ Users (admins, sales engineers, clients)
   - ✅ Companies (client organizations)
   - ✅ Workflows (automation processes)
   - ✅ Executions (workflow runs with mock data)
   - ✅ Billing & usage tracking
   - ✅ Credentials management
2. ⏳ Implement Row Level Security policies
3. ✅ Create realistic seed data
4. ⏳ Build core authentication flows

### Phase 2.5: Database Integration ✅ COMPLETED
1. ✅ Connect to live Supabase PostgreSQL database
2. ✅ Deploy Prisma schema to production database
3. ✅ Populate with realistic test data (4 users, 60 executions)
4. ✅ Connect both dashboards to live data
5. ✅ Fix API schema field alignment issues

### Phase 3: Admin Application (Day 2 - Day 3 Morning) 🔄 IN PROGRESS
1. ✅ **Dashboard**: Overview metrics with live data (4 users, 60 executions, $750 revenue)
2. ⏳ **User Manager**: CRUD operations for all user types
3. ⏳ **Client Manager**: Company management with user assignments
4. ⏳ **Workflow Manager**: View and manage automation workflows
5. ⏳ **Billing**: Usage tracking and payment management (mocked)

### Phase 4: Client Application (Day 3 Morning - Afternoon) 🔄 IN PROGRESS
1. ✅ **Dashboard**: ROI metrics with live data (93% success, $1,400 savings)
2. ⏳ **Reporting**: Detailed analytics and export capabilities
3. ⏳ **Credential Manager**: Secure credential storage interface
4. ⏳ **Real-time Notifications**: Live updates on workflow status

### Phase 5: Polish & Testing (Day 3 Afternoon)
1. Implement critical test suites
2. UI/UX refinements to match Figma designs exactly
3. Performance optimization
4. Final integration testing

## Key Features to Implement

### Admin App Features
- **User Management**: Create, edit, deactivate users with role assignments
- **Client Management**: Onboard companies, assign workflows, track usage
- **Workflow Oversight**: Monitor all client workflows and performance
- **Billing Dashboard**: Track usage metrics and payment status (mocked)
- **System Administration**: Platform settings and configurations

### Client App Features
- **ROI Dashboard**: Visual metrics showing automation value
- **Workflow Status**: Real-time updates on running processes
- **Reporting Suite**: Detailed analytics with export options
- **Credential Management**: Secure storage for API keys and tokens
- **Notification Center**: Real-time alerts and updates

## Database Schema Highlights

### Core Tables
- `users` - All platform users with role-based access
- `companies` - Client organizations
- `workflows` - Automation process definitions
- `workflow_executions` - Historical run data (mocked)
- `credentials` - Encrypted credential storage
- `billing_usage` - Usage tracking for billing
- `notifications` - Real-time notification system

### Security Implementation
- ⏳ Row Level Security (RLS) policies for all tables
- ⏳ Role-based access control at database level
- ✅ Encrypted credential storage schema
- ⏳ Audit logging for sensitive operations

### Current Database Status ✅ LIVE
- **Connection**: Supabase PostgreSQL (epbtaunemgnbolxilrwg.supabase.co)
- **Schema**: 7 tables deployed with proper relationships
- **Data**: Seeded with realistic test data (4 users, 2 companies, 60 executions)
- **APIs**: Both dashboards connected with working endpoints
- **Performance**: 93% execution success rate, $1,400 in calculated savings

## Shared Component Strategy
Approximately 70-80% code reuse between applications through shared packages:

### Shared Components (`packages/ui/`)
- Form components (inputs, selectors, validation)
- Data display (tables, cards, metrics)
- Navigation elements (sidebars, headers)
- Modal dialogs and overlays
- Chart and visualization components

### App-Specific Components
- **Admin**: User management forms, billing interfaces
- **Client**: ROI dashboards, credential management

## Development Standards
- **TypeScript**: Strict mode, no `any` types
- **Code Quality**: ESLint + Prettier for consistent formatting
- **Testing**: Critical path testing with Jest/Vitest
- **UI Consistency**: Match Figma designs pixel-perfect
- **Performance**: Optimize for fast loading and real-time updates

## Mock Data Strategy
- Realistic company names and user profiles
- Simulated workflow execution data with varying success rates
- Historical usage metrics for ROI calculations
- Mock billing data with different pricing tiers
- Sample credentials (safely mocked, no real API keys)

## Real-time Features
- Live workflow status updates via Supabase Realtime
- Instant notifications for important events
- Real-time dashboard metrics updates
- Live user activity indicators

## Deployment Strategy
- **Admin App**: https://nexus-admin-one.vercel.app/ ✅ Deployed (static data)
- **Client App**: https://nexus-delta-vert.vercel.app/ ✅ Deployed (static data)
- **Local Development**: Both apps connected to live Supabase database
- **Database**: Supabase PostgreSQL at epbtaunemgnbolxilrwg.supabase.co ✅ Live
- **Environment Separation**: Local development uses live DB, production uses static data

## Success Metrics
- Pixel-perfect UI matching Figma designs
- Sub-200ms page load times
- 100% TypeScript coverage (no `any`)
- Critical user journeys fully tested
- Real-time features working smoothly
- Proper role-based access enforcement

---

*This plan prioritizes foundational architecture first, then builds features in logical dependency order to maximize development efficiency within the 3-day timeline.*