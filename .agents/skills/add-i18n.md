# Skill: Add Internationalization (i18n)

**Trigger:** "Add translations for X language" or "Localize the app for Y"

## Description

Add a new language or translation keys using the built-in i18n system. The template supports English, Urdu, and Hindi out of the box.

## Steps

1. **Create the translation file** at `shared/i18n/[locale].json`
2. **Add the locale** to `shared/i18n/i18n.ts`
3. **Use the `t()` function** in components for translated strings
4. **Test** by switching locale

## Files to Create/Modify

- `shared/i18n/[locale].json` — Translation file
- `shared/i18n/i18n.ts` — Add locale to imports

## Translation File Structure

```json
// shared/i18n/fr.json (example: French)
{
  "nav": {
    "home": "Accueil",
    "features": "Fonctionnalités",
    "pricing": "Tarifs",
    "contact": "Contact"
  },
  "hero": {
    "title": "Construisez votre SaaS",
    "subtitle": "Auth, paiements et tout ce dont vous avez besoin.",
    "cta": "Commencer"
  },
  "features": {
    "title": "Tout ce dont vous avez besoin",
    "auth": "Authentification",
    "payments": "Paiements",
    "admin": "Administration"
  }
}
```

## Adding a Locale

```typescript
// shared/i18n/i18n.ts
import en from '../i18n/en.json';
import ur from '../i18n/ur.json';
import hi from '../i18n/hi.json';
import fr from '../i18n/fr.json'; // Add import

const translations = { en, ur, hi, fr } as const; // Add to object
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

export const locales = ['en', 'ur', 'hi', 'fr'] as const; // Add locale
export type { Locale };
```

## Using Translations in Components

```astro
---
import { t } from '@shared/i18n/i18n';

const locale = Astro.url.searchParams.get('lang') || 'en';
const translations = t(locale, 'hero');
---

<h1>{translations.title}</h1>
<p>{translations.subtitle}</p>
<a href="/pricing">{translations.cta}</a>
```

## Auto-Translation with AI

For bulk translation, use the `@shared/i18n/i18n.ts` helper:

```typescript
// Generate translations for a new locale
const enKeys = flattenObject(en);
const frTranslations = await translateWithAI(enKeys, 'fr');
// Write to shared/i18n/fr.json
```

## Notes

- Keep translation keys flat and descriptive: `hero.title`, `nav.features`
- Always provide fallback to English if key is missing
- For dynamic content (user names, dates), use interpolation: `t(locale, 'greeting', { name: user.name })`
- RTL languages (Urdu, Arabic) need `dir="rtl"` on the `<html>` tag
- Consider number/date formatting per locale
