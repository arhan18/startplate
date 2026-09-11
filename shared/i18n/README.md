# i18n Setup — Add to astro.config.mjs

## 1. Install
```bash
npm install astro-i18n-aut
```

## 2. Add to astro.config.mjs
```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import i18n from 'astro-i18n-aut';

export default defineConfig({
  site: 'https://yourdomain.com',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap(),
    i18n({
      defaultLocale: 'en',
      locales: {
        en: 'en',
        ur: 'ur',
        hi: 'hi',
      },
    }),
  ],
});
```

## 3. Create Locale Files
Create `src/i18n/` directory with translation files:
```
src/i18n/
├── en.json
├── ur.json
└── hi.json
```

## 4. Example en.json
```json
{
  "nav": {
    "home": "Home",
    "products": "Products",
    "blog": "Blog",
    "docs": "Documentation",
    "about": "About"
  },
  "hero": {
    "title": "Welcome to {product}",
    "subtitle": "Build amazing things",
    "cta": "Get Started"
  },
  "footer": {
    "copyright": "© 2026 {name}. All rights reserved."
  }
}
```

## 5. Create i18n Helper
Create `src/lib/i18n.ts`:
```ts
import en from '../i18n/en.json';
import ur from '../i18n/ur.json';
import hi from '../i18n/hi.json';

const translations = { en, ur, hi } as const;
type Locale = keyof typeof translations;

export function getTranslations(locale: Locale = 'en') {
  return translations[locale] || translations.en;
}

export function t(locale: Locale, key: string): string {
  const keys = key.split('.');
  let value: any = translations[locale] || translations.en;
  for (const k of keys) {
    value = value?.[k];
  }
  return value || key;
}

export const locales = ['en', 'ur', 'hi'] as const;
```

## 6. Usage in Components
```astro
---
import { getTranslations, t } from '../lib/i18n';
const { locale } = Astro.params;
const i18n = getTranslations(locale);
---

<h1>{t(locale, 'hero.title')}</h1>
<p>{t(locale, 'hero.subtitle')}</p>
<a href={`/${locale}/products`}>{i18n.nav.products}</a>
```

## 7. Locale Switcher Component
```astro
---
const currentLocale = Astro.params.locale || 'en';
const otherLocales = ['en', 'ur', 'hi'].filter(l => l !== currentLocale);
---

<div class="locale-switcher">
  {otherLocales.map(locale => (
    <a href={`/${locale}${Astro.url.pathname}`} class="locale-btn">
      {locale.toUpperCase()}
    </a>
  ))}
</div>
```

## 8. File Structure
```
src/
├── i18n/
│   ├── en.json
│   ├── ur.json
│   └── hi.json
├── lib/
│   └── i18n.ts
├── pages/
│   └── [...locale]/
│       ├── index.astro
│       ├── products/
│       └── blog/
```

## Notes
- Default locale (en) doesn't need prefix: `/products`
- Other locales get prefix: `/ur/products`, `/hi/products`
- SEO: Each locale gets its own `<html lang="xx">` tag
- Sitemap: Auto-generates hreflang links
