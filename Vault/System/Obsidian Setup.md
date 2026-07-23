# Obsidian Setup

Open only the `Vault/` folder in Obsidian.

> [!tip] Start at Home
> [[Home]] is the creator front door: recent work, databases, story/timeline actions, SOPs, health checks and era navigation. Use [[Creator Command Reference]] whenever you need the complete command lookup.

## Required setup

1. Enable Obsidian's built-in **Templates** core plugin.
2. Enable Obsidian's built-in **Bases** core plugin. It is already enabled in the checked-in vault configuration.
3. Enable the **Templater** community plugin. It is included and enabled in the checked-in vault configuration.
4. Enable **Dataview**. The homepage uses it for creator widgets and small action surfaces; database and lore source data remain ordinary Markdown/YAML.
5. Keep both template folder locations set to `Templates`. The checked-in configuration already does this; role-specific templates live in subfolders beneath that single root.
6. In **Settings → Templater → File creation**, enable **Trigger Templater on new file creation** on each device where folder-first story-entity creation should work. This master toggle is device-local and cannot be enabled by Git.
7. Leave Templater's matching mode on **Folder templates**. The repository already contains narrowly scoped rules for `Drafts/Databases/Fauna`, `Flora`, `Fungi` and `Items`; do not add a `/` catch-all rule.
8. In **Settings → Templater → Startup templates**, enable **Enable startup templates** on each device where [[Home]] should open automatically when Obsidian starts. The repository already registers `Templates/_Startup/Open VISCERIUM Home.md`; only the device-local permission must be enabled.
9. Write publishable lore in `Lore/`.
10. Keep drafts in `Drafts/`, private notes in `Private/`, process notes, SOPs and Bases in `System/`, and demonstration material in `Demo/`.
11. Put real project images in `Assets/Images/` and fictional map images in `Assets/Maps/`. Demo assets stay beneath `Demo/Assets/`.

Restart Obsidian after first opening the vault if Templater commands do not appear immediately.

## Article width

Minimal Theme Settings is the single source of truth for ordinary note width. The checked-in baseline uses **64em normal**, **76em wide**, and **92% maximum pane width** with Readable line length enabled.

This intentionally gives lore, templates and SOPs more horizontal room than Minimal's default 40em measure while keeping very wide desktop panes readable. Do not add another global `markdown-preview-sizer` width snippet on top of Minimal. [[Home]] is intentionally wider because it is a dashboard and carries its own scoped compatibility CSS.

## Startup homepage

The checked-in Templater startup template opens `Home.md` in Reading View after the Obsidian workspace is ready. It reuses the active Markdown leaf rather than creating a new Home tab on every launch.

Templater intentionally stores **Enable startup templates** in local device storage for safety, so Git cannot turn it on. Enable it once per Obsidian installation. If you prefer Obsidian to reopen exactly where you left off instead, leave the toggle off; [[Home]] remains available as an ordinary note.

## Template commands

For fauna, flora, fungi and items, use **Templater: Create New Story Entity**. This template-specific command launches [[New Story Entity]] directly without a second template picker.

For characters, factions, locations, events and species, use **Templater: Create New Lore Entity**. Relationship fields are searchable. When the referenced thing does not exist, explicitly choose **Create new…**; the workflow creates a task-bearing stub under `Drafts/Inbox/` rather than silently accepting an untracked free-text value.

For structured Myrkild profiles, use **Templater: Create New Myrkild Unit**. Era, Myrkild species, origin, size and known locations are guided during creation.

The older/general route remains valid: **Templater: Create new note from template** → choose the creator-facing template.

Creating a normal new Markdown note directly inside one of the four ordinary database folders uses the same [[New Story Entity]] workflow automatically when the per-device creation trigger is enabled. The folder supplies the entity type, so that question is skipped.

Use **Templater: Insert template** and choose [[Add Storyteller Fields]] to add currently absent optional fields to an existing fauna, flora, fungi, item or Myrkild unit note.

Do not invoke templates under `Templates/_Internals/`, `Templates/_Scripts/` or `Templates/_Startup/` directly. They contain shared implementation, user-script helpers or startup behaviour rather than creator-facing workflows.

Use [[Home]] → **Open Creator Context** to open Outline, Backlinks and Local Graph in the right sidebar without committing device-local workspace state.

## Template roles

All templates live beneath the single `Templates/` root and are grouped by purpose:

- **`Templates/Lore/`** — guided Lore creation plus static Character, Faction, Location, Event and Era skeletons.
- **`Templates/Databases/`** — Story Entity, Myrkild unit and progressive Storyteller-field workflows.
- **`Templates/Publishing/`** — Map and Image Metadata skeletons.
- **`Templates/Timelines/`** — canonical and note-local timeline templates.
- **`Templates/_Internals/`** — shared implementation; never invoke directly.
- **`Templates/_Scripts/`** — Templater user-script helpers such as the relationship picker; never invoke directly.
- **`Templates/_Startup/`** — startup automation; never invoke directly.

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