---
title: Starlight Feature Demo
description: "A VISCERIUM codex demo page for testing Obsidian Markdown, Astro Starlight rendering, headings, asides, code blocks, tables, images, calendar rendering, and frontmatter behaviour."
headerImage: /assets/images/viscerium-banner.webp
publish: true
status: canon
type: system
calendarDate:
  calendar: okse
  year: 20004
  month: solmanuthur
  day: 16
  displayCalendars:
    - okse
calendarShowcase:
  calendar: okse
  year: 4
era:
  - CITADEL
  - SMOG
  - NEARSIGHT
  - ENTROPY
faction:
  - ASTU
  - TCSC
  - KRG
tags:
  - demo
  - starlight
  - obsidian
  - codex
sidebar:
  label: Feature Demo
  order: 999
  badge:
    text: Demo
    variant: tip
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
banner:
  content: |
    Demo page: safe to delete after checking the public codex styling.
prev: false
next: false
pagefind: false
---

%%
Obsidian-only note:
This file is the source of `/demo/starlight/components/starlight-feature-demo/`.
The build syncs this note from `Vault/Lore` into `Site/src/content/docs`.
%%

This page is a visual stress-test for the VISCERIUM codex. It is intentionally overloaded, but it stays as **plain Markdown** so it remains comfortable to edit in Obsidian.

The calendar visible near the page title is not written with MDX. It is rendered by the site layout from the `calendarDate` and `calendarShowcase` frontmatter above.

:::note[Demo intent]
This page should show an automatic Okse date badge and a full Okse calendar module. If either is missing on the live site, the deployment is either stale or the calendar component failed during build.
:::

## Calendar rendering check

Expected visible result on this exact route:

- [ ] An event-date badge for `16 Sólmanuthur, 20004` appears under the page title.
- [ ] A full Okse calendar grid appears near the page title.
- [ ] The footer link to [the calendar page](/calendar/) resolves.

The same calendar module should also appear on the canonical [Okse Calendar](/calendar/) page.

## Frontmatter features being tested

| Field | Purpose | Expected effect |
|---|---|---|
| `title` | Page title | Starlight renders it as the page H1. |
| `description` | SEO and previews | Should appear in metadata. |
| `publish: true` | Codex sync gate | Marks the note as public. |
| `status: canon` | Codex sync gate | Marks the note as publishable canon. |
| `type: system` | Codex schema field | Useful for filtering and graphing. |
| `calendarDate` | Codex date engine | Renders an automatic linked Okse date badge. |
| `calendarShowcase` | Codex calendar module | Renders the full Okse calendar without MDX imports. |
| `era`, `faction`, `tags` | Codex taxonomy | Should be accepted by the current schema. |
| `sidebar` | Sidebar label/order/badge | Tests navigation display. |
| `tableOfContents` | TOC depth | Keeps only H2-H3 in the page TOC. |
| `banner` | Page announcement | Tests page-level banner styling. |
| `prev`, `next` | Pagination controls | Hides previous/next links. |
| `pagefind` | Search indexing | Keeps the demo out of search results. |

## Inline formatting

This paragraph tests **bold**, _italic_, ***bold italic***, ~~strikethrough~~, `inline code`, [internal-style links](/), and <kbd>keyboard hints</kbd>. It also tests punctuation around `code`, because bad spacing around inline code is surprisingly common in lore pages.

A VISCERIUM sentence with several inline styles: The **Okse Dominion** does not call its fortresses _beautiful_; it calls them `standing`, which is considered higher praise.

## Heading scale

Use H2s for major sections and H3s for sub-sections. Starlight automatically uses the page title as the H1, so do not add another `# Page Title` inside the note.

### H3: Secondary section

This H3 should appear in the table of contents if the page settings above are honoured.

#### H4: Fine detail

This H4 should render visually but should not appear in the table of contents with the current frontmatter.

## Paragraph rhythm

Short paragraph:

The horn did not sound. It remembered.

Medium paragraph:

In CITADEL-era records, a fortress is rarely described by its silhouette alone. Scribes care about what the walls forced people to do: where the market moved, which roads died, whose wells were taxed, and how many families learned to sleep beneath stone instead of sky.

Long paragraph:

The worst pages in a worldbuilding codex are not the sparse ones. Sparse can be expanded. The worst pages are the ones that look full while saying almost nothing: history without consequence, factions without appetite, geography without pressure, and names without weight. A useful codex page should leave a reader knowing what changes because this thing exists. If nothing changes, it is decoration wearing a helmet.

## Asides / admonitions

:::note
A plain note aside is good for neutral context, authorial reminders, or harmless lore clarifications.
:::

:::tip[Codex writing tip]
Every faction page should answer: **what story does this nation tell itself about why it deserves to survive?**
:::

:::caution
Use caution callouts for non-fatal problems: unstable terminology, canon risk, confusing aliases, or half-deprecated lore.
:::

:::danger[Canon hazard]
Use danger callouts sparingly. If every note has one, none of them matter.
:::

## Blockquotes

> Money flows here like water through a river, and anything can be bought for the right price.
>
> The lie is that price and cost are the same thing.

> [!NOTE]
> This is Obsidian's native callout syntax. It may look good in Obsidian, but it will not necessarily render as a Starlight aside unless the site pipeline has been configured to transform Obsidian callouts. Prefer Starlight `:::` asides for public pages.

## Lists

- Resonance
- Warfare
- Culture
  - Social hierarchy
  - Religion
  - History

1. Name the pressure.
2. Name who benefits from it.
3. Name who bleeds for it.
4. Name what breaks when it changes.

## Tables

| Faction / power | Public story | Actual pressure | Visual test |
|:---|:---|:---|:---|
| ASTU | Open hands, open minds | Trade security, sea lanes, democratic friction | Short text |
| TCSC | Progress through unity | Rail power, heavy industry, ideological cohesion | Longer cell text to check wrapping across responsive layouts |
| KRG | Recovery, salvage, contract survival | Money, deniability, second-hand hardware | Acronym-heavy |
| Republic of Askalia | Coin as freedom | Exploitation, slavery, guild pressure | Content warning risk |

## Authoring layout tags

[cols:2-1 gap=lg]
[col]
Main article body. This column should behave like normal prose and should not be crushed by the right sidebar or header image.
[/col]

[col]
[card:accent]
### Sidebar content

This card tests the BBCode-like authoring layer.
[/card]
[/col]
[/cols]

## Links and wikilinks

- [Codex home](/)
- [Okse Calendar](/calendar/)
- [[Republic of Askalia]]
- [[Myrkild]]
- [[Nonexistent Demo Target|Custom label for a missing target]]

## Images and embeds

Markdown image using a public URL. This should stay inside the article lane and must not float over text:

![Astro default open graph image](https://raw.githubusercontent.com/withastro/docs/main/public/default-og-image.png)

Obsidian embed syntax for a vault asset:

![[Tech timeline for VISCERIUM.jpg]]

## Details / disclosure blocks

<details>
<summary>Open this to test native HTML disclosure styling.</summary>

The hidden content can include **Markdown**, lists, and links.

- First hidden item
- Second hidden item
- Third hidden item with `inline code`
</details>

## Code blocks

```js title="codex-demo.js" {2-4}
export function pressureTestFaction(faction) {
  if (!faction.publicMyth) return 'Decoration wearing a flag';
  if (!faction.materialPressure) return 'Aesthetic without engine';
  return 'Usable';
}
```

```bash title="Local Starlight check"
cd Site
npm run sync
npm run build
```

## Footnotes

This sentence has a footnote.[^1]

[^1]: A short footnote for checking Starlight's default footnote styling.

## Final deletion note

This page is a tool, not lore. Once the site styling is stable, either hide it with `sidebar.hidden: true`, move it out of `Vault/Lore`, or delete it.