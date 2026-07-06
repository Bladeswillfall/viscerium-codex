---
title:
description:
publish: false
status: draft
slug: characters/
type: character
era:
faction:
location:
species:
occupation:
alignment:
image:
alt:
tags:
relationships:
  allies:
  rivals:
---

# {{title}}

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
