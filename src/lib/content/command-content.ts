import { getCollection } from 'astro:content';

import {
  getSiteLocaleFallbackChain,
  resolveSiteLocale,
  type SiteLocale,
} from '@/i18n/locale-metadata';

const collectionByLocale = {
  'en-US': 'commandsEnUs',
  'zh-CN': 'commandsZhCn',
} as const;

type CommandContentSourceLocale = keyof typeof collectionByLocale;
const commandContentSourceLocales = new Set<SiteLocale>(Object.keys(collectionByLocale) as CommandContentSourceLocale[]);

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
  return getCollection(collectionByLocale[locale]);
}

export async function getLocalizedCommandEntry(
  localeInput: SiteLocale | string | null | undefined,
  slug: string,
) {
  const entries = await getLocalizedCommandEntries(localeInput);
  return entries.find((entry) => entry.data.slug === slug);
}
