import {
  DEFAULT_LOCALE,
  normalizeSiteLocale,
  type SiteLocale,
} from '@/i18n/locale-metadata';

export const SITE_LOCALE_STORAGE_KEY = 'impeccable-site:locale';

export function getStoredSiteLocale(storageValue: string | null | undefined): SiteLocale | null {
  return normalizeSiteLocale(storageValue);
}

export function resolveClientSiteLocale(
  clientLanguages: Array<string | null | undefined>,
): SiteLocale | null {
  for (const language of clientLanguages) {
    const locale = normalizeSiteLocale(language);
    if (locale) {
      return locale;
    }
  }

  return null;
}

export function resolvePreferredSiteLocale(options: {
  storedLocale?: string | null | undefined;
  clientLanguages?: Array<string | null | undefined>;
}): SiteLocale {
  const resolvedStoredLocale = getStoredSiteLocale(options.storedLocale);
  if (resolvedStoredLocale) {
    return resolvedStoredLocale;
  }

  return resolveClientSiteLocale(options.clientLanguages ?? []) ?? DEFAULT_LOCALE;
}
