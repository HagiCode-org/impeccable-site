# Product

## Register

product

## Users

Developers, designers, and technical writers who need to browse the `impeccable` command surface quickly, compare canonical command intent with localized guidance, and move between English and Simplified Chinese without losing structure. They usually arrive from the upstream repository, HagiCode tooling, or an internal documentation workflow and want a stable command reference, not a marketing experience.

## Product Purpose

`impeccable-site` is a standalone Astro documentation surface for the `impeccable` command system. It keeps command ordering, slugs, and relationships aligned with the canonical source, while the information architecture, copy treatment, and visual system are fully owned by this site. Success means a user can scan the full command catalog, understand what each command is for, open any detail page quickly, and trust that the localized guidance stays structurally consistent even though the experience is a HagiCode-led redesign rather than a mirror of the upstream site.

## Brand Personality

Warm, editorial, pragmatic.

The product should feel calm and intentional rather than toolish or sales-driven. It speaks like a well-edited field manual: precise labels, low noise, visible structure, and enough warmth to keep the reference from feeling sterile. The tone is direct and useful, with a slight print-like character from typography and color, but the interface still behaves like a fast technical product.

## Anti-references

- Generic docs portals that feel like default theme output with no hierarchy or identity.
- Dark, neon, purple-on-black AI visuals, glowing particles, or synthetic “future” styling.
- Marketing-page habits inside documentation: oversized hype copy, decorative metric blocks, repeated feature-card clichés.
- Dense enterprise documentation layouts that bury navigation, flatten headings, or make metadata hard to scan.
- Motion-heavy or low-contrast UI that gets in the way of reading and cross-language navigation.
- Treating the upstream site's visual decisions as a design dependency. Upstream command semantics matter, upstream visual styling does not.

## Design Principles

1. Command-first clarity. The command name, category, and route through the catalog should always be easier to scan than decorative UI.
2. Editorial warmth for technical reading. Use typographic contrast and warm surfaces to make long-form command reference browsing feel considered, not generic.
3. Stable bilingual structure. English and Simplified Chinese should share the same information architecture and navigational weight.
4. Structure from source, design from here. Canonical command metadata stays aligned, but the site's UI, hierarchy, and brand decisions are independent.
5. Lightweight static confidence. The experience should feel solid and polished without depending on app-like complexity.

## Accessibility & Inclusion

Baseline target: WCAG 2.1 AA.

- Keyboard navigation must cover sidebar links, language switching, and all command entry points.
- Focus indicators need to remain visible against warm translucent surfaces.
- Body copy, metadata, and code-like command labels need clear contrast in both desktop and mobile layouts.
- Responsive behavior must preserve navigation access on narrow screens without hiding the command map behind unclear affordances.
- Motion should stay subtle, stateful, and compatible with reduced-motion expectations.
