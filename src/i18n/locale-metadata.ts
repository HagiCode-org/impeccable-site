export const DEFAULT_LOCALE = 'en-US' as const;
export const SUPPORTED_SITE_LOCALES = ['en-US', 'zh-CN'] as const;

export type SiteLocale = (typeof SUPPORTED_SITE_LOCALES)[number];

const supportedSiteLocaleSet = new Set<string>(SUPPORTED_SITE_LOCALES);

export function normalizeSiteLocale(value: string | null | undefined): SiteLocale | null {
  if (!value) {
    return null;
  }

  return supportedSiteLocaleSet.has(value) ? (value as SiteLocale) : null;
}

export function resolveSiteLocale(value: string | null | undefined): SiteLocale {
  return normalizeSiteLocale(value) ?? DEFAULT_LOCALE;
}
