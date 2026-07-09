# Contributing

Thanks for helping improve this codex.

## Source of truth

1. Edit source lore in `Vault/Lore/`, not generated files in `Site/src/content/docs/`.
2. Public notes need `publish: true`, `status: canon`, `title`, `description`, `slug`, and `type`.
3. Use frontmatter for reader-facing structure such as `era`, `faction`, `location`, `character`, `tags`, `related`, `image`, map markers, timeline data, and calendar dates.
4. Keep private lore, unreleased spoilers, credentials, and personal data out of public issues, pull requests, and published notes.

## Authoring checks

- Use wikilinks like `[[Example City]]` so backlinks and the graph view stay useful.
- Use Codex layout tags such as `[cols]`, `[card]`, `[note]`, `[warning]`, and `[lore]` instead of blank Markdown tables for layout.
- Use Obsidian embeds like `![[example-banner.webp]]` for vault assets that should be copied during sync.
- Do not put raw `dataviewjs` blocks into public canon notes unless the site renderer explicitly handles them.

## Validation

Run validation before opening a pull request:

```bash
cd Site
npm install
npm run build
```

For smaller content-only checks, run the relevant steps directly:

```bash
cd Site
npm run sync
npm run validate
npm run generate:graph
npm run generate:maps
npm run generate:timelines
```

Pull requests should include a short summary, validation steps, screenshots for visible design changes, and clear notes about generated content or publishing risks.