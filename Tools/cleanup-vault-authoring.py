from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VAULT = ROOT / "Vault"


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8")


def write(rel: str, content: str) -> None:
    path = ROOT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def replace(rel: str, old: str, new: str) -> None:
    path = ROOT / rel
    if not path.exists():
        return
    content = path.read_text(encoding="utf-8")
    if old in content:
        path.write_text(content.replace(old, new), encoding="utf-8")


# ---------------------------------------------------------------------------
# Demo quarantine: flatten the accidental Starlight/Starlight nesting.
# ---------------------------------------------------------------------------
nested = VAULT / "Demo/Starlight/Starlight"
if nested.exists():
    destination = nested.parent
    for child in list(nested.iterdir()):
        target = destination / child.name
        if target.exists():
            if target.is_dir() and child.is_dir():
                for grandchild in list(child.iterdir()):
                    shutil.move(str(grandchild), str(target / grandchild.name))
                child.rmdir()
            else:
                raise RuntimeError(f"Cannot flatten demo path over existing target: {target}")
        else:
            shutil.move(str(child), str(target))
    nested.rmdir()


# ---------------------------------------------------------------------------
# Templater user script naming and guided creator workflows.
# ---------------------------------------------------------------------------
old_picker = VAULT / "Templates/_Scripts/reference-picker.js"
new_picker = VAULT / "Templates/_Scripts/reference_picker.js"
if old_picker.exists():
    if new_picker.exists():
        new_picker.unlink()
    old_picker.rename(new_picker)

if new_picker.exists():
    content = new_picker.read_text(encoding="utf-8")
    content = content.replace('    if (path.startsWith("Drafts/Inbox/Inbox")) continue;\n', "")
    new_picker.write_text(content, encoding="utf-8")

lore_template = VAULT / "Templates/Lore/New Lore Entity.md"
if lore_template.exists():
    content = lore_template.read_text(encoding="utf-8")
    marker = 'const data = {};\n'
    helper = '''const data = {};\n\nasync function ensureFolder(folderPath) {\n  let current = "";\n  for (const segment of folderPath.split("/").filter(Boolean)) {\n    current = current ? `${current}/${segment}` : segment;\n    if (!tp.app.vault.getAbstractFileByPath(current)) await tp.app.vault.createFolder(current);\n  }\n}\n'''
    content = content.replace(marker, helper)
    content = content.replace('if (tp.file.folder(true) !== config.folder) await tp.file.move(`${config.folder}/${tp.file.title}`);', 'await ensureFolder(config.folder);\nif (tp.file.folder(true) !== config.folder) await tp.file.move(`${config.folder}/${tp.file.title}`);')
    lore_template.write_text(content, encoding="utf-8")

myrkild_template = VAULT / "Templates/Databases/New Myrkild Unit.md"
if myrkild_template.exists():
    content = myrkild_template.read_text(encoding="utf-8")
    insert = '''async function ensureFolder(folderPath) {\n  let current = "";\n  for (const segment of folderPath.split("/").filter(Boolean)) {\n    current = current ? `${current}/${segment}` : segment;\n    if (!tp.app.vault.getAbstractFileByPath(current)) await tp.app.vault.createFolder(current);\n  }\n}\n'''
    content = content.replace('const yamlList = (items) => `[${items.map((item) => JSON.stringify(item)).join(", ")}]`;\n', 'const yamlList = (items) => `[${items.map((item) => JSON.stringify(item)).join(", ")}]`;\n' + insert)
    content = content.replace('const folder = `Drafts/Databases/Myrkild Units/${origin}/${era}`;\nif (tp.file.folder(true) !== folder)', 'const folder = `Drafts/Databases/Myrkild Units/${origin}/${era}`;\nawait ensureFolder(folder);\nif (tp.file.folder(true) !== folder)')
    myrkild_template.write_text(content, encoding="utf-8")

# Sidebar setup is a Home action, not a template that could create an empty note.
workspace_template = VAULT / "Templates/Workspace/Setup Creator Sidebar.md"
if workspace_template.exists():
    workspace_template.unlink()
workspace_dir = workspace_template.parent
if workspace_dir.exists() and not any(workspace_dir.iterdir()):
    workspace_dir.rmdir()

templater_path = VAULT / ".obsidian/plugins/templater-obsidian/data.json"
templater = json.loads(templater_path.read_text(encoding="utf-8"))
templater["enabled_templates_hotkeys"] = [
    value for value in templater.get("enabled_templates_hotkeys", [])
    if value != "Templates/Workspace/Setup Creator Sidebar.md"
]
templater_path.write_text(json.dumps(templater, indent=2) + "\n", encoding="utf-8")


# ---------------------------------------------------------------------------
# Home: reliable actions, valid nested-callout formatting, and creator context.
# ---------------------------------------------------------------------------
home_path = VAULT / "Home.md"
home = home_path.read_text(encoding="utf-8")

home = home.replace(
    '> const actions = [\n',
    '''> const openCreatorContext = async () => {\n>   const views = [\n>     { type: "outline", name: "Outline" },\n>     { type: "backlink", name: "Backlinks" },\n>     { type: "localgraph", name: "Local Graph" },\n>   ];\n>   for (const view of views) {\n>     if (app.workspace.getLeavesOfType(view.type).length > 0) continue;\n>     const leaf = app.workspace.getRightLeaf(true);\n>     if (leaf) await leaf.setViewState({ type: view.type, active: false });\n>   }\n> };\n>\n> const actions = [\n'''
)

story_block = '''>   {\n>     label: "+ Create Story Entity",\n>     id: findCommand("Create New Story Entity"),\n>     tone: "create",\n>     title: "Create fauna, flora, fungi or an item through the guided Story Entity workflow.",\n>   },\n'''
new_blocks = story_block + '''>   {\n>     label: "+ Create Lore Entity",\n>     id: findCommand("Create New Lore Entity"),\n>     tone: "create",\n>     title: "Create a character, faction, location, event or species with guided relationship fields.",\n>   },\n>   {\n>     label: "+ Create Myrkild Unit",\n>     id: findCommand("Create New Myrkild Unit"),\n>     tone: "create",\n>     title: "Create a structured Myrkild unit with guided era, species, origin and location fields.",\n>   },\n>   {\n>     label: "Open Creator Context",\n>     run: openCreatorContext,\n>     tone: "stories-secondary",\n>     title: "Open Outline, Backlinks and Local Graph in the right sidebar.",\n>   },\n'''
if story_block in home and "+ Create Lore Entity" not in home:
    home = home.replace(story_block, new_blocks)

home = home.replace('>   const exists = action.id && Boolean(app.commands.commands[action.id]);', '>   const exists = Boolean(action.run) || (action.id && Boolean(app.commands.commands[action.id]));')
home = home.replace('>     button.addEventListener("click", () => app.commands.executeCommandById(action.id));', '>     button.addEventListener("click", () => action.run ? action.run() : app.commands.executeCommandById(action.id));')
home = home.replace('      && !path.startsWith("Demo/");', '> >       && !path.startsWith("Demo/");')
home = home.replace('if (path.startsWith("Lore/")) return { label: "LORE", key: "lore" };', 'if (path.startsWith("Lore/")) return { label: "LORE", key: "lore" };')

create_old = '''> > **Quick action above:** **Create Story Entity**. Command Palette fallback: **Templater: Create New Story Entity**.\n> >\n> > **Add detail later**  \n'''
create_new = '''> > **Quick action above:** **Create Story Entity**. Command Palette fallback: **Templater: Create New Story Entity**.\n> >\n> > **New Lore Entity**  \n> > Guided creation for characters, factions, locations, events and species. Era and relationship fields use searchable choices; explicitly choosing **Create new…** makes a draft stub under `Drafts/Inbox/` and adds a follow-up task. Command Palette: **Templater: Create New Lore Entity**.\n> >\n> > **New Myrkild Unit**  \n> > Guided unit creation for era, Myrkild species, origin, size and known locations. Command Palette: **Templater: Create New Myrkild Unit**.\n> >\n> > **Creator context**  \n> > **Open Creator Context** opens Outline, Backlinks and Local Graph in the right sidebar. Git remains available as a utility tab.\n> >\n> > **Add detail later**  \n'''
home = home.replace(create_old, create_new)

bad_sidebar = '''> > **[[System/Creator Sidebar|Creator Sidebar]]** — *What should live in the right sidebar while I work?*  \nOutline, Backlinks and Local Graph provide active-note context; Git remains a utility tab.\n>\n> **[[System/SOPs/Storyteller View SOP|Storyteller View SOP]]**  \n> > Defines how structured creator data should eventually become a public, system-agnostic Storyteller presentation.\n'''
good_sidebar = '''> > **[[System/Creator Sidebar|Creator Sidebar]]** — *What should live in the right sidebar while I work?*  \n> > Outline, Backlinks and Local Graph provide active-note context; Git remains a utility tab.\n> >\n> > **[[System/SOPs/Storyteller View SOP|Storyteller View SOP]]**  \n> > Defines how structured creator data should eventually become a public, system-agnostic Storyteller presentation.\n'''
home = home.replace(bad_sidebar, good_sidebar)
home = home.replace('`System/`, `Templates/` and Home itself are excluded.', '`System/`, `Templates/`, `Demo/` and Home itself are excluded.')
home_path.write_text(home, encoding="utf-8")

# Keep existing homepage role colours aligned with the renamed Lore label.
for css in (VAULT / ".obsidian/snippets").glob("*.css"):
    content = css.read_text(encoding="utf-8")
    updated = content.replace("vc-home-recent-canon", "vc-home-recent-lore")
    if updated != content:
        css.write_text(updated, encoding="utf-8")

# Actually order the Home row before normal root files/folders, then keep it sticky.
write("Vault/.obsidian/snippets/VISCERIUM Home file.css", '''/* Keep Home pinned and visually distinct from ordinary root notes. */\n.workspace-leaf-content[data-type="file-explorer"] .nav-folder.mod-root > .nav-folder-children {\n  display: flex;\n  flex-direction: column;\n}\n.workspace-leaf-content[data-type="file-explorer"] .nav-folder.mod-root > .nav-folder-children > .nav-file:has(> .nav-file-title[data-path="Home.md"]) {\n  order: -1000;\n  position: sticky;\n  top: 0;\n  z-index: 6;\n  background: var(--background-primary);\n}\n.workspace-leaf-content[data-type="file-explorer"] .nav-file-title[data-path="Home.md"] {\n  margin-block: 0.15rem 0.35rem;\n  border: 1px solid var(--interactive-accent);\n  background: color-mix(in srgb, var(--interactive-accent) 14%, var(--background-secondary));\n  box-shadow: 0 0.35rem 0.8rem rgba(0, 0, 0, 0.18);\n  font-weight: 750;\n}\n.workspace-leaf-content[data-type="file-explorer"] .nav-file-title[data-path="Home.md"] .nav-file-title-content::before {\n  content: "⌂";\n  display: inline-grid;\n  place-items: center;\n  width: 1.1rem;\n  margin-right: 0.35rem;\n  color: var(--interactive-accent);\n  font-weight: 900;\n}\n''')

# Remove stale Iconize mappings to demo files that no longer live in Lore.
icon_path = VAULT / ".obsidian/plugins/obsidian-icon-folder/data.json"
icons = json.loads(icon_path.read_text(encoding="utf-8"))
for key in list(icons):
    if key.startswith("Lore/Eras/CITADEL/") and "/Example " in key:
        icons.pop(key, None)
icons["Home.md"] = "Home"
icon_path.write_text(json.dumps(icons, indent=2) + "\n", encoding="utf-8")


# ---------------------------------------------------------------------------
# Publication documentation and generated content: status is the sole switch.
# ---------------------------------------------------------------------------
markdown_roots = [
    ROOT / "README.md",
    ROOT / "CONTRIBUTING.md",
    ROOT / "Site/README.md",
    ROOT / "Site/FEEDS.md",
    ROOT / "Site/TIMELINES.md",
    ROOT / "Tools/obsidian-viscerium-timelines/README.md",
    ROOT / "Vault/graph.md",
]
markdown_roots.extend((ROOT / "Vault/System").rglob("*.md"))
markdown_roots.extend((ROOT / "Vault/Demo").rglob("*.md"))
markdown_roots.extend((ROOT / "Site/src/content/docs").rglob("*.md"))
markdown_roots.extend((ROOT / "Site/src/content/docs").rglob("*.mdx"))

for path in markdown_roots:
    if not path.exists() or not path.is_file():
        continue
    content = path.read_text(encoding="utf-8")
    updated = re.sub(r"(?m)^\s*publish:\s*(?:true|false)\s*\n", "", content)
    updated = updated.replace("`publish: true` and `status: published`", "`status: published`")
    updated = updated.replace("`publish: true`, `status: published`,", "`status: published`,")
    updated = updated.replace("publish:true + status: published", "status: published")
    updated = updated.replace("publish:true + status:published", "status:published")
    updated = updated.replace("publish: true + status: published", "status: published")
    updated = updated.replace("Only notes with both fields below are published:", "Only notes with `status: published` are published:")
    updated = updated.replace("Set `publish: true` and `status: published`.", "Set `status: published`.")
    updated = updated.replace("with `publish: true` and `status: published`", "with `status: published`")
    updated = updated.replace("with publish:true and status: published", "with status: published")
    updated = updated.replace("data.publish === true && data.status === 'published'", "data.status === 'published'")
    updated = updated.replace("Home.md` is creator-only (`publish: false`) and may therefore", "Home.md` is creator-only because it lives outside `Lore/`, and may therefore")
    updated = updated.replace("`Home.md` is creator-only (`publish: false`) and may therefore", "`Home.md` is creator-only because it lives outside `Lore/`, and may therefore")
    if updated != content:
        path.write_text(updated, encoding="utf-8")

# Architecture handoff has compact prose rather than Markdown examples.
for rel in ["Architecture/viscerium-codex-architecture.html", "Architecture/viscerium-codex-architecture.json"]:
    path = ROOT / rel
    content = path.read_text(encoding="utf-8")
    content = content.replace("Only publish:true + status: published notes publish.", "Only status:published notes beneath Lore publish.")
    content = content.replace("Only notes under Lore with publish:true and status: published may publish.", "Only notes under Lore with status:published may publish.")
    content = content.replace("sync publish:true + status: published notes", "sync status:published notes")
    path.write_text(content, encoding="utf-8")

# Executable fixtures and generators should not retain a redundant publication boolean.
code_files = [
    "Site/scripts/benchmark-timelines.mjs",
    "Site/scripts/generate-category-pages.mjs",
    "Site/tests/category-index.test.mjs",
    "Site/tests/timeline-compiler.test.mjs",
    "Site/tests/vault-doctor.test.mjs",
    "Site/tests/vault-security.test.mjs",
]
for rel in code_files:
    path = ROOT / rel
    content = path.read_text(encoding="utf-8")
    content = re.sub(r"(?m)^\s*publish:\s*true,?\s*\n", "", content)
    path.write_text(content, encoding="utf-8")

contributor = ROOT / "Site/src/components/ContributorStrip.astro"
content = contributor.read_text(encoding="utf-8")
content = content.replace("  && entry.publish === true\n  && entry.status === 'published'", "  && entry.status === 'published'")
contributor.write_text(content, encoding="utf-8")

validator = ROOT / "Site/scripts/validate-vault-notes.mjs"
content = validator.read_text(encoding="utf-8")
content = content.replace("const allowedStatuses = new Set(['published']);\n", "")
content = re.sub(r"\n\s*if \(!allowedStatuses\.has\(data\.status\)\) \{[\s\S]*?\n\s*\}\n", "\n", content, count=1)
validator.write_text(content, encoding="utf-8")

# ---------------------------------------------------------------------------
# Creator documentation: expose the new Command Palette workflows.
# ---------------------------------------------------------------------------
command_ref = VAULT / "System/SOPs/Creator Command Reference.md"
content = command_ref.read_text(encoding="utf-8")
content = content.replace(
    '| Create fauna, flora, fungi or an item | [[Home]] → **Create Story Entity**, or **Templater: Create New Story Entity** |\n',
    '| Create fauna, flora, fungi or an item | [[Home]] → **Create Story Entity**, or **Templater: Create New Story Entity** |\n'
    '| Create a character, faction, location, event or species | [[Home]] → **Create Lore Entity**, or **Templater: Create New Lore Entity** |\n'
    '| Create a Myrkild unit | [[Home]] → **Create Myrkild Unit**, or **Templater: Create New Myrkild Unit** |\n'
    '| Open active-note creator context | [[Home]] → **Open Creator Context** |\n'
)
content = content.replace('`System/`, `Templates/` and `Home.md` are excluded.', '`System/`, `Templates/`, `Demo/` and `Home.md` are excluded.')
row_marker = '| **Templater: Create New Story Entity** | Direct template-specific creation command for fauna, flora, fungi and items. Runs the same guided workflow as `New Story Entity` and automatically files the result into `Drafts/Databases/<Type>/`. This is what the Home **Create Story Entity** button invokes. | **Yes.** Creates and files a Markdown note. |\n'
row_add = row_marker + '| **Templater: Create New Lore Entity** | Guided creation for characters, factions, locations, events and species. Controlled/reference fields are searchable; **Create new…** explicitly creates a task-bearing stub under `Drafts/Inbox/`. | **Yes.** Creates and files a Markdown note and may create referenced stubs. |\n| **Templater: Create New Myrkild Unit** | Guided Myrkild unit creation with controlled era/species/origin choices and relationship-aware locations. | **Yes.** Creates and files a Markdown note and may create location stubs. |\n| [[Home]] → **Open Creator Context** | Opens Outline, Backlinks and Local Graph in the right sidebar without committing workspace state. | **No.** Changes the local workspace layout only. |\n'
content = content.replace(row_marker, row_add)
content = content.replace('Do **not** run files inside `Templates/_Internals/` or `Templates/_Startup/` directly.', 'Do **not** run files inside `Templates/_Internals/`, `Templates/_Scripts/` or `Templates/_Startup/` directly.')
command_ref.write_text(content, encoding="utf-8")

setup = VAULT / "System/Obsidian Setup.md"
content = setup.read_text(encoding="utf-8")
content = content.replace('Use **Templater: New Lore Entity**', 'Use **Templater: Create New Lore Entity**')
content = content.replace('Use **Templater: New Myrkild Unit**', 'Use **Templater: Create New Myrkild Unit**')
content = content.replace('Use **Templater: Setup Creator Sidebar** to open Outline, Backlinks and Local Graph in the right sidebar without committing device-local workspace state.', 'Use [[Home]] → **Open Creator Context** to open Outline, Backlinks and Local Graph in the right sidebar without committing device-local workspace state.')
setup.write_text(content, encoding="utf-8")

sidebar = VAULT / "System/Creator Sidebar.md"
content = sidebar.read_text(encoding="utf-8")
content = content.replace('Run **Templater: Setup Creator Sidebar** from the Command Palette to open the three core creator panes', 'Use [[Home]] → **Open Creator Context** to open the three core creator panes')
sidebar.write_text(content, encoding="utf-8")

plugins = VAULT / "System/Recommended Plugins.md"
content = plugins.read_text(encoding="utf-8")
content = content.replace('The checked-in **Setup Creator Sidebar** Templater command uses', 'The checked-in Home **Open Creator Context** action uses')
plugins.write_text(content, encoding="utf-8")

# Tests should enforce the absence of the old boolean and the corrected user script path.
templates_test = ROOT / "Site/tests/vault-templates.test.mjs"
content = templates_test.read_text(encoding="utf-8")
content = content.replace("  'Templates/Workspace/Setup Creator Sidebar.md',\n", "")
content = content.replace("  'Templates/_Scripts/reference-picker.js',", "  'Templates/_Scripts/reference_picker.js',")
needle = "    assert.equal(parsed.data.status, 'draft', `${relativePath} must start as a draft`);\n"
if "must not carry the legacy publish boolean" not in content:
    content = content.replace(needle, "    assert.equal(parsed.data.publish, undefined, `${relativePath} must not carry the legacy publish boolean`);\n" + needle)
templates_test.write_text(content, encoding="utf-8")

homepage_test = ROOT / "Site/tests/vault-homepage.test.mjs"
content = homepage_test.read_text(encoding="utf-8")
if "Home must not carry the legacy publish boolean" not in content:
    content = content.replace("  assert.ok(home.data.cssclasses?.includes('viscerium-home'));", "  assert.equal(home.data.publish, undefined, 'Home must not carry the legacy publish boolean');\n  assert.ok(home.data.cssclasses?.includes('viscerium-home'));")
homepage_test.write_text(content, encoding="utf-8")

# ---------------------------------------------------------------------------
# Remove build/test artefacts and temporary migration machinery.
# ---------------------------------------------------------------------------
for rel in [
    "Site/public/assets/images/codex-noise-v2.webp",
    "migration-test.log",
    "Tools/migrate-vault-authoring.py",
    "Tools/migrate-vault-authoring-fix.py",
    ".github/workflows/vault-authoring-migration.yml",
]:
    path = ROOT / rel
    if path.exists():
        path.unlink()

# Delete this cleanup script from the final tree as well.
Path(__file__).unlink()

print("Vault authoring cleanup applied.")
