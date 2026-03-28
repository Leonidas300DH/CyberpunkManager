import { useStore } from '@/store/useStore';
import { en } from './en';
import { fr } from './fr';
import type { Translations, Locale } from './types';

export type { Locale, Translations };

const translations: Record<Locale, Translations> = { en, fr };

/**
 * Hook for static UI string translation.
 * Returns t(key, vars?) — resolves key from current locale, falls back to 'en'.
 */
export function useT() {
    const locale = useStore(s => s.displaySettings.locale ?? 'en') as Locale;

    return function t(key: keyof Translations, vars?: Record<string, string | number>): string {
        let str = translations[locale]?.[key] ?? translations.en[key] ?? key;
        if (vars) {
            for (const [k, v] of Object.entries(vars)) {
                str = str.replaceAll(`{${k}}`, String(v));
            }
        }
        return str;
    };
}

/**
 * Hook for dynamic catalog field localization.
 * Returns loc(item, field) — resolves item[field_fr] if locale=fr and non-empty, else item[field].
 */
export function useLocalized() {
    const locale = useStore(s => s.displaySettings.locale ?? 'en') as Locale;

    return function loc<T extends Record<string, unknown>>(item: T, field: string): string {
        if (locale !== 'en') {
            const localizedKey = `${field}_${locale}`;
            const localizedValue = item[localizedKey];
            if (typeof localizedValue === 'string' && localizedValue.length > 0) {
                return localizedValue;
            }
        }
        const value = item[field];
        return typeof value === 'string' ? value : '';
    };
}

/**
 * Standalone t() for non-component code (validation.ts, etc.).
 */
export function getT(locale: Locale) {
    return function t(key: keyof Translations, vars?: Record<string, string | number>): string {
        let str = translations[locale]?.[key] ?? translations.en[key] ?? key;
        if (vars) {
            for (const [k, v] of Object.entries(vars)) {
                str = str.replaceAll(`{${k}}`, String(v));
            }
        }
        return str;
    };
}
