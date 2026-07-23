# Writer Inbox

Use this as a **capture buffer**, not a second planning system.

When a worldbuilding or story thought interrupts the manuscript, use **Templater: Create Capture Idea** or the **Capture Idea** button on [[Home]]. The thought is filed under `Drafts/Inbox/` with only a timestamp and inbox status.

Review captures when it is useful. A capture can be moved into a proper Lore/Draft/Story note, turned into a deliberate task, or simply deleted. Nothing here is automatically canon and there is no expectation that the inbox reaches zero.

## Inbox

```dataview
TABLE WITHOUT ID
file.link AS "Capture",
dateformat(file.ctime, "dd LLL yyyy HH:mm") AS "Captured"
FROM "Drafts/Inbox"
WHERE status = "inbox"
SORT file.ctime DESC
```

## Working rule

> Capture now. Worldbuild later.

Do not expand a capture merely because it exists. Only promote it when the manuscript or setting genuinely needs it.
