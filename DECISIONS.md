# Technical Decisions Log - Braintrust Nexus

## Architecture Decisions

### 1. Monorepo with Turborepo
**Decision:** Use Turborepo monorepo with separate Next.js apps
**Date:** 2025-01-09
**Rationale:**
- Allows code sharing between admin and client apps (70-80% reuse)
- Maintains clear separation of concerns
- Enables independent deployment and scaling
- Simplifies dependency management
**Alternatives Considered:**
- Single Next.js app with role-based routing (rejected: less secure, harder to maintain)
- Completely separate repositories (rejected: code duplication)

### 2. Separate Vercel Projects
**Decision:** Deploy admin and client as separate Vercel projects
**Date:** 2025-01-09
**Rationale:**
- Better isolation and security
- Independent scaling and analytics
- Cleaner domain separation (admin.domain.com vs app.domain.com)
- Simpler environment variable management
**Alternatives Considered:**
- Single Vercel project with subpaths (rejected: more complex routing)
- Subdomain setup on single project (rejected: less flexibility)

### 3. Prisma ORM
**Decision:** Use Prisma for database management
**Date:** 2025-01-09
**Rationale:**
- Type-safe database queries
- Excellent Supabase integration
- Auto-generated TypeScript types
- Built-in migration system
**Alternatives Considered:**
- Drizzle ORM (rejected: less mature Supabase support)
- Raw SQL (rejected: no type safety)

### 4. Shared Packages Structure
**Decision:** Create four shared packages: ui, database, auth, types
**Date:** 2025-01-09
**Rationale:**
- Clear separation of concerns
- Maximum code reuse
- Independent versioning possible
- Easy to test in isolation
**Implementation:**
- @nexus/ui - All shared components
- @nexus/database - Prisma client and utilities
- @nexus/auth - Supabase auth logic
- @nexus/types - Shared TypeScript types

### 5. Mock Data Strategy
**Decision:** Create realistic seed data without actual workflow execution
**Date:** 2025-01-09
**Rationale:**
- Focus on UI/UX demonstration
- Avoid complex workflow engine implementation
- Sufficient for ROI calculations and dashboards
- Faster development timeline
**Implementation:**
- 30 days of execution history
- Realistic success/failure rates (90% success)
- Varied execution times and cost savings

## Technology Stack Decisions

### Frontend
- **Next.js 15+**: Latest features, App Router for better performance
- **React 19**: Latest stable version
- **TypeScript**: Strict mode enabled for type safety
- **Tailwind CSS**: Rapid styling with utility classes
- **shadcn/ui**: High-quality, customizable components

### Backend
- **Supabase**: All-in-one backend (auth, database, real-time)
- **PostgreSQL**: Robust relational database
- **Row Level Security**: Database-level access control

### Development
- **Turborepo**: Monorepo build orchestration
- **npm workspaces**: Native workspace support
- **ESLint + Prettier**: Code quality and formatting

## User Requirements Decisions

### From Q&A Session (2025-01-09)
1. **Two separate Next.js apps** - User preference over single app
2. **Mock data only** - No actual workflow execution needed
3. **Simulate real-time** - Use Supabase Realtime for notifications
4. **Prioritize quality** - Code and design quality over feature quantity
5. **Realistic test data** - Makes testing easier
6. **Match Figma exactly** - Pixel-perfect implementation required
7. **Mock payments** - No real Stripe integration needed
8. **Table view only** - No complex workflow visualizations
9. **3-day timeline** - Include critical tests

## Design Patterns

### Component Architecture
- **Atomic Design**: Small, reusable components
- **Composition**: Build complex UIs from simple parts
- **Props over State**: Prefer controlled components

### State Management
- **Server Components**: Default for data fetching
- **Client Components**: Only when needed for interactivity
- **Context API**: For auth and theme state

### Database Design
- **Normalized Schema**: Proper relationships and foreign keys
- **Enums for Constants**: Type-safe status values
- **Timestamps**: Track creation and updates
- **Soft Deletes**: Use isActive flags instead of deletion

## Security Decisions

### Authentication
- **Supabase Auth**: Built-in secure authentication
- **Role-Based Access**: Database-level enforcement
- **JWT Tokens**: Secure session management

### Data Protection
- **Row Level Security**: Postgres RLS policies
- **Environment Variables**: Never commit secrets
- **HTTPS Only**: Enforce in production

## Performance Decisions

### Optimization Strategy
- **Turbopack**: Fast development builds
- **Dynamic Imports**: Code splitting for better performance
- **Image Optimization**: Next.js Image component
- **Database Indexes**: On frequently queried fields

## Future Considerations
- Web push notifications (enhancement for later)
- Actual payment integration (if needed)
- Workflow visualization (if requested)
- Multi-tenant architecture (for scale)