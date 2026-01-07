# Documentation Index

Complete documentation for the YouTube Summaries project.

## 📚 API Documentation

| Document | Description |
|----------|-------------|
| [openapi.yaml](openapi.yaml) | OpenAPI 3.1 specification (Swagger) for all API endpoints |
| [NEXTJS_API.md](NEXTJS_API.md) | Next.js API routes reference (`/api/*`) |
| [WORKER_API.md](WORKER_API.md) | Cloudflare Worker D1 caching API |
| [API_REFERENCE.md](API_REFERENCE.md) | fast-proxy-api upstream service reference |

## 🔧 Technical Guides

| Document | Description |
|----------|-------------|
| [ANALYSIS.md](ANALYSIS.md) | Codebase analysis and architecture |
| [vercel-streamdown.md](vercel-streamdown.md) | Vercel streaming implementation details |

## 🤖 AI/LLM Integration

| Document | Description |
|----------|-------------|
| [openrouter/openrouter.md](openrouter/openrouter.md) | OpenRouter API integration guide |
| [posthog/LLM_ANALYTICS.md](posthog/LLM_ANALYTICS.md) | LLM analytics with PostHog |
| [vercel-ai-sdk/vercel-ai.md](vercel-ai-sdk/vercel-ai.md) | Vercel AI SDK usage |
| [vercel-ai-sdk/streaming.md](vercel-ai-sdk/streaming.md) | Streaming implementation patterns |
| [vercel-ai-sdk/llms.txt](vercel-ai-sdk/llms.txt) | LLM configuration reference |

## 🚀 Quick Links

- **Main Project Guide**: See [CLAUDE.md](../CLAUDE.md) in project root
- **Changelog**: See [CHANGELOG.md](../CHANGELOG.md) in project root
- **API Playground**: Visit `/api-reference` on the live site

## 📝 Project Documentation

| Document | Description |
|----------|-------------|
| [CHANGELOG_PROCEDURES.md](CHANGELOG_PROCEDURES.md) | How to maintain the project changelog |
| [CHANGELOG_QUICK_REF.md](CHANGELOG_QUICK_REF.md) | Quick reference for changelog commits |

## 📖 Documentation Structure

```
docs/
├── README.md                    # This file
├── CHANGELOG_PROCEDURES.md      # Changelog maintenance guide
├── CHANGELOG_QUICK_REF.md       # Changelog quick reference
├── openapi.yaml                 # OpenAPI specification
├── API_REFERENCE.md             # fast-proxy-api reference
├── NEXTJS_API.md                # Next.js API routes
├── WORKER_API.md                # Cloudflare Worker API
├── ANALYSIS.md                  # Architecture analysis
├── vercel-streamdown.md         # Streaming guide
├── openrouter/
│   └── openrouter.md           # OpenRouter integration
├── posthog/
│   └── LLM_ANALYTICS.md        # PostHog LLM tracking
└── vercel-ai-sdk/
    ├── vercel-ai.md            # AI SDK guide
    ├── streaming.md            # Streaming patterns
    └── llms.txt                # LLM configs
```

## 🔄 Keeping Documentation Updated

When making changes to the project:

1. **API Changes**: Update `openapi.yaml` and relevant API reference docs
2. **Architecture Changes**: Update `ANALYSIS.md` and `CLAUDE.md`
3. **New Features**: Document in appropriate section and update this index
4. **Breaking Changes**: Update changelog and version in `openapi.yaml`

## 📝 Related Files

| File | Location | Purpose |
|------|----------|---------|
| CLAUDE.md | Root | Main project guide for AI agents |
| CHANGELOG.md | Root | Version history and changes |
| cliff.toml | Root | git-cliff configuration |
| vercel.json | Root | Vercel deployment settings |
