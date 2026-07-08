---
title: Starlight Feature Demo
description: "A VISCERIUM codex demo page for testing Obsidian Markdown, Astro Starlight rendering, headings, asides, code blocks, tables, details, embeds, and frontmatter behaviour."
publish: true
status: canon
slug: demo/starlight-feature-demo
type: system
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
Copy this file into `Vault/Lore/Demo/Starlight Feature Demo.md`.
The repo sync script strips Obsidian comments like this before publishing.
%%

This page is a visual stress-test for the VISCERIUM codex. It is intentionally overloaded. Keep it around while tuning theme, typography, sidebar labels, table of contents depth, admonitions, code windows, and Obsidian-to-Starlight publishing behaviour.

The tone samples below use VISCERIUM material because a sterile demo page lies to you. Your site needs to survive actual codex prose: dense faction names, occult terminology, short quotes, long paragraphs, ugly tables, embedded assets, and half-finished notes.

:::note[Demo intent]
This file is written as **plain Markdown** so it opens cleanly in Obsidian and should pass through the repo's `Vault/Lore` sync pipeline. Components like live cards, tabs, file trees, badges, icons, and link buttons need MDX or Markdoc. Use the companion `Starlight Component Gallery.mdx` for those.
:::

## Rendering checklist

- [ ] Frontmatter parses without build errors.
- [ ] The banner appears at the top of the page.
- [ ] Sidebar label shows as `Feature Demo` with a badge.
- [ ] H2 and H3 headings appear in the right-hand table of contents.
- [ ] H4-H6 headings render but do not clutter the table of contents.
- [ ] Asides render as styled Starlight callouts.
- [ ] Code blocks show syntax highlighting, titles, frames, line highlights, and diffs.
- [ ] Tables remain readable on mobile.
- [ ] Details/summary accordions open and close correctly.
- [ ] Footnotes jump correctly.
- [ ] Obsidian embeds and wikilinks either resolve or fail gracefully.

## Frontmatter features being tested

This page uses several Starlight and codex-specific frontmatter fields:

| Field | Purpose | Expected effect |
|---|---|---|
| `title` | Page title | Starlight renders it as the page H1. |
| `description` | SEO and previews | Should appear in metadata. |
| `publish: true` | Codex sync gate | Marks the note as public. |
| `status: canon` | Codex sync gate | Marks the note as publishable canon. |
| `type: system` | Codex schema field | Useful for filtering and graphing. |
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

##### H5: Tiny detail

Useful for deep reference notes, but do not overuse it.

###### H6: Probably too deep

If your codex page needs H6s, the page probably needs to be split.

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

:::tip[Icon test]{icon="heart"}
This tests a custom aside icon. If the icon fails, check the icon name against Starlight's built-in icon set.
:::

:::caution
Use caution callouts for non-fatal problems: unstable terminology, canon risk, confusing aliases, or half-deprecated lore.
:::

:::danger[Canon hazard]
Use danger callouts sparingly. If every note has one, none of them matter.

- This page contains deliberate stress-test content.
- Do not mistake demo snippets for final canon.
- Delete or hide this page before public launch if it feels too artificial.
:::

## Blockquotes

> Money flows here like water through a river, and anything can be bought for the right price.
>
> The lie is that price and cost are the same thing.

> [!NOTE]
> This is Obsidian's native callout syntax. It may look good in Obsidian, but it will not necessarily render as a Starlight aside unless the site pipeline has been configured to transform Obsidian callouts. Prefer Starlight `:::` asides for public pages.

## Lists

### Unordered list

- Resonance
- Warfare
- Culture
  - Social hierarchy
  - Religion
  - History
    - Public myth
    - Private shame

### Ordered list

1. Name the pressure.
2. Name who benefits from it.
3. Name who bleeds for it.
4. Name what breaks when it changes.

### Task list

- [x] Write the public-facing hook.
- [x] Add a grim, tactile detail.
- [ ] Replace placeholder art.
- [ ] Check all wikilinks.

## Tables

| Faction / power | Public story | Actual pressure | Visual test |
|:---|:---|:---|:---|
| ASTU | Open hands, open minds | Trade security, sea lanes, democratic friction | Short text |
| TCSC | Progress through unity | Rail power, heavy industry, ideological cohesion | Longer cell text to check wrapping across responsive layouts |
| KRG | Recovery, salvage, contract survival | Money, deniability, second-hand hardware | Acronym-heavy |
| Krass Dominion | Tradition survives the weather | Land, fog, inheritance, cunning | Pagan/druidic phrasing |
| Republic of Askalia | Coin as freedom | Exploitation, slavery, guild pressure | Content warning risk |

## Tables (BBcode-style)

Below is a test for BBcode-like tables for aligning formatting columns/rows without using the regular markdown tables style.

[cols:2-1 gap=lg]
[col]
Main prose.
[/col]

[col]
[card:accent]
Sidebar content.
[/card]
[/col]
[/cols]

## Links and wikilinks

Normal Markdown links should work in Obsidian and Starlight:

- [Codex home](/)
- [Astro Starlight docs](https://starlight.astro.build/)

Obsidian wikilinks should be converted by the codex sync script only when the target note is published and can be matched by title or filename:

- [[Republic of Askalia]]
- [[Myrkild]]
- [[Nonexistent Demo Target|Custom label for a missing target]]

## Images and embeds

Markdown image using a public URL:

![Astro default open graph image](https://raw.githubusercontent.com/withastro/docs/main/public/default-og-image.png)

Obsidian embed syntax for a vault asset:

![[Tech timeline for VISCERIUM.jpg]]

If the embedded asset is not present in `Vault/Assets/Images`, `Vault/Assets/Maps`, or `Vault/Assets/Documents`, the sync script should replace it with a missing-asset warning.

## Details / disclosure blocks

<details>
<summary>Open this to test native HTML disclosure styling.</summary>

The hidden content can include **Markdown**, lists, and links.

- First hidden item
- Second hidden item
- Third hidden item with `inline code`

This is useful for spoilers, deprecated lore, mechanical notes, or long author comments.
</details>

## Raw HTML snippets

Some HTML is useful in Markdown pages.

<figure>
  <blockquote>
    <p>The wall was not built to keep monsters out. It was built to decide who counted as human when the monsters came.</p>
  </blockquote>
  <figcaption>— demo epigraph for a defensive doctrine page</figcaption>
</figure>

Small UI fragments: <mark>highlighted text</mark>, <small>fine print</small>, <kbd>Ctrl</kbd> + <kbd>K</kbd>.

## Code blocks

### Plain fenced code

```js
// codex-demo.js
export function pressureTestFaction(faction) {
  if (!faction.publicMyth) return 'Decoration wearing a flag';
  if (!faction.materialPressure) return 'Aesthetic without engine';
  return 'Usable';
}
```

### Highlighted lines

```js {2-4}
const faction = 'Republic of Askalia';
const publicStory = 'Trade makes men free';
const hiddenCost = 'Everything has a price, including people';
const verdict = publicStory.includes('free') && hiddenCost.includes('price');
console.log({ faction, verdict });
```

### Highlighted text and regex markers

```js "Resonance" /Wyrdweave|Galdyr/
const forces = ['Resonance', 'Wyrdweave', 'Galdyr'];
console.log(forces.join(' / '));
```

### Inserted and deleted markers

```js ins="Republic" del="Kingdom"
const oldName = 'Kingdom of Askalia';
const newName = 'Republic of Askalia';
```

### Diff block with language

```diff lang="md"
- The nation is rich and powerful.
+ Askalia is rich because it learned how to turn dependency into law.
```

### Terminal frame with title

```bash title="Local Starlight check"
cd Site
npm run sync
npm run build
```

### No frame

```bash frame="none"
echo "This should render without a terminal/code-editor frame."
```

### JSON sample

```json title="codex-page.json"
{
  "title": "Starlight Feature Demo",
  "publish": true,
  "status": "canon",
  "type": "system",
  "pagefind": false
}
```

## Footnotes

This sentence has a footnote.[^1] This sentence has another footnote with a longer label.[^codex-note]

[^1]: A short footnote for checking Starlight's default footnote styling.
[^codex-note]: A longer footnote. Use these for small clarifications, not for hiding essential canon. If the footnote is required to understand the page, it belongs in the main text.

## Horizontal rule

Above the rule.

---

Below the rule.

## Stress paragraph: dense lore names

Galdyr, the Wyrdweave, the Myrkild, the Naranor, ASTU, TCSC, KRG, the Republic of Askalia, the Krass Dominion, the Okse Dominion, and the Throatless all appear in one paragraph to check line-height, wrapping, search excerpts, and whether the page starts to look like alphabet soup. If it does, the design is not the only problem; the writing may need cleaner rhythm.

## Final deletion note

This page is a tool, not lore. Once the site styling is stable, either hide it with `sidebar.hidden: true`, move it out of `Vault/Lore`, or delete it.
