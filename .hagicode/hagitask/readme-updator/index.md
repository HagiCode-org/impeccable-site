---
public: true
multilingual: false
style: product
---

# README requirements

## Product focus

- Introduce this repository as the standalone documentation site for the `impeccable` command surface at https://impeccable.hagicode.com: a browsable, localized reference where readers scan the full command catalog, see what each command is for, and open a detail page for any command.
- Address developers, designers and technical writers who want to look up `impeccable` commands, and readers who want the guidance in their own language (the site is published in many languages; do not claim full translation coverage beyond what the site shows).
- Lead with the site link and what readers can do there; keep the vendor-submodule and build details out of the main description.

## Required content

- Open with a short product introduction, the website badge and the Apache-2.0 license badge, which must stay consistent with `LICENSE`.
- Describe the reader-facing capabilities: the command catalog, per-command detail pages, language switching, and the documentation RSS feed, as the site actually provides them.
- Link to https://impeccable.hagicode.com and to the upstream `impeccable` project the commands come from, instead of copying command content.

## Exclusions

- Exclude tokens, secret values, internal hosts, machine-specific paths and private links.
- Keep repository maintenance instructions out of the README: repository layout, source model, submodule initialization, daily and localization commands, build pipeline, verification and deployment, internal architecture and CI. Do not list features the repository does not show.
