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

Avoid names such as `VISCERIUM-Codex Folder icons`.

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
- Tag styling
- Checkbox styling
- Hover previews

### Workspace and navigation

- Compact file explorer
- Folder icons
- Folder colors
- Article list colors
- Active file indicator
- Folder hierarchy
- Compact tabs
- Scrollbars
- Compact status bar
- Outline panel
- Search results

The file explorer uses stable section colours rather than assigning arbitrary colours by folder depth:

- Lore — cyan
- Drafts — amber
- Private — rose
- System — violet
- Templates — mint

Nested folders inherit their root section's colour family. Article titles receive a restrained tint, while the currently active article gets a stronger section-coloured background and left indicator.

### Bases and snippet management

- Bases cards
- Bases table
- MySnippets menu

## Optional snippets

### Autohide properties

Available but intentionally disabled by default. It collapses the Properties block in Live Preview until hovered or focused. This is a behavioural change rather than a purely visual one, so enable it only when useful.

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

Standard Markdown constructs such as links, blockquotes, lists, fenced code, horizontal rules, tags, and task checkboxes may be styled freely because their source syntax is already valid Markdown and does not create a second Obsidian-only authoring system.
