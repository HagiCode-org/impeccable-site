import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro:schema';

const commandSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  related: z.array(z.string()).default([]),
});

const commandsEnUs = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/commands/en-US' }),
  schema: commandSchema,
});

const commandsZhCn = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/commands/zh-CN' }),
  schema: commandSchema,
});

export const collections = {
  commandsEnUs,
  commandsZhCn,
};
