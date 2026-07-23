# Atlas Authoring SOP

The public Atlas is generated from ordinary published map and lore notes. The source map image and note frontmatter are canonical; the website does not maintain a second map database.

## Map notes

Create map notes from [[Map Template]]. A published map needs:

- a unique `mapId`
- an image from `Vault/Assets/Maps/`
- a reader-safe `description`
- `width` and `height` when known

`defaultZoom`, `minZoom` and `maxZoom` are optional Leaflet zoom values. Leave them blank until the normal fitted view needs adjustment.

## Place a note on a map

Location notes and any other publishable note may use a `map:` block:

```yaml
map:
  id: errack
  x: 62.38
  y: 41.92
  marker: city
  layer:
    - civilisation/settlements
  minZoom:
  maxZoom:
```

`x` and `y` are percentages measured from the top-left of the source image. Keep them between `0` and `100`.

`marker` controls the public marker treatment. Prefer stable semantic kinds such as `capital`, `city`, `settlement`, `village`, `fortification`, `battlefield`, `ruin`, `rift`, `myrkild`, `naranor`, `anomaly`, `port`, `infrastructure`, `natural`, `map` or the generic `location`.

## Layers

Layer values are paths. `/` creates nested controls in the public Atlas.

Examples:

```yaml
layer:
  - civilisation/settlements
```

```yaml
layer:
  - threats/myrkild/rifts
```

```yaml
layer:
  - infrastructure/rail
```

Keep the first layer the marker's primary browsing layer. Additional layer values remain searchable metadata for now; do not duplicate the same marker purely to make it appear in multiple toggle groups.

## Zoom visibility

Use `map.minZoom` and `map.maxZoom` only to prevent clutter. A world map should not show every village at its default scale.

As a rule:

- leave major nations, capitals and major anomalies visible at broad scales
- reveal towns, forts and regional features as the reader zooms in
- reserve very high zoom levels for local landmarks

Do not use zoom visibility to hide spoilers. Public/creator visibility remains a publishing concern, not a map-scale concern.

## Nested maps

A map note can itself contain a `map:` block. This places the child map on its parent exactly like any other marker:

```yaml
mapId: kemsvall
map:
  id: krass-dominion
  x: 48.6
  y: 33.1
  marker: map
  layer:
    - maps/settlements
```

The public marker opens the child interactive map directly. This supports world → nation → region → settlement navigation without a separate nesting database.

## Build behaviour

`npm run dev` and `npm run build` regenerate `Site/src/data/maps.json` from the published Codex notes. Do not hand-edit that generated JSON.

## Source of truth

The Markdown note and its properties remain canonical. Atlas controls, generated JSON, marker popups and the public map view are projections of that source data.
