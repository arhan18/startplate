# Skill: Add a New Page

**Trigger:** "Add a page for X" or "Create a new route for Y"

## Description

Add a new Astro page to the product's `src/pages/` directory. Pages use `ProductLayout` from the shared library and follow the existing design system.

## Steps

1. **Create the page file** at `src/pages/[page].astro`
2. **Import ProductLayout** — wrap all content in `<ProductLayout>`
3. **Use design tokens** from `@shared/styles/shared.css` (e.g., `text-cyan-400`, `bg-white/5`, `border-white/10`)
4. **Add to navigation** — update any nav components that should link to the new page
5. **Test** with `npm run dev`

## Files to Create/Modify

- `src/pages/[page].astro` — New page
- `src/components/Nav.astro` — Add navigation link (if nav exists)

## Page Template

```astro
---
import ProductLayout from '@shared/layouts/ProductLayout.astro';
import { JsonLd } from '@shared/components/seo/JsonLd';
---

<ProductLayout
  title="Page Title — My SaaS"
  description="Page description for SEO."
  image="/brand/og-image.png"
>
  <JsonLd type="WebPage" data={{
    name: "Page Title",
    description: "Page description"
  }} />

  <section class="py-24 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Page content here -->
    </div>
  </section>
</ProductLayout>
```

## Design System Quick Reference

| Token | Usage |
|-------|-------|
| `text-white` | Primary text |
| `text-gray-400` | Secondary text |
| `text-cyan-400` | Accent / highlights |
| `bg-white/5` | Glass card background |
| `border-white/10` | Glass card border |
| `py-24` | Section vertical padding |
| `max-w-6xl mx-auto` | Content container |

## Notes

- Always use `ProductLayout` — never raw `<html>` tags
- Add `<JsonLd>` for structured data when the page has semantic meaning
- Keep file naming lowercase with hyphens: `pricing.astro`, `about-us.astro`
- For blog posts, use the dynamic route pattern at `src/pages/blog/[slug].astro`
