---
title:
description:
publish: false
status: draft
slug:
type: timeline
headerImage:
---

# {{title}}

%% Native Chronos timeline. This is ideal for quick comparisons, scene chronology, research notes and editorial sketches. It is not automatically merged into the canonical super or era timelines. %%

```chronos
> NOTODAY
> ORDERBY start
> HEIGHT 360

# Events use a dash. A pipe adds hover detail.
- [9201] Example event | Concise event detail.

# Ranges use a tilde between dates.
- [9204~9208] Example ranged event

# Background periods use @.
@ [9201~9400] #gray CITADEL

# Points and markers use * and =.
* [9210] Example point
= [9220] Example milestone

# Add {Group Name} and #colour modifiers where useful.
- [9230] #red {Okse Dominion} Grouped example
```

## Notes

Chronos dates use its numeric ISO-like syntax. For canon events that must participate in registered VISCERIUM calendars, era validation, filters and the generated timelines, create an event note from `Event Template.md` instead.
