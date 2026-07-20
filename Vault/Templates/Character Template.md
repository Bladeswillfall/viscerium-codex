---
title:
description:
publish: false
status: draft
type: character
faction:
location:
species:
occupation:
alignment:
image:
imagePage:
imageTitle:
artist:
headerImage:
alt:
tags:
relationships:
  allies:
  rivals:
---

# {{title}}

%% Sidebar portrait: set `image` to `/assets/images/example.webp` or just `example.webp`. %%
%% Image details: set `imagePage` to the published image metadata page, e.g. `/eras/citadel/images/example-portrait/`. %%
%% Use `imageTitle` and `artist` to show the artwork name and artist beneath the sidebar image. %%
%% Header image: set `headerImage` to a vault asset path that can publish to `/assets/images/...`; in Obsidian, preview it here when useful. %%

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

## Summary

## Appearance

## Personality

## Biography

### Early Life

### Major Events

## Abilities and Resources

## Relationships

## Notes and Secrets

Keep private information in `Vault/Private/` or leave `publish: false`.

## Related

---

## Comments

Keep public discussion notes or moderation reminders here. Published site comments render in their own bottom section via Giscus.
