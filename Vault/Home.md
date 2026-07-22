---
publish: false
cssclasses:
  - viscerium-home
---

> [!home-hero]
> # VISCERIUM
> **CREATOR VAULT · ERRACK**
>
> Worldbuilding database, narrative workspace and Codex source.
>
> **CANON** → `Lore/` · **WIP** → `Drafts/` · **WRITING** → `Stories/` · **TOOLS** → `System/`

> [!home-actions] QUICK ACTIONS
> ```dataviewjs
> const findCommand = (name) => Object.entries(app.commands.commands)
>   .find(([id, command]) => id.startsWith("templater-obsidian:") && command.name === name)?.[0];
>
> const actions = [
>   {
>     label: "+ Create Story Entity",
>     id: findCommand("Create New Story Entity"),
>     tone: "create",
>     title: "Create fauna, flora, fungi or an item through the guided Story Entity workflow.",
>   },
>   {
>     label: "Open Story Timeline",
>     id: "viscerium-timelines:open-storyline-project-timeline",
>     tone: "stories",
>     title: "Open the active StoryLine project on the VISCERIUM calendar.",
>   },
>   {
>     label: "Troubleshoot StoryLine",
>     id: "viscerium-timelines:diagnose-storyline-integration",
>     tone: "stories-secondary",
>     title: "Diagnose StoryLine project detection and storyDate placement without changing files.",
>   },
> ];
>
> const strip = dv.container.createDiv({ cls: "vc-home-action-strip" });
> for (const action of actions) {
>   const button = strip.createEl("button", {
>     text: action.label,
>     cls: `vc-home-button vc-home-action-${action.tone}`,
>     attr: { title: action.title },
>   });
>   const exists = action.id && Boolean(app.commands.commands[action.id]);
>   if (!exists) {
>     button.disabled = true;
>     button.title = "Required Obsidian command is unavailable. See Creator Command Reference.";
>   } else {
>     button.addEventListener("click", () => app.commands.executeCommandById(action.id));
>   }
> }
> ```
> `Ctrl/Cmd + P` remains the universal fallback. See [[System/SOPs/Creator Command Reference|Creator Command Reference]] for command names and what they do.

> [!home-recent] JUMP BACK IN
> ```dataviewjs
> const pages = dv.pages("")
>   .where((page) => {
>     const path = page.file.path;
>     return path !== "Home.md"
>       && !path.startsWith("System/")
>       && !path.startsWith("Templates/");
>   })
>   .sort((page) => page.file.mtime, "desc")
>   .limit(6);
>
> const area = (path) => {
>   if (path.startsWith("Lore/")) return { label: "CANON", key: "canon" };
>   if (path.startsWith("Stories/")) return { label: "WRITING", key: "writing" };
>   if (path.startsWith("Drafts/")) return { label: "WIP", key: "wip" };
>   if (path.startsWith("Private/")) return { label: "PRIVATE", key: "private" };
>   return { label: "NOTE", key: "note" };
> };
>
> if (pages.length === 0) {
>   dv.paragraph("No recent creator notes found yet.");
> } else {
>   const grid = dv.container.createDiv({ cls: "vc-home-recent-grid" });
>   for (const page of pages) {
>     const zone = area(page.file.path);
>     const item = grid.createDiv({ cls: `vc-home-recent-item vc-home-recent-${zone.key}` });
>     const top = item.createDiv({ cls: "vc-home-recent-top" });
>     const link = top.createEl("a", {
>       text: page.file.name,
>       cls: "internal-link vc-home-recent-link",
>       attr: {
>         href: page.file.path,
>         "data-href": page.file.path,
>       },
>     });
>     link.addEventListener("click", (event) => {
>       event.preventDefault();
>       app.workspace.openLinkText(page.file.path, "Home.md", event.ctrlKey || event.metaKey);
>     });
>     top.createSpan({ text: zone.label, cls: "vc-home-recent-area" });
>     item.createDiv({ text: page.file.mtime.toRelative() ?? page.file.mtime.toFormat("dd LLL yyyy"), cls: "vc-home-recent-time" });
>   }
> }
> ```

> [!home-grid]
> > [!home-databases] WORLD DATABASES
> > **[[System/Bases/Story Entities.base|Story Entities]]**  
> > The master index across fauna, flora, fungi, items and Myrkild. Start here when you want to browse *what exists* rather than edit one specific category.
> >
> > **Type-specific databases**  
> > [[System/Bases/Fauna.base|Fauna]] · [[System/Bases/Flora.base|Flora]] · [[System/Bases/Fungi.base|Fungi]] · [[System/Bases/Items.base|Items]]  
> > Use **Cards** for browsing and recognition; use **Database** views for comparison and structured editing.
> >
> > **[[System/Bases/Myrkild Units.base|Myrkild Units]]**  
> > Specialised construct database for answering whether a Myrkild can plausibly exist in a particular era, place and context.
>
> > [!home-stories] STORIES & TIMELINES
> > **StoryLine**  
> > Private story and scene planning under `Stories/`. Story projects are writing material, not automatically canonical Lore. See [[System/StoryLine Integration|StoryLine Integration]].
> >
> > **VISCERIUM Story Timeline**  
> > Projects the current StoryLine project's `storyDate` metadata onto Errack's calendar without creating duplicate chronology.
> >
> > **Quick action above:** **Open Story Timeline**. Command Palette fallback: **VISCERIUM Timelines: Open StoryLine project timeline**.

> [!home-grid]
> > [!home-create] CREATE
> > **New Story Entity**  
> > Guided creation for fauna, flora, fungi or an item. It asks for a small core, offers only useful optional detail, and files the result into the correct draft database.
> >
> > **Quick action above:** **Create Story Entity**. Command Palette fallback: **Templater: Create New Story Entity**.
> >
> > **Add detail later**  
> > Open an existing entity, then run **Templater: Insert template → Add Storyteller Fields**. This remains contextual because it modifies the active note.
>
> > [!home-canon] CANON & PUBLISHING
> > **[[System/Publishing Rules|Publishing Rules]]**  
> > Explains what may become public Codex content and which frontmatter states are required.
> >
> > **`Lore/` — established world**  
> > Canonical setting material lives here. A detailed draft is not canon merely because it has many fields.
> >
> > **`Drafts/` — working worldbuilding**  
> > Structured database entries and unfinished material can remain useful here indefinitely.
> >
> > **[[System/SOPs/Storyteller View SOP|Storyteller View SOP]]**  
> > Defines how structured creator data should eventually become a public, system-agnostic Storyteller presentation.

> [!home-process] HOW THIS VAULT WORKS
> **[[System/SOPs/Creator Command Reference|Creator Command Reference]]** — *What command was that again?*  
> Lookup for Obsidian commands, Bases, terminal commands, validation and common system interactions.
>
> **[[System/SOPs/Story Entity Workflow SOP|Story Entity Workflow SOP]]** — *How do I create and develop a database entry?*  
> Practical lifecycle from guided creation through filing, later detail and structural health checks.
>
> **[[System/SOPs/Entity Authoring SOP|Entity Authoring SOP]]** — *How much information is enough?*  
> Helps decide what is worth writing, what distinguishes an entry from an Earth default, and when to stop.
>
> **[[System/SOPs/Schema Change SOP|Schema Change SOP]]** — *Should this become a property or database field?*  
> Read before expanding shared schemas, templates, Bases or validators.
>
> **[[System/SOPs/Storyteller View SOP|Storyteller View SOP]]** — *How should creator data become usable story material?*  
> Separates Lore, creator-side structure and future public Storyteller presentation.
>
> **[[System/SOPs/SOP Index|All SOPs & references]]**

> [!home-grid]
> > [!home-health] SYSTEM HEALTH
> > **Creator-data check** — catches structural contradictions without judging creative completeness.
> > ```bash
> > cd Site
> > npm run doctor:vault
> > ```
> >
> > **Full confidence check** — Vault Doctor, unit tests and production site build.
> > ```bash
> > cd Site
> > npm test
> > ```
> >
> > **Run the Codex locally**
> > ```bash
> > cd Site
> > npm run dev
> > ```
> >
> > → [[System/SOPs/Creator Command Reference|Full command reference]]
>
> > [!home-glance] VISCERIUM AT A GLANCE
> > **[[Lore/Eras/CITADEL|CITADEL]]**  
> > Fortresses, mythic states and a world that only partly understands what lives beyond its walls.
> >
> > **[[Lore/Eras/SMOG|SMOG]]**  
> > Industrialisation, mass society and the transformation of old powers by machines and extraction.
> >
> > **[[Lore/Eras/NEARSIGHT|NEARSIGHT]]**  
> > Near-future states, advanced warfare and technologies capable of exposing truths once buried in folklore.
> >
> > **[[Lore/Eras/ENTROPY|ENTROPY]]**  
> > A distant age where the setting's accumulated history, technology and cosmic pressures reach their furthest consequences.

> [!home-help] LOST?
> **Use this page as the front door, not as another database.**  
> Browse things through [[System/Bases/Story Entities.base|Story Entities]], learn processes through [[System/SOPs/SOP Index|SOPs]], and use [[System/SOPs/Creator Command Reference|Creator Command Reference]] when you remember *what* you want to do but not *how* to invoke it.
>
> If this page does not open automatically after pulling the vault, see [[System/Obsidian Setup|Obsidian Setup]] → **Startup homepage**. Templater's startup permission is intentionally device-local.
