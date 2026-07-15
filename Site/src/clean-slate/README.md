# VISCERIUM clean-slate presentation layer

This directory is the new presentation boundary for the Codex.

## What remains stable

- The Obsidian vault in `Vault/` remains the source of truth.
- The existing content build, validation, graph, map, timeline, feed, comments, changelog, sitemap, Partytown and compression pipelines remain intact.
- Astro, Starlight and Preact remain the runtime stack.
- Generated files under `src/content/docs/` remain generated and must not be hand-edited.

## What is replaced

The visual shell is rebuilt here rather than continuing to layer patches over the vendored Ion theme and the previous homepage CSS. `viscerium.css` owns the palette, typography, page chrome, navigation, prose and homepage. `VisceriumHeader.astro` and `VisceriumFooter.astro` own the global chrome.

Specialist feature styles for timelines, maps, graph, calendar, category indexes, support and accessibility remain loaded for their proven behaviour. `specialist-features.css` supplies the clean-slate compatibility tokens and removes their inherited gradient, glow, rounded-card and shadow treatments.

## Design premise

The site is an archival wound-map rather than a generic documentation portal. The recurring device is a single cut line that passes through four historical eras. The line is meaningful, not decorative: it represents one unbroken history. Surfaces are warm black, bone and oxidised metal with dried-blood accents. Motion is limited to the authored timeline trace and direct control feedback. Content is always visible without JavaScript or animation.

## Rules

- No generic card grids, floating panels, glowy pills, blue-purple gradients or hero button pairs.
- No content hidden behind entrance animation.
- No fake controls.
- No icon tiles. Marks are bare.
- No hover lift or scale.
- Keep headings to one or two composed lines.
- Keep specialist feature behaviour working before changing its visuals.
- Test keyboard focus, reduced motion, narrow layouts and both colour themes.
