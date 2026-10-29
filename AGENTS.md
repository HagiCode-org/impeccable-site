# Impeccable Site - Agent Configuration

## Root Configuration

Inherits all behavior from `/AGENTS.md` at the monorepo root. Local rules extend or override the root file for this repository.

## Project Context

`impeccable-site` is a standalone Astro documentation site for the `impeccable` command surface. It pins the upstream `pbakaus/impeccable` repository as a vendor submodule and renders localized HagiCode-owned docs content.

## Working Directory

Run commands from `repos/impeccable-site/`.

## Key Commands

```bash
pnpm install
pnpm run dev
pnpm run build
pnpm test
pnpm run validate
pnpm run typecheck
pnpm run i18n:check
pnpm run catalog:check        # regenerate and verify the command catalog
pnpm run i18n:audit           # hagi18n audit/report/doctor/sync/prune (config: hagi18n.yaml; sync/prune have :write variants)
pnpm run content:sync:vendor  # sync en-US command content from the vendor submodule
```

Requires Node.js 24+. `pnpm run build` also runs `scripts/generate-default-locale-aliases.mjs` and `scripts/check-starlight-build.mjs`; `pnpm test` runs vitest over `tests/`. Initialize the vendor submodule after clone with `git submodule update --init --recursive`.

## Key Paths

- `src/content/commands/<locale>/`: localized command body content for the ten supported locales; every upstream command slug must exist in each locale
- `src/i18n/locales/`: shared UI locale source of truth
- `vendor/impeccable/`: upstream git submodule
- `scripts/`: command catalog generation, i18n resource generation, post-build checks (`check-starlight-build.mjs`), and `warm-deployment-domains.mjs` (domain warm-up helper, covered by `tests/warm-deployment-domains.test.ts`, not wired into `pnpm run` scripts or the deploy workflow)
- `src/i18n/generated-locales/`, `src/lib/generated/`: generated and gitignored; regenerate with `pnpm run prepare` instead of editing
- `.github/workflows/`: gh-pages deploy (runs `pnpm run validate` on Node 24 with submodules checked out, then publishes `esa.jsonc`, `wrangler.jsonc` from `.github/gh-pages/` plus `dist/` to the `gh-pages` branch)

## Agent Guidelines

- This repo does NOT run the upstream `pbakaus/impeccable` site directly. It normalizes upstream content at build time.
- Edit localized content in `src/content/commands/`, not the vendor submodule.
- Run `pnpm run validate` (full suite: i18n check + catalog check + typecheck + test + build) before committing.
- Keep command catalog generation scripts aligned with upstream command metadata format changes.
- Footer, language chooser, promotion banner, theme select and RSS come from the `@hagicode/hagilight` / `@hagicode/hagilight-starlight` packages; do not add local copies of that chrome (the build check fails on it).

## References

- `README.md`

## Package management

- The repository uses pnpm, pinned in `package.json` `packageManager`. Run `corepack enable` once, then `pnpm install`. `pnpm-lock.yaml` is the only lockfile; do not commit `package-lock.json`.
- Settings live in `pnpm-workspace.yaml`. `allowBuilds` lists the dependencies whose install scripts may run (reviewed individually, `false` means reviewed and denied); review any new dependency that has an install script and add it there.
- A local registry mirror belongs in `~/.npmrc` only. Never commit a `registry=` line or a mirror URL; `pnpm run check:registry` (also run in CI) fails on any non-`registry.npmjs.org` `tarball` in the lockfile and on mirror hosts in tracked files.
- Undeclared imports fail under pnpm's strict layout: declare the package instead of hoisting it.
