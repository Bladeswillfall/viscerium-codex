# Contributing

Thanks for helping improve this codex.

## Source of truth

1. Edit source lore in `Vault/Lore/`, not generated files in `Site/src/content/docs/` or `Site/src/data/timelines/`.
2. Public notes need `publish: true`, `status: canon`, `title`, and `description`.
3. Public routes are derived from paths relative to `Vault/Lore/`; do not add `slug` frontmatter, and treat file moves as URL changes.
4. Use frontmatter for reader-facing structure such as `type`, `era`, `faction`, `location`, `participants`, `tags`, `related`, images, maps, timeline metadata and calendar dates.
5. Keep private lore, unreleased spoilers, credentials and personal data out of public issues, pull requests and published notes.

## Authoring checks

- Use wikilinks like `[[Example City]]` so backlinks and the graph view stay useful.
- Use Codex layout tags such as `[cols]`, `[card]`, `[note]`, `[warning]`, and `[lore]` instead of blank Markdown tables for layout.
- Use Obsidian embeds like `![[example-banner.svg]]` for vault assets copied during sync.
- Do not publish raw `dataviewjs`.
- Native fenced `chronos` blocks are supported for note-local editorial timelines and are transformed into Starlight Chronos embeds during sync.
- Creator-facing commands and terminal workflows are documented in `Vault/System/SOPs/Creator Command Reference.md`.

## Timeline authoring

- `calendarDate` is the sole start date for a canonical event note.
- Use `calendarEndDate` for a canonical range.
- Never add `timeline.id`, `timeline.year` or `timeline.date`; validation rejects them.
- Use importance for hierarchy, categories for subject matter and lanes for factions, regions, organisations or story threads.
- Declare the expected top-level era. The compiler verifies membership against canonical era boundaries.
- Use `[Timeline:super]` or a configured `timelineBlocks` shortcode to embed a generated canonical dataset.
- Use a fenced `chronos` block for a quick comparison, research, scene or editorial timeline that does not need to join generated era timelines.
- Do not duplicate canonical event dates in a hand-written Chronos block as a substitute for event metadata.

See `Site/TIMELINES.md` for the complete event and era schemas, Chronos integration, calendar behaviour, Obsidian setup and troubleshooting.

## Validation

Run the full local confidence check before opening a pull request:

```bash
cd Site
npm ci
npm test
npm run benchmark:timelines
```

`npm test` now runs Vault Doctor, unit tests and the production site build. Vault Doctor checks creator-database structure; it does not require optional worldbuilding fields to be filled.

Useful focused checks:

```bash
cd Site
npm run doctor:vault
npm run sync
npm run validate:vault
npm run validate:timelines
npm run validate
npm run generate:maps
npm run generate:timelines
npm run test:unit
```

Build the local Obsidian integration when timeline renderer or compiler code changes:

```bash
cd Tools/obsidian-viscerium-timelines
npm ci
npm run build
```

Pull requests should include a short summary, validation steps, screenshots for visible design changes, performance notes for large timeline changes and clear notes about generated content or publishing risks.
