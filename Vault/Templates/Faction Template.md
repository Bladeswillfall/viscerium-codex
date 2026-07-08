---
title:
description:
publish: false
status: draft
slug: factions/
type: faction
era:
capital:
territory:
leader:
government:
founding:
image:
imagePage:
imageTitle:
artist:
headerImage:
alt:
tags:
relationships:
  allies:
  enemies:
---

# {{title}}

%% Sidebar emblem/artwork: set `image` to `/assets/images/example.webp` or just `example.webp`. %%
%% Image details: set `imagePage` to the published image metadata page, e.g. `/eras/citadel/images/example-banner/`. %%
%% Use `imageTitle` and `artist` to show the artwork name and artist beneath the sidebar image. %%
%% Header image: set `headerImage` to a vault asset path that can publish to `/assets/images/...`; in Obsidian, preview it here when useful. %%
%% Page breadcrumbs: Home / {{type}} / {{title}}. Keep these as wiki links when parent pages exist. %%

```dataviewjs
await dv.view('Views/viscerium-sidebar', {
  accent: 'gold',
  sections: [
    { label: 'Capital', field: 'capital' },
    { label: 'Territory', field: 'territory' },
    { label: 'Leader', field: 'leader' },
    { label: 'Government', field: 'government' },
    { label: 'Founded', field: 'founding' },
    { label: 'Allies', field: 'relationships.allies' },
    { label: 'Enemies', field: 'relationships.enemies' }
  ]
});
```

## Summary

## Culture

## Government

## Military

## Economy

## History

## Important Members

## Related Locations

## Related

## Comments

Keep public discussion notes or moderation reminders here. Published site comments render in their own bottom section via Giscus.