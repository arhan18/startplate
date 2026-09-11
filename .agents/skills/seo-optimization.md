# Skill: SEO Optimization

**Trigger:** "Optimize for SEO" or "Add structured data" or "Fix SEO issues"

## Description

Optimize pages for search engines using meta tags, structured data (JSON-LD), sitemap, and content best practices.

## Steps

1. **Add meta tags** via `ProductLayout` props (title, description, image)
2. **Add JSON-LD** using the `JsonLd` component
3. **Optimize images** — use WebP, add alt text, lazy load
4. **Add internal links** between pages
5. **Generate sitemap** in `astro.config.mjs`
6. **Test** with Google Rich Results Test

## Files to Create/Modify

- `src/pages/[page].astro` — Add meta + JSON-LD
- `astro.config.mjs` — Sitemap config
- `public/robots.txt` — Crawl rules

## Meta Tags (via ProductLayout)

```astro
<ProductLayout
  title="Page Title — Brand Name"  <!-- Max 60 chars -->
  description="Page description for search engines."  <!-- Max 160 chars -->
  image="/brand/og-image.png"  <!-- 1200x630 for social -->
  canonical="https://yourdomain.com/page"
>
```

## JSON-LD Structured Data

```astro
---
import { JsonLd } from '@shared/components/seo/JsonLd';
---

<JsonLd type="WebPage" data={{
  name: "Page Title",
  description: "Page description",
  url: "https://yourdomain.com/page"
}} />

<JsonLd type="Product" data={{
  name: "Product Name",
  description: "Product description",
  price: "29.00",
  priceCurrency: "USD",
  image: "/brand/og-image.png"
}} />

<JsonLd type="FAQPage" data={{
  mainEntity: [
    {
      name: "Question text?",
      acceptedAnswer: {
        text: "Answer text"
      }
    }
  ]
}} />
```

## Sitemap Configuration

```javascript
// astro.config.mjs
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/checkout') && !page.includes('/admin'),
    }),
  ],
});
```

## Image Optimization

```astro
<!-- Use WebP with fallback -->
<picture>
  <source srcset="/image.webp" type="image/webp" />
  <img 
    src="/image.png" 
    alt="Descriptive alt text" 
    loading="lazy"
    decoding="async"
    width="800"
    height="600"
  />
</picture>
```

## SEO Checklist Per Page

- [ ] Title tag: 50-60 chars, primary keyword first
- [ ] Meta description: 150-160 chars, includes CTA
- [ ] H1 tag: one per page, matches title intent
- [ ] H2-H3 hierarchy: logical heading structure
- [ ] Alt text: descriptive for all images
- [ ] Internal links: 2-5 per page
- [ ] JSON-LD: WebPage + context-specific schema
- [ ] OG tags: title, description, image (1200x630)
- [ ] Canonical URL: self-referencing
- [ ] Mobile responsive: passes mobile-friendly test

## Notes

- Astro generates static HTML by default — great for SEO
- Use `client:idle` or `client:visible` for interactive components to avoid JS blocking
- Keep page load under 3 seconds for Core Web Vitals
- Update `sitemap` integration when adding new pages
