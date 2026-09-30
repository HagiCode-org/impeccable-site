import { describe, expect, it } from 'vitest';

import { t } from '@/lib/i18n/ui';

describe('i18n fallback', () => {
  it('falls back to English resources for non-translated locales', () => {
    expect(t('fr-FR', 'common', 'entry.redirecting')).toBe('Redirecting to the command overview…');
  });

  it('falls back to Simplified Chinese resources for zh-Hant', () => {
    expect(t('zh-Hant', 'common', 'entry.redirecting')).toBe('正在跳转到命令总览…');
  });
});
