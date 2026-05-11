import lv from './lv.json';
import ru from './ru.json';
import en from './en.json';

export type Locale = 'lv' | 'ru' | 'en';
export const LOCALES: readonly Locale[] = ['lv', 'ru', 'en'] as const;
export const DEFAULT_LOCALE: Locale = 'lv';

const dictionaries = { lv, ru, en } as const;
type Dict = typeof lv;

export function getLocaleFromUrl(url: URL): Locale {
  const seg = url.pathname.split('/').filter(Boolean)[0];
  if (seg === 'ru' || seg === 'en') return seg;
  return DEFAULT_LOCALE;
}

// Strip the locale prefix from a path so we can rebuild it for another locale.
// '/ru/par-namu' → '/par-namu'; '/par-namu' → '/par-namu'; '/' → '/'
export function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(ru|en)(?=\/|$)/, '') || '/';
}

// Build a URL for the given locale, preserving the rest of the path.
// LV is the default and has no prefix.
export function getLocalizedUrl(pathname: string, locale: Locale): string {
  const stripped = stripLocale(pathname);
  if (locale === 'lv') return stripped;
  return stripped === '/' ? `/${locale}/` : `/${locale}${stripped}`;
}

// Walk a dotted key path through the dictionary; fall back to LV when missing,
// and finally to the literal key so missing strings show up as such instead of
// rendering as "undefined".
export function useTranslations(locale: Locale) {
  const dict = dictionaries[locale] ?? dictionaries.lv;
  return function t(key: string): string {
    const value = walk(dict, key);
    if (typeof value === 'string') return value;
    if (locale !== 'lv') {
      const fallback = walk(dictionaries.lv, key);
      if (typeof fallback === 'string') return fallback;
    }
    return key;
  };
}

// Like useTranslations but for arbitrary types (arrays of objects in the dictionary).
export function useTranslationsRaw(locale: Locale) {
  const dict = dictionaries[locale] ?? dictionaries.lv;
  return function t<T = unknown>(key: string): T {
    const value = walk(dict, key);
    if (value !== undefined) return value as T;
    if (locale !== 'lv') {
      const fallback = walk(dictionaries.lv, key);
      if (fallback !== undefined) return fallback as T;
    }
    return key as unknown as T;
  };
}

function walk(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

export type ApartmentStatus = 'available' | 'reserved' | 'sold';

export function formatPrice(
  price: number | null,
  locale: Locale,
  status?: ApartmentStatus,
): string {
  if (price === null) {
    // Sold apartments aren't bookable, so "по запросу" is misleading — show
    // an em dash instead. Available/reserved fall through to the existing
    // localized "price on request" copy.
    if (status === 'sold') return '—';
    const d = dictionaries[locale] ?? dictionaries.lv;
    return d.common.price_on_request;
  }
  // EN audience usually expects en-US thousand separators (commas); LV/RU use lv-LV (spaces).
  const intlLocale = locale === 'en' ? 'en-US' : 'lv-LV';
  return `${price.toLocaleString(intlLocale)} €`;
}

export function localizedRoomName(
  breakdown: { name_lv: string; name_ru: string; name_en: string },
  locale: Locale,
): string {
  if (locale === 'ru') return breakdown.name_ru || breakdown.name_lv;
  if (locale === 'en') return breakdown.name_en || breakdown.name_lv;
  return breakdown.name_lv;
}

// Number-of-rooms label that respects the locale's plural rules. Russian has
// three forms (1 / 2-4 / 5+); English has 1 / >1; Latvian has 1 / >1.
export function roomsLabel(n: number, locale: Locale): string {
  const d = dictionaries[locale] ?? dictionaries.lv;
  const r = d.common.rooms;
  if (locale === 'ru') {
    const last = n % 10;
    const lastTwo = n % 100;
    if (lastTwo >= 11 && lastTwo <= 14) return r.many;
    if (last === 1) return r.one;
    if (last >= 2 && last <= 4) return r.few;
    return r.many;
  }
  return n === 1 ? r.one : r.many;
}
