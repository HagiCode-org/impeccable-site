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
    code: 'it-IT',
    name: 'Italian',
    nativeName: 'Italiano',
    shortLabel: 'IT',
    fallbackCodes: ['en-US'],
    aliases: ['it', 'it-it'],
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
    code: 'bg-BG',
    name: 'Bulgarian',
    nativeName: 'Български',
    shortLabel: 'BG',
    fallbackCodes: ['en-US'],
    aliases: ['bg', 'bg-bg'],
  },
  {
    code: 'cs-CZ',
    name: 'Czech',
    nativeName: 'Čeština',
    shortLabel: 'CS',
    fallbackCodes: ['en-US'],
    aliases: ['cs', 'cs-cz'],
  },
  {
    code: 'da-DK',
    name: 'Danish',
    nativeName: 'Dansk',
    shortLabel: 'DA',
    fallbackCodes: ['en-US'],
    aliases: ['da', 'da-dk'],
  },
  {
    code: 'nl-NL',
    name: 'Dutch',
    nativeName: 'Nederlands',
    shortLabel: 'NL',
    fallbackCodes: ['en-US'],
    aliases: ['nl', 'nl-nl'],
  },
  {
    code: 'fi-FI',
    name: 'Finnish',
    nativeName: 'Suomi',
    shortLabel: 'FI',
    fallbackCodes: ['en-US'],
    aliases: ['fi', 'fi-fi'],
  },
  {
    code: 'el-GR',
    name: 'Greek',
    nativeName: 'Ελληνικά',
    shortLabel: 'EL',
    fallbackCodes: ['en-US'],
    aliases: ['el', 'el-gr'],
  },
  {
    code: 'hu-HU',
    name: 'Hungarian',
    nativeName: 'Magyar',
    shortLabel: 'HU',
    fallbackCodes: ['en-US'],
    aliases: ['hu', 'hu-hu'],
  },
  {
    code: 'id-ID',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    shortLabel: 'ID',
    fallbackCodes: ['en-US'],
    aliases: ['id', 'id-id'],
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
    code: 'nb-NO',
    name: 'Norwegian',
    nativeName: 'Norsk',
    shortLabel: 'NO',
    fallbackCodes: ['en-US'],
    aliases: ['nb', 'nb-no', 'no', 'no-no'],
  },
  {
    code: 'pl-PL',
    name: 'Polish',
    nativeName: 'Polski',
    shortLabel: 'PL',
    fallbackCodes: ['en-US'],
    aliases: ['pl', 'pl-pl'],
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
    code: 'pt-PT',
    name: 'Portuguese (Portugal)',
    nativeName: 'Português (Portugal)',
    shortLabel: 'PT-PT',
    fallbackCodes: ['en-US'],
    aliases: ['pt-pt'],
  },
  {
    code: 'ro-RO',
    name: 'Romanian',
    nativeName: 'Română',
    shortLabel: 'RO',
    fallbackCodes: ['en-US'],
    aliases: ['ro', 'ro-ro'],
  },
  {
    code: 'ru-RU',
    name: 'Russian',
    nativeName: 'Русский',
    shortLabel: 'RU',
    fallbackCodes: ['en-US'],
    aliases: ['ru', 'ru-ru'],
  },
  {
    code: 'es-419',
    name: 'Spanish (Latin America)',
    nativeName: 'Español (Latinoamérica)',
    shortLabel: 'ES-LA',
    fallbackCodes: ['en-US'],
    aliases: ['es-419', 'es-latam'],
  },
  {
    code: 'sv-SE',
    name: 'Swedish',
    nativeName: 'Svenska',
    shortLabel: 'SV',
    fallbackCodes: ['en-US'],
    aliases: ['sv', 'sv-se'],
  },
  {
    code: 'th-TH',
    name: 'Thai',
    nativeName: 'ไทย',
    shortLabel: 'TH',
    fallbackCodes: ['en-US'],
    aliases: ['th', 'th-th'],
  },
  {
    code: 'tr-TR',
    name: 'Turkish',
    nativeName: 'Türkçe',
    shortLabel: 'TR',
    fallbackCodes: ['en-US'],
    aliases: ['tr', 'tr-tr'],
  },
  {
    code: 'uk-UA',
    name: 'Ukrainian',
    nativeName: 'Українська',
    shortLabel: 'UK',
    fallbackCodes: ['en-US'],
    aliases: ['uk', 'uk-ua'],
  },
  {
    code: 'vi-VN',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    shortLabel: 'VI',
    fallbackCodes: ['en-US'],
    aliases: ['vi', 'vi-vn'],
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
