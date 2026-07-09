---
title: Dataview Sidebar Templates
description: How VISCERIUM templates use Obsidian Dataview sidebars without polluting the published Codex.
publish: false
status: draft
type: system
---

# Dataview Sidebar Templates

The published Codex now builds its right-hand page sidebar from frontmatter. That means public notes should prioritise clean metadata over hand-built sidebar blocks.

Use this system note for Obsidian-only sidebar patterns. Do **not** paste raw `dataviewjs` blocks into public `publish: true` lore examples unless the site renderer has been taught how to transform them. Otherwise, the public page will show a code block instead of a sidebar.

## Public-site sidebar fields

These fields currently feed the Starlight page sidebar, image card, map/timeline generators, backlinks, graph view, and tag pages:

```yaml
type: faction
status: canon
era: CITADEL
faction: Example Faction
capital: Example City
territory: Example Valley
location: Example City
character: Example Character
species: Human
occupation: Pathfinder
alignment: Unaligned
tags:
  - citadel
  - faction
image: example-banner.webp
imagePage: /eras/citadel/images/example-banner/
imageTitle: Example Banner
alt: "Describe the image for screen readers."
artist: Artist Name
```

If a field helps readers navigate or understand the page at a glance, put it in frontmatter first. If it is only for your drafting workflow, keep it in an Obsidian-only template or a `%% comment %%`.

## Obsidian-only Dataview card

Use this in non-published templates, drafts, or private notes when you want a Wikipedia-style card inside Obsidian:

```dataviewjs
await dv.view('Views/viscerium-sidebar', {
  accent: 'crimson',
  sections: [
    { label: 'Faction', field: 'faction' },
    { label: 'Location', field: 'location' },
    { label: 'Era', field: 'era' },
    { label: 'Species', field: 'species' },
    { label: 'Occupation', field: 'occupation' },
    { label: 'Alignment', field: 'alignment' },
    { label: 'Allies', field: 'relationships.allies' },
    { label: 'Rivals', field: 'relationships.rivals' }
  ]
});
```

## Customization

- `accent` supports `crimson`, `gold`, and `violet`.
- `sections` controls the sidebar rows. Each row can read a frontmatter field with `field` or use a literal `value`.
- Dot paths like `relationships.allies` and `timeline.year` are supported.
- `image`, `alt`, `title`, `subtitle`, and `type` default to the current note frontmatter but can be overridden in the `dv.view` input.

## Better public-page layout

For public notes, use the codex layout tags instead of Dataview when you need visible callouts, sidebars, or structured article sections:

```md
[cols:2-1 gap=lg]
[col]
Main article body.
[/col]

[col]
[card:accent compact]
Sidebar-style public content.
[/card]
[/col]
[/cols]
```

## Setup Notes

Dataview view paths start at the vault root, so Obsidian-only templates call `Views/viscerium-sidebar` rather than a hidden folder. Keep the view outside dot-prefixed directories because Dataview cannot load custom views from them.

For best results, enable the `viscerium-sidebar.css` CSS snippet in Obsidian Settings → Appearance → CSS snippets. The view also injects `Views/viscerium-sidebar/view.css` at runtime, so Reading View still gets the sidebar styles even if snippet refresh is flaky.