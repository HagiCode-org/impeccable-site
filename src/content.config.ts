import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro:schema';

import { COMMAND_COLLECTION_BY_LOCALE } from './lib/content/command-source-locales';

const commandSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  seoTitle: z.string().min(1).optional(),
  seoDescription: z.string().min(1).optional(),
  routeSlug: z.string().min(1).optional(),
  highlights: z.array(z.string().min(1)).default([]),
  related: z.array(z.string().min(1)).default([]),
});

function defineCommandCollection(locale: keyof typeof COMMAND_COLLECTION_BY_LOCALE) {
  return defineCollection({
    loader: glob({ pattern: '**/*.mdx', base: `./src/content/commands/${locale}` }),
    schema: commandSchema,
  });
}

export const collections = {
  [COMMAND_COLLECTION_BY_LOCALE['bg-BG']]: defineCommandCollection('bg-BG'),
  [COMMAND_COLLECTION_BY_LOCALE['cs-CZ']]: defineCommandCollection('cs-CZ'),
  [COMMAND_COLLECTION_BY_LOCALE['da-DK']]: defineCommandCollection('da-DK'),
  [COMMAND_COLLECTION_BY_LOCALE['de-DE']]: defineCommandCollection('de-DE'),
  [COMMAND_COLLECTION_BY_LOCALE['el-GR']]: defineCommandCollection('el-GR'),
  [COMMAND_COLLECTION_BY_LOCALE['en-US']]: defineCommandCollection('en-US'),
  [COMMAND_COLLECTION_BY_LOCALE['es-419']]: defineCommandCollection('es-419'),
  [COMMAND_COLLECTION_BY_LOCALE['es-ES']]: defineCommandCollection('es-ES'),
  [COMMAND_COLLECTION_BY_LOCALE['fi-FI']]: defineCommandCollection('fi-FI'),
  [COMMAND_COLLECTION_BY_LOCALE['fr-FR']]: defineCommandCollection('fr-FR'),
  [COMMAND_COLLECTION_BY_LOCALE['hu-HU']]: defineCommandCollection('hu-HU'),
  [COMMAND_COLLECTION_BY_LOCALE['id-ID']]: defineCommandCollection('id-ID'),
  [COMMAND_COLLECTION_BY_LOCALE['it-IT']]: defineCommandCollection('it-IT'),
  [COMMAND_COLLECTION_BY_LOCALE['ja-JP']]: defineCommandCollection('ja-JP'),
  [COMMAND_COLLECTION_BY_LOCALE['ko-KR']]: defineCommandCollection('ko-KR'),
  [COMMAND_COLLECTION_BY_LOCALE['nb-NO']]: defineCommandCollection('nb-NO'),
  [COMMAND_COLLECTION_BY_LOCALE['nl-NL']]: defineCommandCollection('nl-NL'),
  [COMMAND_COLLECTION_BY_LOCALE['pl-PL']]: defineCommandCollection('pl-PL'),
  [COMMAND_COLLECTION_BY_LOCALE['pt-BR']]: defineCommandCollection('pt-BR'),
  [COMMAND_COLLECTION_BY_LOCALE['pt-PT']]: defineCommandCollection('pt-PT'),
  [COMMAND_COLLECTION_BY_LOCALE['ro-RO']]: defineCommandCollection('ro-RO'),
  [COMMAND_COLLECTION_BY_LOCALE['ru-RU']]: defineCommandCollection('ru-RU'),
  [COMMAND_COLLECTION_BY_LOCALE['sv-SE']]: defineCommandCollection('sv-SE'),
  [COMMAND_COLLECTION_BY_LOCALE['th-TH']]: defineCommandCollection('th-TH'),
  [COMMAND_COLLECTION_BY_LOCALE['tr-TR']]: defineCommandCollection('tr-TR'),
  [COMMAND_COLLECTION_BY_LOCALE['uk-UA']]: defineCommandCollection('uk-UA'),
  [COMMAND_COLLECTION_BY_LOCALE['vi-VN']]: defineCommandCollection('vi-VN'),
  [COMMAND_COLLECTION_BY_LOCALE['zh-CN']]: defineCommandCollection('zh-CN'),
  [COMMAND_COLLECTION_BY_LOCALE['zh-Hant']]: defineCommandCollection('zh-Hant'),
};
