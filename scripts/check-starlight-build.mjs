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
  assert.doesNotMatch(html, /docs-footer|docs-promote|site-footer|application\/rss\+xml|rss\.xml/u, `${routePath} contains local chrome or an unrelated RSS destination`);
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

const sitemap = await fs.readFile(path.join(distRoot, 'sitemap-0.xml'), 'utf8');
assert.ok(sitemap.includes(`${siteUrl}/docs/`), 'The default overview is missing from the sitemap');
assert.ok(sitemap.includes(`${siteUrl}/zh-CN/docs/animate/`), 'A localized command is missing from the sitemap');
assert.ok(!sitemap.includes(`${siteUrl}/en-US/`), 'Default-locale aliases must not be added to the sitemap');
