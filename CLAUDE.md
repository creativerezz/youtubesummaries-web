# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 application that provides YouTube video transcript extraction and AI-powered summarization. Key integrations:
- **OpenRouter** for LLM completions (via OpenAI SDK configured with OpenRouter base URL)
- **PostHog** for user analytics and LLM observability (`@posthog/ai` wrapper)
- **Clerk** for authentication (OAuth, email/password, session management)
- **Supabase** for database (user profiles, subscriptions, usage logs)
- **Polar.sh** for payments/subscriptions
- **External APIs**:
  - FastAPI at `https://api1.youtubesummaries.cc` - upstream transcript/metadata source
  - Cloudflare Worker at `https://youtube-edge-api.automatehub.workers.dev` - D1 caching layer

## Quick Start Commands

```bash
# Package manager: pnpm (monorepo managed from root)
pnpm install         # Install dependencies
pnpm run dev         # Development server (http://localhost:3000)
pnpm run build       # Production build
pnpm run start       # Start production server
pnpm run lint        # ESLint
pnpm run typecheck   # TypeScript check

# Testing
pnpm run test        # Run tests (currently just build test)
pnpm run test:e2e    # Run Cypress E2E tests
pnpm run test:e2e:open # Open Cypress UI

# Dependency management
pnpm outdated        # Check for outdated packages
pnpm update          # Update dependencies
pnpm add <package>   # Add new dependency
pnpm add -D <package> # Add dev dependency

# Changelog
pnpm run changelog           # Generate CHANGELOG.md
pnpm run changelog:preview   # Preview unreleased changes

# Versioning
pnpm run version:patch       # Bump patch version + changelog
pnpm run version:minor       # Bump minor version + changelog
pnpm run version:major       # Bump major version + changelog
pnpm run release             # Create release commit + tag

# Cleanup
pnpm run clean       # Remove .next, node_modules
```

**Build notes:**
- Vercel deployment uses pnpm (`vercel.json` specifies `pnpm run build`)
- Requires `lightningcss` as explicit dependency for Tailwind CSS 4

## Environment Variables

Add to `.env.local`:

### Required
- `OPENROUTER_API_KEY` - OpenRouter API key for AI summarization

### Client-side (NEXT_PUBLIC_)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk authentication (optional, gracefully degrades)
- `NEXT_PUBLIC_SITE_URL` - Site URL for metadata (default: http://localhost:3000)
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog analytics key (optional)
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog host URL (optional)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (optional)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (optional)
- `NEXT_PUBLIC_TRANSCRIPT_API_URL` - Transcript worker URL (optional, defaults to production)

### Server-side
- `CLERK_SECRET_KEY` - Clerk API secret (optional, gracefully degrades)
- `POSTHOG_API_KEY` - PostHog for LLM analytics (optional)
- `POSTHOG_HOST` - PostHog host for server (optional)
- `POLAR_ACCESS_TOKEN` - Polar.sh payment integration (optional)
- `POLAR_SUCCESS_URL` - Redirect URL after successful checkout (optional)
- `POLAR_PRODUCT_ID` - Default Polar.sh product ID (optional)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase admin access for server-side operations (optional)
- `UPSTASH_REDIS_REST_URL` - Upstash Redis URL for rate limiting (optional)
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token for rate limiting (optional)

**Note:** Most services gracefully handle missing env vars. Only `OPENROUTER_API_KEY` is strictly required for AI features.

## Directory Structure

```
apps/web/
├── app/                       # Next.js App Router
│   ├── (auth)/                # Route group: Authentication pages
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (marketing)/           # Route group: Marketing pages
│   │   ├── about/
│   │   ├── contact/
│   │   ├── features/
│   │   ├── privacy-policy/
│   │   └── terms-of-service/
│   ├── api/                   # API routes
│   │   ├── v1/                # Versioned API endpoints (current)
│   │   │   ├── chat/          # AI chat streaming
│   │   │   ├── summarize/     # AI summary streaming
│   │   │   ├── youtube/search/ # Video search
│   │   │   ├── channel/[id]/  # Channel data
│   │   │   └── beta/          # Beta signup
│   │   ├── checkout/          # Polar.sh checkout
│   │   ├── portal/            # Polar.sh customer portal
│   │   ├── webhook/polar/     # Polar.sh webhooks
│   │   └── [legacy routes]    # Deprecated, proxy to v1
│   ├── api-reference/         # API documentation page
│   ├── channel/[channelId]/   # Dynamic channel pages
│   ├── dashboard/             # User dashboard (protected)
│   ├── search/                # Search results page
│   ├── page.tsx               # Homepage with video analyzer
│   └── layout.tsx             # Root layout with providers
│
├── components/
│   ├── ui/                    # shadcn/ui components (43 components)
│   ├── ai/                    # AI-related components
│   ├── clerk/                 # Clerk authentication UI
│   ├── youtube/               # YouTube-specific components
│   │   ├── demo.tsx           # Main video analyzer (client component)
│   │   └── featured-channels.tsx # Channel carousel
│   ├── auth-button.tsx
│   ├── beta-signup.tsx
│   ├── chat-with-video.tsx
│   ├── header.tsx
│   ├── footer.tsx
│   ├── posthog-provider.tsx   # Analytics provider (client)
│   ├── theme-provider.tsx     # Dark/light mode provider
│   └── theme-toggle.tsx       # Theme switcher (client)
│
├── lib/                       # Core utilities
│   ├── openai-client.ts       # OpenRouter client with PostHog tracking
│   ├── youtube-transcript-api.ts # Worker API client
│   ├── supabase.ts            # Supabase server client
│   ├── auth.ts                # Auth helpers (Clerk)
│   ├── posthog.ts             # Client-side analytics
│   ├── posthog-server.ts      # Server-side LLM analytics
│   ├── rate-limit.ts          # Upstash Redis rate limiting
│   ├── api-error.ts           # API error handling
│   ├── utils.ts               # Helpers (cn() for className merging)
│   └── youtube/               # YouTube utilities
│
├── cypress/                   # E2E tests
│   ├── e2e/                   # Test specs
│   ├── fixtures/              # Test data
│   └── support/               # Test helpers
│
├── public/                    # Static assets
├── scripts/                   # Utility scripts
├── docs/                      # Documentation
│
├── middleware.ts              # Clerk route protection
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS v4 config
├── components.json            # shadcn/ui config (New York style)
├── cypress.config.ts          # Cypress configuration
├── cliff.toml                 # git-cliff changelog config
└── vercel.json                # Vercel deployment config
```

## Technology Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 16 (App Router), React 19 (RSC), TypeScript |
| **Package Manager** | pnpm (monorepo workspace) |
| **Styling** | Tailwind CSS v4, shadcn/ui (New York), Lucide icons, next-themes |
| **AI** | Vercel AI SDK (`ai`, `@ai-sdk/openai`), OpenAI SDK (OpenRouter) |
| **Analytics** | PostHog (`posthog-js`, `posthog-node`, `@posthog/ai`), Vercel Analytics |
| **Auth** | Clerk (`@clerk/nextjs`), Supabase for user data (`@supabase/ssr`) |
| **Payments** | Polar.sh (`@polar-sh/nextjs`, `@polar-sh/sdk`) |
| **Database** | Supabase (PostgreSQL) for user data, Cloudflare D1 for transcript cache |
| **Forms** | react-hook-form, zod, @hookform/resolvers |
| **Animation** | motion (Framer Motion), tw-animate-css |
| **Rate Limiting** | Upstash Redis (`@upstash/ratelimit`, `@upstash/redis`) |
| **Testing** | Cypress (E2E) |
| **Other** | react-markdown, recharts, sonner (toasts), date-fns |

## Authentication Architecture

This project uses a **hybrid authentication system**:

### Primary Authentication: Clerk
- Handles user sign-in, sign-up, and session management
- Provides OAuth (GitHub, Google) and email/password authentication
- Protected routes enforced via `middleware.ts`
- Gracefully degrades if `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is missing

### User Data Storage: Supabase
- PostgreSQL database for user profiles, subscriptions, and usage logs
- Clerk user IDs stored in `clerk_user_id` column for data linkage
- Row Level Security (RLS) policies based on Clerk authentication

### Data Flow
```
User signs in → Clerk authenticates → Gets Clerk user ID
                                           ↓
                            Query Supabase with clerk_user_id
                                           ↓
                            Return user profile/subscription data
```

### Protected Routes
- `/dashboard` - Requires Clerk authentication
- `/api/v1/chat` - Requires Clerk session
- `/api/portal` - Requires Clerk session + Supabase profile lookup

### Auth Files
- `middleware.ts` - Clerk middleware for route protection
- `lib/auth.ts` - Helper functions for Clerk auth checks
- `lib/supabase.ts` - Supabase server client
- `components/clerk/` - Clerk UI components (sign-in/sign-up buttons)
- `app/(auth)/sign-in`, `app/(auth)/sign-up` - Clerk auth pages

## Architecture Patterns

### 1. Server Components by Default
Client boundaries only at:
- `components/youtube/demo.tsx` - Interactive video analyzer
- `components/theme-toggle.tsx` - Theme switching
- `components/posthog-provider.tsx` - Analytics provider
- All interactive UI components in `components/ui/` that use hooks

### 2. API Versioning
- **Current**: `/api/v1/*` for all public endpoints
- **Legacy**: `/api/*` proxies to v1 for backwards compatibility
- **Not versioned**: `/api/checkout`, `/api/portal`, `/api/webhook/polar` (external integrations)

### 3. Manual SSE Streaming
API routes use `ReadableStream` with `TextEncoder` to stream:
```typescript
data: {"content": "..."}\n\n
data: [DONE]\n\n
```

### 4. Dual OpenAI Clients (`lib/openai-client.ts`)
- `getOpenAIClient()` - PostHog-wrapped for analytics (used by `/api/v1/summarize`)
- `getPlainOpenAIClient()` - Unwrapped client (used by `/api/v1/chat`)

Reason: `@posthog/ai` wrapper conflicts with Vercel AI SDK's responses API.

### 5. LLM Analytics
`@posthog/ai` wraps OpenAI client for automatic tracking:
- Token usage (input/output)
- Latency and performance
- Cost tracking
- Model usage

### 6. Singleton Clients
PostHog and OpenAI clients reuse instances across requests for performance.

### 7. Path Alias
`@/*` maps to project root for cleaner imports:
```typescript
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
```

### 8. Default Models
- **Summaries**: `anthropic/claude-3-haiku` (streaming)
- **Chat**: `openai/gpt-4o-mini` (streaming)
- Both via OpenRouter API

### 9. Rate Limiting
Upstash Redis with sliding window algorithm:
- Per-IP for anonymous users
- Per-user-ID for authenticated users
- Returns headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## API Endpoints

### Versioned Endpoints (v1)

| Endpoint | Method | Purpose | Auth | Rate Limit |
|----------|--------|---------|------|------------|
| `/api/v1/summarize` | POST | Generate AI summary (SSE stream) | Optional | 10/min (anon), 30/min (auth) |
| `/api/v1/chat` | POST | Q&A about video (SSE stream) | Required | 20/min |
| `/api/v1/youtube/search` | GET | Search YouTube videos | Optional | 30/min |
| `/api/v1/channel/[id]` | GET | Channel data and uploads | Optional | 20/min |
| `/api/v1/beta` | POST | Beta signup | Optional | 5/hour |

### Payment Endpoints (Not versioned)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/checkout` | GET | Polar.sh checkout redirect |
| `/api/portal` | GET | Polar.sh customer portal |
| `/api/webhook/polar` | POST | Polar.sh payment webhooks |

### Legacy Endpoints (Deprecated)
All `/api/*` routes (non-v1) proxy to `/api/v1/*` for backwards compatibility.

## Data Flow

```
User Input (VideoAnalyzer Component)
    ↓
lib/youtube-transcript-api.ts → Cloudflare Worker (D1 cache) → FastAPI (upstream)
    ↓
POST /api/v1/summarize or /api/v1/chat
    ↓
lib/openai-client.ts → OpenRouter API
    ↓
Manual SSE streaming via ReadableStream
    ↓
Client consumes SSE events (data: {...}\n\n format)
```

## Database Architecture

This project uses **two databases**:

| Database | Purpose | Data Stored |
|----------|---------|-------------|
| **Supabase** (PostgreSQL) | User data storage | `profiles` (linked via `clerk_user_id`), `subscriptions`, `beta_signups` |
| **Cloudflare D1** (SQLite) | Edge transcript cache | `transcripts` (video metadata + captions) |

**Why two databases?**
- D1 provides edge caching (low latency globally) for frequently-accessed transcripts
- Supabase handles user data which needs relational queries and RLS
- Clerk handles authentication separately (OAuth, sessions, user management)

## Adding shadcn/ui Components

```bash
# From apps/web directory
npx shadcn@latest add [component-name]

# Examples
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add form
```

**Config** (`components.json`):
- Style: New York
- Base color: Zinc
- CSS variables: Yes
- RSC: Enabled
- Path alias: `@/components`

## Testing

### E2E Tests with Cypress

```bash
# Run E2E tests (headless)
pnpm run test:e2e

# Open Cypress UI (interactive)
pnpm run test:e2e:open
```

Tests are located in `cypress/e2e/`.

### Build Test

```bash
pnpm run build
```

Verifies the app builds successfully. This is the current "test" command.

## Git Commit Conventions

Uses [Conventional Commits](https://www.conventionalcommits.org/) with [git-cliff](https://git-cliff.org/):

```bash
# Format
<type>(<scope>): <description>

# Examples
feat(channels): add featured channels carousel
fix(auth): resolve session refresh error
perf(api): cache channel metadata
chore(deps): update Next.js to 16.1.1
```

**Types**: `feat`, `fix`, `perf`, `docs`, `chore`, `refactor`, `test`, `ci`, `style`
**Common scopes**: `channels`, `auth`, `api`, `ui`, `analytics`, `payments`, `db`

### Changelog Commands

```bash
pnpm run changelog               # Generate CHANGELOG.md
pnpm run changelog:preview       # Preview unreleased changes
pnpm run version:patch           # Bump patch + changelog
pnpm run version:minor           # Bump minor + changelog
pnpm run version:major           # Bump major + changelog
pnpm run release                 # Create release commit + tag
```

## Deployment

### Vercel (Production)

- **Trigger**: Push to `main` branch
- **URL**: https://youtubesummaries.cc
- **Build command**: `pnpm run build`
- **Output directory**: `.next`
- **Framework**: Next.js
- **Node version**: 20.x

Environment variables must be configured in Vercel dashboard.

### Local Production Build

```bash
pnpm run build
pnpm run start
```

## Common Development Tasks

### Add a New shadcn/ui Component

```bash
npx shadcn@latest add <component-name>
```

### Add a New API Endpoint

1. Create route in `app/api/v1/[endpoint]/route.ts`
2. Use `NextRequest` and `NextResponse`
3. Add rate limiting if needed (import from `@/lib/rate-limit`)
4. Add authentication if needed (check `middleware.ts` or manual check)

### Add a New Page

1. Create directory in `app/[page-name]/`
2. Add `page.tsx` for the page component
3. Add `layout.tsx` if custom layout needed
4. Update `middleware.ts` if authentication required

### Update Environment Variables

1. Update `.env.local` for local development
2. Update Vercel dashboard for production
3. Document in `.env.example` if adding new vars
4. Update this CLAUDE.md if critical

## Troubleshooting

### Dependencies fail to install
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### TypeScript errors
- Ensure `typescript@^5` is installed
- Run `pnpm run typecheck` to see all errors
- Check `tsconfig.json` for path alias config

### Build fails
- Check environment variables (at minimum `OPENROUTER_API_KEY`)
- Run `pnpm run lint` to check for linting errors
- Check `next.config.ts` for misconfigurations

### PostHog not loading
- Verify `NEXT_PUBLIC_POSTHOG_KEY` is set
- Verify `NEXT_PUBLIC_POSTHOG_HOST` is set
- Check browser console for errors
- Note: PostHog is optional, app works without it

### Rate limiting not working
- Verify `UPSTASH_REDIS_REST_URL` is set
- Verify `UPSTASH_REDIS_REST_TOKEN` is set
- Check Redis connection in Upstash dashboard
- Note: Rate limiting is optional, gracefully degrades

### Clerk authentication issues
- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set
- Verify `CLERK_SECRET_KEY` is set
- Check `middleware.ts` for route protection config
- Check Clerk dashboard for user sessions

### Tailwind CSS v4 issues
- Ensure `lightningcss` is installed as dependency (not dev dependency)
- Check `postcss.config.mjs` configuration
- Clear `.next` cache: `rm -rf .next`

## Important Notes

- **Package manager**: pnpm (managed at monorepo root via `pnpm-workspace.yaml`)
- **OpenRouter API key required** for AI features; all other services are optional
- **App Router only** (not Pages Router)
- **React Server Components** by default; mark client components with `"use client"`
- **SEO configured**: metadata in `layout.tsx`, `robots.ts`, `sitemap.ts`
- **Fonts**: Geist Sans and Geist Mono via `next/font/google`
- **Transcript limits**: 6000 chars for summarization, 20000 chars for chat context
- **Route groups**: `(marketing)/` for public pages, `(auth)/` for auth pages
- **Protected routes**: Managed via `middleware.ts` (Clerk)
