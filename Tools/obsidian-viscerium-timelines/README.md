# VISCERIUM Timelines for Obsidian

This small local plugin renders the same generated chronology model used by the Astro/Starlight Codex. It does not call the website, require a development server, or interpret a second timeline format.

The plugin imports the shared calendar runtime, timeline compiler rules and `vis-timeline` adapter from `Site/src/lib/`. It compiles canon notes directly from the open vault, then replaces timeline shortcodes in Reading view.

## Build

From this directory:

```bash
npm install
npm run build
```

The build writes:

```text
dist/
  main.js
  manifest.json
  styles.css
```

## Install locally

Create the plugin directory inside the vault:

```text
Vault/.obsidian/plugins/viscerium-timelines/
```

Copy the three files from `dist/` into that directory, reload Obsidian, then enable **VISCERIUM Timelines** under Community plugins.

For development, run `npm run dev`, copy the resulting files, and use Obsidian's **Reload app without saving** command. The plugin also provides **VISCERIUM Timelines: Refresh compiled timelines** in the command palette.

## Shortcodes

Direct timeline:

```md
[Timeline:super]
```

Inline options:

```md
[Timeline:super calendar=okse lane=unified filters=true minimap=true]
```

Configured block:

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

Supported timeline IDs are `super`, `citadel`, `smog`, `nearsight` and `entropy`.

## Source-of-truth behaviour

- Only Markdown notes beneath `Lore/` with `publish: true` and `status: canon` are compiled.
- `calendarDate` is the sole event start date.
- `calendarEndDate` is optional and creates a period by default.
- Era membership is calculated from the canonical era records.
- Legacy `timeline.id`, `timeline.year` and `timeline.date` fail compilation.
- Selecting **Open full article** opens the source note in Obsidian.

## Files to commit

Commit the plugin source, manifest, build configuration and documentation. Do not commit:

- `node_modules/`
- `dist/`
- machine-specific `.obsidian/workspace*.json`
- Obsidian cache or hot-reload state

The published plugin bundle is a local build artifact, not a manually maintained source.
