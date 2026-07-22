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

## Draft database folders

Working story-entity notes live under:

- `Drafts/Databases/Fauna/`
- `Drafts/Databases/Flora/`
- `Drafts/Databases/Fungi/`
- `Drafts/Databases/Items/`

Use folders for entity type, not era, nation or biome. Those relationships belong in note properties because a single entity may span many of them.

## Create from anywhere

1. Run **Templater: Create new note from template**.
2. Choose [[New Story Entity]].
3. Select Fauna, Flora, Fungi or Item.
4. Complete the small common core.
5. Select only the optional modules that matter to the current story.
6. The finished note is automatically filed into the matching draft database folder.

The template creates only the optional properties you select. Declining a module does not establish negative canon and does not leave a visible checklist of missing work.

## Create from a database folder

When Templater's per-device **Trigger Templater on new file creation** switch is enabled, creating a normal new Markdown note directly inside one of the four folders above automatically launches the same [[New Story Entity]] workflow.

The folder supplies the entity type, so the Fauna / Flora / Fungi / Item question is skipped. All later prompts and generated properties remain identical to command-based creation.

The repository stores the folder-template rules, but the master trigger switch is local to each Obsidian device. See [[Story Entity Workflow SOP]] for setup and troubleshooting.

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

Follow [[Story Entity Workflow SOP]] for creation and filing, [[Entity Authoring SOP]] when deciding what to add, and [[Schema Change SOP]] before adding new shared properties or expanding a template.
