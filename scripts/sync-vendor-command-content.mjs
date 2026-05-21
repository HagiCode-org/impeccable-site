import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { dump, load } from 'js-yaml';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(scriptDirectory, '..');
const vendorContentDirectory = path.join(siteRoot, 'vendor/impeccable/site/content/skills');
const localEnUsDirectory = path.join(siteRoot, 'src/content/commands/en-US');

function parseFrontmatter(sourceText, sourcePath) {
  const match = sourceText.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/u);
  assert(match, `${sourcePath} must include YAML frontmatter`);

  const frontmatter = load(match[1]);
  assert(frontmatter && typeof frontmatter === 'object' && !Array.isArray(frontmatter), `${sourcePath} frontmatter must be a mapping`);

  return {
    frontmatter,
    body: match[2].trim(),
  };
}

function titleFromSlug(slug) {
  if (slug === 'impeccable') return 'Impeccable';

  return slug
    .split('-')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function normalizeStringArray(value) {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function formatMdx(frontmatter, body) {
  return `---\n${dump(frontmatter, { lineWidth: -1, noRefs: true })}---\n\n${body.trim()}\n`;
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function listVendorSlugs() {
  const entries = await fs.readdir(vendorContentDirectory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name.replace(/\.md$/u, ''))
    .sort();
}

async function readVendorCommand(slug) {
  const vendorPath = path.join(vendorContentDirectory, `${slug}.md`);
  const vendorSource = await fs.readFile(vendorPath, 'utf8');
  const { frontmatter: vendorFrontmatter, body } = parseFrontmatter(vendorSource, path.relative(siteRoot, vendorPath));
  return {
    slug,
    vendorPath,
    vendorFrontmatter,
    body,
    commandName: slug === 'impeccable' ? '/impeccable' : `/impeccable ${slug}`,
  };
}

async function syncSlug(slug) {
  const { vendorFrontmatter, body } = await readVendorCommand(slug);
  const localPath = path.join(localEnUsDirectory, `${slug}.mdx`);
  let existingFrontmatter = {};
  let existingSource = '';

  if (await pathExists(localPath)) {
    existingSource = await fs.readFile(localPath, 'utf8');
    existingFrontmatter = parseFrontmatter(existingSource, path.relative(siteRoot, localPath)).frontmatter;
  }

  const nextFrontmatter = {
    slug,
    title: String(existingFrontmatter.title ?? titleFromSlug(slug)),
    summary: String(vendorFrontmatter.tagline ?? ''),
    ...(existingFrontmatter.seoTitle ? { seoTitle: String(existingFrontmatter.seoTitle) } : {}),
    ...(existingFrontmatter.seoDescription ? { seoDescription: String(existingFrontmatter.seoDescription) } : {}),
    ...(existingFrontmatter.routeSlug ? { routeSlug: String(existingFrontmatter.routeSlug) } : {}),
    highlights: normalizeStringArray(existingFrontmatter.highlights),
    related: normalizeStringArray(existingFrontmatter.related),
  };

  const nextSource = formatMdx(nextFrontmatter, body);

  if (nextSource === existingSource) {
    return { slug, changed: false };
  }

  await fs.mkdir(path.dirname(localPath), { recursive: true });
  await fs.writeFile(localPath, nextSource, 'utf8');
  return { slug, changed: true };
}

async function main() {
  const slugFlagIndex = process.argv.indexOf('--slug');
  const requestedSlug = slugFlagIndex >= 0 ? process.argv[slugFlagIndex + 1] : null;
  const allVendorSlugs = await listVendorSlugs();
  const slugs = requestedSlug ? [requestedSlug] : allVendorSlugs;

  for (const slug of slugs) {
    assert(allVendorSlugs.includes(slug), `Unknown vendor slug: ${slug}`);
  }

  const results = [];

  for (const slug of slugs) {
    results.push(await syncSlug(slug));
  }

  const changed = results.filter((result) => result.changed).map((result) => result.slug);
  console.log(JSON.stringify({
    processed: results.map((result) => result.slug),
    changed,
  }, null, 2));
}

await main();
