import type { SiteI18nNamespace } from './namespaces';
import type { SiteLocale } from './locale-metadata';

import enCommon from './generated-locales/en-US/common.json';
import enDocs from './generated-locales/en-US/docs.json';
import zhCommon from './generated-locales/zh-CN/common.json';
import zhDocs from './generated-locales/zh-CN/docs.json';

type SiteTranslationResources = Partial<Record<SiteLocale, Partial<Record<SiteI18nNamespace, unknown>>>>;

export const TRANSLATION_RESOURCES: SiteTranslationResources = {
  'en-US': {
    common: enCommon,
    docs: enDocs,
  },
  'zh-CN': {
    common: zhCommon,
    docs: zhDocs,
  },
};

export function getServerTranslationResources() {
  return TRANSLATION_RESOURCES;
}
