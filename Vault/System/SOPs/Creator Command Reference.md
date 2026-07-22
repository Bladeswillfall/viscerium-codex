# Creator Command Reference

Use this as the practical lookup for interacting with the VISCERIUM authoring system. It records creator-facing Obsidian commands and supported terminal commands so they do not need to be remembered from previous setup work.

> [!tip] Start here when you forget a command
> [[Home]] is the front door for common actions and navigation. Open the Obsidian Command Palette with **Ctrl/Cmd + P**, or open a terminal at the repository root and use the sections below. This page documents what each command does and whether it changes files.

## Quick lookup

| I want to... | Use |
| --- | --- |
| Return to the creator dashboard | Open [[Home]] |
| Create fauna, flora, fungi or an item | [[Home]] → **Create Story Entity**, or **Templater: Create New Story Entity** |
| Add optional Storyteller/profile fields later | **Templater: Insert template** → `Add Storyteller Fields` |
| Browse every structured story entity together | Open [[Story Entities.base]] |
| Check creator data for structural mistakes | `cd Site` then `npm run doctor:vault` |
| Check whether public Lore is safe to publish | `cd Site` then `npm run validate:vault` |
| Run the normal local test/build suite | `cd Site` then `npm test` |
| Start the Codex locally | `cd Site` then `npm run dev` |
| Open the current StoryLine project on the VISCERIUM calendar | [[Home]] → **Open Story Timeline**, or **VISCERIUM Timelines: Open StoryLine project timeline** |
| Diagnose StoryLine ↔ VISCERIUM timeline integration | [[Home]] → **Troubleshoot StoryLine**, or **VISCERIUM Timelines: Diagnose StoryLine integration** |

## Home — creator dashboard

`Home.md` is intentionally a navigation/action layer rather than another source of canon. It provides:

- recent creator work via Dataview;
- links to the cross-entity and type-specific Bases;
- StoryLine and VISCERIUM timeline guidance;
- a one-click **Create Story Entity** action;
- Story Timeline and StoryLine diagnostic actions;
- links to the SOPs/process documentation;
- terminal health-check reminders;
- direct links to the four VISCERIUM eras.

Navigation remains ordinary Markdown/wikilinks. The action buttons use DataviewJS to invoke existing Obsidian commands and are conveniences rather than unique workflows.

## Obsidian commands

Run these through **Ctrl/Cmd + P** unless stated otherwise.

### Story entity authoring

| Command / action | What it does | Changes files? |
| --- | --- | --- |
| **Templater: Create New Story Entity** | Direct template-specific creation command for fauna, flora, fungi and items. Runs the same guided workflow as `New Story Entity` and automatically files the result into `Drafts/Databases/<Type>/`. This is what the Home **Create Story Entity** button invokes. | **Yes.** Creates and files a Markdown note. |
| **Templater: Create new note from template** → `New Story Entity` | General fallback route to the same workflow when you deliberately want the Templater template picker. | **Yes.** Creates and files a Markdown note. |
| Create a normal blank note directly inside `Drafts/Databases/Fauna`, `Flora`, `Fungi` or `Items` | Folder-first version of the same workflow. Templater infers the type from the folder and skips the redundant type question. Requires the per-device **Trigger Templater on new file creation** switch. | **Yes.** The new note is populated by Templater. |
| **Templater: Insert template** → `Add Storyteller Fields` | Adds only selected, currently absent optional properties to an existing fauna, flora, fungi, item or Myrkild unit. Existing values are preserved. | **Yes.** Updates frontmatter only for values actually supplied. |
| **Templates: Insert template** | Uses Obsidian's built-in Templates plugin for static/non-interactive templates. Use Templater instead for the workflows above. | **Yes.** Inserts the chosen static template. |

Do **not** run files inside `Templates/_Internals/` or `Templates/_Startup/` directly. They contain shared implementation or startup behaviour used by creator-facing workflows.

### Bases and browsing

These are files to open rather than Command Palette commands.

| Base | Purpose |
| --- | --- |
| [[Story Entities.base]] | Cross-entity index for fauna, flora, fungi, items and Myrkild units. Useful for navigation, era/type overview, recent edits and stubs. |
| [[Fauna.base]] | Fauna cards plus detailed fauna database. |
| [[Flora.base]] | Flora cards plus detailed flora database. |
| [[Fungi.base]] | Fungi cards plus detailed fungi database. |
| [[Items.base]] | Item cards plus detailed item database. |
| [[Myrkild Units.base]] | Specialised Myrkild unit database. |

Cards are for browsing. Database/table views are for comparison and structured editing. The Markdown note remains the source of truth.

### VISCERIUM Timelines / StoryLine

| Command | What it does | Changes files? |
| --- | --- | --- |
| **VISCERIUM Timelines: Refresh compiled timelines** | Invalidates the local timeline cache and recompiles canonical VISCERIUM timeline data from vault notes. Useful after timeline metadata changes if a rendered timeline appears stale. | **No.** Rebuilds the in-memory view. |
| **VISCERIUM Timelines: Open StoryLine project timeline** | Finds the active/current StoryLine project, reads its scene `storyDate` metadata and opens a read-only VISCERIUM calendar timeline for that project. Also exposed as **Open Story Timeline** on Home. | **No.** Reads StoryLine scene files. |
| **VISCERIUM Timelines: Diagnose StoryLine integration** | Reports whether StoryLine is loaded, which project/root VISCERIUM resolved, and whether dated scenes can be placed on the calendar. Also exposed as the secondary **Troubleshoot StoryLine** action on Home. | **No.** Diagnostic only. |

## One-time Obsidian settings per device

Templater deliberately stores dangerous automatic-execution permissions in local device storage rather than Git.

### Folder-first entity creation

**Settings → Templater → File creation → Trigger Templater on new file creation → On**

Keep the matching mode on **Folder templates**. The repository already contains the four narrow folder rules; do not add a `/` catch-all rule.

### Open Home at startup

**Settings → Templater → Startup templates → Enable startup templates → On**

The repository already registers `Templates/_Startup/Open VISCERIUM Home.md`. Once the device-local permission is enabled, `Home.md` opens in Reading View when the workspace is ready. Leave the toggle off if you prefer Obsidian to resume directly into the previous active note instead.

## Terminal commands — Codex and vault

Run these from the repository's `Site/` directory unless the table says otherwise.

```bash
cd Site
```

| Command | What it does | Writes generated files? |
| --- | --- | --- |
| `npm ci` | Installs the exact dependencies recorded in `package-lock.json`. Preferred after pulling dependency changes or when reproducing CI. | Installs `node_modules`; does not change source files. |
| `npm run doctor:vault` | Runs **Vault Doctor** across creator entities. Fails on objective structural errors; prints non-failing notices for suspicious data such as a near-miss canonical place name. | **No.** Read-only. |
| `npm run validate:vault` | Validates **published Lore** requirements and active-content safety. This is different from Vault Doctor: it is publication-facing rather than creator-database-facing. | **No.** Read-only. |
| `npm run validate:timelines` | Validates canonical timeline/event metadata without generating the final datasets. | **No.** Read-only. |
| `npm run validate` | Checks generated public docs for required generated frontmatter such as title, description, slug and type. Run after sync/generation when diagnosing generated-content problems. | **No.** Read-only. |
| `npm run test:unit` | Runs the Node unit-test suite, including Vault Doctor regression tests. | **No** source changes. |
| `npm test` | Normal local confidence check: runs Vault Doctor, unit tests and the full Astro build. | Produces normal build/generated output as part of the build process. |
| `npm run benchmark:timelines` | Runs timeline performance benchmarks used by CI. Useful before/after substantial timeline compiler changes. | **No** source changes intended. |
| `npm run sync` | Rebuilds/synchronises publishable vault content into the generated site content used by Astro. Do not hand-edit generated copies instead of their vault sources. | **Yes.** Updates generated site content/data. |
| `npm run generate:maps` | Regenerates map data from source metadata. | **Yes.** Updates generated map data. |
| `npm run generate:timelines` | Regenerates canonical timeline datasets from source metadata. | **Yes.** Updates generated timeline data. |
| `npm run dev` | Builds content in development mode and starts the local Astro development server. | May refresh generated development content; then keeps a local server running. |
| `npm run dev:sync` | Alias of `npm run dev`; retained for compatibility with the earlier development-sync command name. | Same behaviour as `npm run dev`. |
| `npm run build` | Runs the production content build and Astro production build; post-build icon validation runs automatically. | **Yes.** Produces build output/generated content. |
| `npm run validate:icons` | Checks generated/public icon output. Normally runs automatically after `npm run build`. | **No.** Read-only. |
| `npm run preview` | Serves the already-built production site locally. Run `npm run build` first if needed. | **No** source changes. |
| `npm run astro -- <args>` | Passes arguments directly to the Astro CLI. This is an escape hatch for Astro-specific commands; prefer the named `dev`, `build` and `preview` scripts for normal work. | Depends on the Astro command supplied. |

`prebuild` and `postbuild` are npm lifecycle hooks rather than commands you normally invoke directly: `prebuild` prepares content before `npm run build`, and `postbuild` runs icon validation afterwards.

### Recommended pre-PR check

```bash
cd Site
npm ci
npm test
npm run benchmark:timelines
```

CI additionally builds the Obsidian timeline plugin and runs browser checks.

## Terminal commands — Obsidian timeline plugin

Run these only when working on `Tools/obsidian-viscerium-timelines/` or when diagnosing its build.

```bash
cd Tools/obsidian-viscerium-timelines
```

| Command | What it does |
| --- | --- |
| `npm ci` | Installs the plugin's locked dependencies. |
| `npm run build` | Creates the production Obsidian plugin bundle. CI uses this before accepting changes. |
| `npm run dev` | Creates the development plugin bundle for local plugin work. |

The repository's main-branch workflow synchronises successful production plugin builds into `Vault/.obsidian/plugins/viscerium-timelines/`. Treat the source under `Tools/` as the implementation source of truth.

## Basic Git commands

Run these from the repository root.

| Command | What it does |
| --- | --- |
| `git status` | Shows changed, staged and untracked files. Safe first check before commits or pulls. |
| `git diff` | Shows unstaged changes. |
| `git diff --staged` | Shows exactly what is staged for the next commit. |
| `git pull` | Fetches and integrates the current remote branch. Check `git status` first when you have local edits. |
| `git log --oneline -10` | Shows the ten most recent commits in compact form. Useful for confirming what was pulled/merged. |

Destructive recovery commands are deliberately omitted from this quick reference. Check the situation before using commands such as hard resets, forced pushes or aggressive cleans.

## Which validator should I use?

**Vault Doctor** asks:

> Is the creator data structurally coherent?

Examples: correct entity folder/type pairing, valid eras, list-shaped relationship fields, unique Myrkild IDs.

**`validate:vault`** asks:

> Is material marked for publication valid and safe to publish?

They solve different problems and both are useful.

## Maintenance rule

Whenever a creator-facing Obsidian command, Templater workflow, Base entry point, homepage action or `npm` script is added, renamed or removed, update this reference in the same change. Add something to [[Home]] only when it is a genuine top-level navigation or frequent action; the comprehensive catalogue belongs here rather than on the dashboard.

For judgement about *what to write*, use [[Entity Authoring SOP]]. For the story-entity lifecycle, use [[Story Entity Workflow SOP]]. For schema changes, use [[Schema Change SOP]].
