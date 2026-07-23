import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import matter from 'gray-matter';
import { inferStoryLineProjectBase, parseStoryLineDate } from '../src/lib/timeline/storyline-adapter.mjs';
import { toAbsoluteDay } from '../src/lib/calendar/runtime.mjs';
import { isMainModule } from './script-entry.mjs';

const siteRoot = process.cwd();
const defaultVaultRoot = path.resolve(siteRoot, '../Vault');
const STRING_FIELDS = ['pov', 'location', 'status', 'synopsis', 'storyTime', 'timeline_strand'];
const NUMERIC_FIELDS = ['sequence', 'chronologicalOrder'];
const LIST_OR_STRING_FIELDS = ['characters', 'tags'];

function toPosix(value) {
  return String(value ?? '').replace(/\\/g, '/');
}

function withoutMarkdownExtension(value) {
  return toPosix(value).replace(/\.(?:md|mdx)$/i, '');
}

function normaliseKey(value) {
  return withoutMarkdownExtension(value)
    .replace(/^\/+/, '')
    .replace(/\/+/g, '/')
    .trim()
    .toLocaleLowerCase('en');
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function addDiagnostic(diagnostics, severity, code, file, message) {
  diagnostics.push({ severity, code, file, message });
}

async function markdownFiles(rootDir) {
  try {
    return (await Array.fromAsync(fs.glob('**/*.{md,mdx}', { cwd: rootDir })))
      .map(toPosix)
      .sort();
  } catch (error) {
    if (error?.code === 'ENOENT') return [];
    throw error;
  }
}

async function readVaultRecords(vaultRoot, diagnostics) {
  const files = await markdownFiles(vaultRoot);
  const records = [];

  for (const relativePath of files) {
    const absolutePath = path.resolve(vaultRoot, relativePath);
    const raw = await fs.readFile(absolutePath, 'utf8');
    try {
      const parsed = matter(raw);
      records.push({ relativePath, raw, data: parsed.data ?? {}, content: parsed.content ?? '' });
    } catch (error) {
      if (relativePath.startsWith('Stories/')) {
        addDiagnostic(
          diagnostics,
          'error',
          'story-frontmatter',
          relativePath,
          `Story Markdown frontmatter could not be parsed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      records.push({ relativePath, raw, data: null, content: '', parseError: true });
    }
  }

  return records;
}

function addIndexValue(map, key, file) {
  const normalised = normaliseKey(key);
  if (!normalised) return;
  const values = map.get(normalised) ?? new Set();
  values.add(file);
  map.set(normalised, values);
}

function buildLinkIndex(records) {
  const exact = new Set();
  const basename = new Map();
  const named = new Map();

  for (const record of records) {
    if (!record.data) continue;
    const noExtension = withoutMarkdownExtension(record.relativePath);
    exact.add(normaliseKey(noExtension));
    addIndexValue(basename, path.posix.basename(noExtension), record.relativePath);
    addIndexValue(named, record.data.title, record.relativePath);

    const aliases = Array.isArray(record.data.aliases)
      ? record.data.aliases
      : (record.data.aliases ? [record.data.aliases] : []);
    for (const alias of aliases) addIndexValue(named, alias, record.relativePath);
  }

  return { exact, basename, named };
}

function cleanWikiTarget(rawTarget) {
  const beforeAlias = String(rawTarget ?? '').split('|', 1)[0].trim();
  if (!beforeAlias || beforeAlias.startsWith('#')) return null;
  const beforeHeading = beforeAlias.split('#', 1)[0].trim();
  return beforeHeading || null;
}

function wikiTargetResolves(target, sourcePath, index) {
  const normalised = normaliseKey(target);
  if (!normalised) return true;
  if (index.exact.has(normalised)) return true;

  const relative = normaliseKey(path.posix.normalize(path.posix.join(path.posix.dirname(sourcePath), target)));
  if (index.exact.has(relative)) return true;

  const base = normaliseKey(path.posix.basename(withoutMarkdownExtension(target)));
  if ((index.basename.get(base)?.size ?? 0) > 0) return true;
  if ((index.named.get(normalised)?.size ?? 0) > 0) return true;
  return false;
}

function validateWikiLinks(record, index, diagnostics) {
  const seen = new Set();
  for (const match of record.raw.matchAll(/\[\[([^\]]+)\]\]/g)) {
    const target = cleanWikiTarget(match[1]);
    if (!target || seen.has(target)) continue;
    seen.add(target);
    if (wikiTargetResolves(target, record.relativePath, index)) continue;
    addDiagnostic(
      diagnostics,
      'notice',
      'unresolved-story-link',
      record.relativePath,
      `Wikilink [[${target}]] does not currently resolve anywhere in the vault. Intentional future links may remain unresolved.`,
    );
  }
}

function validateSceneFields(record, diagnostics) {
  const { data, relativePath: file } = record;

  for (const field of STRING_FIELDS) {
    if (data[field] == null || data[field] === '') continue;
    if (typeof data[field] !== 'string') {
      addDiagnostic(diagnostics, 'error', 'scene-property-type', file, `"${field}" must be text when present.`);
    }
  }

  for (const field of LIST_OR_STRING_FIELDS) {
    const value = data[field];
    if (value == null || value === '') continue;
    const valid = typeof value === 'string' || (Array.isArray(value) && value.every((entry) => typeof entry === 'string'));
    if (!valid) {
      addDiagnostic(diagnostics, 'error', 'scene-property-type', file, `"${field}" must be text or a list of text values when present.`);
    }
  }

  for (const field of NUMERIC_FIELDS) {
    const value = data[field];
    if (value == null || value === '') continue;
    if (!Number.isFinite(Number(value))) {
      addDiagnostic(diagnostics, 'error', 'scene-property-type', file, `"${field}" must be numeric when present.`);
    }
  }
}

function validateStoryDate(record, diagnostics) {
  const { data, relativePath: file } = record;
  if (data.storyDate == null || data.storyDate === '') return;
  if (typeof data.storyDate !== 'string') {
    addDiagnostic(diagnostics, 'error', 'story-date-type', file, '"storyDate" must be text when present.');
    return;
  }

  const parsed = parseStoryLineDate(data.storyDate);
  if (!parsed) {
    addDiagnostic(
      diagnostics,
      'error',
      'story-date-invalid',
      file,
      `Unsupported storyDate ${JSON.stringify(data.storyDate)}. Use a registered VISCERIUM calendar date such as "16 Sólmanuthur, 9250" or "9250-solmanuthur-16".`,
    );
    return;
  }

  try {
    toAbsoluteDay(parsed);
  } catch (error) {
    addDiagnostic(
      diagnostics,
      'error',
      'story-date-invalid',
      file,
      `storyDate cannot be placed on its registered calendar: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function recordOrder(orderIndex, projectBase, field, value, file, diagnostics) {
  if (value == null || value === '' || !Number.isFinite(Number(value))) return;
  const project = orderIndex.get(projectBase) ?? new Map();
  const values = project.get(field) ?? new Map();
  const key = String(Number(value));
  const existing = values.get(key);
  if (existing && existing !== file) {
    addDiagnostic(
      diagnostics,
      'notice',
      'duplicate-story-order',
      file,
      `${field} ${key} is also used by ${existing}. This may be intentional, but check scene ordering if the project behaves unexpectedly.`,
    );
  } else {
    values.set(key, file);
  }
  project.set(field, values);
  orderIndex.set(projectBase, project);
}

async function validateStoryLineSettings(vaultRoot, records, diagnostics) {
  const settingsPath = path.resolve(vaultRoot, '.obsidian/plugins/storyline/data.json');
  let settings;
  try {
    settings = JSON.parse(await fs.readFile(settingsPath, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return;
    addDiagnostic(diagnostics, 'error', 'storyline-settings', '.obsidian/plugins/storyline/data.json', 'StoryLine settings JSON could not be parsed.');
    return;
  }

  if (settings.storyLineRoot && settings.storyLineRoot !== 'Stories') {
    addDiagnostic(
      diagnostics,
      'error',
      'storyline-root',
      '.obsidian/plugins/storyline/data.json',
      `StoryLine root is ${JSON.stringify(settings.storyLineRoot)}; VISCERIUM expects "Stories".`,
    );
  }

  if (nonEmptyString(settings.activeProjectFile)) {
    const active = normaliseKey(settings.activeProjectFile);
    const exists = records.some((record) => normaliseKey(record.relativePath) === active);
    if (!exists) {
      addDiagnostic(
        diagnostics,
        'notice',
        'missing-active-story-project',
        '.obsidian/plugins/storyline/data.json',
        `activeProjectFile points to ${JSON.stringify(settings.activeProjectFile)}, but that Markdown file is not currently present.`,
      );
    }
  }
}

export async function diagnoseStories({ vaultRoot = defaultVaultRoot } = {}) {
  const diagnostics = [];
  const records = await readVaultRecords(vaultRoot, diagnostics);
  const storyRecords = records.filter((record) => record.relativePath.startsWith('Stories/') && record.data);
  const linkIndex = buildLinkIndex(records);
  const orderIndex = new Map();
  const projectBases = new Set();
  let sceneCount = 0;

  for (const record of storyRecords) {
    const { data, relativePath: file } = record;
    const inScenesFolder = file.includes('/Scenes/');
    const declaresScene = data.type === 'scene';

    validateWikiLinks(record, linkIndex, diagnostics);

    if (!inScenesFolder && !declaresScene) {
      if (data.type === 'storyline') {
        const projectBase = inferStoryLineProjectBase(file);
        if (projectBase) projectBases.add(projectBase);
      }
      continue;
    }

    sceneCount += 1;
    const projectBase = inferStoryLineProjectBase(file);
    if (!projectBase) {
      addDiagnostic(diagnostics, 'error', 'scene-project', file, 'Scene could not be associated with a StoryLine project beneath Stories/.');
    } else {
      projectBases.add(projectBase);
    }

    if (declaresScene && !inScenesFolder) {
      addDiagnostic(diagnostics, 'error', 'scene-folder', file, 'A note with type "scene" must live beneath its StoryLine project Scenes/ folder.');
    }
    if (inScenesFolder && !declaresScene) {
      addDiagnostic(diagnostics, 'notice', 'scene-type', file, 'File sits beneath Scenes/ but does not declare type: scene.');
    }
    if (Object.hasOwn(data, 'calendarDate')) {
      addDiagnostic(
        diagnostics,
        'error',
        'duplicate-story-chronology',
        file,
        'StoryLine scenes use storyDate only; do not duplicate story chronology into calendarDate.',
      );
    }

    validateSceneFields(record, diagnostics);
    validateStoryDate(record, diagnostics);

    if (projectBase) {
      for (const field of NUMERIC_FIELDS) recordOrder(orderIndex, projectBase, field, data[field], file, diagnostics);
    }
  }

  await validateStoryLineSettings(vaultRoot, records, diagnostics);

  diagnostics.sort((left, right) => {
    if (left.severity !== right.severity) return left.severity === 'error' ? -1 : 1;
    return left.file.localeCompare(right.file) || left.code.localeCompare(right.code);
  });

  const errors = diagnostics.filter((item) => item.severity === 'error');
  const notices = diagnostics.filter((item) => item.severity === 'notice');
  return {
    ok: errors.length === 0,
    sceneCount,
    projectCount: projectBases.size,
    errors,
    notices,
    diagnostics,
  };
}

export function printStoryDoctor(result) {
  for (const item of result.diagnostics) {
    const line = `${item.severity === 'error' ? 'ERROR' : 'NOTICE'} [${item.code}] ${item.file}: ${item.message}`;
    if (item.severity === 'error') console.error(line);
    else console.warn(line);
  }
  console.log(
    `Story Doctor checked ${result.sceneCount} scene${result.sceneCount === 1 ? '' : 's'} across ${result.projectCount} project${result.projectCount === 1 ? '' : 's'}: ${result.errors.length} error(s), ${result.notices.length} notice(s).`,
  );
}

if (isMainModule(import.meta.url)) {
  const result = await diagnoseStories();
  printStoryDoctor(result);
  if (!result.ok) process.exitCode = 1;
}
