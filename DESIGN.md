---
name: impeccable-site
description: Warm editorial command documentation with translucent paper panels and a restrained ember accent.
colors:
  bg: "#F5EFE4"
  bg-deep: "#E7DDCF"
  surface: "#FFF9F1DB"
  surface-strong: "#FFF8EEF5"
  line: "#482E2224"
  line-strong: "#482E2247"
  text: "#251814"
  muted: "#6B554B"
  accent: "#F26F45"
  accent-soft: "#F26F4529"
  accent-strong: "#C24D2A"
typography:
  display:
    fontFamily: "Iowan Old Style, Palatino Linotype, Book Antiqua, serif"
    fontSize: "clamp(2.2rem, 4vw, 4.4rem)"
    fontWeight: 700
    lineHeight: 0.96
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "IBM Plex Sans, Avenir Next, Segoe UI, sans-serif"
    fontSize: "clamp(1.5rem, 2vw, 2.2rem)"
    fontWeight: 700
    lineHeight: 1.15
  title:
    fontFamily: "IBM Plex Sans, Avenir Next, Segoe UI, sans-serif"
    fontSize: "1.3rem"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "IBM Plex Sans, Avenir Next, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  lead:
    fontFamily: "IBM Plex Sans, Avenir Next, Segoe UI, sans-serif"
    fontSize: "clamp(1rem, 1.2vw, 1.12rem)"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "IBM Plex Sans, Avenir Next, Segoe UI, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.12em"
  mono:
    fontFamily: "IBM Plex Mono, SFMono-Regular, Consolas, monospace"
    fontSize: "0.78rem"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: "6px"
  md: "14px"
  lg: "20px"
  xl: "28px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "14px"
  md: "18px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  docs-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.xl}"
    padding: "22px 18px"
  command-card:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "18px"
  language-switcher:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    rounded: "{rounded.pill}"
    padding: "4px"
  code-chip:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: "0.15rem 0.35rem"
  text-link:
    textColor: "{colors.accent-strong}"
    typography: "{typography.body}"
---

# Design System: impeccable-site

## Overview

**Creative North Star: "Field Manual on Warm Paper"**

This interface is a documentation product with an editorial shell. The structure is closer to a printed manual than to a default docs theme: warm paper backgrounds, compact but legible navigation, and translucent panels that keep the command catalog feeling tactile without turning into decorative glass. The site should feel calm enough for sustained reading and fast enough for lookup. Its visual system is defined by this site itself, not inherited from the upstream impeccable website.

The visual system is built around a restrained ember accent, soft brown text, and a clear distinction between navigation chrome and command content. Typography does most of the hierarchy work. The serif display voice is reserved for large page titles and brand moments, while the sans-serif body face carries the actual reading load. Mono appears only where the product is speaking in command names or code-like tokens.

This system explicitly rejects default-theme documentation, neon AI aesthetics, and marketing spillover. It should not drift into purple-on-black tooling, slick growth-page clichés, or dense enterprise documentation blocks that flatten everything into one reading texture.

**Key Characteristics:**
- Warm paper neutrals with one ember accent and dark brown ink text.
- Large serif hero typography, sans-serif reading text, mono command labels.
- Translucent panels with blur and one soft ambient shadow vocabulary.
- Sidebar-first command browsing on desktop, collapsible navigation on mobile.
- Motion limited to short hover and state transitions.

## Colors

The palette behaves like printed paper plus ink, with one orange-red accent for active states, links, and category cues.

### Primary
- **Ember Accent** (`#F26F45`): Primary highlight for active states, hover emphasis, and selective attention points.
- **Burnt Ember** (`#C24D2A`): Stronger accent for links, badges, and compact metadata that needs more edge than the base accent.

### Neutral
- **Warm Paper** (`#F5EFE4`): Default page background and the base tone of the whole site.
- **Deep Paper** (`#E7DDCF`): Lower gradient stop and quieter background depth.
- **Vellum Surface** (`#FFF9F1DB`): Main translucent panel color used on shells and framed content.
- **Pressed Vellum** (`#FFF8EEF5`): Stronger panel tone for cards and elevated content blocks.
- **Brown Ink** (`#251814`): Primary text color, active pill fill, and high-contrast anchor of the interface.
- **Muted Ink** (`#6B554B`): Secondary copy, summaries, and non-primary metadata.
- **Hairline Seam** (`#482E2224`): Default border tone for panels and cards.
- **Strong Seam** (`#482E2247`): Higher-emphasis line used where panel definition needs more contrast.

### Named Rules

**The Warm-First Rule.** The page never falls back to cold white or neutral gray. Every neutral surface should stay in the warm paper family.

**The Ember-Is-Intent Rule.** Accent color marks interaction, emphasis, or active state. It should not become a wash covering large content areas.

**The Source-Is-Structural Rule.** Upstream canonical data defines command slugs, ordering, and relationships. It does not define this site's visual language.

## Typography

**Display Font:** Iowan Old Style (with Palatino and Book Antiqua fallback)
**Body Font:** IBM Plex Sans (with Avenir Next and Segoe UI fallback)
**Label/Mono Font:** IBM Plex Mono

**Character:** The type pairing balances editorial warmth with technical clarity. The serif face gives the docs shell a printed, considered voice at large sizes; IBM Plex Sans keeps navigation and dense prose practical; IBM Plex Mono marks command strings without turning the whole interface into a terminal.

### Hierarchy
- **Display** (700, `clamp(2.2rem, 4vw, 4.4rem)`, `line-height: 0.96`): Page hero titles and the main command detail heading.
- **Headline** (700, `clamp(1.5rem, 2vw, 2.2rem)`, `line-height: 1.15`): Section headings for command groups and content blocks.
- **Title** (700, `1.3rem`, `line-height: 1.25`): Card and panel titles.
- **Body** (400, `1rem`, `line-height: 1.6`): Standard reading text, summaries, and long-form command guidance. Keep lines near 65ch when possible.
- **Lead** (400, `clamp(1rem, 1.2vw, 1.12rem)`, `line-height: 1.6`): Hero summaries and command intros.
- **Label** (700, `0.78rem`, `letter-spacing: 0.12em`, uppercase): Eyebrows, badges, and section labels.
- **Mono** (400, `0.78rem`): Command names, inline command chips, and code-like route hints.

### Named Rules

**The Serif-Stays-Structural Rule.** The serif face is for brand and hierarchy, not for body copy blocks.

**The Command-Strings-Stay-Mono Rule.** When the UI refers to a command identifier or code token, it switches to mono instead of trying to style it through color alone.

## Elevation

Depth is created through translucent panels, soft shadows, and warm borders rather than heavy layering. The site uses one consistent ambient shadow on framed surfaces, then adds slightly stronger lift on interactive cards. Blur is part of the surface material, not a decorative effect to be scattered across unrelated elements.

### Shadow Vocabulary
- **Shell Shadow** (`0 22px 60px rgba(78, 42, 28, 0.12)`): Default ambient depth on shells, hero panels, category panels, and detail containers.
- **Card Hover Lift** (`0 18px 36px rgba(78, 42, 28, 0.12)`): Hover-only lift for command cards.

### Named Rules

**The Blur-Belongs-to-Surfaces Rule.** Backdrop blur is reserved for navigation and content shells that already read as translucent material.

**The Hover-Moves-a-Little Rule.** Transforms stay small and directional, usually 2px to 4px, just enough to confirm interactivity.

## Components

### Navigation
- **Site Header:** Horizontal lockup with brand on the left and source/language actions on the right. It should stay compact and readable, not banner-like.
- **Language Switcher:** Pill shell with 4px outer padding, rounded to full capsule, muted labels by default, dark ink active state.
- **Sidebar Navigation:** Warm translucent shell with stacked command links and category dividers. Active or hovered items translate slightly right instead of relying on loud fills.

### Command Cards
- **Shape:** Large rounded rectangle (`20px`) with warm gradient fill, hairline border, and compact 18px interior padding.
- **Content Order:** Command name first, localized title second, summary third, tagline last.
- **Hover / Focus:** Slight upward lift with stronger border tint and shadow.

### Detail Panels
- **Shell:** Large rounded container (`28px`) with translucent surface, warm border, and ambient shadow.
- **Hero Block:** Serif title with a command-name mono label above it and a restrained summary below it.
- **Meta Cards:** Smaller rounded subsections with white-leaning fills inside the larger shell.

### Inline Tokens
- **Code Chip:** Accent-soft background, brown ink text, small radius, mono type.
- **Text Link:** Burnt ember text with visible underline and offset underline position.

## Do's and Don'ts

### Do:
- **Do** keep the main background in the warm paper range anchored by `#F5EFE4`.
- **Do** reserve the serif display voice for large hierarchy moments.
- **Do** keep command identifiers in IBM Plex Mono.
- **Do** use hover motion and border emphasis to show interaction before adding new UI chrome.
- **Do** preserve the desktop sidebar as the primary scan path for the command catalog.
- **Do** treat upstream metadata as structural input, not as a visual design constraint.

### Don't:
- **Don't** introduce dark mode with purple gradients, neon accents, glowing particles, or other AI-tool clichés.
- **Don't** replace the warm editorial shell with a generic docs theme look.
- **Don't** turn command docs into a marketing surface with big hype copy or hero-metric blocks.
- **Don't** flatten all hierarchy into one sans-serif weight range.
- **Don't** hide navigation behind ambiguous mobile patterns or low-contrast controls.
- **Don't** copy upstream visual styling just because the command semantics come from upstream.
