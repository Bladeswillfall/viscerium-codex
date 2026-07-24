# Storyteller Editing Migration

This note records the temporary compatibility decision for the Storyteller authoring workflow.

The existing creator-facing template remains named `Add Storyteller Fields.md` while its behaviour expands to support both initial population and later editing. Keeping the filename avoids breaking existing Templater references or hotkeys during the transition.

Once the workflow has been exercised successfully in Obsidian, a later ergonomics-only change may expose a friendlier **Edit Storyteller** alias or contextual command without changing the underlying frontmatter schema.
