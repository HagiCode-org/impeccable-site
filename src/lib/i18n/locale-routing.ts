import {
  DEFAULT_LOCALE,
  SUPPORTED_SITE_LOCALES,
  type SiteLocale,
} from '@/i18n/locale-metadata';

export { DEFAULT_LOCALE, SUPPORTED_SITE_LOCALES, type SiteLocale };

export function normalizePathname(pathname: string): string {
  const withLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const withoutQueryOrHash = withLeadingSlash.split(/[?#]/, 1)[0] || '/';
  const normalized = withoutQueryOrHash.replace(/\/{2,}/g, '/');

  if (normalized.length > 1 && normalized.endsWith('/')) {
    return normalized.replace(/\/+$/u, '');
  }

  return normalized || '/';
}

export function ensureTrailingSlash(pathname: string): string {
  if (pathname === '/') {
    return pathname;
  }

  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

export function stripLocalePrefix(pathname: string): string {
  const normalized = normalizePathname(pathname);
  for (const locale of SUPPORTED_SITE_LOCALES) {
    if (normalized === `/${locale}` || normalized.startsWith(`/${locale}/`)) {
      const withoutPrefix = normalized.slice(locale.length + 1);
      return withoutPrefix ? ensureTrailingSlash(withoutPrefix.startsWith('/') ? withoutPrefix : `/${withoutPrefix}`) : '/';
    }
  }

  return ensureTrailingSlash(normalized === '/' ? '/' : normalized);
}

export function getLocalizedPath(routePath: string, locale: SiteLocale): string {
  const normalizedRoutePath = ensureTrailingSlash(stripLocalePrefix(routePath));
  if (locale === DEFAULT_LOCALE) {
    return normalizedRoutePath;
  }

  return normalizedRoutePath === '/'
    ? `/${locale}/`
    : ensureTrailingSlash(`/${locale}${normalizedRoutePath}`);
}

export function getAlternateLocalePaths(routePath: string): Record<SiteLocale, string> {
  return Object.fromEntries(
    SUPPORTED_SITE_LOCALES.map((locale) => [locale, getLocalizedPath(routePath, locale)]),
  ) as Record<SiteLocale, string>;
}

export function getAbsoluteSiteUrl(
  routePath: string,
  locale: SiteLocale,
  site: string,
): string {
  return new URL(getLocalizedPath(routePath, locale), site).toString();
}
