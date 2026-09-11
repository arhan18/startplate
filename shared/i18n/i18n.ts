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
export type { Locale };
