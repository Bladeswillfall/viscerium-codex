# Continuity Desk

A read-only working view over the **active StoryLine project**. This page derives its information from scene frontmatter; it does not create a second continuity database.

Use StoryLine to edit scene structure and metadata. Use `cd Site && npm run doctor:stories` when you want objective structural/link/date checks.

```dataviewjs
const settingsPath = ".obsidian/plugins/storyline/data.json";
let settings = {};
try {
  settings = JSON.parse(await app.vault.adapter.read(settingsPath));
} catch (error) {
  console.warn("Continuity Desk could not read StoryLine settings.", error);
}

const activeProjectFile = settings.activeProjectFile;
if (!activeProjectFile) {
  dv.paragraph("No active StoryLine project is configured. Open/select a StoryLine project first.");
  return;
}

const projectDir = activeProjectFile.slice(0, activeProjectFile.lastIndexOf("/"));
const scenesPrefix = `${projectDir}/Scenes/`;
const projectName = activeProjectFile.split("/").pop().replace(/\.md$/i, "");
const sceneArray = Array.from(
  dv.pages("")
    .where((page) => page.file.path.startsWith(scenesPrefix) && page.type === "scene"),
);

const asArray = (value) => {
  if (value === undefined || value === null || value === "") return [];
  return Array.isArray(value) ? value : [value];
};

const display = (value) => {
  if (value === undefined || value === null || value === "") return "—";
  if (value?.path) return value.path.split("/").pop().replace(/\.md$/i, "");
  return String(value).replace(/^\[\[/, "").replace(/\]\]$/, "").split("|").pop();
};

const numberOrInfinity = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : Number.POSITIVE_INFINITY;
};

const sortedScenes = [...sceneArray].sort((left, right) =>
  numberOrInfinity(left.sequence) - numberOrInfinity(right.sequence)
  || numberOrInfinity(left.chronologicalOrder) - numberOrInfinity(right.chronologicalOrder)
  || left.file.name.localeCompare(right.file.name),
);

const frequency = (values) => {
  const counts = new Map();
  for (const value of values.flatMap(asArray).map(display).filter((value) => value && value !== "—")) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
};

const dated = sortedScenes.filter((scene) => Boolean(scene.storyDate));
const povs = frequency(sortedScenes.map((scene) => scene.pov));
const locations = frequency(sortedScenes.map((scene) => scene.location));
const characters = frequency(sortedScenes.map((scene) => scene.characters));

const project = dv.container.createDiv({ cls: "continuity-desk-project" });
project.createEl("strong", { text: projectName });
project.createSpan({ text: ` · ${sortedScenes.length} scenes · ${dated.length} dated` });

dv.header(2, "Project snapshot");
dv.table(
  ["Scenes", "Dated", "POVs", "Locations", "Characters"],
  [[sortedScenes.length, dated.length, povs.length, locations.length, characters.length]],
);

dv.header(2, "Scene ledger");
if (sortedScenes.length === 0) {
  dv.paragraph("No scene notes found beneath this project's Scenes/ folder.");
} else {
  dv.table(
    ["Scene", "Act / Chapter", "Seq.", "Chron.", "POV", "Location", "Story date", "Status"],
    sortedScenes.map((scene) => [
      scene.file.link,
      [scene.act, scene.chapter].filter((value) => value !== undefined && value !== null && value !== "").join(" / ") || "—",
      scene.sequence ?? "—",
      scene.chronologicalOrder ?? "—",
      display(scene.pov),
      display(scene.location),
      scene.storyDate ?? "—",
      scene.status ?? "—",
    ]),
  );
}

dv.header(2, "POV balance");
if (povs.length) dv.table(["POV", "Scenes"], povs);
else dv.paragraph("No POV metadata has been assigned yet.");

dv.header(2, "Locations in use");
if (locations.length) dv.table(["Location", "Scenes"], locations);
else dv.paragraph("No location metadata has been assigned yet.");

dv.header(2, "Characters in scenes");
if (characters.length) dv.table(["Character", "Scenes"], characters);
else dv.paragraph("No character lists have been assigned yet.");

dv.header(2, "Unplaced scenes");
const unplaced = sortedScenes.filter((scene) => !scene.storyDate);
if (unplaced.length) dv.list(unplaced.map((scene) => scene.file.link));
else dv.paragraph("Every current scene has a storyDate. This is informational, not a requirement.");
```

## Interpretation

Counts here describe the manuscript **as it currently exists**. They are not targets or quality scores. An uneven POV or location distribution may be exactly what the story needs.

The desk intentionally does not maintain its own character, location, chronology or plot records. If a field is wrong, edit the StoryLine scene that owns it.
