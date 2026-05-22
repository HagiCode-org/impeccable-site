import { describe, expect, it } from 'vitest';

import {
  getLocalizedPath,
  normalizePathname,
  resolveLocaleFromPathname,
  stripLocalePrefix,
} from '@/lib/i18n/locale-routing';

describe('locale routing', () => {
  it('keeps the default locale unprefixed', () => {
    expect(getLocalizedPath('/docs/craft/', 'en-US')).toBe('/docs/craft/');
  });

  it('prefixes non-default locales', () => {
    expect(getLocalizedPath('/docs/craft/', 'zh-CN')).toBe('/zh-CN/docs/craft/');
    expect(getLocalizedPath('/docs/craft/', 'fr-FR')).toBe('/fr-FR/docs/craft/');
  });

  it('strips supported locale prefixes and aliases', () => {
    expect(stripLocalePrefix('/en-US/docs/craft/')).toBe('/docs/craft/');
    expect(stripLocalePrefix('/zh-CN/docs/craft/')).toBe('/docs/craft/');
    expect(stripLocalePrefix('/zh-TW/docs/craft/')).toBe('/docs/craft/');
  });

  it('resolves locale prefixes from the pathname', () => {
    expect(resolveLocaleFromPathname('/')).toBe('en-US');
    expect(resolveLocaleFromPathname('/en-US/docs/')).toBe('en-US');
    expect(resolveLocaleFromPathname('/fr-FR/docs/')).toBe('fr-FR');
    expect(resolveLocaleFromPathname('/zh-TW/docs/')).toBe('zh-Hant');
  });

  it('normalizes repeated slashes', () => {
    expect(normalizePathname('///fr-FR//docs//craft//')).toBe('/fr-FR/docs/craft');
  });
});
