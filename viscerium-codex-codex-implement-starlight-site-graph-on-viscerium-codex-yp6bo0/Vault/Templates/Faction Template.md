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
headerImage:
alt:
tags:
relationships:
  allies:
  enemies:
---

# {{title}}

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
