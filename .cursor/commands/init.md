# Project Initialization

This command helps initialize and update the project dependencies and configuration.

## Steps

1. **Check Bun version**
   - Ensure Bun 1.0+ is installed
   - Run: `bun --version`
   - If not installed, visit: https://bun.sh

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Environment variables setup**
   - Copy `.env.example` to `.env.local` (if exists)
   - Required environment variables:
     - `NEXT_PUBLIC_POSTHOG_KEY` - PostHog API key for analytics
     - `NEXT_PUBLIC_POSTHOG_HOST` - PostHog host URL
     - `OPENAI_API_KEY` - OpenAI API key (if using AI features)

4. **Check for outdated packages**
   ```bash
   bun outdated
   ```

5. **Update dependencies (if needed)**
   ```bash
   bun update
   ```
   
   For major version updates:
   ```bash
   bun add <package>@latest
   ```

6. **Run development server**
   ```bash
   bun run dev
   ```

7. **Verify setup**
   - Open http://localhost:3000
   - Check that PostHog analytics are loading (if configured)
   - Verify no console errors

## Key Dependencies

- **Next.js 16** - React framework
- **React 19** - UI library
- **PostHog** - Analytics and feature flags
- **Tailwind CSS 4** - Styling
- **Radix UI** - Accessible component primitives
- **OpenAI** - AI integration

## Troubleshooting

- If dependencies fail to install, try deleting `node_modules` and `bun.lockb`, then run `bun install` again
- For TypeScript errors, ensure `typescript@^5` is installed
- For PostHog issues, verify environment variables are set correctly
