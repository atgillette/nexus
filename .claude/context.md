# Claude Context Recovery File

## Last Updated: 2025-01-09 16:20 UTC

## Current Working State

### Active Phase
- **Phase 2**: Database Schema & Core Features
- **Next Step**: Connect to Supabase and push database schema

### Environment State
```bash
# Working Directory
/Users/adriangillette/Documents/consulting/Braintrust/nexus

# Node Version
Node.js (latest)

# Package Manager
npm@10.0.0

# Ports
Admin App: 3001
Client App: 3002
```

### Critical Commands
```bash
# Install all dependencies
npm install

# Generate Prisma client
cd packages/database && npx prisma generate

# Start development (both apps)
npm run dev

# Type checking
npm run type-check

# Build all packages
npm run build

# Push database schema
cd packages/database && npx prisma db push

# Seed database
cd packages/database && npm run db:seed
```

### Project Structure
```
nexus/
├── apps/
│   ├── admin/          # Admin portal (port 3001)
│   └── client/         # Client dashboard (port 3002)
├── packages/
│   ├── ui/            # Shared components
│   ├── database/      # Prisma schema & client
│   ├── auth/          # Supabase auth
│   └── types/         # TypeScript types
├── turbo.json         # Turborepo config
└── package.json       # Root workspace
```

### Key Decisions Made
1. Monorepo with Turborepo (not single app)
2. Separate Vercel deployments (not subpaths)
3. Mock workflow data (not real execution)
4. Prisma ORM (not Drizzle)
5. 70-80% component sharing between apps

### User Preferences
- Prioritize code quality over features
- Match Figma designs exactly
- Include critical tests only
- Use realistic test data
- Simulate real-time notifications
- Mock payment flow (no Stripe)
- Table view for workflows (no viz)

### Git State
- Branch: main
- Last Commit: "Phase 1 Complete: Monorepo Foundation"
- Clean working tree after Phase 1

### Dependencies Installed
- Turborepo
- Next.js (both apps)
- Prisma + @prisma/client
- Supabase libraries
- shadcn/ui components
- All shared packages linked

### Files to Check on Recovery
1. `PROJECT_STATUS.md` - Current progress
2. `IMPLEMENTATION_PLAN.md` - Full roadmap
3. `DECISIONS.md` - Technical choices
4. `CLAUDE.md` - Project instructions
5. `.env` - Environment variables (if exists)

### Known Issues/Blockers
- Need Supabase credentials to proceed
- Vercel projects not yet created

### Special Notes
- Using file: protocol for local packages (not workspace:)
- packageManager field required in root package.json
- Components moved to shared packages/ui
- Auth logic centralized in packages/auth

## Recovery Instructions

If session is lost, run:
```bash
# 1. Check current status
cat PROJECT_STATUS.md

# 2. Verify git state
git status
git log --oneline -5

# 3. Install dependencies if needed
npm install

# 4. Generate Prisma client
cd packages/database && npx prisma generate

# 5. Continue from PROJECT_STATUS.md next action
```

## Test Data Context
- 2 companies (Acme, TechFlow)
- 4 users (1 admin, 1 SE, 2 clients)
- 2 workflows with 30 days of execution history
- 90% success rate for executions
- Realistic ROI metrics included

## Next Immediate Actions
1. Get Supabase project credentials
2. Update .env with credentials
3. Push Prisma schema to Supabase
4. Run seed script
5. Test authentication flow