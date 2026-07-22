# Obsidian Setup

Open only the `Vault/` folder in Obsidian.

## Required setup

1. Enable Obsidian's built-in **Templates** core plugin.
2. Enable Obsidian's built-in **Bases** core plugin. It is already enabled in the checked-in vault configuration.
3. Enable the **Templater** community plugin. It is included and enabled in the checked-in vault configuration.
4. Keep both template folder locations set to `Templates`. The checked-in configuration already does this.
5. In **Settings → Templater → File creation**, enable **Trigger Templater on new file creation** on each device where folder-first story-entity creation should work. This master toggle is device-local and cannot be enabled by Git.
6. Leave Templater's matching mode on **Folder templates**. The repository already contains narrowly scoped rules for `Drafts/Databases/Fauna`, `Flora`, `Fungi` and `Items`; do not add a `/` catch-all rule.
7. Write publishable lore in `Lore/`.
8. Keep drafts in `Drafts/`, private notes in `Private/`, and process notes, SOPs and Bases in `System/`.
9. Put images in `Assets/Images/` and fictional map images in `Assets/Maps/`.

Restart Obsidian after first opening the vault if Templater commands do not appear immediately.

## Template commands

Use Obsidian's built-in Templates command for static templates.

Use **Templater: Create new note from template** and choose [[New Story Entity]] when creating a fauna, flora, fungi or item entry from anywhere in the vault. The creator-facing wrapper asks for the entity type when necessary, runs the shared authoring prompts, and automatically files the result into the matching `Drafts/Databases/<Type>/` folder.

Creating a normal new Markdown note directly inside one of those four database folders uses the same [[New Story Entity]] workflow automatically when the per-device creation trigger is enabled. The folder supplies the entity type, so that question is skipped.

Use **Templater: Insert template** and choose [[Add Storyteller Fields]] to add currently absent optional fields to an existing fauna, flora, fungi, item or Myrkild unit note.

Do not invoke templates under `Templates/_Internals/` directly. They contain shared implementation logic for the creator-facing workflows.

## Story entity workflow

Creator-facing fauna, flora, fungi and item cards live in Obsidian Bases. They do not publish to the Codex.

Follow [[Story Entity Workflow SOP]] for the practical creation and filing process, then [[Entity Authoring SOP]] when deciding how much detail is enough.

## WorldAnvil/Wikipedia-style writing workflow

The templates use a simple wiki-style shape:

- YAML frontmatter for machine-readable publishing fields and Bases.
- An Obsidian callout infobox near the top where useful.
- A summary section first.
- Topic sections such as history, culture, relationships, geography, and related links.

Bases are authoring and browsing views over the same Markdown properties. Keep canonical information in the notes themselves rather than relying on view-only configuration.

This is intentionally plain Markdown so the vault remains portable. If a more advanced published infobox, Storyteller panel or unit renderer is added, keep these Markdown notes and their properties as the source data.

Open only the `Vault/` folder in Obsidian. Use templates from `Vault/Templates/`. Put images in `Vault/Assets/Images/` and maps in `Vault/Assets/Maps/`.
