# Vercel Streamdown Documentation

**Repository:** [vercel/streamdown](https://github.com/vercel/streamdown)
**Description:** A drop-in replacement for react-markdown, designed for AI-powered streaming.

## Installation

```bash
npm i streamdown
# or
pnpm add streamdown
# or
yarn add streamdown
# or
bun add streamdown
```

## Usage

### Basic Component

```tsx
import { Streamdown } from 'streamdown';

export default function Page() {
  const markdown = `
# Hello World

This is a streaming markdown component.
  `;

  return (
    <Streamdown>
      {markdown}
    </Streamdown>
  );
}
```

### Customizing Plugins

You can override default plugins or add new ones.

```tsx
import { Streamdown, defaultRehypePlugins } from 'streamdown';
import { harden } from 'rehype-harden';

export default function Page() {
  const markdown = `
[Safe link](https://example.com)
[Unsafe link](https://malicious-site.com)
  `;

  return (
    <Streamdown
      rehypePlugins={[
        defaultRehypePlugins.raw,
        defaultRehypePlugins.katex,
        [
          harden,
          {
            defaultOrigin: 'https://example.com',
            allowedLinkPrefixes: ['https://example.com'],
          },
        ],
      ]}
    >
      {markdown}
    </Streamdown>
  );
}
```

## Development

To contribute or run locally:

```bash
# Clone repo
git clone https://github.com/vercel/streamdown.git
cd streamdown

# Install dependencies
pnpm install

# Build the streamdown package
pnpm --filter streamdown build

# Run development server
pnpm dev

# Run tests
pnpm test
```
