# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Building Braintrust Nexus - a workflow automation platform with separate Admin and Client applications in a Turborepo monorepo structure.

## Quick Start
```bash
# Install dependencies
npm install

# Generate Prisma client
cd packages/database && npx prisma generate

# Start both apps
npm run dev
# Admin: http://localhost:3001
# Client: http://localhost:3002
```

## Commands

### Development
- `npm run dev` - Start both apps in development mode
- `npm run build` - Build all packages and apps
- `npm run lint` - Run ESLint across all packages
- `npm run type-check` - TypeScript type checking

### Database
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run migrations
- `cd packages/database && npm run db:seed` - Seed database

## Architecture

### Monorepo Structure
```
nexus/
├── apps/
│   ├── admin/          # Admin portal (port 3001)
│   └── client/         # Client dashboard (port 3002)
├── packages/
│   ├── ui/            # Shared UI components
│   ├── database/      # Prisma schema & client
│   ├── auth/          # Authentication logic
│   └── types/         # Shared TypeScript types
```

### Core Stack
- **Turborepo** - Monorepo build system
- **Next.js 15+** - React framework with App Router
- **Supabase** - Authentication and database backend
- **Prisma** - Type-safe ORM
- **TypeScript** - Strict mode enabled
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Component library

### Key Patterns

#### Shared Packages
- Import from `@nexus/ui` for shared components
- Import from `@nexus/database` for Prisma client
- Import from `@nexus/auth` for authentication
- Import from `@nexus/types` for TypeScript types

#### Authentication & Authorization
- Role-based access: Admin, SE (Sales Engineer), Client
- Admin/SE users → Admin app only
- Client users → Client app only
- Row Level Security (RLS) enforced at database level

#### Database Schema
- Users with role-based access
- Companies (client organizations)
- Workflows (automation definitions)
- WorkflowExecutions (mock execution data)
- Credentials (secure storage)
- BillingUsage (usage tracking)
- Notifications (real-time updates)

#### Component Structure
- Shared UI components in `packages/ui/`
- App-specific components in `apps/*/components/`
- Use `cn()` utility for conditional classes

#### Environment Configuration
Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public API key
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct database connection

## Development Guidelines

### Code Standards
- NO `any` types - use proper TypeScript types
- Match Figma designs exactly
- Commit frequently with descriptive messages
- Update PROJECT_STATUS.md after major tasks

### Testing
- Focus on critical user paths
- Test authentication flows
- Verify role-based access
- Check real-time updates

### Performance
- Use Turbopack for fast development
- Implement code splitting
- Optimize images with Next.js Image
- Cache database queries appropriately

## Project Status Files
- `PROJECT_STATUS.md` - Current progress tracking
- `IMPLEMENTATION_PLAN.md` - Full project roadmap
- `DECISIONS.md` - Technical decisions log
- `.claude/context.md` - Session recovery information

## Common Tasks

### Add a new shared component
1. Create component in `packages/ui/`
2. Export from `packages/ui/index.ts`
3. Import in apps as `@nexus/ui`

### Add a new database table
1. Update `packages/database/schema.prisma`
2. Run `npm run db:generate`
3. Run `npm run db:push`
4. Update seed data if needed

### Deploy to Vercel
1. Create two separate Vercel projects
2. Configure build commands:
   - Admin: `cd apps/admin && npm run build`
   - Client: `cd apps/client && npm run build`
3. Set environment variables for each project

## Troubleshooting

### Module not found errors
- Run `npm install` at root
- Check package.json dependencies
- Verify file paths in imports

### Database connection issues
- Check DATABASE_URL in .env
- Verify Supabase project is running
- Check network connectivity

### Type errors
- Run `npm run db:generate` for Prisma types
- Check imports from shared packages
- Verify TypeScript config paths