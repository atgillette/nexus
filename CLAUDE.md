# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start the development server with Turbopack (runs on http://localhost:3000)
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality checks

## Architecture

This is a Next.js 15+ application with Supabase authentication, built using:

### Core Stack
- **Next.js App Router** - All pages are in the `/app` directory using the App Router pattern
- **Supabase** - Authentication and database backend
- **TypeScript** - Strict mode enabled with path aliases configured (`@/*` maps to root)
- **Tailwind CSS** - Utility-first CSS with custom configuration
- **shadcn/ui** - Component library built on Radix UI primitives

### Key Patterns

#### Authentication Flow
- Supabase SSR client setup in `/lib/supabase/` with separate clients for:
  - `server.ts` - Server components (creates new client per request)
  - `client.ts` - Client components
  - `middleware.ts` - Session refresh in middleware
- Auth pages under `/app/auth/` handle login, signup, password reset
- Protected routes use `/app/protected/` layout
- Middleware refreshes sessions on all routes except static assets

#### Component Structure
- UI primitives in `/components/ui/` (Button, Card, Input, etc.)
- Auth forms as separate components (LoginForm, SignUpForm, etc.)
- Tutorial components demonstrate Supabase integration patterns

#### Environment Configuration
Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` - Public API key

#### Styling
- Global styles in `/app/globals.css` 
- Theme switching via `next-themes` with system/light/dark modes
- Geist font family configured as default
- Components use `cn()` utility from `/lib/utils.ts` for conditional classes