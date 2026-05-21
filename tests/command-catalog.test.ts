import { describe, expect, it } from 'vitest';

import commandCatalog from '@/lib/generated/command-catalog.json';

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
});
