# Skill: Add a UI Component

**Trigger:** "Add a component for X" or "Create a reusable Y component"

## Description

Add a new Astro component to `src/components/`. Components use Tailwind CSS with the shared design system tokens.

## Steps

1. **Create the component** at `src/components/[ComponentName].astro`
2. **Use design tokens** from shared CSS (not raw colors)
3. **Accept props** via Astro's `Props` interface
4. **Use SVG icons** from Lucide — NEVER emojis
5. **Export** as default or named export

## Files to Create/Modify

- `src/components/[ComponentName].astro` — New component

## Component Template

```astro
---
export interface Props {
  title: string;
  description?: string;
  class?: string;
}

const { title, description, class: className = '' } = Astro.props;
---

<div class={`p-6 bg-white/5 border border-white/10 rounded-xl ${className}`}>
  <h3 class="text-xl font-semibold text-white mb-2">{title}</h3>
  {description && (
    <p class="text-gray-400">{description}</p>
  )}
  <slot />
</div>
```

## Design System Component Patterns

| Pattern | Classes |
|---------|---------|
| Glass card | `bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm` |
| Button primary | `px-6 py-3 bg-cyan-500 text-black font-semibold rounded-lg hover:bg-cyan-400 transition-all` |
| Button secondary | `px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-all` |
| Heading | `text-4xl font-bold text-white` |
| Subheading | `text-xl text-gray-400` |
| Section | `py-24 px-4` |
| Container | `max-w-6xl mx-auto` |

## Using Shared Components

Import from `@shared/components/`:

```astro
---
import { Modal } from '@shared/components/ui/Modal';
import { Toast } from '@shared/components/ui/Toast';
import SEOHead from '@shared/components/seo/SEOHead.astro';
---
```

## Notes

- Component filenames: PascalCase for components, kebab-case for pages
- Always define `Props` interface for type safety
- Use `<slot />` for content projection
- Prefer Astro components over React components for performance
- If you need interactivity, add `client:*` directive or use a React component
