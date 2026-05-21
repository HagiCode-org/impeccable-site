import { getCollection } from 'astro:content';

import {
  resolveSiteLocale,
  type SiteLocale,
} from '@/i18n/locale-metadata';

const collectionByLocale = {
  'en-US': 'commandsEnUs',
  'zh-CN': 'commandsZhCn',
} as const;

export async function getLocalizedCommandEntries(localeInput: SiteLocale | string | null | undefined) {
  const locale = resolveSiteLocale(localeInput);
  return getCollection(collectionByLocale[locale]);
}

export async function getLocalizedCommandEntry(
  localeInput: SiteLocale | string | null | undefined,
  slug: string,
) {
  const entries = await getLocalizedCommandEntries(localeInput);
  return entries.find((entry) => entry.data.slug === slug);
}

