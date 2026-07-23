# Obsidian Setup

Open only the `Vault/` folder in Obsidian.

> [!tip] Start at Home
> [[Home]] is the creator front door: recent work, databases, story/timeline actions, SOPs, health checks and era navigation. Use [[Creator Command Reference]] whenever you need the complete command lookup.

## Required setup

1. Enable Obsidian's built-in **Templates** core plugin.
2. Enable Obsidian's built-in **Bases** core plugin. It is already enabled in the checked-in vault configuration.
3. Enable the **Templater** community plugin. It is included and enabled in the checked-in vault configuration.
4. Enable **Dataview**. The homepage uses it for creator widgets and small action surfaces; database and lore source data remain ordinary Markdown/YAML.
5. Keep both template folder locations set to `Templates`. The checked-in configuration already does this.
6. In **Settings → Templater → File creation**, enable **Trigger Templater on new file creation** on each device where folder-first story-entity creation should work. This master toggle is device-local and cannot be enabled by Git.
7. Leave Templater's matching mode on **Folder templates**. The repository already contains narrowly scoped rules for `Drafts/Databases/Fauna`, `Flora`, `Fungi` and `Items`; do not add a `/` catch-all rule.
8. In **Settings → Templater → Startup templates**, enable **Enable startup templates** on each device where [[Home]] should open automatically when Obsidian starts. The repository already registers `Templates/_Startup/Open VISCERIUM Home.md`; only the device-local permission must be enabled.
9. Write publishable lore in `Lore/`.
10. Keep drafts in `Drafts/`, private notes in `Private/`, and process notes, SOPs and Bases in `System/`.
11. Put images in `Assets/Images/` and fictional map images in `Assets/Maps/`.

Restart Obsidian after first opening the vault if Templater commands do not appear immediately.

## Article width

Minimal Theme Settings is the single source of truth for ordinary note width. The checked-in baseline uses **64em normal**, **76em wide**, and **92% maximum pane width** with Readable line length enabled.

This intentionally gives lore, templates and SOPs more horizontal room than Minimal's default 40em measure while keeping very wide desktop panes readable. Do not add another global `markdown-preview-sizer` width snippet on top of Minimal. [[Home]] is intentionally wider because it is a dashboard and carries its own scoped compatibility CSS.

## Startup homepage

The checked-in Templater startup template opens `Home.md` in Reading View after the Obsidian workspace is ready. It reuses the active Markdown leaf rather than creating a new Home tab on every launch.

Templater intentionally stores **Enable startup templates** in local device storage for safety, so Git cannot turn it on. Enable it once per Obsidian installation. If you prefer Obsidian to reopen exactly where you left off instead, leave the toggle off; [[Home]] remains available as an ordinary note.

## Template commands

For the normal creator workflow, use **Templater: Create New Story Entity**. This template-specific command is registered by the checked-in Templater configuration and launches [[New Story Entity]] directly without a second template picker.

The older/general route remains valid: **Templater: Create new note from template** → [[New Story Entity]].

Creating a normal new Markdown note directly inside one of the four database folders uses the same [[New Story Entity]] workflow automatically when the per-device creation trigger is enabled. The folder supplies the entity type, so that question is skipped.

Use **Templater: Insert template** and choose [[Add Storyteller Fields]] to add currently absent optional fields to an existing fauna, flora, fungi, item or Myrkild unit note.

Do not invoke templates under `Templates/_Internals/` or `Templates/_Startup/` directly. They contain shared implementation or startup behaviour rather than creator-facing workflows.


Use **Templater: Create New Lore Entity** for relationship-aware character, faction, location, event and species drafts. Use **Templater: Create New Myrkild Unit** for guided unit creation. Both use searchable references; creating a missing reference requires explicitly choosing **Create new…** and produces a task-bearing stub under `Drafts/Inbox/`.

Use [[Home]] → **Open Creator Context** to open Outline, Backlinks and Local Graph in the right sidebar without committing device-local workspace state.

## Template roles

Use the template that matches the kind of work rather than treating every file in `Templates/` as interchangeable:

- **New Story Entity** — guided Templater workflow for fauna, flora, fungi and items. This is the default structured-worldbuilding entry point.
- **Add Storyteller Fields** — inserts only currently absent optional Storyteller properties into an existing supported entity.
- **Myrkild Unit Profile** — specialised structured profile for the Myrkild unit database; it intentionally retains import/provenance fields that ordinary story entities do not need.
- **Character / Faction / Location / Event / Era** — plain publishable-Lore skeletons. Create/rename the note first, then insert the relevant template with Obsidian's core Templates command so `{{title}}` resolves from the filename.
- **Map / Image Metadata** — publishing metadata skeletons for map pages and image provenance records.
- **Timeline Template** — generated canonical VISCERIUM timeline page backed by event metadata.
- **Chronos Timeline Template** — note-local/editorial timeline that does not automatically enter canonical era/super timelines.
- **`_Internals/Story Entity Core`** — shared implementation used by New Story Entity; never invoke directly.
- **`_Startup/Open VISCERIUM Home`** — startup automation; never invoke as an authoring template.

Public-Lore templates deliberately do **not** render an Obsidian-only infobox/sidebar. Structured metadata remains in Properties/frontmatter; the article body stays focused on readable worldbuilding.

## Story entity workflow

Creator-facing fauna, flora, fungi and item cards live in Obsidian Bases. [[Story Entities.base]] provides the cross-entity navigation view and includes Myrkild units without replacing their specialised Base.

Follow [[Story Entity Workflow SOP]] for the practical creation and filing process, then [[Entity Authoring SOP]] when deciding how much detail is enough. Use [[Creator Command Reference]] for the exact commands and terminal health checks.

## WorldAnvil/Wikipedia-style writing workflow

Templates use a simple wiki-style shape:

- YAML frontmatter for machine-readable publishing fields, Bases and relationships.
- A concise summary first.
- Topic sections only where they help explain or use the subject.
- Wikilinks for meaningful relationships and navigation.
- Creator-only guidance inside `%% comments %%` where it should not become public prose.

Bases are authoring and browsing views over the same Markdown properties. Keep canonical information in the notes themselves rather than relying on view-only configuration.

This is intentionally plain Markdown so the vault remains portable. Homepage actions and Dataview summaries are creator conveniences only; the underlying notes, properties and SOPs remain usable without them.

Open only the `Vault/` folder in Obsidian. Use templates from `Vault/Templates/`. Put images in `Vault/Assets/Images/` and maps in `Vault/Assets/Maps/`.
