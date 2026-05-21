import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { load } from 'js-yaml';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(scriptDirectory, '..');
const localesRoot = path.join(siteRoot, 'src/i18n/locales');
const generatedRoot = path.join(siteRoot, 'src/i18n/generated-locales');
const expectedLocales = ['en-US', 'zh-CN'];
const expectedNamespaces = ['common', 'docs'];

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function formatJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function readDirectoryNames(directoryPath) {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
}

async function readYamlFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  const data = load(raw);
  assert(isPlainObject(data), `${path.relative(siteRoot, filePath)} must be a top-level mapping`);
  return data;
}

async function loadYamlLocaleTree() {
  const locales = await readDirectoryNames(localesRoot);
  assert.deepEqual(locales, expectedLocales, 'Locale directories must match project locale metadata');

  const resources = {};

  for (const locale of expectedLocales) {
    const localeDirectory = path.join(localesRoot, locale);
    const entries = await fs.readdir(localeDirectory, { withFileTypes: true });
    const namespaces = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.yml'))
      .map((entry) => entry.name.replace(/\.yml$/u, ''))
      .sort();

    assert.deepEqual(namespaces, expectedNamespaces, `${locale} namespaces must match expected namespaces`);

    resources[locale] = {};

    for (const namespace of expectedNamespaces) {
      resources[locale][namespace] = await readYamlFile(path.join(localeDirectory, `${namespace}.yml`));
    }
  }

  return resources;
}

async function loadGeneratedLocaleTree() {
  const locales = await readDirectoryNames(generatedRoot);
  assert.deepEqual(locales, expectedLocales, 'Generated locale directories must match project locale metadata');

  const resources = {};

  for (const locale of expectedLocales) {
    const localeDirectory = path.join(generatedRoot, locale);
    const entries = await fs.readdir(localeDirectory, { withFileTypes: true });
    const namespaces = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
      .map((entry) => entry.name.replace(/\.json$/u, ''))
      .sort();

    assert.deepEqual(namespaces, expectedNamespaces, `${locale} generated namespaces must match expected namespaces`);

    resources[locale] = {};

    for (const namespace of expectedNamespaces) {
      const raw = await fs.readFile(path.join(localeDirectory, `${namespace}.json`), 'utf8');
      resources[locale][namespace] = JSON.parse(raw);
    }
  }

  return resources;
}

export async function generateI18nResources() {
  const resources = await loadYamlLocaleTree();

  await fs.rm(generatedRoot, { recursive: true, force: true });

  for (const locale of expectedLocales) {
    await fs.mkdir(path.join(generatedRoot, locale), { recursive: true });
    for (const namespace of expectedNamespaces) {
      await fs.writeFile(
        path.join(generatedRoot, locale, `${namespace}.json`),
        formatJson(resources[locale][namespace]),
        'utf8',
      );
    }
  }
}

export async function verifyGeneratedI18nResources() {
  const sourceResources = await loadYamlLocaleTree();
  const generatedResources = await loadGeneratedLocaleTree();

  for (const locale of expectedLocales) {
    for (const namespace of expectedNamespaces) {
      assert.equal(
        formatJson(generatedResources[locale][namespace]),
        formatJson(sourceResources[locale][namespace]),
        `${locale}/${namespace}.json is stale; rerun npm run i18n:generate`,
      );
    }
  }
}

if (process.argv.includes('--check')) {
  await verifyGeneratedI18nResources();
} else {
  await generateI18nResources();
}
