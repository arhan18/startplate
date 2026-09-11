# Starlight Documentation Setup

## 1. Install
```bash
npm install @astrojs/starlight
```

## 2. Add to astro.config.mjs
```js
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Your Product Docs',
      social: {
        github: 'https://github.com/yourusername/yourrepo',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', slug: 'getting-started/introduction' },
            { label: 'Installation', slug: 'getting-started/installation' },
            { label: 'Quick Start', slug: 'getting-started/quick-start' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Configuration', slug: 'guides/configuration' },
            { label: 'Deployment', slug: 'guides/deployment' },
            { label: 'API Reference', slug: 'guides/api-reference' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'CLI Commands', slug: 'reference/cli' },
            { label: 'Environment Variables', slug: 'reference/env-vars' },
          ],
        },
      ],
    }),
  ],
});
```

## 3. Create Docs Content
Create `src/content/docs/` directory:
```
src/content/docs/
├── getting-started/
│   ├── introduction.mdx
│   ├── installation.mdx
│   └── quick-start.mdx
├── guides/
│   ├── configuration.mdx
│   ├── deployment.mdx
│   └── api-reference.mdx
└── reference/
    ├── cli.mdx
    └── env-vars.mdx
```

## 4. Example Doc Page
```mdx
---
title: Introduction
description: Welcome to your product documentation
---

Welcome to the documentation for **Your Product**.

## What is Your Product?

Your Product is a tool that helps you [do something amazing].

## Features

- **Feature 1**: Description of feature 1
- **Feature 2**: Description of feature 2
- **Feature 3**: Description of feature 3

## Quick Start

```bash
npm install your-product
```

## Next Steps

- [Installation Guide](/getting-started/installation)
- [Quick Start Tutorial](/getting-started/quick-start)
- [Configuration](/guides/configuration)
```

## 5. Custom Styling
Create `src/content/docs/styles.css`:
```css
:root {
  --sl-color-primary: #00ff88;
  --sl-color-primary-high: #00cc6a;
  --sl-color-bg: #0a0a0a;
  --sl-color-text: #e0e0e0;
}
```

Add to starlight config:
```js
starlight({
  title: 'Your Product Docs',
  customCss: ['./src/content/docs/styles.css'],
})
```

## 6. File Structure
```
src/
├── content/
│   └── docs/
│       ├── getting-started/
│       │   ├── introduction.mdx
│       │   ├── installation.mdx
│       │   └── quick-start.mdx
│       ├── guides/
│       │   ├── configuration.mdx
│       │   ├── deployment.mdx
│       │   └── api-reference.mdx
│       └── reference/
│           ├── cli.mdx
│           └── env-vars.mdx
```

## Benefits
- Auto-generated sidebar
- Search functionality
- Dark mode by default
- SEO optimized
- MDX support
- Version control friendly
