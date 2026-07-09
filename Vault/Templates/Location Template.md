---
title:
description:
publish: false
status: draft
faction:
region:
population:
climate:
image:
headerImage:
alt:
map:
  id:
  x:
  y:
  marker: location
  layer:
    - locations
tags:
---

# {{title}}

%% Header image: set `headerImage` to a vault asset path that can publish to `/assets/images/...`; in Obsidian, preview it here when useful. %%

```dataviewjs
await dv.view('Views/viscerium-sidebar', {
  accent: 'violet',
  sections: [
    { label: 'Region', field: 'region' },
    { label: 'Faction', field: 'faction' },
    { label: 'Population', field: 'population' },
    { label: 'Climate', field: 'climate' },
    { label: 'Map', field: 'map.id' }
  ]
});
```

## Summary

## Geography

## Districts and Landmarks

## People and Culture

## History

## Adventure Hooks

## Related

---

## Comments

Keep public discussion notes or moderation reminders here. Published site comments render in their own bottom section via Giscus.
