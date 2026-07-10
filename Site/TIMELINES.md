# VISCERIUM timeline system

The timeline system has one chronology model for the Obsidian vault and the Astro/Starlight site.

## Architecture

```text
Vault canon notes
  calendarDate / calendarEndDate
          │
          ▼
Site/src/lib/calendar/runtime.mjs
  registered calendars ↔ absolute world-day
          │
          ▼
Site/src/lib/timeline/compiler.mjs
  validation, era membership, sorting, dataset generation
          │
          ├── Site/src/data/timelines/*.json → Astro renderer
          └── live vault records → Obsidian renderer

Site/src/lib/timeline/renderer.mjs
  shared vis-timeline adapter used by both surfaces
```

`calendarDate` is the only canonical event start date. Never add `timeline.year`, `timeline.date` or `timeline.id`. The compiler rejects those legacy fields.

The renderer maps absolute world-days to synthetic UTC JavaScript dates solely because `vis-timeline` needs JavaScript dates. One world day is exactly one UTC day. Gregorian labels are hidden and replaced with labels produced by the selected VISCERIUM calendar.

## Event schema

```yaml
---
title: Example Event
description: "A concise public description."
publish: true
status: canon
slug: eras/citadel/events/example-event
type: event
era: CITADEL

calendarDate:
  calendar: okse
  year: 9250
  month: niewmonath
  day: 1
  precision: day
  certainty: exact

calendarEndDate:

timeline:
  kind: event
  importance: standard
  categories:
    - military
    - political
  lanes:
    - okse-dominion
  global: auto
  era: auto
  order: 10

location:
  - Example Location
faction:
  - Okse Dominion
participants:
  - Example Character
tags:
  - example
---
```

Optional fields may be omitted. A note with `calendarEndDate` defaults to `period`; a point defaults to `event`. `timeline.order` is only a same-day tie-breaker.

### Date presentation

`precision` controls labels, never sorting or position:

- `day`
- `month`
- `year`

`certainty` controls visual presentation, never position:

- `exact`
- `approximate`
- `disputed`
- `legendary`

Start and end dates may use different registered calendars. Both resolve independently to absolute world-days.

### Importance

- `landmark`
- `major`
- `standard`
- `minor`
- `incidental`

`landmark` and `major` enter the `super` timeline automatically. Override with `timeline.global: include` or `exclude`.

### Categories and lanes

Categories are open-ended. Known visual mappings exist for technology, military, political, cultural, religious, economic, scientific, disaster, resonance, myrkild, naranor, exploration, social and environmental. Unknown categories use the neutral fallback.

Lanes are optional identifiers for factions, nations, regions, organisations or story threads. Readers can switch between unified, declared-lane and category views. The renderer caps the visible group count and folds low-volume groups into **Other / unassigned**.

## Era schema

```yaml
---
title: CITADEL
description: "A time of steel, bone and thrones."
publish: true
status: canon
slug: eras/citadel
type: era
eraId: citadel

calendarDate:
  calendar: okse
  year: 9201
  month: niewmonath
  day: 1
  precision: year
  certainty: exact

calendarEndDate:
  calendar: okse
  year: 9400
  intercalaryDay: engimanutur-02
  precision: year
  certainty: exact

timeline:
  kind: era
  order: 1
  visualToken: e1
  allowGapAfter: true
  defaultViewport:
    paddingDays: 56
---
```

Canonical era records live in `Vault/Lore/Eras/`. Point events belong to the era containing their absolute day. Periods belong to every era they overlap. A declared `era` that disagrees with chronology fails validation. Set `allowGapAfter: true` only when a historical gap is deliberate.

## Generated timelines

The compiler always generates:

- `super`
- `citadel`
- `smog`
- `nearsight`
- `entropy`
- `manifest.json`

Datasets are generated into `Site/src/data/timelines/` at build time. They are outputs, not hand-maintained lore.

## Embedding in notes

Simple form:

```md
[Timeline:super]
```

Inline test form:

```md
[Timeline:super calendar=okse lane=unified filters=true minimap=true]
```

Configured form:

```yaml
timelineBlocks:
  ID-0001:
    timeline: super
    defaultCalendar: okse
    laneMode: unified
    showFilters: true
    showMinimap: true
    showLegend: true
```

```md
[Timeline:ID-0001]
```

The sync step converts the shortcode to `TimelineEmbed.astro`. The Obsidian plugin detects the same shortcode in Reading view.

## Adding an event

1. Create the note beneath `Vault/Lore/` using `Vault/Templates/Event Template.md`.
2. Set `publish: true`, `status: canon`, `type: event` and a concise description.
3. Author exactly one `calendarDate`.
4. Add `calendarEndDate` only for a range.
5. Choose importance, categories and optional lanes.
6. Declare the expected top-level era. The compiler verifies it from chronology.
7. Run `npm run sync` and `npm run generate:timelines` from `Site/`.

## Adding a calendar

1. Add a canonical runtime definition in `Site/src/data/calendars/<id>.mjs`.
2. Add a typed re-export when TypeScript consumers need one.
3. Register it in `Site/src/lib/calendar/runtime.mjs`.
4. Add conversion tests covering its epoch, leap rules, intercalary dates and negative absolute days where supported.
5. Use the new ID in `calendarDate`. No timeline renderer changes should be needed.

## Site commands

From `Site/`:

```bash
npm install
npm run sync
npm run validate
npm run generate:timelines
npm run test:unit
npm run benchmark:timelines
npm run build
```

`npm run build` runs sync, validation, graph generation, map generation and timeline generation before Astro's static build.

## Performance model

- Only the selected timeline dataset is bundled into a page.
- Article bodies are not copied into timeline JSON.
- At distant zoom levels, lower-importance events are omitted from the graphical item set.
- `vis-timeline` updates on filter or zoom-threshold changes rather than rebuilding every item on every pan.
- Calendar labels are reformatted from absolute days without changing event positions.
- Lane/category grouping is capped.
- Every page contains a lightweight static chronological fallback list.

Run `npm run benchmark:timelines` to compile deterministic synthetic sets of 1,000 and 5,000 events. The script fails if compilation exceeds five seconds in the CI environment and reports heap and dataset size figures.

## Renderer decision

The implementation uses `vis-timeline` directly rather than the `chronos-timeline-md` wrapper. Chronos Markdown would have introduced a second authoring syntax, while the wrapper does not provide enough control over non-Gregorian axes, synchronized minimaps, URL state and the accessible detail/list interface. Chronos-compatible concepts remain—points, ranges, groups, backgrounds and clustering—but VISCERIUM metadata remains the source of truth.

## Troubleshooting

- **Legacy field error:** remove `timeline.id`, `timeline.year` or `timeline.date`; move the date into `calendarDate`.
- **Unknown month/intercalary day:** use the slug from the source calendar definition.
- **Era mismatch:** correct the event date or declared top-level era. Do not override calculated membership.
- **Period missing end:** add `calendarEndDate` or change `timeline.kind`.
- **Blank interactive view:** the static list should remain visible when mounting fails. Check the browser console and regenerate datasets.
- **Obsidian article link does not open:** ensure the compiled event's source note still exists beneath `Lore/`.
