---
title: Dataview Sidebar Templates
description: How VISCERIUM templates render modern Wikipedia-style Obsidian sidebars with Dataview.
publish: false
status: draft
type: system
---

# Dataview Sidebar Templates

The vault templates use DataviewJS to call a reusable view at `Views/viscerium-sidebar`. The view reads the current note frontmatter and renders a right-side, Wikipedia-inspired lore card styled for the VISCERIUM brand.

```dataviewjs
await dv.view('Views/viscerium-sidebar', {
  accent: 'crimson',
  sections: [
    { label: 'Faction', field: 'faction' },
    { label: 'Location', field: 'location' }
  ]
});
```

## Customization

- `accent` supports `crimson`, `gold`, and `violet`.
- `sections` controls the sidebar rows. Each row can read a frontmatter field with `field` or use a literal `value`.
- Dot paths like `relationships.allies` and `timeline.year` are supported.
- `image`, `alt`, `title`, `subtitle`, and `type` default to the current note frontmatter but can be overridden in the `dv.view` input.

## Setup Notes

Dataview view paths start at the vault root, so the templates call `Views/viscerium-sidebar` rather than a hidden folder. Keep the view outside dot-prefixed directories because Dataview cannot load custom views from them.

For best results, enable the `viscerium-sidebar.css` CSS snippet in Obsidian Settings → Appearance → CSS snippets. The view also injects `Views/viscerium-sidebar/view.css` at runtime, so Reading View still gets the sidebar styles even if snippet refresh is flaky.
