# Recommended Plugins

The publishing workflow does not require paid plugins. Keep the authoring stack small and add optional plugins only when they remove more work than they create.

## Required for the checked-in creator workflow

1. Enable the built-in **Templates** plugin and keep `Templates` as its template folder.
2. Enable the built-in **Bases** plugin for creator-only card and database views.
3. Enable **Templater** for guided entity creation and progressive Storyteller field injection. Its checked-in configuration uses `Templates` and does not run automatically on file creation.
4. Enable **Dataview** to render the shared sidebar in canonical templates.

## Optional conveniences

1. **Advanced Tables** or the checked-in table editor can help with table-style editing.
2. **Editing Toolbar** can provide a more visual editing experience.
3. **Style Settings** and a preferred theme can change Obsidian-only appearance.

Do not add a plugin merely to expose more fields, forms or dashboards. The creator workflow should remain understandable from the Markdown notes, templates, Bases and SOPs committed to the repository.

## Publishing caution

Dataview queries, Templater commands, plugin-only syntax, and theme-specific styling may not render on the Astro site.

Templater commands should be executed during authoring so the resulting note contains ordinary Markdown and frontmatter. Important public content must remain available as normal Markdown or structured properties that the site explicitly consumes.
