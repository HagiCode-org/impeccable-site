import {
  resolveSiteLocale,
  type SiteLocale,
} from '@/i18n/locale-metadata';
import type { SiteI18nNamespace } from '@/i18n/namespaces';
import { getServerTranslationResources } from '@/i18n/translation-resources';

type TranslationLeaf = string | number | boolean | null;
interface TranslationRecord {
  [key: string]: TranslationValue;
}

interface TranslationArray extends Array<TranslationValue> {}

type TranslationValue = TranslationLeaf | TranslationArray | TranslationRecord;

function getNestedValue(input: TranslationValue | undefined, segments: readonly string[]): TranslationValue | undefined {
  let current = input;

  for (const segment of segments) {
    if (Array.isArray(current)) {
      if (!/^(?:0|[1-9]\d*)$/u.test(segment)) {
        return undefined;
      }

      current = current[Number(segment)];
      continue;
    }

    if (!current || typeof current !== 'object') {
      return undefined;
    }

    current = (current as Record<string, TranslationValue>)[segment];
  }

  return current;
}

export function getLocaleResourceValue(
  localeInput: SiteLocale | string | null | undefined,
  namespace: SiteI18nNamespace,
  key: string,
): TranslationValue | undefined {
  const locale = resolveSiteLocale(localeInput);
  const resources = getServerTranslationResources();
  return getNestedValue(resources[locale]?.[namespace] as TranslationValue | undefined, key.split('.'));
}

export function t(
  localeInput: SiteLocale | string | null | undefined,
  namespace: SiteI18nNamespace,
  key: string,
): string {
  const value = getLocaleResourceValue(localeInput, namespace, key);

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  throw new Error(`Missing localized string for ${namespace}.${key} (${localeInput ?? 'default'})`);
}
