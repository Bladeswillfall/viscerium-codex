---
title: Example City
description: "A sample city with generated map marker data, faction links, tags, and public layout guidance."
publish: true
status: canon
slug: eras/citadel/locations/example-city
type: location
icon: "fa-solid fa-city"
era: CITADEL
faction: Example Faction
location: Example City
tags:
  - example
  - location-template
  - citadel
map:
  id: example-world
  x: 52
  y: 41
  marker: city
  layer:
    - cities
related:
  - Example Faction
  - Example Battle
  - Example World Map
eraStyle: e1
sourcePath: "Eras/CITADEL/Locations/Example City.md"
updated: "2026-07-10T13:09:48Z"
---

Example City is a public location note with generated map marker data. It is governed by [Example Faction](/eras/citadel/factions/example-faction/), appears in [Example Battle](/eras/citadel/events/example-battle/), and belongs on [Example World Map](/eras/citadel/maps/example-world-map/).

<div class="cx-cols cx-cols-2-1 cx-gap-lg">

<div class="cx-col">

## <span class="codex-icon codex-heading-icon" aria-hidden="true"><i class="fa-solid fa-book-open fa-fw"></i></span> Summary

Open with the city's function in the story: fortress, port, market, pilgrimage site, plague knot, imperial capital, prison-city, or ruin wearing a new name.

## <span class="codex-icon codex-heading-icon" aria-hidden="true"><i class="fa-solid fa-cloud fa-fw"></i></span> Atmosphere

Describe what a visitor sees, smells, hears, and fears within the first hour of arrival.

## <span class="codex-icon codex-heading-icon" aria-hidden="true"><i class="fa-solid fa-map-location-dot fa-fw"></i></span> Districts and Landmarks

- **Old Gate** — What enters, what leaves, and who profits from both.
- **Market Spine** — What is sold openly and what is only sold after dusk.
- **Shrine Quarter** — What the city claims to worship and what it actually obeys.

</div>

<div class="cx-col">

<aside class="cx-callout cx-callout-note">

<p class="cx-callout-title">Map marker</p>

The `map` frontmatter places this note on the generated `example-world` map. Use `x` and `y` as percentage coordinates from the top-left of the map image.

</aside>

<div class="cx-card cx-card-muted cx-card-compact">

**Marker checklist**

- `map.id` matches a `type: map` note
- `x` and `y` are set
- `marker` describes the marker style
- `layer` groups filters such as `cities`, `ruins`, or `battlefields`

</div>

</div>

</div>

## <span class="codex-icon codex-heading-icon" aria-hidden="true"><i class="fa-solid fa-landmark fa-fw"></i></span> Government

Who rules here, who believes they rule here, and who actually decides whether the gates open.

## <span class="codex-icon codex-heading-icon" aria-hidden="true"><i class="fa-solid fa-coins fa-fw"></i></span> Economy

List exports, imports, taxes, black markets, guild monopolies, seasonal shortages, and debt traps.

## <span class="codex-icon codex-heading-icon" aria-hidden="true"><i class="fa-solid fa-triangle-exclamation fa-fw"></i></span> Threats

Use this section for bandits, Myrkild pressure, occult contamination, faction rivalry, disease, food insecurity, local monsters, or corrupt law.

## <span class="codex-icon codex-heading-icon" aria-hidden="true"><i class="fa-solid fa-diagram-project fa-fw"></i></span> Related

- [Example Faction](/eras/citadel/factions/example-faction/)
- [Example Battle](/eras/citadel/events/example-battle/)
- [Example World Map](/eras/citadel/maps/example-world-map/)
