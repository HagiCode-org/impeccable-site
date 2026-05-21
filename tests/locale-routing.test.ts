import { describe, expect, it } from 'vitest';

import { getLocalizedPath, stripLocalePrefix } from '@/lib/i18n/locale-routing';

describe('locale routing', () => {
  it('keeps the default locale unprefixed', () => {
    expect(getLocalizedPath('/docs/craft/', 'en-US')).toBe('/docs/craft/');
  });

  it('prefixes non-default locales', () => {
    expect(getLocalizedPath('/docs/craft/', 'zh-CN')).toBe('/zh-CN/docs/craft/');
  });

  it('strips supported locale prefixes', () => {
    expect(stripLocalePrefix('/zh-CN/docs/craft/')).toBe('/docs/craft/');
  });
});

