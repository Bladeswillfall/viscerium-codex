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

- Infobox sidebar
- Readable line width
- Heading hierarchy
- Paragraph spacing
- Compact properties
- Table styling
- Image styling
- Callout styling
- Embed styling
- Compact file explorer
- Folder icons
- Bases cards
- Bases table
- MySnippets menu

## Optional snippets

### Autohide properties

Available but intentionally disabled by default. It collapses the Properties block in Live Preview until hovered or focused. This is a behavioural change rather than a purely visual one, so enable it only when useful.

## MySnippets plugin

The enabled community-plugin list includes `mysnippets-plugin`.

Installed community-plugin bundles (`main.js` and `styles.css`) are intentionally ignored by Git in this repository, so a new machine still needs the plugin installed locally once through Obsidian's Community Plugins system.

The original MySnippets repository is:

https://github.com/chetachiezikeuzor/MySnippets-Plugin

The official build is old. A drop-in compatibility fork updated for newer Obsidian releases is available at:

https://github.com/Moyf/MySnippets

Both use the same `mysnippets-plugin` ID, so the vault configuration does not need to change between them.

## Compatibility rule

Prefer CSS that styles Obsidian's UI and rendered Markdown without requiring extra frontmatter, special tags, image syntax, or duplicate layout conventions.

If a visual feature requires authoring syntax, it should either use syntax already supported by the Codex or be implemented through an automated shared renderer. Do not create separate authoring conventions for Obsidian and the public Codex.
