from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VAULT = ROOT / "Vault"


def text(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def write(path: str, content: str) -> None:
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding="utf-8")


def replace_in(path: str, old: str, new: str) -> None:
    target = ROOT / path
    if not target.exists():
        return
    content = target.read_text(encoding="utf-8")
    if old in content:
        target.write_text(content.replace(old, new), encoding="utf-8")


def move(old: str, new: str) -> None:
    source = ROOT / old
    if not source.exists():
        return
    target = ROOT / new
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists():
        if target.is_dir():
            shutil.rmtree(target)
        else:
            target.unlink()
    shutil.move(str(source), str(target))


# ---------------------------------------------------------------------------
# 1. One template root, with role-based subfolders.
# ---------------------------------------------------------------------------
TEMPLATE_MOVES = {
    "Vault/Templates/Character Template.md": "Vault/Templates/Lore/Character Template.md",
    "Vault/Templates/Faction Template.md": "Vault/Templates/Lore/Faction Template.md",
    "Vault/Templates/Location Template.md": "Vault/Templates/Lore/Location Template.md",
    "Vault/Templates/Event Template.md": "Vault/Templates/Lore/Event Template.md",
    "Vault/Templates/Era Template.md": "Vault/Templates/Lore/Era Template.md",
    "Vault/Templates/Map Template.md": "Vault/Templates/Publishing/Map Template.md",
    "Vault/Templates/Image Metadata Template.md": "Vault/Templates/Publishing/Image Metadata Template.md",
    "Vault/Templates/Timeline Template.md": "Vault/Templates/Timelines/Timeline Template.md",
    "Vault/Templates/Chronos Timeline Template.md": "Vault/Templates/Timelines/Chronos Timeline Template.md",
    "Vault/Templates/New Story Entity.md": "Vault/Templates/Databases/New Story Entity.md",
    "Vault/Templates/Add Storyteller Fields.md": "Vault/Templates/Databases/Add Storyteller Fields.md",
    "Vault/Templates/Myrkild Unit Profile.md": "Vault/Templates/Databases/Myrkild Unit Profile.md",
}
for old, new in TEMPLATE_MOVES.items():
    move(old, new)

# Update literal path references repo-wide after the moves.
text_suffixes = {".md", ".mdx", ".mjs", ".js", ".ts", ".tsx", ".astro", ".json", ".html", ".yml", ".yaml", ".css"}
for file in ROOT.rglob("*"):
    if not file.is_file() or file.suffix.lower() not in text_suffixes:
        continue
    if any(part in {"node_modules", ".git", "dist"} for part in file.parts):
        continue
    content = file.read_text(encoding="utf-8")
    updated = content
    for old, new in TEMPLATE_MOVES.items():
        old_rel = old.removeprefix("Vault/")
        new_rel = new.removeprefix("Vault/")
        updated = updated.replace(old_rel, new_rel).replace(old, new)
    if updated != content:
        file.write_text(updated, encoding="utf-8")


# ---------------------------------------------------------------------------
# 2. Demo content is quarantined outside Lore so it can later be gitignored.
# ---------------------------------------------------------------------------
move("Vault/Lore/Demo", "Vault/Demo/Starlight")
DEMO_MOVES = {
    "Vault/Lore/Eras/CITADEL/Characters/Example Character.md": "Vault/Demo/Lore/CITADEL/Characters/Example Character.md",
    "Vault/Lore/Eras/CITADEL/Factions/Example Faction.md": "Vault/Demo/Lore/CITADEL/Factions/Example Faction.md",
    "Vault/Lore/Eras/CITADEL/Locations/Example City.md": "Vault/Demo/Lore/CITADEL/Locations/Example City.md",
    "Vault/Lore/Eras/CITADEL/Events/Example Battle.md": "Vault/Demo/Lore/CITADEL/Events/Example Battle.md",
    "Vault/Lore/Eras/CITADEL/Images/Example Banner.md": "Vault/Demo/Lore/CITADEL/Images/Example Banner.md",
    "Vault/Lore/Eras/CITADEL/Maps/Example World Map.md": "Vault/Demo/Lore/CITADEL/Maps/Example World Map.md",
    "Vault/Assets/Images/example-banner.svg": "Vault/Demo/Assets/Images/example-banner.svg",
    "Vault/Assets/Maps/example-world.svg": "Vault/Demo/Assets/Maps/example-world.svg",
}
for old, new in DEMO_MOVES.items():
    move(old, new)

write("Vault/Demo/README.md", """# Demo content\n\nThis folder contains VISCERIUM Codex demonstration material, examples and Starlight authoring references.\n\nIt is deliberately outside `Lore/` and `Assets/`, so demo entities never enter publication, relationship pickers, canonical graphs or creator databases. The whole folder may be added to `.gitignore` later without changing the real vault structure.\n\nAutomated tests must use fixtures under `Site/tests/fixtures/` rather than depending on this folder.\n""")


# ---------------------------------------------------------------------------
# 3. Publication state: status is the single publication flag.
# ---------------------------------------------------------------------------
# Remove the old boolean from Markdown frontmatter throughout the vault.
for file in VAULT.rglob("*.md"):
    content = file.read_text(encoding="utf-8")
    if not content.startswith("---"):
        continue
    end = content.find("\n---", 3)
    if end < 0:
        continue
    fm = content[: end + 4]
    body = content[end + 4 :]
    fm = re.sub(r"(?m)^publish:\s*(?:true|false)\s*\n", "", fm)
    fm = re.sub(r"(?m)^status:\s*[\"']?canon[\"']?\s*$", "status: published", fm)
    file.write_text(fm + body, encoding="utf-8")

# Generated/public fixtures and docs should use the same status vocabulary.
for file in ROOT.rglob("*"):
    if not file.is_file() or file.suffix.lower() not in text_suffixes:
        continue
    if any(part in {"node_modules", ".git", "dist"} for part in file.parts):
        continue
    content = file.read_text(encoding="utf-8")
    updated = content
    updated = re.sub(r"status:\s*([\"']?)canon\1", "status: published", updated)
    updated = updated.replace("status === 'canon'", "status === 'published'")
    updated = updated.replace('status === "canon"', 'status === "published"')
    updated = updated.replace("status !== 'canon'", "status !== 'published'")
    updated = updated.replace('status !== "canon"', 'status !== "published"')
    updated = updated.replace("new Set(['canon'])", "new Set(['published'])")
    updated = updated.replace('new Set(["canon"])', 'new Set(["published"])')
    updated = updated.replace("status: canon", "status: published")
    updated = updated.replace("status: `canon`", "status: `published`")
    updated = updated.replace("status `canon`", "status `published`")
    if updated != content:
        file.write_text(updated, encoding="utf-8")

# Replace publication predicates that previously required both publish:true and canon.
publication_files = [
    "Site/scripts/sync-public-notes.mjs",
    "Site/scripts/validate-vault-notes.mjs",
    "Site/scripts/vault-doctor.mjs",
    "Site/scripts/generate-category-pages.mjs",
    "Site/scripts/generate-timeline-data.mjs",
    "Site/src/lib/feed.ts",
    "Site/src/pages/index.astro",
    "Site/src/pages/changelog.astro",
    "Site/src/components/degel-system/DegelSystemExplorer.astro",
    "Tools/obsidian-viscerium-timelines/main.ts",
]
for rel in publication_files:
    path = ROOT / rel
    if not path.exists():
        continue
    content = path.read_text(encoding="utf-8")
    updated = content
    # Common exact forms.
    updated = updated.replace("parsed.data.publish !== true || parsed.data.status !== 'published'", "parsed.data.status !== 'published'")
    updated = updated.replace("data.publish !== true || data.status !== 'published'", "data.status !== 'published'")
    updated = updated.replace("data.publish === true && data.status === 'published'", "data.status === 'published'")
    updated = updated.replace("entry.data.publish === true && entry.data.status === 'published'", "entry.data.status === 'published'")
    updated = updated.replace("note.data.publish === true && note.data.status === 'published'", "note.data.status === 'published'")
    updated = updated.replace("page.data.publish === true && page.data.status === 'published'", "page.data.status === 'published'")
    # Generic same-object combinations.
    updated = re.sub(r"([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\.publish\s*===\s*true\s*&&\s*\1\.status\s*===\s*['\"]published['\"]", r"\1.status === 'published'", updated)
    updated = re.sub(r"([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\.publish\s*!==\s*true\s*\|\|\s*\1\.status\s*!==\s*['\"]published['\"]", r"\1.status !== 'published'", updated)
    # Validator previously skipped every record that lacked publish:true.
    updated = updated.replace("if (data.publish !== true) continue;", "if (data.status !== 'published') continue;")
    path.write_text(updated, encoding="utf-8")

# The generated Starlight schema no longer needs a publish boolean.
content_config = ROOT / "Site/src/content.config.ts"
if content_config.exists():
    content = content_config.read_text(encoding="utf-8")
    content = re.sub(r"(?m)^\s*publish: z\.boolean\(\)\.optional\(\),\n", "", content)
    content_config.write_text(content, encoding="utf-8")

# Remove publish assertions/fixture lines from tests and authoring docs where status now owns publication.
for root in [ROOT / "Site/tests", ROOT / "Vault/System", ROOT / "README.md", ROOT / "CONTRIBUTING.md"]:
    files = [root] if root.is_file() else list(root.rglob("*")) if root.exists() else []
    for file in files:
        if not file.is_file() or file.suffix.lower() not in text_suffixes:
            continue
        content = file.read_text(encoding="utf-8")
        updated = re.sub(r"(?m)^.*assert\.equal\([^\n]*\.publish[^\n]*\);\s*\n", "", content)
        updated = re.sub(r"(?m)^\s*publish:\s*(?:true|false)\s*\n", "", updated)
        updated = updated.replace("publish:true + status:published", "status:published")
        updated = updated.replace("publish: true + status: published", "status: published")
        if updated != content:
            file.write_text(updated, encoding="utf-8")


# ---------------------------------------------------------------------------
# 4. Frontmatter cleanup.
# ---------------------------------------------------------------------------
replace_in("Vault/Templates/Lore/Faction Template.md", 'faction: "{{title}}"\n', "")
replace_in("Vault/Templates/Lore/Location Template.md", 'location: "{{title}}"\n', "")

write("Vault/System/Frontmatter Schema.md", """# Frontmatter Schema\n\nVISCERIUM properties have one authoritative meaning. Templates may omit properties that are irrelevant to a subject; absence means the fact is not established or not useful yet.\n\n## Publication\n\n`status` is the publication workflow field. Use `draft`, `review`, `published`, or `archived`. Only notes beneath `Lore/` with `status: published` are public Codex sources. Folder placement remains the second safety boundary.\n\nDo not add a second `publish` boolean. Canon/continuity truth is a separate concept from whether a note is publicly released.\n\n## Relationship fields\n\n- `era` / `eras`: controlled VISCERIUM era identifiers.\n- `faction`: references faction entity titles.\n- `location` / `locations`: references location entity titles.\n- `species`: references species entity titles.\n- `participants`: event participant titles, normally characters.\n- `related`: deliberately loose cross-entity references.\n\nUse arrays where a field can genuinely hold several values. Do not create self-reference fields merely to repeat the note title; `title` already identifies the entity.\n\n## Creator maturity\n\n`development_level: stub` means an intentionally incomplete creator record. It is not a publication state. Generated relationship stubs belong under `Drafts/Inbox/` until developed and deliberately promoted.\n\nSpecialist databases may retain provenance/import fields when those fields answer a real workflow question. For example, Myrkild `source_*` fields remain distinct from public metadata.\n\n## Artwork provenance\n\n`artist` identifies the maker where known. `credit` is the display/rights-holder credit and may differ from the artist. `source`, `sourceUrl`, `license`, `rights`, and `usage` remain provenance/permission fields rather than synonyms.\n""")


# ---------------------------------------------------------------------------
# 5. Shared relationship picker + explicit stub creation.
# ---------------------------------------------------------------------------
write("Vault/Templates/_Scripts/reference-picker.js", r'''const normalise = (value) => String(value ?? "").trim().toLocaleLowerCase();

const safeFilename = (value) => String(value)
  .replace(/[\\/:*?"<>|]/g, "-")
  .replace(/\s+/g, " ")
  .trim();

async function ensureFolder(app, folderPath) {
  let current = "";
  for (const segment of String(folderPath).split("/").filter(Boolean)) {
    current = current ? `${current}/${segment}` : segment;
    if (!app.vault.getAbstractFileByPath(current)) await app.vault.createFolder(current);
  }
}

function candidates(tp, types) {
  const allowed = new Set(types.map(normalise));
  const byName = new Map();
  for (const file of tp.app.vault.getMarkdownFiles()) {
    const path = file.path;
    if (!(path.startsWith("Lore/") || path.startsWith("Drafts/"))) continue;
    if (path.startsWith("Drafts/Inbox/Inbox")) continue;
    const fm = tp.app.metadataCache.getFileCache(file)?.frontmatter ?? {};
    if (!allowed.has(normalise(fm.type))) continue;
    const title = String(fm.title ?? file.basename).trim();
    if (!title) continue;
    const aliases = Array.isArray(fm.aliases) ? fm.aliases.map(String) : [];
    const key = normalise(title);
    if (!byName.has(key)) byName.set(key, { title, aliases, path });
  }
  return [...byName.values()].sort((a, b) => a.title.localeCompare(b.title));
}

async function createStub(tp, options, existing) {
  const label = options.label ?? options.stubType ?? options.types?.[0] ?? "entity";
  const name = String(await tp.system.prompt(`New ${label} name`, "", true) ?? "").trim();
  if (!name) return null;

  const wanted = normalise(name);
  const duplicate = existing.find((entry) => normalise(entry.title) === wanted || entry.aliases.some((alias) => normalise(alias) === wanted));
  if (duplicate) return duplicate.title;

  const folder = options.stubFolder ?? `Drafts/Inbox/${String(options.stubType ?? "Entity").replace(/^./, (char) => char.toUpperCase())}s`;
  await ensureFolder(tp.app, folder);
  const filename = safeFilename(name);
  if (!filename) return null;
  const path = `${folder}/${filename}.md`;
  const alreadyThere = tp.app.vault.getAbstractFileByPath(path);
  if (alreadyThere) return alreadyThere.basename;

  const type = options.stubType ?? options.types?.[0] ?? "article";
  const content = [
    "---",
    `title: ${JSON.stringify(name)}`,
    'description: ""',
    "status: draft",
    `type: ${type}`,
    "development_level: stub",
    `tags: [${JSON.stringify("stub")}, ${JSON.stringify("inbox")}]`,
    "---",
    "",
    "## Summary",
    "",
    "%% Created automatically because this relationship did not yet exist. Add only the detail the world actually needs. %%",
    "",
    "- [ ] Develop this stub before promotion to Lore.",
    "",
  ].join("\n");
  await tp.app.vault.create(path, content);
  return name;
}

module.exports = async function referencePicker(tp, options = {}) {
  const types = Array.isArray(options.types) && options.types.length ? options.types : [options.type].filter(Boolean);
  const existing = candidates(tp, types);
  const createToken = "__viscerium_create__";
  const labels = existing.map((entry) => entry.title);
  const values = existing.map((entry) => entry.title);
  if (options.allowCreate !== false) {
    labels.push(`＋ Create new ${options.label ?? options.stubType ?? "entity"}…`);
    values.push(createToken);
  }

  if (options.multiple) {
    const selected = await tp.system.multi_suggester(labels, values, false, options.prompt ?? options.label ?? "Select") ?? [];
    const result = selected.filter((value) => value !== createToken);
    if (selected.includes(createToken)) {
      const created = await createStub(tp, options, existing);
      if (created && !result.includes(created)) result.push(created);
    }
    return result;
  }

  const singleLabels = ["Leave blank", ...labels];
  const singleValues = ["", ...values];
  const selected = await tp.system.suggester(singleLabels, singleValues, false, options.prompt ?? options.label ?? "Select") ?? "";
  if (selected !== createToken) return selected;
  return await createStub(tp, options, existing) ?? "";
};
''')

# Story Entities: locations become searchable references; free-text biomes remain free-form because there is no biome entity schema.
core_path = ROOT / "Vault/Templates/_Internals/Story Entity Core.md"
if core_path.exists():
    core = core_path.read_text(encoding="utf-8")
    old = '''const locationsText = await tp.system.prompt(\n  type === "item" ? "Known regions or markets, comma-separated (optional)" : "Known locations or regions, comma-separated (optional)",\n  "",\n  false\n) ?? "";\nconst locations = locationsText.split(",").map((value) => value.trim()).filter(Boolean);'''
    new = '''const locations = await tp.user.reference_picker(tp, {\n  types: ["location"],\n  multiple: true,\n  allowCreate: true,\n  label: "location",\n  stubType: "location",\n  stubFolder: "Drafts/Inbox/Locations",\n  prompt: type === "item" ? "Known regions or markets" : "Known locations or regions"\n}) ?? [];'''
    if old not in core:
        raise SystemExit("Story Entity Core location prompt changed; migration needs review")
    core_path.write_text(core.replace(old, new), encoding="utf-8")

write("Vault/Templates/Lore/New Lore Entity.md", r'''<%*
const ERA_OPTIONS = ["CITADEL", "SMOG", "NEARSIGHT", "ENTROPY"];
const TYPES = {
  character: { label: "Character", folder: "Drafts/Inbox/Characters" },
  faction: { label: "Faction", folder: "Drafts/Inbox/Factions" },
  location: { label: "Location", folder: "Drafts/Inbox/Locations" },
  event: { label: "Event", folder: "Drafts/Inbox/Events" },
  species: { label: "Species", folder: "Drafts/Inbox/Species" },
};
const type = await tp.system.suggester(Object.values(TYPES).map((entry) => entry.label), Object.keys(TYPES), true, "What are you creating?");
const config = TYPES[type];
const currentTitle = tp.file.title === "Untitled" ? "" : tp.file.title;
const title = String(await tp.system.prompt("Name", currentTitle, true) ?? "").trim();
if (title && title !== tp.file.title) await tp.file.rename(title);
const description = String(await tp.system.prompt("One-line identity (optional)", "", false) ?? "").trim();
const era = type === "species" ? "" : (await tp.system.suggester(["Leave undefined", ...ERA_OPTIONS], ["", ...ERA_OPTIONS], false, "Era") ?? "");
const pick = (options) => tp.user.reference_picker(tp, options);
const data = {};

if (type === "character") {
  data.faction = await pick({ types: ["faction"], multiple: true, label: "faction", stubType: "faction", stubFolder: "Drafts/Inbox/Factions" });
  data.location = await pick({ types: ["location"], multiple: true, label: "location", stubType: "location", stubFolder: "Drafts/Inbox/Locations" });
  data.species = await pick({ types: ["species"], multiple: false, label: "species", stubType: "species", stubFolder: "Drafts/Inbox/Species" });
}
if (type === "faction") {
  data.capital = await pick({ types: ["location"], multiple: false, label: "capital", stubType: "location", stubFolder: "Drafts/Inbox/Locations" });
  data.territory = await pick({ types: ["location"], multiple: true, label: "territory", stubType: "location", stubFolder: "Drafts/Inbox/Locations" });
  data.leader = await pick({ types: ["character"], multiple: false, label: "leader", stubType: "character", stubFolder: "Drafts/Inbox/Characters" });
}
if (type === "location") {
  data.faction = await pick({ types: ["faction"], multiple: true, label: "faction", stubType: "faction", stubFolder: "Drafts/Inbox/Factions" });
  data.region = await pick({ types: ["location"], multiple: false, label: "parent region", stubType: "location", stubFolder: "Drafts/Inbox/Locations" });
}
if (type === "event") {
  data.location = await pick({ types: ["location"], multiple: true, label: "location", stubType: "location", stubFolder: "Drafts/Inbox/Locations" });
  data.faction = await pick({ types: ["faction"], multiple: true, label: "faction", stubType: "faction", stubFolder: "Drafts/Inbox/Factions" });
  data.participants = await pick({ types: ["character"], multiple: true, label: "participant", stubType: "character", stubFolder: "Drafts/Inbox/Characters" });
}

const yamlValue = (value) => Array.isArray(value) ? `[${value.map((item) => JSON.stringify(item)).join(", ")}]` : JSON.stringify(value);
const frontmatter = ["---", `title: ${JSON.stringify(title)}`, `description: ${JSON.stringify(description)}`, "status: draft", `type: ${type}`, "development_level: stub"];
if (era) frontmatter.push(`era: ${JSON.stringify(era)}`);
for (const [key, value] of Object.entries(data)) {
  if (Array.isArray(value) ? value.length : Boolean(value)) frontmatter.push(`${key}: ${yamlValue(value)}`);
}
frontmatter.push(`tags: [${JSON.stringify(type)}]`, "---");
const bodies = {
  character: ["## Summary", "", "## Appearance", "", "## Personality", "", "## Biography", "", "## Relationships"],
  faction: ["## Summary", "", "## Culture", "", "## Government", "", "## Military", "", "## Economy", "", "## History"],
  location: ["## Summary", "", "## Geography", "", "## People and Culture", "", "## History", "", "## Story Use"],
  event: ["## Summary", "", "## Background", "", "## The Event", "", "## Aftermath", "", "## Outcome"],
  species: ["## Summary", "", "## Identification", "", "## Ecology", "", "## Relationship with people"],
};
const body = [...bodies[type], "", "## Related", "", "- [ ] Review this inbox draft and promote it deliberately when established.", ""];
tR += `${frontmatter.join("\n")}\n\n${body.join("\n")}`;
if (tp.file.folder(true) !== config.folder) await tp.file.move(`${config.folder}/${tp.file.title}`);
%>''')

write("Vault/Templates/Databases/New Myrkild Unit.md", r'''<%*
const ERAS = ["CITADEL", "SMOG", "NEARSIGHT", "ENTROPY"];
const MYRKILD = ["Gluttony", "Envy", "Sloth", "Wrath", "Lust", "Pride", "Greed"];
const ORIGINS = ["Purespawn", "Mutated"];
const SIZES = ["Tiny", "Small", "Human-scale", "Large", "Massive", "Behemoth"];
const title = String(await tp.system.prompt("Unit name", tp.file.title === "Untitled" ? "" : tp.file.title, true) ?? "").trim();
if (title && title !== tp.file.title) await tp.file.rename(title);
const era = await tp.system.suggester(ERAS, ERAS, true, "Era");
const myrkildSpecies = await tp.system.suggester(MYRKILD, MYRKILD, true, "Myrkild species");
const origin = await tp.system.suggester(ORIGINS, ORIGINS, true, "Origin");
const size = await tp.system.suggester(["Leave undefined", ...SIZES], ["", ...SIZES], false, "Size class") ?? "";
const locations = await tp.user.reference_picker(tp, { types: ["location"], multiple: true, label: "location", stubType: "location", stubFolder: "Drafts/Inbox/Locations" }) ?? [];
const yamlList = (items) => `[${items.map((item) => JSON.stringify(item)).join(", ")}]`;
const fm = ["---", `title: ${JSON.stringify(title)}`, `description: ${JSON.stringify("A WIP Myrkild unit profile.")}`, "status: draft", "type: myrkild-unit", "unit_id: null", "source_id: null", `unit_name: ${JSON.stringify(title)}`, `era: ${JSON.stringify(era)}`, "species: Myrkild", `myrkild_species: ${JSON.stringify(myrkildSpecies)}`, `origin: ${JSON.stringify(origin)}`, "natural_host: null", "role: null"];
if (size) fm.push(`size_class: ${JSON.stringify(size)}`); else fm.push("size_class: null");
fm.push("threat_rating: null", "strain: null", "subtype: null", "rarity: null", `locations: ${yamlList(locations)}`, "biomes: []", "tactics: null", "weaknesses: null", "visual_notes: null", "image: null", "review_status: draft", "development_level: stub", "source: null", "source_sheet: null", "source_row: null", "source_species_entry: null", "tags: [myrkild, unit]", "---");
const body = ["", "> [!tip] Stop when usable", "> Keep the structured profile focused on placement, battlefield behaviour and counterplay.", "", "## Battlefield profile", "", "## Tactics and behaviour", "", "## Weaknesses and counterplay", "", "## Visual notes", "", "## Availability notes", ""];
tR += `${fm.join("\n")}\n${body.join("\n")}`;
const folder = `Drafts/Databases/Myrkild Units/${origin}/${era}`;
if (tp.file.folder(true) !== folder) await tp.file.move(`${folder}/${tp.file.title}`);
%>''')

write("Vault/Templates/Workspace/Setup Creator Sidebar.md", r'''<%*
const viewTypes = [
  { type: "outline", name: "Outline" },
  { type: "backlink", name: "Backlinks" },
  { type: "localgraph", name: "Local Graph" },
];
for (const view of viewTypes) {
  try {
    let leaf = tp.app.workspace.getLeavesOfType(view.type)[0];
    if (!leaf) {
      leaf = tp.app.workspace.getRightLeaf(true);
      if (leaf) await leaf.setViewState({ type: view.type, active: false });
    }
  } catch (error) {
    console.warn(`Could not open ${view.name} in the creator sidebar.`, error);
  }
}
%>''')

write("Vault/System/Creator Sidebar.md", """# Creator Sidebar\n\nThe right sidebar is for **context while creating**, not merely repository controls. The recommended stack is:\n\n1. **Outline** — structure of the active note.\n2. **Backlinks** — what established material points at the active subject.\n3. **Local Graph** — nearby lore context rather than the noisy global vault graph.\n4. **Obsidian Git** — keep sync/push/pull available as a utility tab.\n\nRun **Templater: Setup Creator Sidebar** from the Command Palette to open the three core creator panes without checking `workspace.json` into Git. Workspace placement remains device-local so collaborators are not forced into one layout.\n\nThe global Graph remains available from the Command Palette when you actually need a whole-vault overview.\n""")

# Templater config: shared user scripts and direct creator commands.
templater_path = ROOT / "Vault/.obsidian/plugins/templater-obsidian/data.json"
config = json.loads(templater_path.read_text(encoding="utf-8"))
config["user_scripts_folder"] = "Templates/_Scripts"
for item in [
    "Templates/Databases/New Story Entity.md",
    "Templates/Lore/New Lore Entity.md",
    "Templates/Databases/New Myrkild Unit.md",
    "Templates/Workspace/Setup Creator Sidebar.md",
]:
    if item not in config.setdefault("enabled_templates_hotkeys", []):
        config["enabled_templates_hotkeys"].append(item)
templater_path.write_text(json.dumps(config, indent=2) + "\n", encoding="utf-8")


# ---------------------------------------------------------------------------
# 6. Home becomes a visibly special creator front door and surfaces inbox work.
# ---------------------------------------------------------------------------
home_path = ROOT / "Vault/Home.md"
if home_path.exists():
    home = home_path.read_text(encoding="utf-8")
    home = home.replace("**CANON** → `Lore/`", "**LORE** → `Lore/`")
    home = home.replace('if (path.startsWith("Lore/")) return { label: "CANON", key: "canon" };', 'if (path.startsWith("Lore/")) return { label: "LORE", key: "lore" };')
    home = home.replace('&& !path.startsWith("Templates/");', '&& !path.startsWith("Templates/")\n      && !path.startsWith("Demo/");')
    story_action = '''  {\n    label: "+ Create Story Entity",\n    id: findCommand("Create New Story Entity"),\n    tone: "create",\n    title: "Create fauna, flora, fungi or an item through the guided Story Entity workflow.",\n  },'''
    replacement = story_action + '''\n  {\n    label: "+ Create Lore Entity",\n    id: findCommand("New Lore Entity"),\n    tone: "create",\n    title: "Create a character, faction, location, event or species with relationship pickers and inbox filing.",\n  },\n  {\n    label: "+ Create Myrkild Unit",\n    id: findCommand("New Myrkild Unit"),\n    tone: "create",\n    title: "Create a structured Myrkild unit with guided era, species, origin and location fields.",\n  },\n  {\n    label: "Setup Creator Sidebar",\n    id: findCommand("Setup Creator Sidebar"),\n    tone: "stories-secondary",\n    title: "Open Outline, Backlinks and Local Graph in the right sidebar without committing workspace state.",\n  },'''
    if story_action in home:
        home = home.replace(story_action, replacement)
    home = home.replace("**New Story Entity**  \nGuided creation for fauna, flora, fungi or an item.", "**New Story Entity**  \nGuided creation for fauna, flora, fungi or an item.\n\n**New Lore Entity**  \nGuided inbox creation for characters, factions, locations, events and species. Relationship fields are searchable and can explicitly create a follow-up stub.\n\n**New Myrkild Unit**  \nGuided Myrkild unit creation with controlled era/species/origin choices and relationship-aware locations.")
    home = home.replace("**[[System/SOPs/Storyteller View SOP|Storyteller View SOP]]**", "**[[System/Creator Sidebar|Creator Sidebar]]** — *What should live in the right sidebar while I work?*  \nOutline, Backlinks and Local Graph provide active-note context; Git remains a utility tab.\n>\n> **[[System/SOPs/Storyteller View SOP|Storyteller View SOP]]**", 1)
    home_path.write_text(home, encoding="utf-8")

# Creator activity should ignore quarantined demos too.
startup = ROOT / "Vault/Templates/_Startup/Open VISCERIUM Home.md"
if startup.exists():
    content = startup.read_text(encoding="utf-8")
    content = content.replace('&& !path.startsWith("Templates/");', '&& !path.startsWith("Templates/")\n    && !path.startsWith("Demo/");')
    startup.write_text(content, encoding="utf-8")

write("Vault/.obsidian/snippets/VISCERIUM Home file.css", r'''/* Keep Home visually distinct from ordinary notes in the File Explorer. */
.workspace-leaf-content[data-type="file-explorer"] .nav-file-title[data-path="Home.md"] {
  position: sticky;
  top: 0;
  z-index: 6;
  margin-block: 0.15rem 0.35rem;
  border: 1px solid var(--interactive-accent);
  background: color-mix(in srgb, var(--interactive-accent) 14%, var(--background-secondary));
  box-shadow: 0 0.35rem 0.8rem rgba(0, 0, 0, 0.18);
  font-weight: 750;
}
.workspace-leaf-content[data-type="file-explorer"] .nav-file-title[data-path="Home.md"] .nav-file-title-content::before {
  content: "⌂";
  display: inline-grid;
  place-items: center;
  width: 1.1rem;
  margin-right: 0.35rem;
  color: var(--interactive-accent);
  font-weight: 900;
}
''')
appearance_path = ROOT / "Vault/.obsidian/appearance.json"
appearance = json.loads(appearance_path.read_text(encoding="utf-8"))
if "VISCERIUM Home file" not in appearance.setdefault("enabledCssSnippets", []):
    appearance["enabledCssSnippets"].append("VISCERIUM Home file")
appearance_path.write_text(json.dumps(appearance, indent=2) + "\n", encoding="utf-8")

# Existing Iconize installation gets a Home mapping as a harmless visual enhancement.
icon_path = ROOT / "Vault/.obsidian/plugins/obsidian-icon-folder/data.json"
if icon_path.exists():
    icons = json.loads(icon_path.read_text(encoding="utf-8"))
    icons["Home.md"] = "Home"
    icon_path.write_text(json.dumps(icons, indent=2) + "\n", encoding="utf-8")


# ---------------------------------------------------------------------------
# 7. Documentation and tests follow the reorganised architecture.
# ---------------------------------------------------------------------------
# Publishing Rules: status-only contract.
publishing = ROOT / "Vault/System/Publishing Rules.md"
if publishing.exists():
    content = publishing.read_text(encoding="utf-8")
    content = content.replace("A public note must have:", "A public note must live beneath `Vault/Lore/` and have:")
    content = re.sub(r"(?m)^publish:\s*true\s*\n", "", content)
    content = content.replace("Only notes in `Vault/Lore/` can publish.", "Only notes in `Vault/Lore/` can publish. Publication is controlled by `status: published`; there is no second publish boolean.")
    publishing.write_text(content, encoding="utf-8")

# Obsidian Setup and plugin docs: new commands/paths and sidebar workflow.
setup = ROOT / "Vault/System/Obsidian Setup.md"
if setup.exists():
    content = setup.read_text(encoding="utf-8")
    content = content.replace("Templates/New Story Entity.md", "Templates/Databases/New Story Entity.md")
    content = content.replace("Templates/New Story Entity", "Templates/Databases/New Story Entity")
    content = content.replace("Templates/_Startup/Open VISCERIUM Home.md", "Templates/_Startup/Open VISCERIUM Home.md")
    insert = "\nUse **Templater: New Lore Entity** for relationship-aware character, faction, location, event and species drafts. Use **Templater: New Myrkild Unit** for guided unit creation. Both use searchable references; creating a missing reference requires explicitly choosing **Create new…** and produces a task-bearing stub under `Drafts/Inbox/`.\n\nUse **Templater: Setup Creator Sidebar** to open Outline, Backlinks and Local Graph in the right sidebar without committing device-local workspace state.\n"
    marker = "## Template roles\n"
    if insert.strip() not in content and marker in content:
        content = content.replace(marker, insert + "\n" + marker)
    setup.write_text(content, encoding="utf-8")

plugins = ROOT / "Vault/System/Recommended Plugins.md"
if plugins.exists():
    content = plugins.read_text(encoding="utf-8")
    content += "\n## Creator sidebar\n\nNo additional sidebar plugin is required. The checked-in **Setup Creator Sidebar** Templater command uses Obsidian's core Outline, Backlinks and Local Graph panes; Obsidian Git remains available as a utility tab. Workspace state stays device-local and ignored by Git.\n"
    plugins.write_text(content, encoding="utf-8")

# Update test fixture path lists after the template moves; publication is status-only.
vt = ROOT / "Site/tests/vault-templates.test.mjs"
if vt.exists():
    content = vt.read_text(encoding="utf-8")
    content = content.replace("assert.equal(parsed.data.publish, false, `${relativePath} must start unpublished`);\n", "")
    # New creator workflows should be present too.
    content = content.replace("'Templates/_Startup/Open VISCERIUM Home.md',", "'Templates/_Startup/Open VISCERIUM Home.md',\n  'Templates/Lore/New Lore Entity.md',\n  'Templates/Databases/New Myrkild Unit.md',\n  'Templates/Workspace/Setup Creator Sidebar.md',\n  'Templates/_Scripts/reference-picker.js',")
    vt.write_text(content, encoding="utf-8")

# Update architecture handoff statements without erasing conceptual uses of canon elsewhere.
for rel in ["Architecture/viscerium-codex-architecture.json", "Architecture/viscerium-codex-architecture.html"]:
    path = ROOT / rel
    if path.exists():
        content = path.read_text(encoding="utf-8")
        content = content.replace("publish:true + status:canon", "status:published")
        content = content.replace("publish:true + status:published", "status:published")
        content = content.replace("Only publish:true + status:canon notes publish.", "Only status:published notes beneath Lore publish.")
        path.write_text(content, encoding="utf-8")

print("Vault authoring migration applied.")
