# StoryLine Integration

StoryLine is the private/offline narrative-planning layer for VISCERIUM. Its project root is:

`Vault/Stories/`

Everything beneath `Stories/` is excluded from Codex publishing. Only `Vault/Lore/` can become public.

## Source-of-truth rule

Story projects must remain portable Markdown and YAML.

- StoryLine owns project structure, scene prose, `sequence`, `chronologicalOrder`, POV, characters, locations, status, synopsis and other story-planning fields.
- StoryLine project-local `System/` JSON may store plugin UI/layout state, but it is not authoritative story lore.
- VISCERIUM Timelines reads StoryLine scene frontmatter and builds its timeline view in memory.
- Do not manually duplicate StoryLine chronology into `calendarDate`, native Chronos blocks, or generated timeline files.

## Story dates

For StoryLine scenes, `storyDate` is the single date field used by the VISCERIUM story-timeline adapter.

Preferred readable form:

```yaml
storyDate: "16 Sólmanuthur, 9250"
```

Compact form:

```yaml
storyDate: "9250-solmanuthur-16"
```

Explicit calendar form:

```yaml
storyDate: "okse:16 Sólmanuthur, 9250"
```

StoryLine can continue to use `chronologicalOrder` for its chronological scene ordering. VISCERIUM Timelines converts `storyDate` to the registered fictional calendar only when rendering the story timeline.

Scenes without a supported `storyDate` remain valid StoryLine scenes. They are simply listed as unplaced in the VISCERIUM story-timeline view until a date is supplied.

## Open the VISCERIUM story timeline

1. Open a StoryLine project note or one of its scene notes beneath `Stories/`.
2. Run **VISCERIUM Timelines: Open StoryLine project timeline** from the command palette.
3. The generated view reads that project's `Scenes/` folder and opens scene notes when timeline entries are selected.

No shortcode is inserted into the project and no generated timeline file is written.

## Plugin setup

The vault enables the StoryLine plugin ID `storyline` and stores only this repository-level setting:

```json
{
  "storyLineRoot": "Stories"
}
```

StoryLine's executable plugin bundle is not vendored. Install it once through Obsidian Community Plugins and let Obsidian handle normal plugin updates.

The local VISCERIUM Timelines plugin remains the adapter between StoryLine scene metadata and the shared VISCERIUM calendar/Chronos renderer.
