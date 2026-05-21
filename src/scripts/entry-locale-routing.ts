import { resolvePreferredSiteLocale, SITE_LOCALE_STORAGE_KEY } from '@/lib/i18n/site-entry-locale';
import { getLocalizedPath } from '@/lib/i18n/locale-routing';

export function redirectRootEntryToPreferredLocale() {
  const preferredLocale = resolvePreferredSiteLocale({
    storedLocale: (() => {
      try {
        return localStorage.getItem(SITE_LOCALE_STORAGE_KEY);
      } catch {
        return null;
      }
    })(),
    clientLanguages: Array.isArray(navigator.languages) && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language],
  });

  try {
    localStorage.setItem(SITE_LOCALE_STORAGE_KEY, preferredLocale);
  } catch {
    // Ignore unavailable storage.
  }

  const target = `${getLocalizedPath('/docs/', preferredLocale)}${window.location.search}${window.location.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (target !== current) {
    window.location.replace(target);
  }
}
