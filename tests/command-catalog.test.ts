import { describe, expect, it } from 'vitest';

import commandCatalog from '@/lib/generated/command-catalog.json';
import {
  getCommandAlternateLocalePaths,
  getCommandPath,
  getCommandRecord,
  getCommandRecordByLocaleRoute,
  getLocalizedCommandContent,
} from '@/lib/catalog/command-catalog';
import { buildCommandCatalog } from '../scripts/build-command-catalog.mjs';

describe('command catalog', () => {
  it('contains both source locales for every command', () => {
    for (const command of commandCatalog.commands) {
      expect(command.locales['en-US']).toBeTruthy();
      expect(command.locales['zh-CN']).toBeTruthy();
    }
  });

  it('keeps stable top-level category order', () => {
    expect(commandCatalog.categoryOrder).toEqual(['create', 'evaluate', 'refine', 'simplify', 'harden', 'system']);
  });

  it('resolves locale route slugs back to canonical commands', () => {
    for (const command of commandCatalog.commands) {
      expect(getCommandRecordByLocaleRoute('en-US', command.locales['en-US'].routeSlug)?.canonicalId).toBe(command.canonicalId);
      expect(getCommandRecordByLocaleRoute('zh-CN', command.locales['zh-CN'].routeSlug)?.canonicalId).toBe(command.canonicalId);
      expect(getCommandRecordByLocaleRoute('fr-FR', command.locales['en-US'].routeSlug)?.canonicalId).toBe(command.canonicalId);
      expect(getCommandRecordByLocaleRoute('zh-Hant', command.locales['zh-CN'].routeSlug)?.canonicalId).toBe(command.canonicalId);
    }
  });

  it('exposes alternate locale paths and fallback content for command pages', () => {
    const command = getCommandRecord(commandCatalog.commands[0].canonicalId);
    expect(command).toBeTruthy();
    if (!command) {
      return;
    }

    const alternatePaths = getCommandAlternateLocalePaths(command.canonicalId);

    expect(getCommandPath(command.canonicalId, 'en-US')).toBe(command.locales['en-US'].routePath);
    expect(getCommandPath(command.canonicalId, 'fr-FR')).toBe(`/fr-FR/docs/${command.locales['en-US'].routeSlug}/`);
    expect(getLocalizedCommandContent(command, 'zh-Hant').title).toBe(command.locales['zh-CN'].title);
    expect(alternatePaths['en-US']).toBe(command.locales['en-US'].routePath);
    expect(alternatePaths['fr-FR']).toBe(`/fr-FR/docs/${command.locales['en-US'].routeSlug}/`);
    expect(Object.keys(alternatePaths)).toHaveLength(29);
  });

  it('fails generation on per-locale route collisions', async () => {
    const collidedLocalizations = {
      locales: ['en-US', 'zh-CN'],
      commands: Object.fromEntries(
        commandCatalog.commands.map((command) => [command.canonicalId, structuredClone(command.locales)]),
      ),
    };
    const commandIds = Object.keys(collidedLocalizations.commands) as Array<keyof typeof collidedLocalizations.commands>;
    const [firstId, secondId] = commandIds;

    collidedLocalizations.commands[secondId]['zh-CN'].routeSlug =
      collidedLocalizations.commands[firstId]['zh-CN'].routeSlug;

    await expect(buildCommandCatalog({ localizedContent: collidedLocalizations })).rejects.toThrow(
      /Route collision/,
    );
  });
});
