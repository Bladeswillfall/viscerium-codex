# Calendar engine

The codex calendar system is built around hidden absolute world-time.

Article frontmatter stores a structured source date in one calendar:

```yaml
calendarDate:
  calendar: okse
  year: 20001
  month: niewmonath
  day: 1
  displayCalendars:
    - okse
```

The engine converts that source date into an absolute day number, then renders it through each requested display calendar. This allows later calendars to show equivalent dates without rewriting event articles.

## Current calendar

Implemented calendar:

- `okse` — 13 months × 28 days, plus Engimanutur 01 every year and Engimanutur 02 every fourth year.

Okse weekday order:

1. Modirdag
2. Elddag
3. Vatnsdag
4. Erddag
5. Fadirdag
6. Laugdag
7. Degeldag

Epoch assumption:

```ts
absoluteDay: 0
Okse year: 1
month: niewmonath
day: 1
weekday: Modirdag
```

Leap-year rule:

```ts
year % 4 === 0
```

## Intercalary dates

Use `intercalaryDay` instead of `month` and `day`:

```yaml
calendarDate:
  calendar: okse
  year: 20004
  intercalaryDay: engimanutur-02
```

`engimanutur-02` only exists in leap years; invalid use will fail the build.

## Placing full calendars in pages

Full calendar grids are placed with an Obsidian-friendly shortcode in the note body:

```md
[Calendar:ID-0001]
```

Define the block in the page frontmatter:

```yaml
calendarBlocks:
  ID-0001:
    calendar: okse
    year: 4
```

The source note can stay as Markdown. During sync, any page that uses a `[Calendar:...]` shortcode is emitted as generated MDX so Astro can render the real `CalendarYear` component at that exact position.

For quick tests, the shortcode can also use an inline calendar id and year:

```md
[Calendar:okse year=4]
```

Prefer the `calendarBlocks` form for real articles because it keeps configuration in frontmatter and placement in the body.

## Files

- `src/data/calendars/okse.ts` — Okse calendar definition.
- `src/lib/calendar/types.ts` — shared calendar types.
- `src/lib/calendar/registry.ts` — registered calendars.
- `src/lib/calendar/convert.ts` — absolute-day conversion, validation, weekdays, formatting, and equivalence helpers.
- `src/components/calendar/CalendarYear.astro` — full calendar rendering.
- `src/components/calendar/CalendarDateBadge.astro` — article date badge.
- `src/styles/calendar.css` — calendar visuals.
- `scripts/sync-public-notes.mjs` — expands `[Calendar:...]` shortcodes into placed Astro components during the Obsidian sync.
- `Vault/Lore/Calendar.md` — Obsidian-source public calendar overview.
- `Vault/Lore/Calendar/Okse.md` — Obsidian-source detailed Okse calendar route used by date-badge anchors.

## Adding future calendars

Add another calendar definition, register it in `registry.ts`, then include it in article frontmatter:

```yaml
calendarDate:
  calendar: okse
  year: 20001
  month: niewmonath
  day: 1
  displayCalendars:
    - okse
    - askalian-civic
```

The source calendar can be any registered calendar. The engine resolves it to absolute world-time first, then converts it into each display calendar.
