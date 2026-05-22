import { getCollection } from 'astro:content';

import {
  getSiteLocaleFallbackChain,
  resolveSiteLocale,
  type SiteLocale,
} from '@/i18n/locale-metadata';
import {
  COMMAND_COLLECTION_BY_LOCALE,
  COMMAND_CONTENT_LOCALES,
  type CommandCollectionName,
} from '@/lib/content/command-source-locales';

type CommandContentSourceLocale = SiteLocale;
const commandContentSourceLocales = new Set<SiteLocale>(COMMAND_CONTENT_LOCALES);

function resolveCommandContentSourceLocale(
  localeInput: SiteLocale | string | null | undefined,
): CommandContentSourceLocale {
  const locale = resolveSiteLocale(localeInput);
  const lookupChain = [locale, ...getSiteLocaleFallbackChain(locale)];

  for (const candidate of lookupChain) {
    if (commandContentSourceLocales.has(candidate)) {
      return candidate as CommandContentSourceLocale;
    }
  }

  return 'en-US';
}

export async function getLocalizedCommandEntries(localeInput: SiteLocale | string | null | undefined) {
  const locale = resolveCommandContentSourceLocale(localeInput);
  return getCollection(COMMAND_COLLECTION_BY_LOCALE[locale] as CommandCollectionName);
}

export async function getLocalizedCommandEntry(
  localeInput: SiteLocale | string | null | undefined,
  slug: string,
) {
  const entries = await getLocalizedCommandEntries(localeInput);
  return entries.find((entry) => entry.data.slug === slug);
}
