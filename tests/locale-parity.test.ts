import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { locales as hagilightLocales } from '@hagicode/hagilight-starlight/locales';
import commandCatalog from '@/lib/generated/command-catalog.json';
import {
  normalizeSiteLocale,
  resolveSiteLocale,
  SUPPORTED_SITE_LOCALES,
} from '@/i18n/locale-metadata';

const PUBLISHED_TAGS = [
  'en-US',
  'zh-CN',
  'zh-Hant',
  'fr-FR',
  'de-DE',
  'es-ES',
  'ja-JP',
  'ko-KR',
  'pt-BR',
  'ru-RU',
] as const;

const REMOVED_TAGS = [
  'bg-BG',
  'cs-CZ',
  'da-DK',
  'el-GR',
  'es-419',
  'fi-FI',
  'hu-HU',
  'id-ID',
  'it-IT',
  'nb-NO',
  'nl-NL',
  'pl-PL',
  'pt-PT',
  'ro-RO',
  'sv-SE',
  'th-TH',
  'tr-TR',
  'uk-UA',
  'vi-VN',
];

function sorted(values: readonly string[]): string[] {
  return [...values].sort();
}

describe('supported language parity', () => {
  it('exposes exactly the ten published Hagilight languages', () => {
    expect(SUPPORTED_SITE_LOCALES).toHaveLength(10);
    expect(SUPPORTED_SITE_LOCALES).toEqual(PUBLISHED_TAGS);
  });

  it('keeps the site locale metadata, Hagilight map, and catalog in exact parity', () => {
    const publishedTags = sorted(
      Object.values(hagilightLocales).map((definition) => definition.lang),
    );
    const siteTags = sorted([...SUPPORTED_SITE_LOCALES]);
    const catalogTags = sorted([...commandCatalog.locales]);

    expect(publishedTags).toEqual([...PUBLISHED_TAGS].sort());
    expect(siteTags).toEqual(publishedTags);
    expect(catalogTags).toEqual(publishedTags);
  });

  it('keeps every supported locale record in the generated catalog', () => {
    for (const command of commandCatalog.commands) {
      for (const locale of PUBLISHED_TAGS) {
        expect(command.locales[locale]).toBeTruthy();
        expect(Object.keys(command.locales[locale].alternateLocalePaths)).toHaveLength(10);
      }
    }
  });

  it('excludes removed locales from the supported set and catalog', () => {
    for (const locale of REMOVED_TAGS) {
      expect(SUPPORTED_SITE_LOCALES).not.toContain(locale);
      expect(commandCatalog.locales).not.toContain(locale);
    }
  });

  it('keeps no unsupported command source directories on disk', () => {
    const commandsRoot = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content', 'commands');
    const directories = readdirSync(commandsRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    for (const locale of REMOVED_TAGS) {
      expect(directories).not.toContain(locale);
    }

    expect(directories).toEqual([...PUBLISHED_TAGS].sort());
  });
});

describe('unsupported preference resolution', () => {
  it('resolves removed stored or browser preferences to a supported language', () => {
    expect(resolveSiteLocale('bg-BG')).toBe('en-US');
    expect(resolveSiteLocale('it-IT')).toBe('en-US');
    expect(resolveSiteLocale('nl-NL')).toBe('en-US');
    expect(normalizeSiteLocale('xx-YY')).toBeNull();
    expect(resolveSiteLocale('xx-YY')).toBe('en-US');
  });

  it('keeps retained regional aliases on their supported language', () => {
    expect(normalizeSiteLocale('zh-TW')).toBe('zh-Hant');
    expect(normalizeSiteLocale('zh-hk')).toBe('zh-Hant');
    expect(normalizeSiteLocale('zh-SG')).toBe('zh-CN');
    expect(normalizeSiteLocale('en')).toBe('en-US');
    expect(normalizeSiteLocale('pt')).toBe('pt-BR');
    expect(normalizeSiteLocale('pt-PT')).toBe('pt-BR');
  });
});