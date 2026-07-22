# Obsidian Setup

Open only the `Vault/` folder in Obsidian.

## Required setup

1. Enable Obsidian's built-in **Templates** core plugin.
2. Enable Obsidian's built-in **Bases** core plugin. It is already enabled in the checked-in vault configuration.
3. Enable the **Templater** community plugin. It is included and enabled in the checked-in vault configuration.
4. Keep both template folder locations set to `Templates`. The checked-in configuration already does this.
5. Write publishable lore in `Lore/`.
6. Keep drafts in `Drafts/`, private notes in `Private/`, and process notes, SOPs and Bases in `System/`.
7. Put images in `Assets/Images/` and fictional map images in `Assets/Maps/`.

Restart Obsidian after first opening the vault if Templater commands do not appear immediately.

## Template commands

Use Obsidian's built-in Templates command for static templates.

Use **Templater: Create new note from template** for interactive templates such as [[New Story Entity]]. The template asks for a small common core, then exposes only the optional modules deliberately selected by the creator.

Use **Templater: Insert template** and choose [[Add Storyteller Fields]] to add currently absent optional fields to an existing fauna, flora, fungi, item or Myrkild unit note.

Templater is deliberately configured with automatic file-creation triggers disabled. Interactive templates should run only when intentionally invoked.

## Story entity workflow

Creator-facing fauna, flora, fungi and item cards live in Obsidian Bases. They do not publish to the Codex.

Start with [[Story Entity Databases]], then follow [[Entity Authoring SOP]] when deciding how much detail is enough.

## WorldAnvil/Wikipedia-style writing workflow

The templates use a simple wiki-style shape:

- YAML frontmatter for machine-readable publishing fields and Bases.
- An Obsidian callout infobox near the top where useful.
- A summary section first.
- Topic sections such as history, culture, relationships, geography, and related links.

Bases are authoring and browsing views over the same Markdown properties. Keep canonical information in the notes themselves rather than relying on view-only configuration.

This is intentionally plain Markdown so the vault remains portable. If a more advanced published infobox, Storyteller panel or unit renderer is added, keep these Markdown notes and their properties as the source data.

Open only the `Vault/` folder in Obsidian. Use templates from `Vault/Templates/`. Put images in `Vault/Assets/Images/` and maps in `Vault/Assets/Maps/`.
