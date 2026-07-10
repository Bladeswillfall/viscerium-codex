# VISCERIUM Timelines for Obsidian

This maintained local plugin renders canonical VISCERIUM timeline shortcodes through Chronos. It imports the shared calendar runtime, compiler, Chronos adapter and renderer from `Site/src/lib/`, compiles canon notes directly from the open vault, and does not require the Astro development server.

It is designed to coexist with the public **Chronos Timeline** community plugin:

- The public Chronos plugin owns fenced `chronos` blocks, templates, note links and quick Markdown timelines.
- VISCERIUM Timelines owns `[Timeline:...]` shortcodes, registered fictional calendars, canonical era membership and generated super/era datasets.

The local plugin deliberately does not register a second `chronos` code-block processor.

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

Also install and enable **Chronos Timeline** from the Obsidian community directory when you want native fenced blocks. The two plugins have separate processors and can be enabled together.

For development, run `npm run dev`, copy the resulting files, and use Obsidian's **Reload app without saving** command. The plugin provides **VISCERIUM Timelines: Refresh compiled timelines** in the command palette.

## Canonical shortcodes

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

## Native Chronos blocks

Use the public Chronos plugin for quick note-local timelines:

````md
```chronos
> NOTODAY
> ORDERBY start

- [9201] Example event | Hover detail
@ [9201~9400] #gray CITADEL
* [9210] Example point
= [9220] Example milestone
```
````

The site sync process converts the same block to `ChronosEmbed.astro`, so the core Chronos UI and syntax pass into Starlight. Native blocks are not imported into canonical generated timelines; use an event note with `calendarDate` when the entry must use registered calendars and era validation.

## Source-of-truth behaviour

- Only Markdown notes beneath `Lore/` with `publish: true` and `status: canon` are compiled into generated datasets.
- `calendarDate` is the sole canonical event start date.
- `calendarEndDate` is optional and creates a period by default.
- Era membership is calculated from canonical era records.
- Legacy `timeline.id`, `timeline.year` and `timeline.date` fail compilation.
- The normalized dataset is adapted to Chronos with `renderParsed`; authors do not maintain generated Chronos syntax.
- Selecting **Open full article** opens the source note in Obsidian.

## Files to commit

Commit the plugin source, manifest, build configuration and documentation. Do not commit:

- `node_modules/`
- `dist/`
- machine-specific `.obsidian/workspace*.json`
- Obsidian cache or hot-reload state

The plugin bundle is a local build artifact, not a manually maintained source.
