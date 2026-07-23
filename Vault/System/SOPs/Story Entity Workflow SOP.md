# Story Entity Workflow SOP

Use this SOP for the practical creation, filing and later development of fauna, flora, fungi and item entries.

The authoring system deliberately supports two entry points into the same schema. Use whichever matches how you are already working.

For a lookup of commands rather than workflow judgement, use [[Creator Command Reference]]. [[Home]] also exposes the common creation action as a one-click button while preserving the Command Palette route.

## One-time Templater setup per device

The repository stores the folder-template rules, but Templater stores its master **Trigger Templater on new file creation** switch locally on each Obsidian device.

On each desktop or mobile installation where folder-first creation should work:

1. Open **Settings → Templater → File creation**.
2. Enable **Trigger Templater on new file creation**.
3. Leave the matching mode on **Folder templates**.
4. Do not add a `/` catch-all rule. The checked-in configuration is intentionally limited to the four story-entity database folders.

The configured folders are:

- `Drafts/Databases/Fauna`
- `Drafts/Databases/Flora`
- `Drafts/Databases/Fungi`
- `Drafts/Databases/Items`

If the local trigger is disabled, the normal command-based workflow still works; only automatic folder-first creation is unavailable.

## Route A — create from anywhere

Use this when an idea occurs outside a database folder.

### Fast route

1. From [[Home]], click **Create Story Entity**; or open the Command Palette and run **Templater: Create Databases/New Story Entity**.
2. Choose Fauna, Flora, Fungi or Item when prompted.
3. Complete the small common core.
4. Select only the optional modules that matter now.

The checked-in Templater configuration registers `New Story Entity` as a template-specific command, so the fast route does not require a second template picker.

### General Templater fallback

The generic route remains valid:

1. Run **Templater: Create new note from template**.
2. Choose [[New Story Entity]].
3. Continue the same prompts.

Both routes execute the same creator-facing wrapper, which automatically files the completed note into the matching `Drafts/Databases/<Type>/` folder.

Do not run templates inside `Templates/_Internals/` directly. They contain shared implementation logic rather than creator-facing workflows.

## Route B — create from a database folder

Use this when browsing a database and already know what kind of entity you are adding.

1. Open one of the four story-entity folders.
2. Create a normal new Markdown note in that folder.
3. Templater automatically applies [[New Story Entity]].
4. The folder supplies the entity type, so the Fauna / Flora / Fungi / Item question is skipped.
5. Complete the same core and optional-module prompts used by Route A.

Both routes produce the same note structure and use the same shared schema.

## Folder discipline

Folders answer **what kind of creator object is this?** Properties answer **where, when and how does it exist?**

Do not subdivide ordinary story-entity folders by era, nation or biome. A single species or item may span several eras and locations, so those relationships belong in properties such as `eras`, `locations` and `biomes` rather than the filesystem.

## Develop an entry later

Do not recreate an entry because new detail becomes relevant.

1. Open the existing note.
2. Run **Templater: Insert template**.
3. Choose [[Add Storyteller Fields]].
4. Select only the field families now required by the story or worldbuilding task.

Existing values are preserved. Unselected fields remain absent rather than becoming negative canon.

This is intentionally **not** a homepage button: it changes the active entity note, so the action belongs in the context of that note rather than on a global dashboard.

## Browse and edit

Use the relevant Obsidian Base:

- [[Story Entities.base]] for cross-entity navigation, recent edits, era/type context and stubs.
- Type-specific **Cards** for browsing and visual recognition.
- Type-specific **Database** views for comparison, filtering and structured editing.

The Markdown note and its properties remain the source of truth.

## Check structural health

Vault Doctor is the creator-data safety net. It checks structure, not creative completeness.

From the repository terminal:

```bash
cd Site
npm run doctor:vault
```

Run it after broad manual property edits, folder moves, imports or schema work, and rely on CI to run it on pull requests as well.

**Errors** are objective contradictions likely to break or corrupt the creator model, such as a fauna note filed as Flora, invalid era values, malformed list properties, unknown development states or duplicate Myrkild unit IDs.

**Notices** are non-blocking prompts for human review, such as a location spelling that closely resembles a canonical note title.

The Doctor must not report missing optional Storyteller fields merely because they are absent. Absence remains a valid state.

## Promotion

Creation and publication are separate decisions.

New story entities begin as drafts. Do not automatically move a note into `Lore/` merely because it has many fields or reaches `development_level: developed`.

Promote material only when it is genuinely ready to become canonical/public lore. Until then, leaving a useful entry under `Drafts/Databases/` is correct.

## Troubleshooting

### Creating a note in a database folder does nothing

Check the per-device **Trigger Templater on new file creation** toggle first. The folder rules are committed to Git; the master switch is not.

### The Home Create button is disabled

Confirm Templater is enabled and restart Obsidian after pulling configuration changes. The button looks for the checked-in **Templater: Create Databases/New Story Entity** command and disables itself rather than falling back to an unrelated command if that command is unavailable.

### The type question appears during folder-first creation

Confirm the note was created directly inside one of the configured database folders and that the folder name has not been changed locally.

### A command-created note remains outside `Drafts/Databases/`

Use [[New Story Entity]], not the internal core template. The creator-facing wrapper is responsible for routing.

### The template appears to run twice

Check Templater's folder rules for extra parent-folder or `/` catch-all rules. The repository should contain only the four specific story-entity folder rules.

### Vault Doctor reports a notice

Read the suggestion and decide whether it is a real inconsistency. Notices deliberately do not fail CI because unusual worldbuilding can be valid.

### Vault Doctor reports an error

Fix the structural contradiction rather than silencing the check. If the model itself has legitimately changed, update the validator and [[Schema Change SOP]] in the same change.

## Stop condition

The workflow is successful when the entry can be used consistently. Follow [[Entity Authoring SOP]] rather than filling fields simply because they exist.
