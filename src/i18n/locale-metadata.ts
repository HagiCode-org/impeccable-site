export const DEFAULT_LOCALE = 'en-US' as const;

const SITE_LOCALE_DEFINITIONS = [
  {
    code: 'en-US',
    name: 'English',
    nativeName: 'English',
    shortLabel: 'EN',
    fallbackCodes: ['en-US'],
    aliases: ['en', 'en-us'],
  },
  {
    code: 'zh-CN',
    name: 'Simplified Chinese',
    nativeName: '简体中文',
    shortLabel: '简中',
    fallbackCodes: ['en-US'],
    aliases: ['zh', 'zh-cn', 'zh-hans', 'zh-sg'],
  },
  {
    code: 'zh-Hant',
    name: 'Traditional Chinese',
    nativeName: '繁體中文',
    shortLabel: '繁中',
    fallbackCodes: ['zh-CN', 'en-US'],
    aliases: ['zh-hant', 'zh-tw', 'zh-hk', 'zh-mo'],
  },
  {
    code: 'fr-FR',
    name: 'French',
    nativeName: 'Français',
    shortLabel: 'FR',
    fallbackCodes: ['en-US'],
    aliases: ['fr', 'fr-fr'],
  },
  {
    code: 'de-DE',
    name: 'German',
    nativeName: 'Deutsch',
    shortLabel: 'DE',
    fallbackCodes: ['en-US'],
    aliases: ['de', 'de-de'],
  },
  {
    code: 'es-ES',
    name: 'Spanish (Spain)',
    nativeName: 'Español (España)',
    shortLabel: 'ES',
    fallbackCodes: ['en-US'],
    aliases: ['es', 'es-es'],
  },
  {
    code: 'ja-JP',
    name: 'Japanese',
    nativeName: '日本語',
    shortLabel: '日本',
    fallbackCodes: ['en-US'],
    aliases: ['ja', 'ja-jp'],
  },
  {
    code: 'ko-KR',
    name: 'Korean',
    nativeName: '한국어',
    shortLabel: '한국',
    fallbackCodes: ['en-US'],
    aliases: ['ko', 'ko-kr'],
  },
  {
    code: 'pt-BR',
    name: 'Portuguese (Brazil)',
    nativeName: 'Português (Brasil)',
    shortLabel: 'PT-BR',
    fallbackCodes: ['en-US'],
    aliases: ['pt', 'pt-br'],
  },
  {
    code: 'ru-RU',
    name: 'Russian',
    nativeName: 'Русский',
    shortLabel: 'RU',
    fallbackCodes: ['en-US'],
    aliases: ['ru', 'ru-ru'],
  },
] as const;

export type SiteLocale = (typeof SITE_LOCALE_DEFINITIONS)[number]['code'];

export interface SiteLocaleDefinition {
  readonly code: SiteLocale;
  readonly name: string;
  readonly nativeName: string;
  readonly shortLabel: string;
  readonly fallbackCodes: readonly SiteLocale[];
  readonly aliases: readonly string[];
}

export const SITE_LOCALES: readonly SiteLocaleDefinition[] = SITE_LOCALE_DEFINITIONS;
export const SUPPORTED_SITE_LOCALES = SITE_LOCALES.map((locale) => locale.code) as readonly SiteLocale[];

const siteLocaleByCode = new Map<SiteLocale, SiteLocaleDefinition>(
  SITE_LOCALES.map((locale) => [locale.code, locale] as const),
);

function canonicalizeLocale(locale: string): string {
  const candidate = locale.trim().replace(/_/g, '-');
  if (!candidate) {
    return '';
  }

  try {
    return Intl.getCanonicalLocales(candidate)[0] ?? candidate;
  } catch {
    return candidate;
  }
}

function buildAliasMap() {
  const aliases = new Map<string, SiteLocale>();

  for (const locale of SITE_LOCALES) {
    aliases.set(locale.code.toLowerCase(), locale.code);

    for (const alias of locale.aliases) {
      const canonicalAlias = canonicalizeLocale(alias).toLowerCase();
      aliases.set(canonicalAlias || alias.toLowerCase(), locale.code);
    }
  }

  return aliases;
}

const siteLocaleByNormalizedInput = buildAliasMap();
const siteLocaleByLanguage = new Map<string, SiteLocale>(
  SITE_LOCALES.map((locale) => [locale.code.split('-')[0].toLowerCase(), locale.code] as const),
);

export function getSiteLocaleDefinition(locale: SiteLocale): SiteLocaleDefinition {
  const definition = siteLocaleByCode.get(locale);
  if (!definition) {
    throw new Error(`Unsupported site locale: ${locale}`);
  }

  return definition;
}

export function getSiteLocaleFallbackChain(locale: SiteLocale): readonly SiteLocale[] {
  return getSiteLocaleDefinition(locale).fallbackCodes;
}

export function normalizeSiteLocale(value: string | null | undefined): SiteLocale | null {
  if (!value) {
    return null;
  }

  const canonical = canonicalizeLocale(value);
  const normalized = canonical.toLowerCase();
  if (!normalized) {
    return null;
  }

  const directMatch = siteLocaleByNormalizedInput.get(normalized);
  if (directMatch) {
    return directMatch;
  }

  const [languagePart] = normalized.split('-');
  return siteLocaleByLanguage.get(languagePart) ?? null;
}

export function resolveSiteLocale(value: string | null | undefined): SiteLocale {
  return normalizeSiteLocale(value) ?? DEFAULT_LOCALE;
}

export function getNonDefaultSiteLocales(): readonly SiteLocale[] {
  return SUPPORTED_SITE_LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);
}