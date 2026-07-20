# Codex stylesheet architecture

Astro/Vite processes authored styles into production assets, but **where a stylesheet enters the module graph affects cascade and colour-transformation output**. Group imports only through a boundary proven safe by unit, build, and browser regression tests.

## Homepage style manifest

`homepage-styles.ts` is the single homepage import used by `index.astro`. It imports the existing CSS modules individually and in their established order:

1. `homepage-base.css`
2. `homepage-content.css`
3. `homepage-responsive.css`
4. `homepage-reveal.css`
5. `homepage-shell.css`

The first four files retain their existing responsibilities. `homepage-shell.css` contains the Starlight shell overrides that previously lived in an inline global style block inside `index.astro`.

This TypeScript manifest is deliberate. A CSS file using nested `@import` rules changed site-graph and timeline hovercard colours during browser regression tests. The module manifest gives maintainers one obvious entrypoint while allowing Astro/Vite to continue processing each stylesheet separately.

## Deliberate separate-file boundaries

The following stacks remain explicit because browser regression tests showed that combining them through CSS `@import` entrypoints changes runtime rendering:

- The global Starlight/Codex files registered in `astro.config.mjs`.
- The server-rendered timeline files imported by `TimelineApp.astro`.
- The hydrated timeline files imported by `TimelineIsland.tsx`.

Do not collapse these boundaries merely to reduce the number of source files. Fewer files are not an improvement when rendered output changes.

## Core files

- `typography.css` — typefaces, prose rhythm, headings, and text overflow behaviour.
- `codex-ui.css` — reusable Codex surfaces, cards, clusters, pills, warnings, and buttons.
- `custom.css` — older shared article and authoring utilities. Prefer a more specific file for new feature work; reduce this file over time rather than adding unrelated rules.
- `navigation.css` — icon rendering, left-sidebar presentation, and sidebar overlay behaviour.
- `header-controls.css` — header actions and controls.
- `layout.css` — page grid, right-sidebar geometry, global square geometry, and late structural overrides.
- `color-tokens.css` — dark/light colour tokens and Starlight token mappings.
- `a11y.css` — focus visibility, reduced motion, forced colours, screen-reader helpers, and target sizing.
- `era-styles.css` — era-scoped variables and treatments. Structural layout does not belong here.

## Feature files

- `graph.css` — graph views and related-page visualisation.
- `timelines.css` — shared timeline page presentation.
- `maps.css` — map, image-panel, and gallery structures.
- `calendar.css` — calendar modules and date badges.
- `support.css` — support, contact, and social-link pages.

Feature files remain separate where their selectors, loading boundary, and maintenance cycle are genuinely distinct. Use a TypeScript style manifest when a page needs one visible import but the CSS modules must remain separately processed.

## Cascade rules

1. Do not reorder style imports casually. Their sequence and import boundary are part of the cascade.
2. Keep first-party global styles explicitly registered in `astro.config.mjs` unless browser regression tests prove an alternative is neutral.
3. Keep server-rendered timeline styles in `TimelineApp.astro` and hydrated enhancement styles in `TimelineIsland.tsx`.
4. Use a TypeScript manifest—not CSS `@import`—when separate modules must be grouped behind one page import.
5. Do not put page-global CSS inside an `.astro` page when a page-specific authored stylesheet exists.
6. Put shared colours and surfaces in tokens, not feature selectors.
7. Put global geometry and late cascade overrides in `layout.css`.
8. Put navigation and icon rules in `navigation.css`.
9. Put era colour changes in `era-styles.css`; reuse the same selectors through `--era-*` variables.
10. Avoid new unlayered `!important` overrides unless a third-party selector makes them unavoidable.
11. When two files style the same selector, document the intended owner before adding another override.
12. Do not edit generated or middleware CSS bundles. Port experiments into authored files.
13. Keep the right sidebar page-scrolling: do not add `overflow`, `overflow-y`, or scrollbar declarations to its sticky desktop rule.

## Progressive colour output

Author CSS in stable HEX, RGB/RGBA, HSL/HSLA, Display-P3, or OKLCH values as appropriate. `Site/plugins/progressive-css-colors.mjs` keeps the authored declaration as the compatibility fallback, then emits a support-gated Display-P3 declaration and a final OKLCH declaration. The transform covers first-party styles, checked-in Starlight theme styles, Astro component style blocks, custom properties, gradients, shadows, and `color-mix()` interpolation spaces.

Because the OKLCH tier is emitted last, it is the preferred rendering path where supported. Browsers without OKLCH fall back to Display-P3 where available, then to the original HEX/RGB-compatible declaration.

## Next consolidation pass

Physical merging should happen only with browser coverage for the affected route and component boundary. Reasonable candidates are:

1. Physically merge the homepage CSS modules after confirming the progressive-colour transform emits identical output for a single file.
2. `degel-system.css` + `degel-system-art.css` + `degel-system-layout.css`, after dedicated explorer regression coverage.

The global Starlight stack and both timeline style stacks are not candidates until their processing differences are understood and removed at the build-pipeline level.
