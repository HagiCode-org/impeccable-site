import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(scriptDirectory, '..');
const distRoot = path.join(siteRoot, 'dist');
const siteUrl = 'https://impeccable.hagicode.com';
const catalog = JSON.parse(
  await fs.readFile(path.join(siteRoot, 'src/lib/generated/command-catalog.json'), 'utf8'),
);

function htmlPath(routePath) {
  const segments = routePath.split('/').filter(Boolean);
  return path.join(distRoot, ...segments, 'index.html');
}

async function readPage(routePath) {
  const filePath = htmlPath(routePath);
  await fs.access(filePath).catch(() => {
    throw new Error(`Missing built documentation route: ${routePath}`);
  });
  return fs.readFile(filePath, 'utf8');
}

function assertSharedShell(html, routePath) {
  const pathnameLocale = routePath.split('/').filter(Boolean)[0];
  const locale = catalog.locales.includes(pathnameLocale) ? pathnameLocale : 'en-US';
  const switcherLocale = locale === 'en-US' ? 'root' : locale;

  assert.ok(html.includes(`<html lang="${locale}"`), `${routePath} has the wrong document language`);
  assert.match(html, /<hagilight-language-chooser\b/u, `${routePath} is missing the shared language chooser`);
  assert.match(html, /<hagilight-promoto-banner\b/u, `${routePath} is missing the shared promotion banner`);
  assert.ok(html.includes(`data-locale="${switcherLocale}" data-href="${routePath}"`), `${routePath} is missing its language-switch destination`);
  assert.equal((html.match(/<footer\b/gu) ?? []).length, 1, `${routePath} must have one shared footer`);
  assert.match(html, /popovertarget="starlight__sidebar"/u, `${routePath} is missing Starlight mobile navigation`);
  assert.match(html, /<starlight-theme-select\b/u, `${routePath} is missing theme controls`);
  assert.doesNotMatch(html, /docs-footer|docs-promote|site-footer/u, `${routePath} contains local chrome`);
  assert.ok(html.includes('type="application/rss+xml"'), `${routePath} is missing the shared RSS feed link`);
  assert.ok(html.includes('href="https://impeccable.hagicode.com/rss.xml"'), `${routePath} is missing the shared RSS feed destination`);
}

function assertMetadata(html, routePath) {
  assert.ok(html.includes(`rel="canonical" href="${siteUrl}${routePath}"`), `${routePath} has the wrong canonical URL`);
  assert.equal((html.match(/rel="alternate" hreflang=/gu) ?? []).length, catalog.locales.length + 1, `${routePath} must link all locale alternates and x-default`);
  assert.match(html, /hreflang="x-default"/u, `${routePath} is missing x-default metadata`);
  assert.match(html, /<script type="application\/ld\+json">/u, `${routePath} is missing structured data`);
}

const overviewPaths = Object.fromEntries(
  catalog.locales.map((locale) => [
    locale,
    locale === 'en-US' ? '/docs/' : `/${locale}/docs/`,
  ]),
);

for (const routePath of Object.values(overviewPaths)) {
  const html = await readPage(routePath);
  assertSharedShell(html, routePath);
  assertMetadata(html, routePath);
  assert.match(html, /docs-overview__cards/u, `${routePath} is missing its server-rendered command cards`);
  assert.match(html, /aria-current="page"/u, `${routePath} is missing an active navigation entry`);
}

for (const command of catalog.commands) {
  for (const locale of catalog.locales) {
    const routePath = command.localePaths[locale];
    const html = await readPage(routePath);
    assertSharedShell(html, routePath);
    assertMetadata(html, routePath);
    assert.ok(html.includes(command.locales[locale].title), `${routePath} is missing localized command content`);
    assert.match(html, /command-context/u, `${routePath} is missing its server-rendered command summary`);
    assert.match(html, /aria-current="page"/u, `${routePath} is missing its active command navigation entry`);
  }
}

const aliases = [
  ['/en-US/', '/docs/'],
  ['/en-US/docs/', '/docs/'],
  ...catalog.commands.map((command) => [
    `/en-US/docs/${command.localeRouteSlugs['en-US']}/`,
    command.localePaths['en-US'],
  ]),
];

for (const [aliasPath, canonicalPath] of aliases) {
  const html = await readPage(aliasPath);
  assert.ok(html.includes(`rel="canonical" href="${siteUrl}${canonicalPath}"`), `${aliasPath} does not canonicalize to ${canonicalPath}`);
  assert.ok(html.includes(`http-equiv="refresh" content="0; url=${canonicalPath}"`), `${aliasPath} does not redirect to ${canonicalPath}`);
  assert.equal((html.match(/rel="alternate" hreflang=/gu) ?? []).length, catalog.locales.length + 1, `${aliasPath} must link all locale alternates and x-default`);
}

assert.equal((await fs.access(htmlPath('/docs/not-a-command/')).then(() => true).catch(() => false)), false, 'An unsupported command route was generated');

const REMOVED_LOCALES = [
  'bg-BG',
  'cs-CZ',
  'da-DK',
  'el-GR',
  'es-419',
  'fi-FI',
  'hu-HU',
  'id-ID',
  'it-IT',
  'nb-NO',
  'nl-NL',
  'pl-PL',
  'pt-PT',
  'ro-RO',
  'sv-SE',
  'th-TH',
  'tr-TR',
  'uk-UA',
  'vi-VN',
];

assert.equal(catalog.locales.length, 10, 'The build must publish exactly ten supported languages');

for (const locale of REMOVED_LOCALES) {
  const removedLocaleRoot = path.join(distRoot, locale);
  assert.equal(
    await fs.access(removedLocaleRoot).then(() => true).catch(() => false),
    false,
    `A removed-locale directory was generated for ${locale}`,
  );
}

const sitemapFiles = (await fs.readdir(distRoot))
  .filter((entry) => /^sitemap-\d+\.xml$/u.test(entry));
assert.ok(sitemapFiles.length > 0, 'Expected at least one Starlight sitemap file');

const sitemapUrls = (
  await Promise.all(
    sitemapFiles.map(async (file) => {
      const content = await fs.readFile(path.join(distRoot, file), 'utf8');
      return [...content.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((match) => match[1]);
    }),
  )
).flat();

for (const locale of REMOVED_LOCALES) {
  for (const url of sitemapUrls) {
    assert.doesNotMatch(url, new RegExp(`/${locale}/`, 'u'), `Sitemap entry advertises removed locale ${locale}: ${url}`);
  }
}

const robots = await fs.readFile(path.join(distRoot, 'robots.txt'), 'utf8');
assert.ok(robots.includes(`Sitemap: ${siteUrl}/sitemap-index.xml`), 'Robots must reference the Starlight sitemap index');