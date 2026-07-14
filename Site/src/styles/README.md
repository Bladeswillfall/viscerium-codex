# Codex stylesheet architecture

Styles are loaded in the order declared in `Site/astro.config.mjs`. Astro/Vite processes these source files into production assets, so source-file count should follow maintainability boundaries rather than treating every file as a separate browser request.

## Core files

- `typography.css` — typefaces, prose rhythm, headings, and text overflow behaviour.
- `codex-ui.css` — reusable Codex surfaces, cards, clusters, pills, warnings, and buttons.
- `custom.css` — older shared article and authoring utilities. Prefer a more specific file for new feature work; reduce this file over time rather than adding unrelated rules.
- `navigation.css` — icon rendering, left-sidebar presentation, and sidebar overlay behaviour.
- `layout.css` — page grid, right-sidebar geometry, global square geometry, and late structural overrides.
- `color-tokens.css` — dark/light colour tokens and Starlight token mappings.
- `a11y.css` — focus visibility, reduced motion, forced colours, screen-reader helpers, and target sizing.
- `era-styles.css` — era-scoped variables and treatments. Structural layout does not belong here.

## Feature files

- `graph.css` — graph views and related-page visualisation.
- `timelines.css` — timeline components.
- `maps.css` — map, image-panel, and gallery structures.
- `calendar.css` — calendar modules and date badges.
- `support.css` — support, contact, and social-link pages.

These feature files remain separate because their selectors, components, and maintenance cycles are distinct. Combining them would make human navigation worse while providing little or no production loading benefit after bundling.

## Progressive colour output

Author CSS in stable HEX, RGB/RGBA, HSL/HSLA, Display-P3, or OKLCH values as appropriate. `Site/plugins/progressive-css-colors.mjs` keeps the authored declaration as the compatibility fallback, then emits a support-gated Display-P3 declaration and a final OKLCH declaration. The transform covers first-party styles, checked-in Starlight theme styles, Astro component style blocks, custom properties, gradients, shadows, and `color-mix()` interpolation spaces.

Because the OKLCH tier is emitted last, it is the preferred rendering path where supported. Browsers without OKLCH fall back to Display-P3 where available, then to the original HEX/RGB-compatible declaration.

## Placement rules

1. Put shared colours and surfaces in tokens, not feature selectors.
2. Put global geometry and cascade overrides in `layout.css`.
3. Put navigation and icon rules in `navigation.css`.
4. Put era colour changes in `era-styles.css`; reuse the same selectors through `--era-*` variables.
5. Do not edit generated or middleware CSS bundles. Port experiments into these authored files.
6. Keep the right sidebar page-scrolling: do not add `overflow`, `overflow-y`, or scrollbar declarations to its sticky desktop rule.
