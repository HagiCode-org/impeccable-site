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

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function getOverviewPaths() {
  return Object.fromEntries(
    catalog.locales.map((locale) => [
      locale,
      locale === 'en-US' ? '/docs/' : `/${locale}/docs/`,
    ]),
  );
}

async function writeAlias(relativePath, canonicalPath, title, alternatePaths) {
  const segments = relativePath.split('/');
  assert(segments.every((segment) => /^[A-Za-z0-9-]+$/u.test(segment)), `Invalid alias path: ${relativePath}`);
  assert(canonicalPath.startsWith('/docs/'), `Unexpected canonical route: ${canonicalPath}`);

  const outputPath = path.join(distRoot, ...segments, 'index.html');
  const alternates = Object.entries(alternatePaths)
    .map(([locale, route]) => `    <link rel="alternate" hreflang="${escapeHtml(locale)}" href="${siteUrl}${escapeHtml(route)}" />`)
    .join('\n');
  const html = `<!doctype html>
<html lang="en-US">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)} | Impeccable Commands</title>
    <meta http-equiv="refresh" content="0; url=${escapeHtml(canonicalPath)}" />
    <link rel="canonical" href="${siteUrl}${escapeHtml(canonicalPath)}" />
${alternates}
    <link rel="alternate" hreflang="x-default" href="${siteUrl}${escapeHtml(alternatePaths['en-US'])}" />
  </head>
  <body>
    <main>
      <p>This English route has moved to the default documentation URL.</p>
      <a href="${escapeHtml(canonicalPath)}">Continue to the command documentation</a>
    </main>
  </body>
</html>
`;

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, html, 'utf8');
}

const overviewPaths = getOverviewPaths();
await writeAlias('en-US', '/docs/', 'Command overview', overviewPaths);
await writeAlias('en-US/docs', '/docs/', 'Command overview', overviewPaths);

for (const command of catalog.commands) {
  const routeSlug = command.localeRouteSlugs['en-US'];
  assert(/^[A-Za-z0-9-]+$/u.test(routeSlug), `Invalid command route slug: ${routeSlug}`);
  await writeAlias(
    `en-US/docs/${routeSlug}`,
    command.localePaths['en-US'],
    command.locales['en-US'].title,
    command.localePaths,
  );
}
