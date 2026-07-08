---
title: Okse Calendar
description: "The first implemented VISCERIUM calendar, rendered from structured calendar data and absolute world-time."
publish: true
status: canon
type: calendar
calendarBlocks:
  ID-0001:
    calendar: okse
    year: 4
sidebar:
  label: Calendar
  order: 5
  badge:
    text: Okse
    variant: tip
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

The Okse Calendar is the first implemented calendar system in the codex. It is rendered from structured calendar data rather than a static image, so event articles can link back to individual days and the site can later show equivalent dates in other cultural calendars.

The visible calendar module below is placed with a BBCode-like shortcode in the note body. This keeps the page Obsidian-friendly: the note remains plain Markdown, while the sync step converts only this page to generated MDX for Astro.

[Calendar:ID-0001]

## Why this page exists

This is the canonical public calendar route for the codex:

```text
/calendar/
```

The rendered year is currently `4`, a leap year, so both Engimanutur days appear in the grid.

## Placing calendars in articles

Define the calendar block in frontmatter:

```yaml
calendarBlocks:
  ID-0001:
    calendar: okse
    year: 4
```

Then place it anywhere in the Markdown body:

```md
[Calendar:ID-0001]
```

For quick tests, you can also write the calendar directly:

```md
[Calendar:okse year=4]
```

## Using Okse dates in articles

Event articles can declare a structured date in frontmatter:

```yaml
calendarDate:
  calendar: okse
  year: 20001
  month: niewmonath
  day: 1
  displayCalendars:
    - okse
```

Intercalary days use `intercalaryDay` instead of `month` and `day`:

```yaml
calendarDate:
  calendar: okse
  year: 20004
  intercalaryDay: engimanutur-02
```

The site resolves the source date into hidden absolute world-time first, then renders it through the selected display calendars.