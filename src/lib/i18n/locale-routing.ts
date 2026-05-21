import {
  DEFAULT_LOCALE,
  normalizeSiteLocale,
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

function getLeadingSegment(pathname: string): string | null {
  const normalized = normalizePathname(pathname);
  if (normalized === '/') {
    return null;
  }

  const [, leadingSegment] = normalized.split('/');
  return leadingSegment || null;
}

export function getCanonicalLocalePrefix(pathname: string): SiteLocale | null {
  const leadingSegment = getLeadingSegment(pathname);
  return leadingSegment ? normalizeSiteLocale(leadingSegment) : null;
}

export function hasExplicitLocalePrefix(pathname: string): boolean {
  return getCanonicalLocalePrefix(pathname) !== null;
}

export function resolveLocaleFromPathname(pathname: string): SiteLocale {
  return getCanonicalLocalePrefix(pathname) ?? DEFAULT_LOCALE;
}

export function stripLocalePrefix(pathname: string): string {
  const normalized = normalizePathname(pathname);
  if (!hasExplicitLocalePrefix(normalized)) {
    return ensureTrailingSlash(normalized === '/' ? '/' : normalized);
  }

  const withoutPrefix = normalized.replace(/^\/[^/]+(?=\/|$)/u, '');
  if (!withoutPrefix) {
    return '/';
  }

  return ensureTrailingSlash(withoutPrefix.startsWith('/') ? withoutPrefix : `/${withoutPrefix}`);
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

export function getAbsoluteSiteUrl(routePath: string, locale: SiteLocale, site: string): string {
  return new URL(getLocalizedPath(routePath, locale), site).toString();
}

function normalizeSearch(search = ''): string {
  if (!search) {
    return '';
  }

  return search.startsWith('?') ? search : `?${search}`;
}

function normalizeHash(hash = ''): string {
  if (!hash) {
    return '';
  }

  return hash.startsWith('#') ? hash : `#${hash}`;
}

export function getLocaleSwitchPath(
  locale: SiteLocale,
  options: { pathname: string; search?: string; hash?: string },
): string {
  const localizedPath = getLocalizedPath(options.pathname, locale);
  return `${localizedPath}${normalizeSearch(options.search)}${normalizeHash(options.hash)}`;
}
