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

> [!home-recent] JUMP BACK IN
> The most recently modified worldbuilding and story notes. System documentation and templates are intentionally excluded.
>
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
>   if (path.startsWith("Lore/")) return "CANON";
>   if (path.startsWith("Stories/")) return "WRITING";
>   if (path.startsWith("Drafts/")) return "WIP";
>   if (path.startsWith("Private/")) return "PRIVATE";
>   return "NOTE";
> };
>
> if (pages.length === 0) {
>   dv.paragraph("No recent creator notes found yet.");
> } else {
>   dv.table(
>     ["Note", "Area", "Modified"],
>     pages.map((page) => [page.file.link, area(page.file.path), page.file.mtime]),
>   );
> }
> ```

> [!home-grid]
> > [!home-panel] WORLD DATABASES
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
> > [!home-panel] STORIES & TIMELINES
> > **StoryLine**  
> > Private story and scene planning under `Stories/`. Story projects are writing material, not automatically canonical Lore. See [[System/StoryLine Integration|StoryLine Integration]].
> >
> > **VISCERIUM Story Timeline**  
> > Projects the current StoryLine project's `storyDate` metadata onto Errack's calendar without creating duplicate chronology.
> >
> > ```dataviewjs
> > const actions = [
> >   {
> >     label: "Open Story Timeline",
> >     id: "viscerium-timelines:open-storyline-project-timeline",
> >     kind: "primary",
> >   },
> >   {
> >     label: "Troubleshoot StoryLine",
> >     id: "viscerium-timelines:diagnose-storyline-integration",
> >     kind: "secondary",
> >   },
> > ];
> > const wrap = dv.container.createDiv({ cls: "vc-home-actions" });
> > for (const action of actions) {
> >   const button = wrap.createEl("button", {
> >     text: action.label,
> >     cls: `vc-home-button vc-home-button-${action.kind}`,
> >   });
> >   const exists = Boolean(app.commands.commands[action.id]);
> >   if (!exists) {
> >     button.disabled = true;
> >     button.title = "Required VISCERIUM command is unavailable.";
> >   } else {
> >     button.addEventListener("click", () => app.commands.executeCommandById(action.id));
> >   }
> > }
> > ```
> > Alternative route: `Ctrl/Cmd + P` → **VISCERIUM Timelines: Open StoryLine project timeline**.

> [!home-grid]
> > [!home-panel] CREATE
> > **New Story Entity**  
> > Guided creation for fauna, flora, fungi or an item. The workflow asks for a small core, offers only useful optional detail, and files the result into the correct draft database.
> >
> > ```dataviewjs
> > const commands = Object.entries(app.commands.commands);
> > const templaterCommand = commands.find(([id, command]) =>
> >   id.startsWith("templater-obsidian:") && command.name === "Create new note from template"
> > );
> > const wrap = dv.container.createDiv({ cls: "vc-home-actions" });
> > const button = wrap.createEl("button", {
> >   text: "+ Create Story Entity…",
> >   cls: "vc-home-button vc-home-button-primary",
> > });
> > if (!templaterCommand) {
> >   button.disabled = true;
> >   button.title = "Templater's create-from-template command is unavailable.";
> > } else {
> >   button.addEventListener("click", () => app.commands.executeCommandById(templaterCommand[0]));
> > }
> > ```
> > Click the button, then choose **New Story Entity**.
> >
> > Keyboard route: `Ctrl/Cmd + P` → **Templater: Create new note from template** → **New Story Entity**.
> >
> > **Add detail later**  
> > Open the entity note, then run `Ctrl/Cmd + P` → **Templater: Insert template** → **Add Storyteller Fields**. This belongs on the entity itself rather than as a Home button because it modifies the active note.
>
> > [!home-panel] CANON & PUBLISHING
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
> > [!home-panel] SYSTEM HEALTH
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
> > [!home-panel] VISCERIUM AT A GLANCE
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
