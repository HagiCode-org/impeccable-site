# impeccable-site

Standalone Astro documentation site for the `impeccable` command surface.

This repository does not run the upstream `pbakaus/impeccable` site directly. Instead, it pins the upstream repository as a vendor submodule, normalizes the upstream command catalog at build time, and renders localized HagiCode-owned docs content from this repository.

## Source model

- Vendor source: `vendor/impeccable`
- Upstream command markdown reference: `vendor/impeccable/site/content/skills/`
- Upstream category and relationship data: `vendor/impeccable/site/data/sub-pages-data.ts`
- Upstream command metadata: `vendor/impeccable/skill/scripts/command-metadata.json`
- Localized command body content:
  - `src/content/commands/en-US/*.mdx`
  - `src/content/commands/zh-CN/*.mdx`
- Shared UI locale source of truth:
  - `src/i18n/locales/en-US/*.yml`
  - `src/i18n/locales/zh-CN/*.yml`

## Initialize after clone

```bash
git submodule update --init --recursive
cd repos/impeccable-site
env -u NPM_CONFIG_PREFIX npm install
```

If the submodule is already present but stale, update it with:

```bash
cd repos/impeccable-site
git submodule update --remote vendor/impeccable
```

Review the upstream pointer change, then regenerate derived assets before committing.

## Daily commands

From `repos/impeccable-site`:

```bash
env -u NPM_CONFIG_PREFIX npm run dev
env -u NPM_CONFIG_PREFIX npm run typecheck
env -u NPM_CONFIG_PREFIX npm test
env -u NPM_CONFIG_PREFIX npm run build
env -u NPM_CONFIG_PREFIX npm run validate
```

`validate` runs the full local gate: hagi18n checks, catalog parity, Astro typecheck, tests, and static build.

## Localization workflow

Shared chrome strings live in YAML and are committed as the source of truth:

- `src/i18n/locales/en-US/common.yml`
- `src/i18n/locales/en-US/docs.yml`
- `src/i18n/locales/zh-CN/common.yml`
- `src/i18n/locales/zh-CN/docs.yml`

Generated runtime resources are written to `src/i18n/generated-locales/` by:

```bash
env -u NPM_CONFIG_PREFIX npm run i18n:generate
```

Useful maintenance commands:

```bash
env -u NPM_CONFIG_PREFIX npm run i18n:audit
env -u NPM_CONFIG_PREFIX npm run i18n:doctor
env -u NPM_CONFIG_PREFIX npm run i18n:sync
env -u NPM_CONFIG_PREFIX npm run i18n:sync:write
env -u NPM_CONFIG_PREFIX npm run i18n:prune
env -u NPM_CONFIG_PREFIX npm run i18n:prune:write
env -u NPM_CONFIG_PREFIX npm run i18n:check
```

## Command content workflow

Every upstream command slug must exist in both locale collections. The parity rules are enforced during catalog generation.

Add or update command docs in:

- `src/content/commands/en-US/<slug>.mdx`
- `src/content/commands/zh-CN/<slug>.mdx`

The filename and frontmatter `slug` must match the upstream slug exactly.

Regenerate the normalized catalog with:

```bash
env -u NPM_CONFIG_PREFIX npm run catalog:generate
```

Check that generated output is current with:

```bash
env -u NPM_CONFIG_PREFIX npm run catalog:check
```

The generated catalog lives at `src/lib/generated/command-catalog.json`.

## Build pipeline summary

1. `i18n:generate` converts YAML locale sources into JSON runtime resources.
2. `catalog:generate` reads vendor metadata plus local MDX entries and emits a normalized command catalog.
3. Astro routes consume the generated catalog and the localized command content collections.
4. The site builds as static output only.

## Verification expectations

Before committing, run:

```bash
env -u NPM_CONFIG_PREFIX npm run validate
```

This should confirm:

- Vendor paths are present.
- Every upstream command slug exists in both `en-US` and `zh-CN`.
- Generated locale resources are fresh.
- Generated command catalog is fresh.
- Astro routes compile and static output builds successfully.
