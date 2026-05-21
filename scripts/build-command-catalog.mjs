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

function normalizeStringArray(value) {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
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

function getLocalizedCommandPath(routeSlug, locale) {
  return locale === 'en-US' ? `/docs/${routeSlug}/` : `/${locale}/docs/${routeSlug}/`;
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

async function readLocalizedCommandEntry(locale, slug) {
  const contentPath = path.join(localContentRoot, locale, `${slug}.mdx`);
  await assertPathExists(contentPath);

  const contentSource = await fs.readFile(contentPath, 'utf8');
  const { frontmatter, body } = parseFrontmatter(contentSource, path.relative(siteRoot, contentPath));
  const routeSlug = String(frontmatter.routeSlug ?? slug);
  const relatedCommandIds = normalizeStringArray(frontmatter.related ?? frontmatter.relatedCommandIds);

  assert(frontmatter.title, `Missing title for ${locale}/${slug}`);
  assert(frontmatter.summary, `Missing summary for ${locale}/${slug}`);
  assert(body.length > 0, `${path.relative(siteRoot, contentPath)} must include body content`);
  assert.equal(String(frontmatter.slug ?? slug), slug, `${path.relative(siteRoot, contentPath)} slug must match canonical id ${slug}`);

  return {
    title: String(frontmatter.title),
    summary: String(frontmatter.summary),
    ...(frontmatter.seoTitle ? { seoTitle: String(frontmatter.seoTitle) } : {}),
    ...(frontmatter.seoDescription ? { seoDescription: String(frontmatter.seoDescription) } : {}),
    routeSlug,
    highlights: normalizeStringArray(frontmatter.highlights),
    relatedCommandIds,
    contentPath: path.relative(siteRoot, contentPath),
    sourcePath: path.relative(siteRoot, contentPath),
  };
}

async function readLocalizedCommandSource(vendorCommands) {
  const commands = {};

  for (const command of vendorCommands) {
    const locales = {};

    for (const locale of supportedLocales) {
      locales[locale] = await readLocalizedCommandEntry(locale, command.slug);
    }

    commands[command.slug] = locales;
  }

  return {
    locales: supportedLocales,
    commands,
  };
}

export async function buildCommandCatalog(options = {}) {
  const vendorSource = options.vendorSource ?? await readVendorCommandSource();
  const localizedContent = options.localizedContent ?? await readLocalizedCommandSource(vendorSource.commands);

  assert.deepEqual(localizedContent.locales, supportedLocales, 'Localized command locales must match supported locales');

  const vendorCommandsById = new Map(vendorSource.commands.map((command) => [command.slug, command]));
  const localizedCommands = localizedContent.commands ?? {};

  for (const commandId of Object.keys(localizedCommands)) {
    assert(vendorCommandsById.has(commandId), `Unmatched localized command id ${commandId}`);
  }

  const localeRouteOwners = new Map();
  const commands = [];

  for (const command of vendorSource.commands) {
    const localizedRecord = localizedCommands[command.slug];
    assert(localizedRecord, `Missing localized command record for ${command.slug}`);

    const localeRouteSlugs = {};
    const localePaths = {};
    const locales = {};
    const validatedLocalizedEntries = {};

    for (const locale of supportedLocales) {
      const localizedEntry = localizedRecord[locale];
      assert(localizedEntry, `Missing command entry for ${locale}/${command.slug}`);
      validatedLocalizedEntries[locale] = localizedEntry;
    }

    for (const locale of supportedLocales) {
      const localizedEntry = validatedLocalizedEntries[locale];
      const relatedCommandIds = Array.isArray(localizedEntry.relatedCommandIds)
        ? localizedEntry.relatedCommandIds.map(String)
        : [];

      for (const relatedCommandId of relatedCommandIds) {
        assert(vendorCommandsById.has(relatedCommandId), `Unknown related command id ${relatedCommandId} for ${locale}/${command.slug}`);
      }

      const routePath = getLocalizedCommandPath(String(localizedEntry.routeSlug), locale);
      const routeOwnerKey = `${locale}:${localizedEntry.routeSlug}`;
      const existingOwner = localeRouteOwners.get(routeOwnerKey);
      assert(
        !existingOwner || existingOwner === command.slug,
        `Route collision for ${locale}/${localizedEntry.routeSlug}: ${existingOwner} and ${command.slug}`,
      );
      localeRouteOwners.set(routeOwnerKey, command.slug);

      localeRouteSlugs[locale] = String(localizedEntry.routeSlug);
      localePaths[locale] = routePath;
      locales[locale] = {
        slug: command.slug,
        title: String(localizedEntry.title),
        summary: String(localizedEntry.summary),
        ...(localizedEntry.seoTitle ? { seoTitle: String(localizedEntry.seoTitle) } : {}),
        ...(localizedEntry.seoDescription ? { seoDescription: String(localizedEntry.seoDescription) } : {}),
        routeSlug: String(localizedEntry.routeSlug),
        routePath,
        alternateLocalePaths: Object.fromEntries(
          supportedLocales.map((candidateLocale) => [
            candidateLocale,
            getLocalizedCommandPath(
              String(validatedLocalizedEntries[candidateLocale].routeSlug),
              candidateLocale,
            ),
          ]),
        ),
        highlights: Array.isArray(localizedEntry.highlights) ? localizedEntry.highlights.map(String) : [],
        relatedCommandIds,
        contentPath: String(localizedEntry.contentPath),
        sourcePath: String(localizedEntry.sourcePath ?? localizedEntry.contentPath),
      };
    }

    commands.push({
      ...command,
      canonicalId: command.slug,
      localeRouteSlugs,
      localePaths,
      locales,
    });
  }

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
