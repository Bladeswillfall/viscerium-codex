# Story Entity Databases

The fauna, flora, fungi and item databases use **Obsidian Bases** as creator-only card browsers over ordinary Markdown notes.

> [!important] Public presentation
> Base cards do not publish to the Codex. The public consumer sees the Lore and Storyteller views. Structured properties from these notes can feed the Storyteller view later without exposing the authoring interface.

## Open the card browsers

- [[Fauna.base]]
- [[Flora.base]]
- [[Fungi.base]]
- [[Items.base]]
- [[Myrkild Units.base]]

Each Base has a focused card view for browsing and a table view for comparison or bulk editing.

## Create a story entity

1. Run **Templater: Create new note from template**.
2. Choose [[New Story Entity]].
3. Select Fauna, Flora, Fungi or Item.
4. Complete the small common core.
5. Select only the optional modules that matter to the current story.
6. Keep the note in `Drafts/` until it is ready for review.

The template creates only the optional properties you select. Declining a module does not establish negative canon and does not leave a visible checklist of missing work.

## Add detail later

Open an existing fauna, flora, fungi, item or Myrkild unit note, place the cursor where no inserted text will disrupt prose, then run **Templater: Insert template** and choose [[Add Storyteller Fields]].

The injector adds only currently absent fields to the note's frontmatter. It does not add prose or change existing values.

## Development levels

- `stub` — enough to identify the subject and distinguish it from an Earth default.
- `usable` — enough to place and use consistently in a scene or story.
- `developed` — deliberately interconnected or important enough to justify deeper treatment.

These are fitness states, not completion percentages. A background species can remain `usable` permanently.

## Source of truth

The Markdown note and its properties are the source of truth. A `.base` file is only a view. Do not store canon solely in Base configuration, filters or formulas.

## Placement model

The practical target remains:

> **Can this subject plausibly exist here, during these eras, and matter to the story being told?**

Use `eras`, `locations`, `biomes`, `rarity` and type-specific properties only where they help answer that question.

## Further guidance

Follow [[Entity Authoring SOP]] when deciding what to add, and [[Schema Change SOP]] before adding new shared properties or expanding a template.
