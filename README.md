# impeccable-site

Standalone Astro documentation site for the `impeccable` command surface.

This repository does not run the upstream `pbakaus/impeccable` site directly. Instead, it pins the upstream repository as a vendor submodule, normalizes the upstream command catalog at build time, and renders localized HagiCode-owned docs content from this repository.

## Source model

- Vendor source: `vendor/impeccable`
- Upstream command markdown reference: `vendor/impeccable/site/content/skills/`
- Upstream category and relationship data: `vendor/impeccable/site/data/sub-pages-data.ts`
- Upstream command metadata: `vendor/impeccable/skill/scripts/command-metadata.json`
- Localized command body content: `src/content/commands/<locale>/*.mdx` for all 29 supported locale codes.
- Localized overview entries: `src/content/docs/index.mdx` and the Chinese variants under `src/content/docs/`; the Astro content loader supplies the existing fallback locales without copying command bodies.
- Starlight locale and sidebar configuration: `src/lib/starlight/config.ts`, projected from the generated command catalog.
- HagiLight Starlight owns documentation RSS and publishes content-aware root and locale feeds. The plain-Astro discovery integration defers to Starlight so it cannot replace those feeds with empty defaults.
- `/en-US/` and `/en-US/docs/*` remain redirect aliases, generated after the Astro build so they do not collide with Starlight's unprefixed default locale routes.
- Shared UI locale source of truth:
  - `src/i18n/locales/en-US/*.yml`
  - `src/i18n/locales/zh-CN/*.yml`
- Starlight UI overrides for Simplified and Traditional Chinese: `src/content/i18n/`.

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

Site-specific entry and overview/detail copy remains in YAML:

- `src/i18n/locales/en-US/common.yml`
- `src/i18n/locales/en-US/docs.yml`
- `src/i18n/locales/zh-CN/common.yml`
- `src/i18n/locales/zh-CN/docs.yml`

Starlight supplies its own translated shell labels. This site overrides the navigation, search, and not-found labels for Simplified and Traditional Chinese in `src/content/i18n/`; other configured locales use their Starlight translations or English fallback.

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

Every upstream command slug must exist in each of the 29 locale collections. The parity rules are enforced during catalog generation.

For English source-of-truth syncing, you can pull the upstream skill body content into the local `en-US` MDX files with:

```bash
env -u NPM_CONFIG_PREFIX npm run content:sync:vendor
```

To sync a single command only:

```bash
env -u NPM_CONFIG_PREFIX node scripts/sync-vendor-command-content.mjs --slug animate
```

This sync copies the upstream command body and tagline-driven summary into `src/content/commands/en-US/*.mdx`. Local frontmatter fields such as `title`, `seoTitle`, `seoDescription`, `routeSlug`, `highlights`, and `related` are preserved directly inside each MDX file so the site can keep its own presentation layer.

Add or update command docs in the relevant locale directories, for example:

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
2. `catalog:generate` reads vendor metadata plus per-locale MDX frontmatter and emits a normalized command catalog.
3. The Starlight content loader projects the existing localized MDX and generated catalog route slugs to `/docs/<slug>/` and `/{locale}/docs/<slug>/`; no vendor command bodies are copied into a second collection.
4. Starlight and the HagiLight adapter render the responsive docs shell and shared chrome as static HTML.
5. The build emits the `/en-US/` and `/en-US/docs/*` redirect aliases, then checks all 29 locale routes, metadata, navigation, and shared-only chrome.

## Verification expectations

Before committing, run:

```bash
env -u NPM_CONFIG_PREFIX npm run validate
```

This should confirm:

- Vendor paths are present.
- Every upstream command slug exists in all 29 locale directories.
- Generated locale resources are fresh.
- Generated command catalog is fresh.
- All canonical docs routes and `/en-US/` aliases exist in static output.
- Canonical/hreflang metadata, active/mobile navigation, language switching, the HagiLight footer/promotion, and generated RSS channel metadata and locale membership are checked in the built pages.

## Production Deployment

- Production command docs host: `https://impeccable.hagicode.com`
- Authoritative workflow: `.github/workflows/impeccable-site-deploy-gh-pages.yml`
- Production source of truth: the `gh-pages` branch, published only by GitHub Actions
- Published payload contract: branch root `esa.jsonc`, `wrangler.jsonc`, and `dist/` containing the validated Astro snapshot
- Build prerequisite in CI: the workflow checks out `vendor/impeccable` recursively before running `npm run validate`
- Manual dispatch path: `workflow_dispatch` rebuilds from the selected ref and republishes the validated payload to `gh-pages`
- Direct Cloudflare publication is handled outside this workflow; keep `gh-pages/wrangler.jsonc` as the checked-in Wrangler contract for direct publish operations
- Required GitHub permissions: the deploy job needs `contents: write`; the build job stays read-only
- Required hosting setting: configure the production host to read `gh-pages/esa.jsonc`, treat `gh-pages/wrangler.jsonc` as the Wrangler source of truth for direct publication, and serve `gh-pages/dist/`
- First deploy checks: confirm the workflow publishes `esa.jsonc`, `wrangler.jsonc`, and `dist/`, verify the hosting target still points at `gh-pages`, and load `https://impeccable.hagicode.com`
- Rollback path: revert the source change or rerun deployment from an older commit so CI republishes the previous snapshot
