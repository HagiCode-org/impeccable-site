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
  it('contains both supported locales for every command', () => {
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
    }
  });

  it('exposes alternate locale paths for command pages', () => {
    const command = getCommandRecord(commandCatalog.commands[0].canonicalId);
    expect(command).toBeTruthy();
    if (!command) {
      return;
    }

    expect(getCommandPath(command.canonicalId, 'en-US')).toBe(command.locales['en-US'].routePath);
    expect(getCommandAlternateLocalePaths(command.canonicalId)).toEqual(command.localePaths);
    expect(getLocalizedCommandContent(command, 'zh-CN').alternateLocalePaths['en-US']).toBe(command.localePaths['en-US']);
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
