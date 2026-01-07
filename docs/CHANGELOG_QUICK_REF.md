# Changelog Quick Reference for Channel Features

## Quick Commands

```bash
# Generate full changelog
git-cliff --output CHANGELOG.md

# Preview unreleased changes
git-cliff --unreleased

# Generate for specific version
git-cliff --tag v1.0.0 --output CHANGELOG.md
```

## Commit Message Examples for Channels

```bash
# New feature
feat(channels): add channel search functionality

# Bug fix
fix(channels): resolve thumbnail loading error

# Performance
perf(channels): cache channel metadata

# Refactor
refactor(channels): simplify channel API route

# Documentation
docs(channels): add channel feature guide
```

## Workflow

1. Make your changes
2. Commit: `git commit -m "feat(channels): your feature description"`
3. Generate: `git-cliff --output CHANGELOG.md`
4. Review and commit changelog: `git commit -m "chore: update changelog"`

See `CHANGELOG_PROCEDURES.md` for detailed documentation.
