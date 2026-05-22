import type { SiteLocale } from '../../i18n/locale-metadata';

export const COMMAND_COLLECTION_BY_LOCALE = {
  'bg-BG': 'commandsBgBG',
  'cs-CZ': 'commandsCsCZ',
  'da-DK': 'commandsDaDK',
  'de-DE': 'commandsDeDE',
  'el-GR': 'commandsElGR',
  'en-US': 'commandsEnUS',
  'es-419': 'commandsEs419',
  'es-ES': 'commandsEsES',
  'fi-FI': 'commandsFiFI',
  'fr-FR': 'commandsFrFR',
  'hu-HU': 'commandsHuHU',
  'id-ID': 'commandsIdID',
  'it-IT': 'commandsItIT',
  'ja-JP': 'commandsJaJP',
  'ko-KR': 'commandsKoKR',
  'nb-NO': 'commandsNbNO',
  'nl-NL': 'commandsNlNL',
  'pl-PL': 'commandsPlPL',
  'pt-BR': 'commandsPtBR',
  'pt-PT': 'commandsPtPT',
  'ro-RO': 'commandsRoRO',
  'ru-RU': 'commandsRuRU',
  'sv-SE': 'commandsSvSE',
  'th-TH': 'commandsThTH',
  'tr-TR': 'commandsTrTR',
  'uk-UA': 'commandsUkUA',
  'vi-VN': 'commandsViVN',
  'zh-CN': 'commandsZhCN',
  'zh-Hant': 'commandsZhHant',
} as const satisfies Record<SiteLocale, string>;

export type CommandCollectionName = (typeof COMMAND_COLLECTION_BY_LOCALE)[keyof typeof COMMAND_COLLECTION_BY_LOCALE];

export const COMMAND_CONTENT_LOCALES = Object.keys(COMMAND_COLLECTION_BY_LOCALE) as SiteLocale[];
