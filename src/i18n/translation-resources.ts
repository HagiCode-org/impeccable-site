import enCommon from './generated-locales/en-US/common.json';
import enDocs from './generated-locales/en-US/docs.json';
import zhCommon from './generated-locales/zh-CN/common.json';
import zhDocs from './generated-locales/zh-CN/docs.json';

export const TRANSLATION_RESOURCES = {
  'en-US': {
    common: enCommon,
    docs: enDocs,
  },
  'zh-CN': {
    common: zhCommon,
    docs: zhDocs,
  },
} as const;

export function getServerTranslationResources() {
  return TRANSLATION_RESOURCES;
}
