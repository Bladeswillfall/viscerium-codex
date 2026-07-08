---
title: Okse Calendar
description: "The first implemented VISCERIUM calendar, rendered from structured calendar data and absolute world-time."
publish: true
status: canon
type: calendar
calendarShowcase:
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

The visible calendar module above is rendered from `calendarShowcase` frontmatter. This keeps the page Obsidian-friendly: the note remains plain Markdown, while Astro renders the heavy visual component during the site build.

## Why this page exists

This is the canonical public calendar route for the codex:

```text
/calendar/
```

The rendered year is currently `4`, a leap year, so both Engimanutur days appear in the grid.

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