<%*
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

async function ensureFolder(folderPath) {
  let current = "";
  for (const segment of folderPath.split("/").filter(Boolean)) {
    current = current ? `${current}/${segment}` : segment;
    if (!tp.app.vault.getAbstractFileByPath(current)) await tp.app.vault.createFolder(current);
  }
}

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
await ensureFolder(config.folder);
if (tp.file.folder(true) !== config.folder) await tp.file.move(`${config.folder}/${tp.file.title}`);
%>