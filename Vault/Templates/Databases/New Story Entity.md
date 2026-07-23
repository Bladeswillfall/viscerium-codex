<%*
const startedAt = Date.now();
const TYPE_FOLDERS = {
  fauna: "Drafts/Databases/Fauna",
  flora: "Drafts/Databases/Flora",
  fungi: "Drafts/Databases/Fungi",
  item: "Drafts/Databases/Items"
};

const currentFolder = tp.file.folder(true);
const inferredEntry = Object.entries(TYPE_FOLDERS).find(([, folder]) => currentFolder === folder);
let selectedType = inferredEntry?.[0] ?? null;

// The shared core still owns all prompts and schema definitions. This wrapper only
// supplies a type when the folder already tells us what is being created, then
// routes command-created notes into the same folder structure afterwards.
const originalSuggester = tp.system.suggester;
tp.system.suggester = async (...args) => {
  const prompt = args[4];
  if (prompt === "What are you creating?") {
    if (selectedType) return selectedType;
    selectedType = await originalSuggester(...args);
    return selectedType;
  }
  return originalSuggester(...args);
};

let rendered = "";
try {
  rendered = await tp.file.include("[[Templates/_Internals/Story Entity Core]]");
} finally {
  tp.system.suggester = originalSuggester;
}

function renderedDocumentTitle(source) {
  const line = source.split(/\r?\n/).find((entry) => entry.startsWith("title:"));
  if (!line) return tp.file.title;
  const raw = line.slice("title:".length).trim();
  try {
    return String(JSON.parse(raw)).trim() || tp.file.title;
  } catch {
    return raw.replace(/^['"]|['"]$/g, "").trim() || tp.file.title;
  }
}

const targetFolder = selectedType ? TYPE_FOLDERS[selectedType] : null;
if (targetFolder && tp.file.folder(true) !== targetFolder) {
  // Templater checks new blank files after a short delay. Keep a command-created
  // note out of folder-triggered directories until that creation event has passed,
  // otherwise the same template can be applied twice.
  const minimumAgeMs = 450;
  const remainingDelay = minimumAgeMs - (Date.now() - startedAt);
  if (remainingDelay > 0) {
    await new Promise((resolve) => setTimeout(resolve, remainingDelay));
  }
  const documentTitle = renderedDocumentTitle(rendered);
  await tp.file.move(`${targetFolder}/${documentTitle}`);
}

tR += rendered;
%>