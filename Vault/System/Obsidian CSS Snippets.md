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

The creator dashboard is deliberately project-specific, so `VISCERIUM Homepage` is an intentional exception.

Avoid names such as `VISCERIUM-Codex Folder icons` for otherwise reusable behaviour.

## Enabled by default

### Reading and rendered content

- Infobox sidebar
- Readable line width
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

`VISCERIUM Homepage` is scoped to notes with `cssclasses: viscerium-home` and currently applies only to [[Home]]. It provides the responsive two-column panel layout, creator-action button styling and recent-work table treatment. The underlying homepage remains ordinary Markdown callouts, wikilinks and creator-only Dataview blocks, so disabling the snippet changes presentation rather than information architecture.

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
