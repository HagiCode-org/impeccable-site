import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { load } from 'js-yaml';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(scriptDirectory, '..');
const vendorContentDirectory = path.join(siteRoot, 'vendor/impeccable/site/content/skills');
const vendorCategoryDataPath = path.join(siteRoot, 'vendor/impeccable/site/data/sub-pages-data.ts');
const vendorMetadataPath = path.join(siteRoot, 'vendor/impeccable/skill/scripts/command-metadata.json');
const localContentRoot = path.join(siteRoot, 'src/content/commands');
const generatedCatalogPath = path.join(siteRoot, 'src/lib/generated/command-catalog.json');
const supportedLocales = ['en-US', 'zh-CN'];

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function formatJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function parseFrontmatter(sourceText, sourcePath) {
  const match = sourceText.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/u);
  assert(match, `${sourcePath} must include YAML frontmatter`);
  const frontmatter = load(match[1]);
  assert(isPlainObject(frontmatter), `${sourcePath} frontmatter must be a mapping`);
  return {
    frontmatter,
    body: match[2].trim(),
  };
}

function stripMarkdown(value) {
  return value
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/[*_>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function readExportLiteral(sourceText, exportName) {
  const exportIndex = sourceText.indexOf(`export const ${exportName}`);
  assert(exportIndex >= 0, `Could not find export ${exportName} in ${path.relative(siteRoot, vendorCategoryDataPath)}`);
  const equalsIndex = sourceText.indexOf('=', exportIndex);
  assert(equalsIndex >= 0, `Could not find initializer for export ${exportName}`);

  let index = equalsIndex + 1;
  let depth = 0;
  let quote = null;
  let previous = '';

  while (index < sourceText.length && /\s/u.test(sourceText[index])) {
    index += 1;
  }

  const literalStart = index;

  for (; index < sourceText.length; index += 1) {
    const character = sourceText[index];

    if (quote) {
      if (character === quote && previous !== '\\') {
        quote = null;
      }
      previous = character;
      continue;
    }

    if (character === '\'' || character === '"') {
      quote = character;
      previous = character;
      continue;
    }

    if (character === '{' || character === '[') {
      depth += 1;
    } else if (character === '}' || character === ']') {
      depth -= 1;
    } else if (character === ';' && depth === 0) {
      const literal = sourceText.slice(literalStart, index).trim();
      return Function(`return (${literal});`)();
    }

    previous = character;
  }

  throw new Error(`Could not parse export ${exportName}`);
}

async function assertPathExists(targetPath) {
  await fs.access(targetPath).catch(() => {
    throw new Error(`Missing required vendor input: ${path.relative(siteRoot, targetPath)}`);
  });
}

async function readVendorSkillFiles() {
  await assertPathExists(vendorContentDirectory);
  const entries = await fs.readdir(vendorContentDirectory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name.replace(/\.md$/u, ''))
    .sort();
}

async function readVendorCommandSource() {
  await Promise.all([
    assertPathExists(vendorCategoryDataPath),
    assertPathExists(vendorMetadataPath),
  ]);

  const skillSlugs = await readVendorSkillFiles();
  const categorySourceText = await fs.readFile(vendorCategoryDataPath, 'utf8');
  const metadata = JSON.parse(await fs.readFile(vendorMetadataPath, 'utf8'));
  const skillCategories = readExportLiteral(categorySourceText, 'SKILL_CATEGORIES');
  const categoryOrder = readExportLiteral(categorySourceText, 'CATEGORY_ORDER');
  const categoryLabels = readExportLiteral(categorySourceText, 'CATEGORY_LABELS');
  const categoryDescriptions = readExportLiteral(categorySourceText, 'CATEGORY_DESCRIPTIONS');
  const commandRelationships = readExportLiteral(categorySourceText, 'COMMAND_RELATIONSHIPS');
  const vendorOrder = Object.keys(skillCategories).filter((slug) => skillSlugs.includes(slug));

  const categoryOffsets = new Map();
  const commands = [];

  for (const slug of vendorOrder) {
    const sourcePath = path.join(vendorContentDirectory, `${slug}.md`);
    const vendorSourceText = await fs.readFile(sourcePath, 'utf8');
    const { frontmatter, body } = parseFrontmatter(vendorSourceText, path.relative(siteRoot, sourcePath));
    const categoryId = skillCategories[slug];
    assert(categoryId, `Missing category mapping for vendor slug ${slug}`);
    const orderInCategory = categoryOffsets.get(categoryId) ?? 0;
    categoryOffsets.set(categoryId, orderInCategory + 1);
    const metadataEntry = metadata[slug] ?? {};
    const firstParagraph = stripMarkdown(body.split(/\n\n+/u).find(Boolean) ?? '');

    commands.push({
      slug,
      commandName: slug === 'impeccable' ? '/impeccable' : `/impeccable ${slug}`,
      categoryId,
      orderInCategory,
      tagline: String(frontmatter.tagline ?? firstParagraph),
      description: String(metadataEntry.description ?? firstParagraph),
      argumentHint: String(metadataEntry.argumentHint ?? ''),
      sourcePath: path.relative(siteRoot, sourcePath),
      relationships: commandRelationships[slug] ?? {},
    });
  }

  return {
    categoryOrder,
    categoryLabels,
    categoryDescriptions,
    commands,
  };
}

async function readLocalizedCommandEntries(locale) {
  const localeDirectory = path.join(localContentRoot, locale);
  await assertPathExists(localeDirectory);
  const entries = await fs.readdir(localeDirectory, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.mdx'))
    .map((entry) => entry.name)
    .sort();
  const localizedEntries = new Map();

  for (const fileName of files) {
    const sourcePath = path.join(localeDirectory, fileName);
    const sourceText = await fs.readFile(sourcePath, 'utf8');
    const slugFromFile = fileName.replace(/\.mdx$/u, '');
    const { frontmatter, body } = parseFrontmatter(sourceText, path.relative(siteRoot, sourcePath));
    const slug = String(frontmatter.slug ?? slugFromFile);

    assert.equal(slug, slugFromFile, `${path.relative(siteRoot, sourcePath)} slug must match the filename`);
    assert(body.length > 0, `${path.relative(siteRoot, sourcePath)} must include body content`);

    localizedEntries.set(slug, {
      slug,
      title: String(frontmatter.title ?? ''),
      summary: String(frontmatter.summary ?? ''),
      seoTitle: frontmatter.seoTitle ? String(frontmatter.seoTitle) : undefined,
      seoDescription: frontmatter.seoDescription ? String(frontmatter.seoDescription) : undefined,
      highlights: Array.isArray(frontmatter.highlights) ? frontmatter.highlights.map(String) : [],
      related: Array.isArray(frontmatter.related) ? frontmatter.related.map(String) : [],
      contentPath: path.relative(siteRoot, sourcePath),
    });
  }

  return localizedEntries;
}

export async function buildCommandCatalog(options = {}) {
  const vendorSource = await readVendorCommandSource();
  const localizedEntriesByLocale = Object.fromEntries(
    await Promise.all(
      supportedLocales.map(async (locale) => [locale, await readLocalizedCommandEntries(locale)]),
    ),
  );

  for (const locale of supportedLocales) {
    for (const slug of localizedEntriesByLocale[locale].keys()) {
      assert(
        vendorSource.commands.some((command) => command.slug === slug),
        `Unmatched local slug ${slug} in ${locale}`,
      );
    }
  }

  const commands = vendorSource.commands.map((command) => {
    const locales = {};

    for (const locale of supportedLocales) {
      const localizedEntry = localizedEntriesByLocale[locale].get(command.slug);
      assert(localizedEntry, `Missing command entry for ${locale}/${command.slug}`);
      locales[locale] = localizedEntry;
    }

    return {
      ...command,
      locales,
    };
  });

  return {
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    locales: supportedLocales,
    categoryOrder: vendorSource.categoryOrder,
    categoryLabels: vendorSource.categoryLabels,
    categoryDescriptions: vendorSource.categoryDescriptions,
    commands,
  };
}

export async function generateCommandCatalog() {
  const catalog = await buildCommandCatalog({ generatedAt: new Date().toISOString() });
  await fs.mkdir(path.dirname(generatedCatalogPath), { recursive: true });
  await fs.writeFile(generatedCatalogPath, formatJson(catalog), 'utf8');
}

export async function verifyCommandCatalog() {
  const existing = await fs.readFile(generatedCatalogPath, 'utf8').catch(() => '');
  const existingGeneratedAt = existing ? JSON.parse(existing).generatedAt : undefined;
  const catalog = await buildCommandCatalog({ generatedAt: existingGeneratedAt });
  assert.equal(existing, formatJson(catalog), 'Generated command catalog is stale; rerun npm run catalog:generate');
}

if (process.argv.includes('--check')) {
  await verifyCommandCatalog();
} else {
  await generateCommandCatalog();
}
