---
title:
description:
publish: false
status: draft
slug: locations/
type: location
faction:
region:
population:
climate:
image:
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
