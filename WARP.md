# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Overview
A Next.js 16 (App Router) app that analyzes YouTube videos by fetching transcripts and generating AI summaries. It also includes a Cloudflare Worker (youtube-transcript-worker/) that caches transcripts in D1 for speed and reliability.

Key integrations
- AI: OpenRouter via OpenAI SDK, optionally instrumented with PostHog LLM analytics
- Auth: Supabase (SSR helpers + middleware)
- Analytics: PostHog (client and server), Vercel Analytics
- Payments: Polar.sh
- Styling/UI: Tailwind CSS v4, shadcn/ui (Radix), next-themes

## Commands
Project uses Bun at the root and npm in the worker subproject.

Root (Next.js app)
- Install deps: 
  ```bash
  bun install
  ```
- Dev server (http://localhost:3000):
  ```bash
  bun run dev
  ```
- Build and start prod:
  ```bash
  bun run build
  bun run start
  ```
- Lint (ESLint, Next config):
  ```bash
  bun run lint
  ```

Cloudflare Worker (transcript cache)
- Change directory first:
  ```bash
  cd youtube-transcript-worker
  ```
- Local dev (wrangler):
  ```bash
  npm run dev
  ```
- Deploy to Cloudflare:
  ```bash
  npm run deploy
  ```
- View production logs:
  ```bash
  npm run tail
  ```
- Tests (Vitest):
  ```bash
  npm run test              # all tests
  npm run test -- src/index.test.ts -t "extractVideoId"   # single file + test name
  ```

## Environment
Create .env.local in the repo root (see .env.local.example).

Required
- OPENROUTER_API_KEY — used by lib/openai-client.ts (throws if missing)

Common client/server vars
- NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_HOST — client analytics (optional)
- POSTHOG_API_KEY, POSTHOG_HOST — server LLM analytics (optional)
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY — Supabase auth
- NEXT_PUBLIC_SITE_URL — site metadata
- NEXT_PUBLIC_TRANSCRIPT_API_URL — override transcript worker base if needed

Notes
- Vercel uses Bun for install/build (vercel.json). No extra build setup required.
- If PostHog keys/host are absent, LLM analytics are disabled gracefully.

## Architecture and flow
High level
- UI (components/youtube/demo.tsx) lets users enter a YouTube URL. It fetches captions/timestamps from the API and kicks off AI summarization.
- Transcript storage preference: try cached transcript via the Worker first; on miss, fetch from API and store; then summarize.
- Summarization streams Server-Sent Events (SSE) from app/api/summarize/route.ts to the client for responsive UX.

Data flow
1) Client → transcript service
   - lib/youtube-transcript-api.ts wraps the Worker: POST /fetch, GET /transcript/:id, etc.
   - Fallback endpoints (direct API) are used in the demo component if the Worker fails.
2) Client → Next API (POST /api/summarize)
   - app/api/summarize/route.ts builds a ReadableStream and forwards to OpenRouter via lib/openai-client.ts
   - Streams SSE back to client as `data: { content: "..." }` and ends with `data: [DONE]`
3) Observability
   - lib/posthog-server.ts provides a PostHog client; lib/openai-client.ts uses @posthog/ai to capture model, tokens, latency, cost

Key files
- app/api/summarize/route.ts — SSE streaming wrapper over generateSummaryStreamWithAnalytics()
- app/api/chat/route.ts — example Q&A streaming over a provided transcript
- components/youtube/demo.tsx — main interactive analyzer + client streaming UI
- lib/openai-client.ts — OpenRouter client (PostHog-instrumented) and streaming helper
- lib/youtube-transcript-api.ts — Transcript Worker client (fetch/list/get/delete)
- middleware.ts — Supabase SSR cookie/session refresh
- next.config.ts — CORS headers for /api, remote image patterns
- tsconfig.json — path alias '@/*' for clean imports

Cloudflare Worker (youtube-transcript-worker/)
- Purpose: cache transcripts in D1 and serve fast GETs
- API: /fetch, /transcript/:id, /transcripts, /delete, root docs
- See youtube-transcript-worker/WARP.md for Worker-specific guidance

## Dev specifics that matter here
- Streaming: Responses from /api/summarize are `text/event-stream`; the client code parses lines starting with `data: ` and accumulates content.
- CORS: next.config.ts sets permissive CORS headers for /api during development; tighten for production if needed.
- Images: Next Image is configured to allow https://img.youtube.com.
- Package managers: Bun in root; npm in youtube-transcript-worker/.

## What to check first when something breaks
- OPENROUTER_API_KEY missing → lib/openai-client.ts throws early
- PostHog not configured → warning logged; analytics disabled but app continues
- Transcript cache not populated → demo.tsx falls back to direct API calls

## Pulling in existing guidance
- CLAUDE.md captures important context used above: Bun-only at root, streaming prompts/formatting, endpoints, Worker overview, and required env vars.
- The Worker already provides its own focused WARP.md.

## Suggestions for the existing Worker WARP.md
- Add an explicit single-test example with Vitest (included above).
- Document how to run tests in CI mode (`vitest run`) and how to filter by file name for faster feedback.
- Link schema.sql and wrangler.toml lines that define the D1 binding for quick reference when debugging DB issues.
