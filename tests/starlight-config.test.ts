import { describe, expect, it } from 'vitest';

import { SUPPORTED_SITE_LOCALES } from '@/i18n/locale-metadata';
import {
  getStarlightCatalog,
  getStarlightDocId,
  getStarlightLocales,
  getStarlightSidebar,
} from '@/lib/starlight/config';

describe('Starlight docs configuration', () => {
  it('maps every supported locale to a labeled Starlight locale', () => {
    const locales = getStarlightLocales();

    expect(Object.keys(locales)).toHaveLength(SUPPORTED_SITE_LOCALES.length);
    expect(locales.root).toMatchObject({ label: 'English', lang: 'en-US' });

    for (const locale of SUPPORTED_SITE_LOCALES) {
      const config = locales[locale === 'en-US' ? 'root' : locale];
      expect(config?.label).toBeTruthy();
      expect(config?.lang).toBe(locale);
    }
  });

  it('keeps overview and all command routes in the localized sidebar', () => {
    const sidebar = getStarlightSidebar();
    const commandLinks = sidebar.flatMap((item) => ('items' in item ? item.items : []));
    const catalog = getStarlightCatalog();

    expect(sidebar[0]).toMatchObject({
      slug: 'docs',
      translations: { 'zh-CN': '总览', 'zh-Hant': '總覽' },
    });
    expect(commandLinks.map((item) => item.slug)).toHaveLength(catalog.commands.length);
    expect(new Set(commandLinks.map((item) => item.slug)).size).toBe(catalog.commands.length);
  });

  it('projects each localized command source to a unique Starlight route ID', () => {
    const catalog = getStarlightCatalog();
    const ids = new Set<string>();

    for (const locale of catalog.locales) {
      for (const command of catalog.commands) {
        const sourceEntry = `commands/${locale}/${command.slug}.mdx`;
        const id = getStarlightDocId(sourceEntry);

        expect(ids.has(id)).toBe(false);
        ids.add(id);
        expect(id).toBe(
          locale === 'en-US'
            ? `docs/${command.localeRouteSlugs[locale]}`
            : `${locale}/docs/${command.localeRouteSlugs[locale]}`,
        );
      }
    }

    expect(ids.size).toBe(catalog.locales.length * catalog.commands.length);
    expect(getStarlightDocId('docs/index.mdx')).toBe('docs');
    expect(getStarlightDocId('docs/zh-CN/index.mdx')).toBe('zh-CN/docs');
  });

  it('rejects unsupported command content instead of fabricating a route', () => {
    expect(() => getStarlightDocId('commands/en-US/unknown.mdx')).toThrow(
      'No localized command route for en-US/unknown',
    );
    expect(() => getStarlightDocId('other/unknown.mdx')).toThrow(
      'Unsupported impeccable docs source path',
    );
  });

  it('rejects removed-locale command sources rather than publishing a route', () => {
    expect(() => getStarlightDocId('commands/bg-BG/impeccable.mdx')).toThrow(
      'No localized command route for bg-BG/impeccable',
    );
    expect(() => getStarlightDocId('commands/pt-PT/impeccable.mdx')).toThrow(
      'No localized command route for pt-PT/impeccable',
    );
  });

  it('exposes only the supported Hagilight labels for the chooser', () => {
    const locales = getStarlightLocales();

    expect(Object.keys(locales)).toHaveLength(SUPPORTED_SITE_LOCALES.length);
    expect(locales.root).toMatchObject({ label: 'English', lang: 'en-US' });
    expect(locales['zh-CN']).toMatchObject({ label: '简体中文', lang: 'zh-CN' });
    expect(locales['fr-FR']).toMatchObject({ label: 'Français', lang: 'fr-FR' });
    expect(locales['ru-RU']).toMatchObject({ label: 'Русский', lang: 'ru-RU' });
  });
});