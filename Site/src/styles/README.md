# Codex stylesheet architecture

Styles are exposed through a small set of **entrypoints**. Astro/Vite processes these source files into production assets, so source-file count should follow maintainability boundaries rather than treating every file as a separate browser request.

## Entrypoints

- `codex.css` — the complete global Starlight/Codex stack. This is the only first-party stylesheet registered in `astro.config.mjs`.
- `homepage.css` — all homepage partials plus homepage-only shell overrides.
- `timeline.css` — the complete interactive timeline stack used by `TimelineApp.astro`.
- `chronos.css` — the smaller standalone Chronos embed stack.
- `degel-system.css` and `degel-system-layout.css` — the Degel explorer feature. These remain separate until their large visual and layout rules can be regression-tested as one file.

Page and component code should import an entrypoint rather than knowing the full list of implementation partials.

## Core partials

- `typography.css` — typefaces, prose rhythm, headings, and text overflow behaviour.
- `codex-ui.css` — reusable Codex surfaces, cards, clusters, pills, warnings, and buttons.
- `custom.css` — older shared article and authoring utilities. Prefer a more specific file for new feature work; reduce this file over time rather than adding unrelated rules.
- `navigation.css` — icon rendering, left-sidebar presentation, and sidebar overlay behaviour.
- `header-controls.css` — header actions and controls.
- `layout.css` — page grid, right-sidebar geometry, global square geometry, and late structural overrides.
- `color-tokens.css` — dark/light colour tokens and Starlight token mappings.
- `a11y.css` — focus visibility, reduced motion, forced colours, screen-reader helpers, and target sizing.
- `era-styles.css` — era-scoped variables and treatments. Structural layout does not belong here.

Their global order is declared once in `codex.css`.

## Feature partials

- `graph.css` — graph views and related-page visualisation.
- `timelines.css` — shared timeline page presentation.
- `maps.css` — map, image-panel, and gallery structures.
- `calendar.css` — calendar modules and date badges.
- `support.css` — support, contact, and social-link pages.

Feature partials remain separate where their selectors, components, and maintenance cycles are genuinely distinct. Related partials are collected by the nearest feature entrypoint.

## Cascade rules

1. Do not reorder imports in an entrypoint casually. Their sequence is part of the cascade.
2. Do not add another first-party global stylesheet directly to `astro.config.mjs`; add it to `codex.css` in the correct position.
3. Do not add a growing list of CSS partial imports to a page or component when a feature entrypoint exists.
4. Do not put page-global CSS inside an `.astro` page when a page entrypoint exists.
5. Put shared colours and surfaces in tokens, not feature selectors.
6. Put global geometry and late cascade overrides in `layout.css`.
7. Put navigation and icon rules in `navigation.css`.
8. Put era colour changes in `era-styles.css`; reuse the same selectors through `--era-*` variables.
9. Avoid new unlayered `!important` overrides unless a third-party selector makes them unavoidable.
10. When two partials style the same selector, document the intended owner before adding another override.
11. Do not edit generated or middleware CSS bundles. Port experiments into these authored files.
12. Keep the right sidebar page-scrolling: do not add `overflow`, `overflow-y`, or scrollbar declarations to its sticky desktop rule.

## Progressive colour output

Author CSS in stable HEX, RGB/RGBA, HSL/HSLA, Display-P3, or OKLCH values as appropriate. `Site/plugins/progressive-css-colors.mjs` keeps the authored declaration as the compatibility fallback, then emits a support-gated Display-P3 declaration and a final OKLCH declaration. The transform covers first-party styles, checked-in Starlight theme styles, Astro component style blocks, custom properties, gradients, shadows, and `color-mix()` interpolation spaces.

Because the OKLCH tier is emitted last, it is the preferred rendering path where supported. Browsers without OKLCH fall back to Display-P3 where available, then to the original HEX/RGB-compatible declaration.

## Next consolidation pass

Physical merging should happen only after browser regression coverage exists for the affected feature. The highest-value candidates are:

1. `navigation.css` + `header-controls.css`
2. the four homepage partials
3. the timeline partials grouped into graph, controls, and chronicle files
4. `degel-system.css` + `degel-system-art.css` + `degel-system-layout.css`

The staged approach makes the active import graph understandable first, then permits safe physical merging without guessing which rules currently win.
