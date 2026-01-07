# Changelog Procedures for Channel Features

This document outlines how to properly document channel-related features in the changelog.

## Overview

This project uses [git-cliff](https://git-cliff.org/) to automatically generate changelogs from conventional commit messages. The changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.

## Commit Message Format

All commits should follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Commit Types for Channel Features

| Type | Use Case | Example |
|------|----------|---------|
| `feat` | New channel feature | `feat(channels): add featured channels section` |
| `fix` | Bug fix in channel functionality | `fix(channels): resolve thumbnail loading error` |
| `perf` | Performance improvement | `perf(channels): optimize channel data fetching` |
| `refactor` | Code restructuring | `refactor(channels): simplify channel API route` |
| `docs` | Documentation updates | `docs(channels): add channel feature documentation` |

### Scope Usage

Use `channels` as the scope for channel-related commits:

```bash
feat(channels): add channel search functionality
fix(channels): handle missing channel thumbnails
perf(channels): cache channel metadata
```

## Examples for Channel Features

### Adding a New Channel Feature

```bash
git commit -m "feat(channels): add featured channels carousel on homepage"
```

This will appear in the changelog as:
```markdown
### Features
- **channels**: Add featured channels carousel on homepage
```

### Fixing Channel Bugs

```bash
git commit -m "fix(channels): resolve channel page loading error for invalid IDs"
```

This will appear as:
```markdown
### Bug Fixes
- **channels**: Resolve channel page loading error for invalid IDs
```

### Performance Improvements

```bash
git commit -m "perf(channels): implement channel data caching with 5min TTL"
```

This will appear as:
```markdown
### Performance
- **channels**: Implement channel data caching with 5min TTL
```

## Generating the Changelog

### Prerequisites

Install git-cliff:

```bash
# macOS
brew install git-cliff

# Or via cargo
cargo install git-cliff
```

### Generate Changelog

```bash
# Generate full changelog
git-cliff --output CHANGELOG.md

# Preview unreleased changes only
git-cliff --unreleased

# Generate changelog for a specific version
git-cliff --tag v1.0.0 --output CHANGELOG.md
```

### Update Changelog After Commits

After making channel-related commits:

1. **Preview changes:**
   ```bash
   git-cliff --unreleased
   ```

2. **Generate full changelog:**
   ```bash
   git-cliff --output CHANGELOG.md
   ```

3. **Review and commit:**
   ```bash
   git add CHANGELOG.md
   git commit -m "chore: update changelog"
   ```

## Current Channel Features

Based on the codebase, here are the existing channel features that should be documented:

### Features to Document

1. **Featured Channels Component** (`components/youtube/featured-channels.tsx`)
   - Displays popular channels on homepage
   - Includes channel thumbnails, names, and descriptions
   - Links to individual channel pages

2. **Channel Page** (`app/channel/[channelId]/page.tsx`)
   - Dynamic channel page with channel info
   - Displays recent uploads in a grid
   - Shows subscriber count and description

3. **Channel API Route** (`app/api/channel/[channelId]/route.ts`)
   - Fetches channel data from fast-proxy-api backend
   - Fallback to YouTube Data API v3
   - Demo data fallback when APIs unavailable

4. **Channel Search** (if implemented)
   - Search functionality for finding channels

### Example Commit Messages for Existing Features

If documenting existing features:

```bash
# For featured channels component
feat(channels): add featured channels section to homepage

# For channel page
feat(channels): add dynamic channel page with recent uploads

# For API route
feat(channels): implement channel API with multi-tier fallback strategy

# For analytics
feat(channels): add PostHog tracking for channel views
```

## Best Practices

1. **Be Specific**: Include what was added/changed, not just "update channels"
   - ✅ Good: `feat(channels): add channel subscription button`
   - ❌ Bad: `feat(channels): update channel page`

2. **Use Present Tense**: Write commit messages in present tense
   - ✅ Good: `feat(channels): add channel search`
   - ❌ Bad: `feat(channels): added channel search`

3. **Keep It Concise**: First line should be under 72 characters
   - Use body for detailed explanations if needed

4. **Group Related Changes**: Multiple related changes can be in one commit
   - ✅ Good: `feat(channels): add channel filtering and sorting`
   - ❌ Bad: Two separate commits for filtering and sorting if they're related

## Workflow

1. **Make changes** to channel-related code
2. **Commit with conventional format**: `feat(channels): description`
3. **Generate changelog**: `git-cliff --output CHANGELOG.md`
4. **Review** the generated changelog
5. **Commit changelog**: `git commit -m "chore: update changelog"`
6. **Push** changes

## Troubleshooting

### Changelog not updating?

- Ensure commits follow conventional format (start with `feat:`, `fix:`, etc.)
- Check that `cliff.toml` exists and is configured correctly
- Run `git-cliff --unreleased` to preview what will be included

### Commits not appearing?

- Verify commit messages match the patterns in `cliff.toml`
- Check if commits are filtered out (e.g., `chore(deps)` might be skipped)
- Ensure commits are not in a different branch

## Related Files

- `cliff.toml` - git-cliff configuration
- `CHANGELOG.md` - Generated changelog file
- `components/youtube/featured-channels.tsx` - Featured channels component
- `app/channel/[channelId]/page.tsx` - Channel page component
- `app/api/channel/[channelId]/route.ts` - Channel API route
