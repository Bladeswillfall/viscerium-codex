---
title: Example Character
description: "A sample public character linked to the faction, city, and battle examples."
publish: true
status: canon
slug: eras/citadel/characters/example-character
type: character
faction: Example Faction
location: Example City
tags:
  - example
era: CITADEL
sourcePath: "Eras/CITADEL/Characters/Example Character.md"
---

Example Character is a template-friendly protagonist, antagonist, witness, or scholar.

They live in [Example City](/eras/citadel/locations/example-city/) and study the history of [Example Battle](/eras/citadel/events/example-battle/).


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

## Comments

Keep public discussion notes or moderation reminders here. Published site comments render in their own bottom section via Giscus.
