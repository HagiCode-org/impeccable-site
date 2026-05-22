import { readFileSync } from 'node:fs';

import { load } from 'js-yaml';
import { describe, expect, it } from 'vitest';

import commandCatalog from '@/lib/generated/command-catalog.json';
import { SUPPORTED_SITE_LOCALES } from '@/i18n/locale-metadata';
import {
  getCommandAlternateLocalePaths,
  getCommandPath,
  getCommandRecord,
  getCommandRecordByLocaleRoute,
  getLocalizedCommandContent,
} from '@/lib/catalog/command-catalog';
import { buildCommandCatalog } from '../scripts/build-command-catalog.mjs';

function readFrontmatterSummary(relativePath: string): string {
  const sourceText = readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');
  const match = sourceText.match(/^---\n([\s\S]*?)\n---\n?/u);

  if (!match) {
    throw new Error(`Missing frontmatter in ${relativePath}`);
  }

  const frontmatter = load(match[1]) as { summary?: string };

  if (!frontmatter.summary) {
    throw new Error(`Missing summary in ${relativePath}`);
  }

  return frontmatter.summary;
}

describe('command catalog', () => {
  it('contains every supported locale for every command', () => {
    for (const command of commandCatalog.commands) {
      for (const locale of SUPPORTED_SITE_LOCALES) {
        expect(command.locales[locale]).toBeTruthy();
      }
    }
  });

  it('keeps stable top-level category order', () => {
    expect(commandCatalog.categoryOrder).toEqual(['create', 'evaluate', 'refine', 'simplify', 'harden', 'system']);
  });

  it('resolves locale route slugs back to canonical commands', () => {
    for (const command of commandCatalog.commands) {
      for (const locale of SUPPORTED_SITE_LOCALES) {
        expect(getCommandRecordByLocaleRoute(locale, command.locales[locale].routeSlug)?.canonicalId).toBe(command.canonicalId);
      }
    }
  });

  it('exposes alternate locale paths and localized content for command pages', () => {
    const command = getCommandRecord(commandCatalog.commands[0].canonicalId);
    expect(command).toBeTruthy();
    if (!command) {
      return;
    }

    const alternatePaths = getCommandAlternateLocalePaths(command.canonicalId);

    expect(getCommandPath(command.canonicalId, 'en-US')).toBe(command.locales['en-US'].routePath);
    expect(getCommandPath(command.canonicalId, 'fr-FR')).toBe(command.locales['fr-FR'].routePath);
    expect(getLocalizedCommandContent(command, 'zh-Hant').title).toBe(command.locales['zh-Hant'].title);
    expect(getLocalizedCommandContent(command, 'fr-FR').title).toBe(command.locales['fr-FR'].title);
    expect(alternatePaths['en-US']).toBe(command.locales['en-US'].routePath);
    expect(alternatePaths['fr-FR']).toBe(command.locales['fr-FR'].routePath);
    expect(Object.keys(alternatePaths)).toHaveLength(SUPPORTED_SITE_LOCALES.length);
  });

  it('keeps localized MDX frontmatter for non-English and non-Chinese locales', () => {
    expect(readFrontmatterSummary('src/content/commands/fr-FR/impeccable.mdx')).toBe(
      "L'intelligence de conception derrière chaque commande.",
    );
    expect(readFrontmatterSummary('src/content/commands/zh-Hant/impeccable.mdx')).toBe('每個指令背後的設計智慧引擎。');
  });

  it('fails generation on per-locale route collisions', async () => {
    const collidedLocalizations = {
      locales: [...SUPPORTED_SITE_LOCALES],
      commands: Object.fromEntries(
        commandCatalog.commands.map((command) => [command.canonicalId, structuredClone(command.locales)]),
      ),
    };
    const commandIds = Object.keys(collidedLocalizations.commands) as Array<keyof typeof collidedLocalizations.commands>;
    const [firstId, secondId] = commandIds;

    collidedLocalizations.commands[secondId]['fr-FR'].routeSlug =
      collidedLocalizations.commands[firstId]['fr-FR'].routeSlug;

    await expect(buildCommandCatalog({ localizedContent: collidedLocalizations, supportedLocales: [...SUPPORTED_SITE_LOCALES] })).rejects.toThrow(
      /Route collision/,
    );
  });
});
