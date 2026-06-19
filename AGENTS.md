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
```

## Key Paths

- `src/content/commands/`: localized command body content (en-US, zh-CN)
- `src/i18n/locales/`: shared UI locale source of truth
- `vendor/impeccable/`: upstream git submodule
- `scripts/`: command catalog generation

## Agent Guidelines

- This repo does NOT run the upstream `pbakaus/impeccable` site directly. It normalizes upstream content at build time.
- Edit localized content in `src/content/commands/`, not the vendor submodule.
- Run `npm run validate` (full suite: i18n check + catalog check + typecheck + test + build) before committing.
- Keep command catalog generation scripts aligned with upstream command metadata format changes.

## References

- `README.md`
