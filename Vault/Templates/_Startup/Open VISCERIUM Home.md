<%*
const ACTIVITY_PATH = "System/Data/Creator Activity.json";
const CACHE_KEY = `viscerium-creator-activity-mtimes:${tp.app.vault.getName()}`;

const dayKey = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const hashText = (text) => {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
};

const isCreatorFile = (file) => {
  const path = file.path;
  return file.extension === "md"
    && path !== "Home.md"
    && !path.startsWith("System/")
    && !path.startsWith("Templates/");
};

const readLocalMtimeCache = () => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}") ?? {};
  } catch (error) {
    console.warn("VISCERIUM creator activity local cache could not be read; rebuilding it.", error);
    return {};
  }
};

const recordCreatorActivity = async () => {
  const adapter = tp.app.vault.adapter;
  let ledger = {
    version: 1,
    lastScan: null,
    files: {},
    days: {},
  };

  try {
    if (await adapter.exists(ACTIVITY_PATH)) {
      ledger = {
        ...ledger,
        ...JSON.parse(await adapter.read(ACTIVITY_PATH)),
      };
    }
  } catch (error) {
    console.warn("VISCERIUM creator activity ledger could not be read; rebuilding it.", error);
  }

  ledger.files ??= {};
  ledger.days ??= {};

  const localMtimes = readLocalMtimeCache();
  const nextLocalMtimes = {};
  const isBaselineScan = !ledger.lastScan && Object.keys(ledger.files).length === 0;
  const nextFiles = {};
  let changed = isBaselineScan;

  for (const file of tp.app.vault.getMarkdownFiles().filter(isCreatorFile)) {
    const mtime = Number(file.stat?.mtime ?? 0);
    const previousHash = String(ledger.files[file.path] ?? "");
    nextLocalMtimes[file.path] = mtime;

    if (!isBaselineScan && previousHash && Number(localMtimes[file.path] ?? 0) === mtime) {
      nextFiles[file.path] = previousHash;
      continue;
    }

    const text = await tp.app.vault.cachedRead(file);
    const hash = hashText(text);
    nextFiles[file.path] = hash;

    if (isBaselineScan || previousHash === hash) continue;

    const key = dayKey(mtime || Date.now());
    ledger.days[key] = Number(ledger.days[key] ?? 0) + 1;
    changed = true;
  }

  const knownPaths = Object.keys(ledger.files);
  if (knownPaths.length !== Object.keys(nextFiles).length || knownPaths.some((path) => !(path in nextFiles))) {
    changed = true;
  }

  ledger.files = nextFiles;
  localStorage.setItem(CACHE_KEY, JSON.stringify(nextLocalMtimes));

  if (!changed && ledger.lastScan) return;

  ledger.lastScan = new Date().toISOString();
  await adapter.write(ACTIVITY_PATH, `${JSON.stringify(ledger, null, 2)}\n`);
};

const openHome = async () => {
  const home = tp.app.vault.getAbstractFileByPath("Home.md");
  if (!home || home.extension !== "md") return;

  const leaves = tp.app.workspace.getLeavesOfType("markdown");
  const existing = leaves.find((leaf) => leaf.view?.file?.path === home.path);
  const leaf = existing ?? tp.app.workspace.getLeaf(false);

  await leaf.setViewState({
    type: "markdown",
    state: {
      file: home.path,
      mode: "preview",
      source: false,
    },
  });
  tp.app.workspace.setActiveLeaf(leaf, { focus: true });
};

tp.app.workspace.onLayoutReady(async () => {
  try {
    await recordCreatorActivity();
  } catch (error) {
    console.warn("VISCERIUM creator activity could not be recorded.", error);
  }
  await openHome();
});
%>
