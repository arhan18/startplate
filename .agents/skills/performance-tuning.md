# Skill: Performance Tuning

**Trigger:** "Optimize performance" or "Fix slow page" or "Improve Core Web Vitals"

## Description

Optimize page load speed, Core Web Vitals, and runtime performance. Astro is fast by default — this skill covers the edge cases.

## Steps

1. **Audit current performance** — check Lighthouse scores
2. **Optimize images** — WebP, lazy load, proper sizing
3. **Reduce JavaScript** — use `client:*` directives wisely
4. **Optimize fonts** — subset, preload, use `font-display: swap`
5. **Enable caching** — Cloudflare cache headers
6. **Test** with Lighthouse and WebPageTest

## Files to Create/Modify

- `astro.config.mjs` — Build optimizations
- `src/components/*.astro` — Component-level fixes
- `functions/api/hono.ts` — API response caching

## Image Optimization

```astro
<!-- Always use WebP with fallback -->
<picture>
  <source srcset="/hero.webp" type="image/webp" />
  <img src="/hero.png" alt="Hero" loading="lazy" decoding="async" />
</picture>

<!-- Use Astro's built-in image optimization -->
---
import { Image } from 'astro:assets';
import heroImage from '../assets/hero.png';
---
<Image src={heroImage} alt="Hero" widths={[400, 800, 1200]} formats={['webp', 'png']} />
```

## Font Optimization

```astro
<!-- In ProductLayout.astro head -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Cormorant:wght@400;600;700&family=Inter:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
```

## JavaScript Reduction

```astro
<!-- Use the lightest client directive -->
<InteractiveComponent client:visible />  <!-- Loads when visible -->
<InteractiveComponent client:idle />     <!-- Loads when browser idle -->
<InteractiveComponent client:only="react" />  <!-- SSR skip (last resort) -->

<!-- Avoid client:load unless critical -->
```

## Caching Headers

```typescript
// In functions/api/hono.ts
app.get('/api/data', async (c) => {
  c.header('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  return c.json(data);
});
```

## Build Optimizations

```javascript
// astro.config.mjs
export default defineConfig({
  build: {
    inlineStylesheets: 'auto',  // Inline small CSS
    format: 'file',  // Clean URLs
  },
  vite: {
    build: {
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks: undefined,  // Single bundle for small apps
        },
      },
    },
  },
});
```

## Performance Targets

| Metric | Target | How to Measure |
|--------|--------|----------------|
| LCP | < 2.5s | Lighthouse |
| INP | < 200ms | Lighthouse |
| CLS | < 0.1 | Lighthouse |
| FCP | < 1.8s | Lighthouse |
| TTI | < 3.8s | Lighthouse |
| Bundle Size | < 200KB | `npm run build` |

## Common Fixes

1. **Large images** → Compress, convert to WebP, lazy load
2. **Render-blocking JS** → Move to `client:idle` or `client:visible`
3. **Unnecessary re-renders** → Memoize components, avoid inline functions
4. **Slow API calls** → Cache responses, use Cloudflare edge
5. **Font FOUT** → Use `font-display: swap` and preload fonts

## Notes

- Astro is 0-JS by default — only add JS when needed
- Cloudflare Pages serves from edge — leverage CDN caching
- Turso has built-in edge replication — queries are fast globally
- Use `npm run build` to check bundle size before deploying
