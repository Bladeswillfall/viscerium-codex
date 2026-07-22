<%*
const RARITY_FIELD = { key: "rarity", label: "Rarity", options: ["Leave undefined", "Common", "Uncommon", "Rare", "Singular"], values: ["", "Common", "Uncommon", "Rare", "Singular"] };

const configs = {
  fauna: [
    { id: "profile", label: "Profile — kind, size and rarity", fields: [
      { key: "fauna_kind", prompt: "Broad kind of animal (for example: browsing herd animal, burrowing scavenger)" },
      { key: "size_class", label: "Size", options: ["Leave undefined", "Tiny", "Small", "Human-scale", "Large", "Massive"], values: ["", "Tiny", "Small", "Human-scale", "Large", "Massive"] },
      RARITY_FIELD
    ] },
    { id: "encounter", label: "Encounter — signs, behaviour and danger", fields: [
      { key: "signs_of_presence", prompt: "How might someone know it is nearby before seeing it?" },
      { key: "encounter_behaviour", prompt: "How does it usually react when encountered?" },
      { key: "threat_level", label: "Threat", options: ["Leave undefined", "Negligible", "Low", "Moderate", "High", "Extreme"], values: ["", "Negligible", "Low", "Moderate", "High", "Extreme"] }
    ] },
    { id: "ecology", label: "Ecology — dependencies and relationships", fields: [
      { key: "ecology_summary", prompt: "What does it eat, compete with, or get hunted by? One useful sentence is enough." }
    ] },
    { id: "people", label: "People — why ordinary people care", fields: [
      { key: "human_relevance", prompt: "Why would an ordinary person care about this animal?" }
    ] },
    { id: "culture", label: "Culture — beliefs and symbolism", fields: [
      { key: "cultural_significance", prompt: "Who fears, reveres, symbolises or ritualises this animal, and why?" }
    ] },
    { id: "story", label: "Story seed — a problem it can create", fields: [
      { key: "story_complication", prompt: "What problem could this animal create in a story?" }
    ] }
  ],
  flora: [
    { id: "profile", label: "Profile — growth form and rarity", fields: [
      { key: "growth_form", prompt: "Growth form (for example: tree, creeping vine, reed, thorn scrub)" },
      RARITY_FIELD
    ] },
    { id: "identification", label: "Identification — appearance and signs", fields: [
      { key: "identification", prompt: "What is the quickest reliable way to identify it?" },
      { key: "signs_of_presence", prompt: "What nearby sign might reveal it before the plant itself is seen?" }
    ] },
    { id: "ecology", label: "Ecology — growth and relationships", fields: [
      { key: "growth_conditions", prompt: "What conditions does it require or strongly prefer?" },
      { key: "ecological_relationships", prompt: "What feeds on, spreads, shelters or competes with it?" }
    ] },
    { id: "use", label: "Use — harvesting and practical value", fields: [
      { key: "human_relevance", prompt: "Why would an ordinary person gather, grow, destroy or protect it?" }
    ] },
    { id: "hazards", label: "Hazards — toxicity or unsafe handling", fields: [
      { key: "hazards", prompt: "What can go wrong when someone touches, eats, burns or harvests it?" }
    ] },
    { id: "culture", label: "Culture — beliefs and symbolism", fields: [
      { key: "cultural_significance", prompt: "Who values, fears or ritualises this plant, and why?" }
    ] },
    { id: "story", label: "Story seed — a problem it can create", fields: [
      { key: "story_complication", prompt: "What problem could this plant create in a story?" }
    ] }
  ],
  fungi: [
    { id: "profile", label: "Profile — growth form, substrate and rarity", fields: [
      { key: "growth_form", prompt: "Growth form (for example: shelf fungus, mould, fruiting caps, subterranean network)" },
      { key: "substrate", prompt: "Primary substrate or host, if important" },
      RARITY_FIELD
    ] },
    { id: "identification", label: "Identification — appearance and signs", fields: [
      { key: "identification", prompt: "What is the quickest reliable way to identify it?" },
      { key: "signs_of_presence", prompt: "What might reveal a colony before its fruiting bodies are seen?" }
    ] },
    { id: "ecology", label: "Ecology — fruiting and spread", fields: [
      { key: "fruiting_conditions", prompt: "What causes it to fruit or become noticeable?" },
      { key: "spread", prompt: "How does it meaningfully spread?" }
    ] },
    { id: "use", label: "Use — gathering and practical value", fields: [
      { key: "human_relevance", prompt: "Why would an ordinary person gather, cultivate, destroy or avoid it?" }
    ] },
    { id: "hazards", label: "Hazards — spores, toxicity or infection", fields: [
      { key: "hazards", prompt: "What can go wrong through exposure, ingestion, disturbance or harvesting?" }
    ] },
    { id: "culture", label: "Culture — beliefs and symbolism", fields: [
      { key: "cultural_significance", prompt: "Who values, fears or ritualises this fungus, and why?" }
    ] },
    { id: "story", label: "Story seed — a problem it can create", fields: [
      { key: "story_complication", prompt: "What problem could this fungus create in a story?" }
    ] }
  ],
  item: [
    { id: "profile", label: "Profile — type, origin and rarity", fields: [
      { key: "item_type", prompt: "Item type (for example: field tool, weapon, ritual object, household good)" },
      { key: "origin", prompt: "Place, culture, faction or maker of origin, if important" },
      RARITY_FIELD
    ] },
    { id: "use", label: "Use — purpose and limitations", fields: [
      { key: "primary_use", prompt: "What is this item actually used for?" },
      { key: "limitations", prompt: "What practical limitation, cost or trade-off matters?" }
    ] },
    { id: "construction", label: "Construction — materials and manufacture", fields: [
      { key: "materials", prompt: "Which materials meaningfully define the item?" },
      { key: "construction", prompt: "What is notable about how it is made?" }
    ] },
    { id: "availability", label: "Availability — access and common users", fields: [
      { key: "availability", prompt: "How difficult is it to obtain, and what controls that access?" },
      { key: "common_users", prompt: "Who commonly carries, owns or operates it?" }
    ] },
    { id: "culture", label: "Culture — meaning and symbolism", fields: [
      { key: "cultural_significance", prompt: "What does this item communicate about its owner, maker or culture?" }
    ] },
    { id: "story", label: "Story seed — a problem it can create", fields: [
      { key: "story_complication", prompt: "What problem could ownership, loss, scarcity or misuse of this item create?" }
    ] }
  ],
  "myrkild-unit": [
    { id: "presence", label: "Presence — signs and encounter context", fields: [
      { key: "signs_of_presence", prompt: "What evidence warns that this construct is active nearby?" },
      { key: "encounter_context", prompt: "Under what circumstances is it most likely to be encountered?" }
    ] },
    { id: "people", label: "People — knowledge and response", fields: [
      { key: "human_relevance", prompt: "What would informed people know, fear or do in response to it?" }
    ] },
    { id: "story", label: "Story seed — consequences beyond combat", fields: [
      { key: "story_complication", prompt: "What problem can this construct create beyond simply attacking someone?" }
    ] }
  ]
};

const type = tp.frontmatter.type;
const modules = configs[type];

if (!modules) {
  new tp.obsidian.Notice(`No Storyteller field set is defined for type: ${type ?? "undefined"}`);
  tR = "";
  return;
}

const available = modules.filter((module) =>
  module.fields.some((field) => {
    const value = tp.frontmatter[field.key];
    return value === undefined || value === null || value === "";
  })
);

if (!available.length) {
  new tp.obsidian.Notice("All supported optional fields are already present on this note.");
  tR = "";
  return;
}

const selected = await tp.system.multi_suggester(
  available.map((module) => module.label),
  available.map((module) => module.id),
  false,
  "Add only the fields the current story now requires"
) ?? [];

if (!selected.length) {
  new tp.obsidian.Notice("No fields added.");
  tR = "";
  return;
}

const additions = {};
for (const module of available) {
  if (!selected.includes(module.id)) continue;
  for (const field of module.fields) {
    const existing = tp.frontmatter[field.key];
    if (existing !== undefined && existing !== null && existing !== "") continue;

    let value = "";
    if (field.options) {
      value = await tp.system.suggester(field.options, field.values, false, field.label ?? field.key) ?? "";
    } else {
      value = (await tp.system.prompt(field.prompt, "", false) ?? "").trim();
    }
    if (value !== "") additions[field.key] = value;
  }
}

const keys = Object.keys(additions);
if (!keys.length) {
  new tp.obsidian.Notice("No values were entered.");
  tR = "";
  return;
}

await tp.app.fileManager.processFrontMatter(tp.config.target_file, (frontmatter) => {
  for (const [key, value] of Object.entries(additions)) frontmatter[key] = value;
  if (!frontmatter.development_level) frontmatter.development_level = "stub";
});

new tp.obsidian.Notice(`Added ${keys.length} field${keys.length === 1 ? "" : "s"}.`);
tR = "";
%>
