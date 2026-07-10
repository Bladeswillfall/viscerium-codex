# Publishing Rules

Only notes in `Vault/Lore/` can publish. Draft, private, template, and system notes are ignored.

A public note must have:

```yaml
---
title: Example Title
description: "A short, reader-safe description for search and link previews."
publish: true
status: canon
slug: eras/citadel/example-title
type: article
---
```

The sync script rewrites `slug` from the note path, except for the root `index` page, so keep the frontmatter slug readable but treat the file location as the real route source.

## Recommended frontmatter

Use the extra fields when they help the page sidebar, graph, maps, timelines, feeds, or future social cards.

```yaml
icon: "fa-solid fa-book-skull"
sidebarIcon: "fa-solid fa-book"
titleIcon: "fa-solid fa-book-skull"
era: CITADEL
faction: Example Faction
location: Example City
character: Example Character
species: Human
occupation: Pathfinder
alignment: Unaligned
capital: Example City
territory: Example Valley
tags:
  - citadel
  - faction
related:
  - Example City
  - Example Battle
image: example-banner.webp
imagePage: /eras/citadel/images/example-banner/
imageTitle: Example Banner
alt: "Describe the image for screen readers."
artist: Artist Name
credit: Artist Name / Rights Holder
```

## Links and graph data

Use Obsidian wikilinks in source notes:

```md
[[Example City]]
[[Example Character|a named witness]]
```

During sync, published wikilinks become site links. Missing or unpublished wikilinks fall back to plain text and produce a sync warning. The same links feed the site graph and backlink panels, so use them generously but deliberately.

## Icons

Use Font Awesome's own class format in Obsidian. The sync step converts heading shortcodes into decorative site markup while keeping the visible heading text clean for anchors, search, and the table of contents.

```md
## [Icon:fa-solid fa-people-group] People
## [Icon:fa-solid fa-landmark] Government
### [Icon:fa-regular fa-clock] Early History
```

Use the same specification in frontmatter:

```yaml
icon: "fa-solid fa-flag"
sidebarIcon: "fa-solid fa-shield-halved"
titleIcon: "fa-solid fa-flag"
```

`icon` is the shared default for the page title and sidebar entry. `sidebarIcon` and `titleIcon` override it where required.

The existing local SVG library is also available:

```md
## [Icon:local faction] Faction Identity
```

```yaml
icon: "local faction"
```

A single icon name such as `icon: faction` is retained as shorthand for `local faction`. Multi-token specifications are treated as CSS icon classes, which allows more class-based libraries to be added later without changing the Markdown grammar.

## Layout tags

The public site supports controlled BBCode-style layout tags. Tags must sit on their own lines.

```md
[cols:2-1 gap=lg]
[col]
Main article body.
[/col]

[col]
[card:accent compact]
Sidebar material.
[/card]
[/col]
[/cols]

[note:title="Archivist note"]
A public note or clarification.
[/note]

[warning:title="Content warning"]
Sensitive public warning text.
[/warning]

[lore:title="Recovered fragment"]
In-world quoted text.
[/lore]
```

Use normal Markdown tables only for actual tabular data. Do not use blank tables as layout scaffolding; use `[cols]`, `[row]`, `[col]`, and `[card]` instead.

## Assets and image pages

Store source images in `Vault/Assets/Images/` and maps in `Vault/Assets/Maps/`. Reference plain filenames in frontmatter where possible:

```yaml
image: example-banner.webp
headerImage: example-banner.webp
asset: example-banner.webp
```

Create a dedicated `type: image` note for any artwork that needs provenance, rights, usage notes, or a sidebar image detail link.

## Calendars, maps, and timelines

Event pages can use structured calendar dates:

```yaml
calendarDate:
  calendar: okse
  year: 4
  month: solmanuthur
  day: 16
  displayCalendars:
    - okse
```

Full calendar grids use a shortcode in the note body:

```md
[Calendar:okse year=4]
```

Map markers and timeline entries are frontmatter-driven:

```yaml
map:
  id: example-world
  x: 52
  y: 41
  marker: city
  layer:
    - cities

timeline:
  id: example-history
  year: 1200
  precision: exact
  order: 1
```

## Obsidian-only helpers

Obsidian comments are removed during sync:

```md
%% Private drafting note. %%
```

Do not put raw `dataviewjs` blocks into public canon examples. They will publish as code blocks unless the site renderer explicitly handles them. Keep Dataview views in non-published templates, draft notes, or `Vault/System/` guidance instead.
