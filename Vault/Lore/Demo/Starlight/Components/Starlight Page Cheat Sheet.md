---
title: Starlight Page Cheat Sheet
description: "A single authoring reference for the Markdown, Codex layout, media, map-container, sidebar, calendar, timeline, typography, and metadata features available to a regular VISCERIUM Codex page."
headerImage: /assets/images/viscerium-banner.webp
image: /assets/images/640faf5b8cd2814de13871ff58c900b6.webp
imageTitle: Demo sidebar artwork
artist: Fall
alt: "A VISCERIUM artwork sample used to demonstrate the standard page sidebar image treatment."
publish: true
status: canon
type: system
icon: "fa-solid fa-book-open"
sidebarIcon: "fa-solid fa-list-check"
titleIcon: "fa-solid fa-book-open"
era: CITADEL
faction:
  - Okse Dominion
location:
  - Degel System
tags:
  - demo
  - starlight
  - authoring
  - cheat-sheet
  - formatting
  - maps
  - images
  - calendar
  - timeline
calendarDate:
  calendar: okse
  year: 20004
  month: solmanuthur
  day: 16
  displayCalendars:
    - okse
calendarBlocks:
  ID-0001:
    calendar: okse
    year: 4
timelineBlocks:
  ID-0001:
    timeline: citadel
    defaultCalendar: okse
    laneMode: unified
    showFilters: false
    showMinimap: false
    showLegend: true
sidebar:
  label: Page Cheat Sheet
  order: 999
  badge:
    text: Guide
    variant: tip
  replaceMeta: true
  meta:
    - label: Page model
      value: Regular Vault Markdown
    - label: Rendering
      value: Starlight + Codex sync
    - label: Era styling
      value: CITADEL / e1
  sections:
    - title: Demonstrated here
      items:
        - Frontmatter and page sidebar
        - Typography and Markdown
        - Layout tags and callouts
        - Images and map containers
        - Calendar and timelines
      note: This is an author-facing system page rather than VISCERIUM lore.
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
banner:
  content: |
    Authoring cheat sheet — this page deliberately demonstrates the features available to a normal Codex article.
prev: false
next: false
pagefind: false
---

%%
Author note:
This is the source of the single Starlight/Codex page cheat sheet.
It intentionally replaces the older Feature Demo and Component Gallery pages.
%%

This is the **regular-page authoring reference** for the VISCERIUM Codex. It is deliberately overloaded so that one page can be used to inspect the normal article renderer and copy working syntax back into lore notes.

:::note[What counts as a regular page?]
A regular page starts as Markdown beneath `Vault/Lore/`. It does **not** need hand-written Astro components or imported Starlight MDX components. The sync pipeline may emit MDX internally when a normal note uses Codex layout, calendar, or timeline features, but the source note remains the authoring surface.
:::

## Quick-start page

A minimal public article needs this frontmatter:

```yaml
---
title: Example Article
description: "A short reader-safe description for search and previews."
publish: true
status: canon
type: article
---
```

Everything else on this page is optional and can be added when the article needs it.

## Frontmatter and page chrome

This cheat sheet itself demonstrates a **header image**, title/sidebar icons, an automatic calendar-date badge, taxonomy fields, a page banner, a customised right-hand sidebar, TOC depth, disabled pagination, and disabled Pagefind indexing.

A richer regular page can use:

```yaml
headerImage: /assets/images/example-banner.webp
image: /assets/images/example-sidebar-art.webp
imageTitle: Example artwork
artist: Artist Name
alt: "Describe the artwork for screen readers."

icon: "fa-solid fa-book-open"
sidebarIcon: "fa-solid fa-list-check"
titleIcon: "fa-solid fa-book-open"

era: CITADEL
faction:
  - Example Faction
location:
  - Example Location
participants:
  - Example Character
tags:
  - example
related:
  - Related Article

sidebar:
  replaceMeta: true
  meta:
    - label: Category
      value: Example
  sections:
    - title: Key facts
      items:
        - First fact
        - Second fact
      note: Optional section note.
```

| Field | What a regular page gets |
|---|---|
| `headerImage` | Large page-title artwork with the shared Codex fade treatment. |
| `image` | Artwork in the right-hand page information panel. |
| `imageTitle`, `artist`, `alt` | Artwork caption/provenance and accessible alternative text. |
| `icon`, `sidebarIcon`, `titleIcon` | Icon treatment in generated navigation and headings. |
| `era` | Taxonomy plus the matching era visual treatment when applicable. |
| `faction`, `location`, `participants`, `tags` | Search, graph, metadata, and editorial classification. |
| `related` / `relationships` | Graph and related-entry connections. |
| `sidebar.meta` | Custom label/value metadata in the right sidebar. |
| `sidebar.sections` | Extra facts, lists, links, and notes below sidebar metadata. |
| `tableOfContents` | Controls the heading depths shown in the page TOC. |
| `banner` | A Starlight page-level announcement strip. |
| `prev`, `next` | Enables or disables article pagination links. |
| `pagefind` | Controls whether the page enters Pagefind search. |

## Headings and section structure

The page title from frontmatter is already the document H1. Normal article content should therefore begin at H2.

### H3 — subsection

Use H3 for a section inside an H2. This level is normally useful in the page table of contents.

#### H4 — fine detail

H4 through H6 are available for deeper structure but should be used sparingly.

```md
## Major section

### Subsection

#### Fine detail
```

### Icon headings

A heading can use the shared icon renderer:

```md
## [Icon:fa-solid fa-map] Geographic pressure
### [Icon:local faction] Faction identity
```

### [Icon:fa-solid fa-map] Live icon-heading example

This heading is rendered through the same authoring syntax a normal lore page can use.

## Inline formatting

This sentence demonstrates **bold**, _italic_, ***bold italic***, ~~strikethrough~~, `inline code`, [a normal site link](/), and <kbd>Ctrl</kbd> + <kbd>K</kbd> keyboard notation.

```md
**bold**
_italic_
***bold italic***
~~strikethrough~~
`inline code`
[normal link](/calendar/)
<kbd>Ctrl</kbd> + <kbd>K</kbd>
```

## Links and wikilinks

Regular Vault notes can use ordinary Markdown links or Obsidian wikilinks.

- [Codex home](/)
- [Calendar](/calendar/)
- [[Okse Dominion]]
- [[Myrkild]]
- [[Okse Dominion|Custom wikilink label]]

```md
[Normal Markdown link](/calendar/)
[[Okse Dominion]]
[[Okse Dominion|Custom label]]
```

Published wikilinks become site links and also feed graph/backlink data. Missing or unpublished targets fall back to plain text and produce a sync warning.

## Paragraphs, blockquotes, and horizontal rules

Short paragraph:

The horn did not sound. It remembered.

Longer prose should simply remain normal Markdown. The body face, paragraph width, spacing, and responsive typography are supplied by the shared Codex article styles rather than by author markup.

> Money flows here like water through a river, and anything can be bought for the right price.
>
> The lie is that price and cost are the same thing.

---

The horizontal rule above uses plain Markdown:

```md
---
```

## Asides and Codex callouts

Starlight asides are available directly in regular Markdown.

:::note
A neutral note is useful for clarification or secondary context.
:::

:::tip[Codex writing tip]
Use a titled tip when the guidance itself is useful to the reader or author.
:::

:::caution
Caution is appropriate for unstable terminology, partial canon, or non-fatal warnings.
:::

:::danger[Content or canon hazard]
Use danger sparingly so that it retains meaning.
:::

```md
:::note[Optional title]
Callout body.
:::

:::tip
Tip body.
:::

:::caution
Caution body.
:::

:::danger
Danger body.
:::
```

The Codex also provides Obsidian-friendly authoring tags that compile to the shared callout treatment:

[note:title="Archivist note"]
This is a controlled note callout authored with the Codex tag syntax.
[/note]

[warning:title="Content warning"]
This is the standard author-facing warning form for sensitive material.
[/warning]

[lore:title="Recovered fragment"]
The horn did not sound. It remembered.
[/lore]

```md
[note:title="Archivist note"]
A public clarification.
[/note]

[warning:title="Content warning"]
Sensitive public warning text.
[/warning]

[lore:title="Recovered fragment"]
In-world quoted text.
[/lore]
```

## Lists and task lists

Unordered lists:

- Resonance
- Warfare
- Culture
  - Social hierarchy
  - Religion
  - History

Ordered lists:

1. Name the pressure.
2. Name who benefits from it.
3. Name who bleeds for it.
4. Name what breaks when it changes.

Task lists:

- [x] Establish the public myth.
- [x] Establish material pressure.
- [ ] Decide who pays the hidden cost.

## Tables

Use Markdown tables for genuinely tabular information rather than as a layout system.

| Faction / power | Public story | Actual pressure | Responsive test |
|:---|:---|:---|:---|
| ASTU | Open hands, open minds | Trade security and democratic friction | Short cell |
| TCSC | Progress through unity | Rail power, heavy industry, ideological cohesion | Longer text to test wrapping on narrow layouts |
| KRG | Recovery and contract survival | Money, deniability, second-hand hardware | Acronym-heavy |
| Republic of Askalia | Coin as freedom | Exploitation, guild pressure, and slavery | Sensitive-content example |

```md
| Column A | Column B | Column C |
|---|---|---|
| Value | Value | Value |
| Value | Value | Value |
```

## Responsive layout tags

The compact Codex layout syntax is available from ordinary Vault Markdown. Tags must sit on their own lines.

```md
[cols:2-1 gap=lg]
[col]
Main article body.
[/col]

[col]
[card:accent compact]
Sidebar or summary content.
[/card]
[/col]
[/cols]
```

[cols:2-1 gap=lg]
[col]
### Primary column

Use this side for the main argument, description, history, or other long-form material. On narrow screens the columns collapse into a readable single-column flow.
[/col]

[col]
[card:accent compact]
### Supporting card

Useful for a compact summary, doctrine note, key facts, warning, or sidebar-like material within the article itself.
[/card]
[/col]
[/cols]

### Equal columns

[cols gap=lg]
[col]
[card:plain]
### First column

Equal columns work well for comparisons where neither side should dominate.
[/card]
[/col]

[col]
[card:muted]
### Second column

The layout remains responsive without author-written CSS.
[/card]
[/col]
[/cols]

### Twelve-column row control

For more deliberate layouts, `[row]` uses a twelve-column grid and `[col]` accepts spans and breakpoint-specific spans.

```md
[row gap=lg]
[col 8 md:8]
Eight-column region.
[/col]
[col 4 md:4]
Four-column region.
[/col]
[/row]
```

[row gap=lg]
[col 8 md:8]
[card]
**Eight-column region.** This is the wider side of the row.
[/card]
[/col]
[col 4 md:4]
[card:muted]
**Four-column region.** This is the narrower side.
[/card]
[/col]
[/row]

### Card variants

Available card variants are `plain`, `accent`, `muted`, `warning`, `danger`, and `success`; add `compact` when the content is small.

[cols gap=sm]
[col]
[card:accent compact]
**Accent** — emphasis without implying danger.
[/card]
[/col]
[col]
[card:warning compact]
**Warning** — cautionary article material.
[/card]
[/col]
[col]
[card:success compact]
**Success** — confirmed or completed state.
[/card]
[/col]
[/cols]

## Images and media

### Standard Markdown image

A regular local image can be referenced by generated public path or by a managed Vault asset. The sync process resolves managed images into `/assets/images/`.

![Okse Dominion artwork used as a local image example](/assets/images/640faf5b8cd2814de13871ff58c900b6.webp)

```md
![Useful alternative text](/assets/images/example-image.webp)
```

### Obsidian image embed

Vault image embeds are supported and are rewritten to managed public assets during sync:

![[Tech timeline for VISCERIUM.jpg]]

```md
![[Tech timeline for VISCERIUM.jpg]]
```

### Captioned image panel

The shared media styles include `codex-image-panel`. Use MDX-compatible HTML when a figure needs a visible caption rather than a plain Markdown image.

<figure className="codex-image-panel">
  <img src="/assets/images/1d6a04547df953b36f4d6f8ce73e91f2.webp" alt="A VISCERIUM landscape artwork used to demonstrate the captioned image panel." />
  <figcaption>Captioned image panel — useful for artwork, diagrams, documentary images, or visual references that need visible context.</figcaption>
</figure>

```mdx
<figure className="codex-image-panel">
  <img src="/assets/images/example.webp" alt="Describe the image." />
  <figcaption>Visible caption and context.</figcaption>
</figure>
```

## Map containers

A regular article does not need to become a specialist `type: map` page just to display cartography. The shared page styles expose map/image containers for inline maps, plans, diagrams, and map collections.

### Single map panel

`codex-map`, `map-panel`, and `map-frame` share the standard full-width framed-media treatment.

<figure className="codex-map">
  <img src="/assets/images/1d6a04547df953b36f4d6f8ce73e91f2.webp" alt="Demonstration artwork standing in for a map image inside the Codex map container." />
  <figcaption>Demo map container. Replace the image source with the actual managed map asset for a lore page.</figcaption>
</figure>

```mdx
<figure className="codex-map">
  <img src="/assets/maps/your-map.webp" alt="Describe the map and the area shown." />
  <figcaption>Map title, date, projection, source, or reader guidance.</figcaption>
</figure>
```

### Scrollable world-map container

For a large image that may need its own overflow area, use `world-map`:

<div className="world-map">
  <img src="/assets/images/viscerium-banner.webp" alt="Wide VISCERIUM artwork used to demonstrate the scrollable world-map container." />
</div>

```mdx
<div className="world-map">
  <img src="/assets/maps/large-world-map.webp" alt="Describe the world map." />
</div>
```

### Map grid and map cards

Use `map-grid` with `map-card` when an article needs several regional maps or visual references.

<div className="map-grid">
  <article className="map-card">
    <img src="/assets/images/640faf5b8cd2814de13871ff58c900b6.webp" alt="First demonstration image in a map card." />
    <div className="map-card__body">
      <h3>Regional map card</h3>
      <p>Use the body for map scope, period, provenance, legend notes, or a link to the dedicated map page.</p>
    </div>
  </article>
  <article className="map-card">
    <img src="/assets/images/viscerium-banner.webp" alt="Second demonstration image in a map card." />
    <div className="map-card__body">
      <h3>Second map card</h3>
      <p>The grid automatically reflows according to available article width.</p>
    </div>
  </article>
</div>

```mdx
<div className="map-grid">
  <article className="map-card">
    <img src="/assets/maps/region-a.webp" alt="Region A map." />
    <div className="map-card__body">
      <h3>Region A</h3>
      <p>Context for this map.</p>
    </div>
  </article>
</div>
```

### Connecting a normal article to an interactive map

A regular location, battlefield, settlement, ruin, or region can also become a marker on a specialist map page through frontmatter:

```yaml
map:
  id: example-world
  x: 52
  y: 41
  marker: city
  layer:
    - cities
```

The `type: map` note owns the interactive map itself; normal articles only need the matching marker metadata when they should appear on it.

## Details / disclosure blocks

Native HTML disclosure blocks are useful for optional technical detail, spoilers, long source notes, or secondary lists.

<details>
<summary>Open this demonstration disclosure</summary>

The hidden content can contain **Markdown**, lists, links, and `inline code`.

- First hidden item
- Second hidden item
- Third hidden item

</details>

```md
<details>
<summary>Reader-facing summary</summary>

Hidden Markdown content.

</details>
```

## Code blocks

Fenced code blocks receive the shared Expressive Code treatment.

```js title="codex-demo.js" {2-4}
export function pressureTestFaction(faction) {
  if (!faction.publicMyth) return 'Decoration wearing a flag';
  if (!faction.materialPressure) return 'Aesthetic without engine';
  return 'Usable';
}
```

Language labels, titles, and highlighted lines can be added directly to the opening fence.

````md
```js title="example.js" {2-3}
const visible = true;
const highlighted = 'these lines';
const stillHighlighted = true;
```
````

## Mathematical notation

Inline TeX works with dollar delimiters: $a^2+b^2=c^2$.

Display TeX uses double-dollar delimiters:

$$
a^2+b^2=c^2
$$

The Codex equation container can add a consistent title and presentation:

[equation:title="Resonance decay model"]
$$
R(t)=R_0e^{-\lambda t}
$$
[/equation]

```md
Inline: $a^2+b^2=c^2$

$$
a^2+b^2=c^2
$$

[equation:title="Resonance decay model"]
$$
R(t)=R_0e^{-\lambda t}
$$
[/equation]
```

## Calendar placement

A regular page can display an automatic date badge through `calendarDate` and can place a full calendar wherever a shortcode appears.

This page defines:

```yaml
calendarDate:
  calendar: okse
  year: 20004
  month: solmanuthur
  day: 16
  displayCalendars:
    - okse

calendarBlocks:
  ID-0001:
    calendar: okse
    year: 4
```

Then places the calendar with:

```md
[Calendar:ID-0001]
```

[Calendar:ID-0001]

For a simple one-off calendar, the inline form is also available:

```md
[Calendar:okse year=4]
```

## Timeline placement

Regular pages can place a generated canonical timeline with a shortcode. The simplest form is:

```md
[Timeline:citadel]
```

For reusable page-specific settings, define a block in frontmatter:

```yaml
timelineBlocks:
  ID-0001:
    timeline: citadel
    defaultCalendar: okse
    laneMode: unified
    showFilters: false
    showMinimap: false
    showLegend: true
```

Then place it where required:

```md
[Timeline:ID-0001]
```

[Timeline:ID-0001]

### Native note-local Chronos timeline

A regular page can also contain a self-contained `chronos` fence for editorial, research, or note-local chronology that does not need to enter the canonical event compiler.

```chronos
> NOTODAY
> ORDERBY start
> HEIGHT 260

- [9201] First demonstration event | Example hover detail
- [9204~9208] Demonstration ranged event
* [9210] Demonstration point
= [9220] Demonstration marker
```

Use canonical event notes and `[Timeline:...]` shortcodes when the events must participate in registered calendars, era validation, filters, and generated datasets.

## Footnotes

Footnotes use normal Markdown syntax.[^1]

```md
A sentence with a footnote.[^1]

[^1]: The footnote text.
```

[^1]: This is the live footnote used by the cheat sheet.

## What is deliberately not in the regular-page toolbox?

The old MDX component gallery imported Starlight components such as `Badge`, `CardGrid`, `FileTree`, `Tabs`, and `LinkCard` directly from `@astrojs/starlight/components`. Those are valid **hand-authored MDX** features, but they are not part of the normal Vault Markdown authoring contract and are therefore not presented here as everyday lore-page syntax.

| Feature | Regular page? | Use instead / when appropriate |
|---|---:|---|
| Markdown + Starlight asides | Yes | Everyday article authoring. |
| Codex `[cols]`, `[row]`, `[card]`, callout, and equation tags | Yes | Responsive article layout from Vault Markdown. |
| Managed images and Obsidian embeds | Yes | Normal article media. |
| `codex-map`, `world-map`, `map-grid`, `map-card` containers | Yes | Inline map and cartography presentation. |
| Calendar and timeline shortcodes | Yes | Dynamic article modules. |
| Native `chronos` fences | Yes | Note-local chronology. |
| Imported Starlight React/MDX-style components | No, not by default | Reserve for deliberately hand-authored `.mdx` pages. |
| `type: map` interactive-map route | Specialist page | Use only when the note owns the map dataset/route. |
| Bespoke Astro/Preact components | Specialist implementation | Add at Site/component level, not inside ordinary lore notes. |

## Authoring checklist

Before treating a regular lore article as finished:

- [ ] Use one frontmatter `title`; do not repeat it as an H1 in the body.
- [ ] Give every public page a useful `description`.
- [ ] Use H2 for major body sections and H3 for subsections.
- [ ] Give meaningful images and maps useful alternative text.
- [ ] Use tables only for tabular data; use layout tags for visual columns.
- [ ] Prefer wikilinks when the relationship should feed graph/backlink data.
- [ ] Use callouts only when the distinction actually helps the reader.
- [ ] Keep specialist MDX/Astro components out of ordinary Vault notes unless the page genuinely requires custom implementation.
