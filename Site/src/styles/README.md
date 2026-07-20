# Codex stylesheet architecture

Stylesheet boundaries are part of the rendered cascade. Astro/Vite and the progressive-colour transform do not produce identical output when every file is routed through a shared CSS `@import` file or an indirect TypeScript manifest.

## Current homepage structure

The homepage loads three authored stylesheets directly from `index.astro`, in this order:

1. `homepage-base.css`
2. `homepage-content.css`
3. `homepage-responsive.css`

`homepage-reveal.css` was small and had no independent colour-token ownership, so its reveal-overlay rules were appended to the end of `homepage-responsive.css`. This preserves their former final cascade position while reducing the homepage stylesheet count from four to three.

The small Starlight shell override remains in the page's global style block. Moving that block into another CSS module changed unrelated site-graph and timeline hovercard colours in browser regression tests.

## Deliberate separate-file boundaries

The following stacks remain explicit because attempted consolidation changed runtime rendering:

- Global Starlight/Codex files registered in `astro.config.mjs`.
- Server-rendered timeline files imported by `TimelineApp.astro`.
- Hydrated timeline files imported by `TimelineIsland.tsx`.
- The homepage shell override embedded in `index.astro`.

Do not collapse these boundaries simply to reduce source-file count. Fewer files are not an improvement when computed colours or component behaviour change.

## Ownership guide

- `color-tokens.css` — shared palette, state, era, calendar, timeline, homepage and Degel variables.
- `typography.css` — typefaces, prose rhythm and headings.
- `codex-ui.css` — reusable Codex surfaces, cards, buttons and layout utilities.
- `navigation.css` — navigation icons, left-sidebar presentation and sidebar overlay behaviour.
- `header-controls.css` — header actions and controls.
- `layout.css` — page grid, right-sidebar geometry and late structural overrides.
- `a11y.css` — focus, reduced-motion, forced-colour and target-size rules.
- `era-styles.css` — era-scoped variables and treatments.
- `graph.css`, `timelines.css`, `maps.css`, `calendar.css`, `support.css` — feature-owned styles.

## Rules for future changes

1. Treat import order and import location as part of the cascade.
2. Keep global styles explicitly registered in `astro.config.mjs` unless browser tests prove another arrangement is neutral.
3. Keep timeline styles at their current Astro and Preact boundaries.
4. Prefer physical merging only when selectors have one clear owner and the merged file can retain the original rule order.
5. Avoid CSS `@import` as a consolidation mechanism in this project; tested attempts changed progressive-colour output.
6. Run unit tests, the production build and browser checks after any stylesheet-boundary change.
7. Do not add another override before identifying which existing file should own the selector.

## Next candidates

Potential merges require dedicated browser coverage first. The most plausible candidate is the three-file Degel explorer group (`degel-system.css`, `degel-system-art.css`, and `degel-system-layout.css`). The global and timeline stacks should not be merged until their build-pipeline ordering differences are understood.
