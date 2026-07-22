# Obsidian CSS Snippets

The vault keeps Obsidian presentation tweaks as small, single-purpose CSS files in:

`Vault/.obsidian/snippets/`

Use **MySnippets** to toggle individual files from the Obsidian workspace while testing or adjusting the UI.

## Naming rule

Snippet filenames describe the visible behaviour directly. Avoid project-specific prefixes unless the behaviour itself is project-specific.

Good examples:

- `Folder icons`
- `Compact properties`
- `Bases cards`

The creator dashboard is deliberately project-specific, so `VISCERIUM Homepage` and `VISCERIUM Homepage responsive` are intentional exceptions.

Avoid names such as `VISCERIUM-Codex Folder icons` for otherwise reusable behaviour.

## Article width

Normal note width is owned by **Minimal Theme Settings**, not by a CSS snippet. The checked-in baseline is:

- Normal line width: **64em**
- Wide line width: **76em**
- Maximum line width: **92% of the pane**
- Readable line length: **enabled**

This gives ordinary articles substantially more room while still preventing very wide desktop panes from turning prose into edge-to-edge lines. Minimal applies the same width model to Reading View and Live Preview and handles narrow/mobile panes responsively.

Do not reintroduce a second global `markdown-preview-sizer` width rule. The old `Readable line width` snippet duplicated Minimal's own layout system and was the reason ordinary notes remained artificially narrow. Use Minimal's per-note `wide` or `max` helper classes only when a specific article genuinely benefits from a wider layout.

[[Home]] is the deliberate exception: its two VISCERIUM Homepage snippets override the normal article measure because Home is a dashboard/control surface rather than long-form prose.

## Enabled by default

### Reading and rendered content

- Heading hierarchy
- Paragraph spacing
- Link styling
- Blockquote styling
- List spacing
- Code block styling
- Horizontal rules
- Compact properties
- Table styling
- Image styling
- Callout styling
- Embed styling
- Timeline styling
- Tag styling
- Checkbox styling
- Hover previews

`Timeline styling` is the Obsidian presentation bridge for Chronos and the shared VISCERIUM timeline renderer. It maps the Codex/Starlight variables used by the shared renderer onto Obsidian theme variables, gives ordinary Chronos blocks an explicit `CHRONOS · PORTABLE TIMELINE` identity, and labels the StoryLine timeline projection with its source, date field, renderer and read-only role. It does not introduce timeline syntax or duplicate metadata.

The old Obsidian-only Dataview infobox/sidebar has been removed. Templates should use clean frontmatter for structured data and ordinary Markdown for article content rather than rendering a floating duplicate of the same metadata inside the note.

### Workspace and navigation

- Compact file explorer
- Folder icons
- Folder colors
- Article list colors
- Active file indicator
- Folder hierarchy
- Workspace labels
- Compact tabs
- Scrollbars
- Compact status bar
- Outline panel
- Search results
- VISCERIUM Homepage
- VISCERIUM Homepage responsive

`VISCERIUM Homepage` is scoped to notes with `cssclasses: viscerium-home` and currently applies only to [[Home]]. It owns the dashboard's visual treatment: functional colour families, flat panel hierarchy, quick-action styling, task/writing widgets and the creator-activity heatmap. The design deliberately uses solid surfaces, restrained borders and coloured title/accent lines rather than gradients or decorative shadows.

`VISCERIUM Homepage responsive` is the layout/interaction compatibility layer for the same page. It overrides the normal Minimal article measure, makes paired panels fit the actual pane instead of the overall app window, and provides the compact top control deck: colour-matched quick-action buttons plus responsive recent-work cards. The same rules reflow for desktop split panes, tablets and phones without relying on the overall app-window width. It also hides Home's redundant inline title and Properties block in Reading View.

The underlying homepage remains ordinary Markdown callouts, wikilinks and creator-only Dataview blocks, so disabling the snippets changes presentation rather than information architecture.

The file explorer uses stable section colours rather than assigning arbitrary colours by folder depth:

- Lore — cyan
- Stories — orange
- Drafts — amber
- Private — rose
- System — violet
- Templates — mint

Nested folders inherit their root section's colour family. Article titles receive a restrained tint, while the currently active article gets a stronger section-coloured background and left indicator.

`Workspace labels` adds small functional labels to the six root folders so the architecture remains obvious while navigating:

- Lore — `CANON`
- Stories — `WRITING`
- Drafts — `WIP`
- Private — `PRIVATE`
- System — `TOOLS`
- Templates — `REUSE`

These labels are file-explorer presentation only; the folder paths remain the actual architectural boundary.

### Bases and snippet management

- Bases cards
- Bases table
- MySnippets menu

### Behavioural

- Autohide properties

`Autohide properties` collapses the Properties block in Live Preview until hovered or focused. It is a behavioural change rather than a purely visual one and remains independently toggleable in MySnippets.

## MySnippets plugin

The enabled community-plugin list includes `mysnippets-plugin`.

This repository vendors the MySnippets compatibility runtime so a normal Git pull delivers the working plugin code as well as its configuration. `Vault/.obsidian/plugins/mysnippets-plugin/main.js` and `styles.css` are deliberate exceptions to the repository-wide community-plugin bundle ignore rule.

The compatibility runtime keeps the same `mysnippets-plugin` ID and is based on the newer MySnippets compatibility work for current Obsidian releases.

Original repository:

https://github.com/chetachiezikeuzor/MySnippets-Plugin

Compatibility baseline:

https://github.com/Moyf/MySnippets

Local compatibility notes live in:

`Vault/.obsidian/plugins/mysnippets-plugin/COMPATIBILITY.md`

## Compatibility rule

Prefer CSS that styles Obsidian's UI and rendered Markdown without requiring extra frontmatter, special tags, image syntax, or duplicate layout conventions.

If a visual feature requires authoring syntax, it should either use syntax already supported by the Codex or be implemented through an automated shared renderer. Do not create separate authoring conventions for Obsidian and the public Codex.

Creator-only control surfaces such as [[Home]] may use a dedicated `cssclasses` value when the class is clearly scoped to the interface note rather than ordinary lore content.

Standard Markdown constructs such as links, blockquotes, lists, fenced code, horizontal rules, tags, and task checkboxes may be styled freely because their source syntax is already valid Markdown and does not create a second Obsidian-only authoring system.
