import { describe, expect, it } from 'vitest';

import { t } from '@/lib/i18n/ui';

describe('i18n fallback', () => {
  it('falls back to English resources for non-translated locales', () => {
    expect(t('fr-FR', 'common', 'navigation.source')).toBe('Upstream source');
  });

  it('falls back to Simplified Chinese resources for zh-Hant', () => {
    expect(t('zh-Hant', 'common', 'navigation.source')).toBe('上游源码');
  });
});
