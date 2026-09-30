import commandCatalogData from '../generated/command-catalog.json';
import { locales as hagilightLocales, type LocaleDefinition } from '@hagicode/hagilight-starlight/locales';

interface StarlightCatalog {
  locales: string[];
  categoryOrder: string[];
  categoryLabels: Record<string, string>;
  commands: Array<{
    slug: string;
    categoryId: string;
    orderInCategory: number;
    localeRouteSlugs: Record<string, string>;
    localePaths: Record<string, string>;
  }>;
}

const commandCatalog = commandCatalogData as StarlightCatalog;
const defaultLocale = 'en-US';
const hagilightLocalesByLanguage: ReadonlyMap<string, LocaleDefinition> = new Map(
  Object.values(hagilightLocales).map((locale) => [locale.lang, locale] as const),
);

const categoryTranslations: Record<string, Record<string, string>> = {
  create: { 'zh-CN': '创建', 'zh-Hant': '建立' },
  evaluate: { 'zh-CN': '评估', 'zh-Hant': '評估' },
  refine: { 'zh-CN': '优化', 'zh-Hant': '精煉' },
  simplify: { 'zh-CN': '简化', 'zh-Hant': '簡化' },
  harden: { 'zh-CN': '加固', 'zh-Hant': '強化' },
  system: { 'zh-CN': '系统', 'zh-Hant': '系統' },
};

function getLocalizedLanguageLabel(locale: string): string {
  return new Intl.DisplayNames([locale], { type: 'language' }).of(locale) ?? locale;
}

export function getStarlightLocales() {
  return Object.fromEntries(
    commandCatalog.locales.map((locale) => {
      const path = locale === defaultLocale ? 'root' : locale;
      const sharedLocale = hagilightLocalesByLanguage.get(locale);

      return [
        path,
        sharedLocale ?? {
          label: getLocalizedLanguageLabel(locale),
          lang: locale,
        },
      ];
    }),
  );
}

export function getStarlightSidebar() {
  return [
    {
      slug: 'docs',
      label: 'Overview',
      translations: { 'zh-CN': '总览', 'zh-Hant': '總覽' },
    },
    ...commandCatalog.categoryOrder.map((categoryId) => ({
      label: commandCatalog.categoryLabels[categoryId],
      translations: categoryTranslations[categoryId],
      items: commandCatalog.commands
        .filter((command) => command.categoryId === categoryId)
        .sort((left, right) => left.orderInCategory - right.orderInCategory)
        .map((command) => ({
          slug: `docs/${command.localeRouteSlugs[defaultLocale]}`,
        })),
    })),
  ];
}

export function getStarlightDocId(entry: string): string {
  const normalizedEntry = entry.replace(/\\/gu, '/').replace(/^\/+/u, '');
  const segments = normalizedEntry.split('/');
  const source = segments[0];

  if (source === 'docs') {
    const contentPath = segments.slice(1).join('/').replace(/\.[^/.]+$/u, '');
    const [locale, ...localizedPath] = contentPath.split('/');

    if (commandCatalog.locales.includes(locale)) {
      const localizedSlug = localizedPath.join('/');
      return localizedSlug === 'index' ? `${locale}/docs` : `${locale}/docs/${localizedSlug}`;
    }

    return contentPath === 'index' ? 'docs' : `docs/${contentPath}`;
  }

  if (source !== 'commands' || segments.length !== 3) {
    throw new Error(`Unsupported impeccable docs source path: ${entry}`);
  }

  const [, locale, filename] = segments;
  const commandSlug = filename.replace(/\.[^/.]+$/u, '');
  const command = commandCatalog.commands.find((candidate) => candidate.slug === commandSlug);
  const routeSlug = command?.localeRouteSlugs[locale];

  if (!routeSlug) {
    throw new Error(`No localized command route for ${locale}/${commandSlug}`);
  }

  return locale === defaultLocale ? `docs/${routeSlug}` : `${locale}/docs/${routeSlug}`;
}

export function getStarlightCatalog() {
  return commandCatalog;
}
