import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import type { Loader } from 'astro/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import { hagilightSchema } from '@hagicode/hagilight-starlight/schema';
import { i18nLoader } from '@astrojs/starlight/loaders';
import { z } from 'astro/zod';

import { getStarlightCatalog, getStarlightDocId } from './lib/starlight/config';

const commandCatalog = getStarlightCatalog();

const SUPPORTED_LOCALES = commandCatalog.locales;
const SUPPORTED_LOCALE_BRACE = SUPPORTED_LOCALES.join(',');
const MARKDOWN_PATTERN = 'md,mdx,markdown,mdown,mkdn,mkd,mdwn';

// Restrict loading to the English overview, the supported localized overview
// sources, and the supported command source directories so a reintroduced
// unsupported translation can never generate a public route.
const commandContentLoader = glob({
  pattern: [
    `docs/[^_]*.{${MARKDOWN_PATTERN}}`,
    `docs/{${SUPPORTED_LOCALE_BRACE}}/**/[^_]*.{${MARKDOWN_PATTERN}}`,
    `commands/{${SUPPORTED_LOCALE_BRACE}}/**/[^_]*.{${MARKDOWN_PATTERN}}`,
  ],
  base: './src/content',
  generateId: ({ entry }) => getStarlightDocId(entry),
});

const docsLoader: Loader = {
  name: 'impeccable-starlight-docs',
  async load(context) {
    await commandContentLoader.load(context);

    const defaultOverview = context.store.get('docs');
    if (!defaultOverview) {
      throw new Error('Missing the default Starlight docs overview entry.');
    }

    for (const locale of commandCatalog.locales) {
      if (locale === 'en-US' || context.store.has(`${locale}/docs`)) {
        continue;
      }

      context.store.set({
        ...defaultOverview,
        id: `${locale}/docs`,
      });
    }
  },
};

const commandSchema = z.object({
  slug: z.string().min(1),
  summary: z.string().min(1),
  seoTitle: z.string().min(1).optional(),
  seoDescription: z.string().min(1).optional(),
  routeSlug: z.string().min(1).optional(),
  highlights: z.array(z.string().min(1)).default([]),
  related: z.array(z.string().min(1)).default([]),
});

const docsMetadataSchema = commandSchema
  .extend(hagilightSchema.shape);

export const collections = {
  docs: defineCollection({
    loader: docsLoader,
    schema: (context) => docsSchema({ extend: docsMetadataSchema })(context).transform((data) => {
      const description = data.seoDescription ?? data.description ?? data.summary;

      return {
        ...data,
        description,
        seo: {
          ...data.seo,
          title: data.seoTitle ?? data.seo?.title,
          description: data.seoDescription ?? data.seo?.description ?? description,
        },
      };
    }),
  }),
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
};