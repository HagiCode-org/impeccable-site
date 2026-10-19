# Impeccable Site - Agent Configuration

## Root Configuration

Inherits all behavior from `/AGENTS.md` at the monorepo root. Local rules extend or override the root file for this repository.

## Project Context

`impeccable-site` is a standalone Astro documentation site for the `impeccable` command surface. It pins the upstream `pbakaus/impeccable` repository as a vendor submodule and renders localized HagiCode-owned docs content.

## Working Directory

Run commands from `repos/impeccable-site/`.

## Key Commands

```bash
npm install
npm run dev
npm run build
npm test
npm run validate
npm run typecheck
npm run i18n:check
npm run catalog:check        # regenerate and verify the command catalog
npm run content:sync:vendor  # sync en-US command content from the vendor submodule
```

Requires Node.js 24+. `npm run build` also runs `scripts/generate-default-locale-aliases.mjs` and `scripts/check-starlight-build.mjs`; `npm test` runs vitest over `tests/`. Initialize the vendor submodule after clone with `git submodule update --init --recursive`.

## Key Paths

- `src/content/commands/<locale>/`: localized command body content for the ten supported locales; every upstream command slug must exist in each locale
- `src/i18n/locales/`: shared UI locale source of truth
- `vendor/impeccable/`: upstream git submodule
- `scripts/`: command catalog generation, i18n resource generation, post-build checks (`check-starlight-build.mjs`)
- `src/i18n/generated-locales/`, `src/lib/generated/`: generated and gitignored; regenerate with `npm run prepare` instead of editing
- `.github/workflows/`: gh-pages deploy (runs `npm run validate` on Node 24 with submodules checked out, then publishes `esa.jsonc`, `wrangler.jsonc` from `.github/gh-pages/` plus `dist/` to the `gh-pages` branch)

## Agent Guidelines

- This repo does NOT run the upstream `pbakaus/impeccable` site directly. It normalizes upstream content at build time.
- Edit localized content in `src/content/commands/`, not the vendor submodule.
- Run `npm run validate` (full suite: i18n check + catalog check + typecheck + test + build) before committing.
- Keep command catalog generation scripts aligned with upstream command metadata format changes.
- Footer, language chooser, promotion banner, theme select and RSS come from the `@hagicode/hagilight` / `@hagicode/hagilight-starlight` packages; do not add local copies of that chrome (the build check fails on it).

## References

- `README.md`
