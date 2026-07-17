from __future__ import annotations

import json
from pathlib import Path
from textwrap import dedent

ROOT = Path(__file__).resolve().parents[2]
SITE = ROOT / "Site"


def read(relative: str) -> str:
    return (ROOT / relative).read_text(encoding="utf-8")


def write(relative: str, content: str) -> None:
    path = ROOT / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def replace_once(relative: str, old: str, new: str) -> None:
    content = read(relative)
    count = content.count(old)
    if count != 1:
        raise RuntimeError(f"{relative}: expected exactly one match, found {count}: {old[:100]!r}")
    write(relative, content.replace(old, new, 1))


def replace_all(relative: str, old: str, new: str, *, minimum: int = 1) -> None:
    content = read(relative)
    count = content.count(old)
    if count < minimum:
        raise RuntimeError(f"{relative}: expected at least {minimum} matches, found {count}: {old[:100]!r}")
    write(relative, content.replace(old, new))


package_path = SITE / "package.json"
package = json.loads(package_path.read_text(encoding="utf-8"))
removed_dependencies = [
    "xss",
    "uuid",
    "moment",
    "vis-data",
    "vis-util",
    "@egjs/hammerjs",
    "component-emitter",
    "keycharm",
    "propagating-hammerjs",
    "fs-extra",
]
for dependency in removed_dependencies:
    if dependency not in package["dependencies"]:
        raise RuntimeError(f"Site/package.json: missing expected dependency {dependency}")
    del package["dependencies"][dependency]
package_path.write_text(json.dumps(package, indent=2) + "\n", encoding="utf-8")

write(
    "Site/src/lib/codex-paths.mjs",
    dedent(r'''
    export function cleanSlug(value) {
      return String(value ?? '').trim().replace(/^\/+|\/+$/g, '').toLowerCase();
    }

    export function slugToRoute(slug) {
      const cleaned = cleanSlug(slug);
      return cleaned === 'index' ? '/' : `/${cleaned}/`;
    }

    export function escapeHtml(value) {
      return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    export function toPosixPath(value) {
      return String(value ?? '').replace(/\\/g, '/');
    }
    ''').lstrip(),
)

write(
    "Site/scripts/lib/walk.mjs",
    dedent(r'''
    import fs from 'node:fs/promises';
    import path from 'node:path';

    export async function walk(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
      const files = await Promise.all(entries.map((entry) => {
        const full = path.join(dir, entry.name);
        return entry.isDirectory() ? walk(full) : full;
      }));
      return files.flat();
    }
    ''').lstrip(),
)

replace_once("Site/scripts/generate-graph.mjs", "import fs from 'fs-extra';", "import fs from 'node:fs/promises';")
replace_once(
    "Site/scripts/generate-graph.mjs",
    "  await fs.ensureDir(path.dirname(outFile));\n  await fs.writeJson(outFile, { nodes, edges }, { spaces: 2 });",
    "  await fs.mkdir(path.dirname(outFile), { recursive: true });\n"
    "  await fs.writeFile(outFile, `${JSON.stringify({ nodes, edges }, null, 2)}\\n`, 'utf8');",
)

replace_once("Site/scripts/generate-map-data.mjs", "import fs from 'fs-extra';", "import fs from 'node:fs/promises';")
replace_once(
    "Site/scripts/generate-map-data.mjs",
    "  await fs.ensureDir(path.dirname(outFile));\n  await fs.writeJson(outFile, maps, { spaces: 2 });",
    "  await fs.mkdir(path.dirname(outFile), { recursive: true });\n"
    "  await fs.writeFile(outFile, `${JSON.stringify(maps, null, 2)}\\n`, 'utf8');",
)

replace_once("Site/scripts/generate-timeline-data.mjs", "import fs from 'fs-extra';", "import fs from 'node:fs/promises';")
replace_once(
    "Site/scripts/generate-timeline-data.mjs",
    "import fg from 'fast-glob';",
    "import fg from 'fast-glob';\nimport { cleanSlug, slugToRoute } from '../src/lib/codex-paths.mjs';",
)
replace_once(
    "Site/scripts/generate-timeline-data.mjs",
    dedent(r'''
    function cleanSlug(slug) {
      return String(slug).trim().replace(/^\/+|\/+$/g, '').toLowerCase();
    }

    '''),
    "",
)
replace_once(
    "Site/scripts/generate-timeline-data.mjs",
    dedent(r'''
    function route(slug) {
      return slug === 'index' ? '/' : `/${slug}/`;
    }

    '''),
    "",
)
replace_once("Site/scripts/generate-timeline-data.mjs", "      href: route(slug),", "      href: slugToRoute(slug),")
replace_once(
    "Site/scripts/generate-timeline-data.mjs",
    "  await fs.ensureDir(outDir);\n"
    "  await Promise.all((await fg('*.json', { cwd: outDir, absolute: true })).map((file) => fs.remove(file)));\n"
    "  for (const id of TIMELINE_IDS) {\n"
    "    await fs.writeJson(path.join(outDir, `${id}.json`), compiled.datasets[id], { spaces: 2 });\n"
    "  }\n"
    "  await fs.writeJson(path.join(outDir, 'manifest.json'), compiled.manifest, { spaces: 2 });",
    "  await fs.mkdir(outDir, { recursive: true });\n"
    "  await Promise.all((await fg('*.json', { cwd: outDir, absolute: true })).map((file) => fs.rm(file, { force: true })));\n"
    "  for (const id of TIMELINE_IDS) {\n"
    "    await fs.writeFile(path.join(outDir, `${id}.json`), `${JSON.stringify(compiled.datasets[id], null, 2)}\\n`, 'utf8');\n"
    "  }\n"
    "  await fs.writeFile(path.join(outDir, 'manifest.json'), `${JSON.stringify(compiled.manifest, null, 2)}\\n`, 'utf8');",
)

replace_once("Site/scripts/transform-timeline-shortcodes.mjs", "import fs from 'fs-extra';", "import fs from 'node:fs/promises';")
replace_once(
    "Site/scripts/transform-timeline-shortcodes.mjs",
    "  if (outFile !== file) await fs.remove(file);",
    "  if (outFile !== file) await fs.rm(file, { force: true });",
)

replace_once("Site/scripts/generate-category-pages.mjs", "import fs from 'fs-extra';", "import fs from 'node:fs/promises';")
replace_once(
    "Site/scripts/generate-category-pages.mjs",
    "import matter from 'gray-matter';",
    "import matter from 'gray-matter';\n"
    "import { cleanSlug, escapeHtml, slugToRoute, toPosixPath } from '../src/lib/codex-paths.mjs';",
)
replace_once(
    "Site/scripts/generate-category-pages.mjs",
    dedent(r'''
    function cleanSlug(value) {
      return String(value ?? '').trim().replace(/^\/+|\/+$/g, '').toLowerCase();
    }

    function routeFor(slug) {
      return slug === 'index' ? '/' : `/${cleanSlug(slug)}/`;
    }

    '''),
    "",
)
replace_once(
    "Site/scripts/generate-category-pages.mjs",
    dedent(r'''
    function escapeHtml(value) {
      return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    '''),
    "",
)
replace_all("Site/scripts/generate-category-pages.mjs", "routeFor(", "slugToRoute(")
replace_once(
    "Site/scripts/generate-category-pages.mjs",
    "  const relative = path.relative(docsDir, file).replace(/\\\\/g, '/').replace(markdownExtensions, '');",
    "  const relative = toPosixPath(path.relative(docsDir, file)).replace(markdownExtensions, '');",
)
replace_once(
    "Site/scripts/generate-category-pages.mjs",
    "      const sourcePath = line.slice(loreRoot.length).replace(/\\\\/g, '/');",
    "      const sourcePath = toPosixPath(line.slice(loreRoot.length));",
)
replace_once(
    "Site/scripts/generate-category-pages.mjs",
    "    const updated = updatedBySourcePath.get(parsed.data.sourcePath.replace(/\\\\/g, '/'));",
    "    const updated = updatedBySourcePath.get(toPosixPath(parsed.data.sourcePath));",
)
replace_once(
    "Site/scripts/generate-category-pages.mjs",
    "  await fs.ensureDir(path.dirname(outFile));",
    "  await fs.mkdir(path.dirname(outFile), { recursive: true });",
)

replace_once("Site/scripts/validate-math-output.mjs", "import fs from 'fs-extra';", "import fs from 'node:fs/promises';")

replace_once("Site/scripts/sync-contributor-avatars.mjs", "import fs from 'fs-extra';", "import fs from 'node:fs/promises';")
replace_once(
    "Site/scripts/sync-contributor-avatars.mjs",
    "function validateRegistry(registry, manifest) {",
    dedent(r'''
    async function pathExists(file) {
      try {
        await fs.access(file);
        return true;
      } catch {
        return false;
      }
    }

    function validateRegistry(registry, manifest) {
    ''').rstrip(),
)
replace_once(
    "Site/scripts/sync-contributor-avatars.mjs",
    "      await fs.move(temporaryPath, cachePath, { overwrite: true });",
    "      await fs.rename(temporaryPath, cachePath);",
)
replace_once(
    "Site/scripts/sync-contributor-avatars.mjs",
    "      await fs.remove(temporaryPath);",
    "      await fs.rm(temporaryPath, { force: true });",
)
replace_once(
    "Site/scripts/sync-contributor-avatars.mjs",
    "  if (!(await fs.pathExists(cachePath))) {",
    "  if (!(await pathExists(cachePath))) {",
)
replace_once(
    "Site/scripts/sync-contributor-avatars.mjs",
    "  await fs.copy(cachePath, publicPath, { overwrite: true });",
    "  await fs.copyFile(cachePath, publicPath);",
)
replace_once(
    "Site/scripts/sync-contributor-avatars.mjs",
    "  const registry = await fs.readJson(registryPath);",
    "  const registry = JSON.parse(await fs.readFile(registryPath, 'utf8'));",
)
replace_once(
    "Site/scripts/sync-contributor-avatars.mjs",
    "  await fs.ensureDir(cacheDir);\n  await fs.ensureDir(publicDir);",
    "  await fs.mkdir(cacheDir, { recursive: true });\n  await fs.mkdir(publicDir, { recursive: true });",
)

replace_once(
    "Site/scripts/sync-public-notes.mjs",
    "import matter from 'gray-matter';",
    "import matter from 'gray-matter';\n"
    "import { cleanSlug, slugToRoute, toPosixPath } from '../src/lib/codex-paths.mjs';",
)
replace_once(
    "Site/scripts/sync-public-notes.mjs",
    "import { transformCodexFormatting } from './codex-formatting.mjs';",
    "import { transformCodexFormatting } from './codex-formatting.mjs';\n"
    "import { inferNoteType, sourceSegments } from './note-inference.mjs';\n"
    "import { walk } from './lib/walk.mjs';",
)
replace_once(
    "Site/scripts/sync-public-notes.mjs",
    dedent(r'''
    const typeByFolder = new Map([
      ['characters', 'character'],
      ['factions', 'faction'],
      ['locations', 'location'],
      ['events', 'event'],
      ['maps', 'map'],
      ['images', 'image'],
      ['eras', 'era'],
      ['timelines', 'timeline'],
      ['calendar', 'calendar'],
      ['demo', 'system'],
    ]);
    '''),
    "",
)
replace_once(
    "Site/scripts/sync-public-notes.mjs",
    dedent(r'''
    function cleanSlug(slug) {
      return String(slug).trim().replace(/^\/+|\/+$/g, '').toLowerCase();
    }

    '''),
    "",
)
replace_once(
    "Site/scripts/sync-public-notes.mjs",
    "  const rel = path.relative(sourceDir, file).replace(/\\\\/g, '/').replace(/\\.(md|mdx)$/i, '');",
    "  const rel = toPosixPath(path.relative(sourceDir, file)).replace(/\\.(md|mdx)$/i, '');",
)
replace_once(
    "Site/scripts/sync-public-notes.mjs",
    dedent(r'''
    function sourceSegments(file) {
      const rel = path.relative(sourceDir, file).replace(/\\/g, '/').replace(/\.(md|mdx)$/i, '');
      return rel.split('/').filter(Boolean);
    }

    function inferType(file) {
      const segments = sourceSegments(file).map((segment) => segment.toLowerCase());
      for (let index = segments.length - 2; index >= 0; index -= 1) {
        const type = typeByFolder.get(segments[index]);
        if (type) return type;
      }
      return typeByFolder.get(segments[0]) ?? 'article';
    }

    '''),
    "",
)
replace_all("Site/scripts/sync-public-notes.mjs", "sourceSegments(file)", "sourceSegments(file, sourceDir)", minimum=2)
replace_once("Site/scripts/sync-public-notes.mjs", "  parsed.data.type ||= inferType(file);", "  parsed.data.type ||= inferNoteType(file, sourceDir);")
replace_once(
    "Site/scripts/sync-public-notes.mjs",
    dedent(r'''
    function route(slug) {
      return slug === 'index' ? '/' : `/${slug}/`;
    }

    '''),
    "",
)
replace_once(
    "Site/scripts/sync-public-notes.mjs",
    dedent(r'''
    async function walk(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
      const files = await Promise.all(entries.map((entry) => {
        const full = path.join(dir, entry.name);
        return entry.isDirectory() ? walk(full) : full;
      }));
      return files.flat();
    }

    '''),
    "",
)
replace_once(
    "Site/scripts/sync-public-notes.mjs",
    "  return imageSlug ? `[${image}](${route(imageSlug)})` : image;",
    "  return imageSlug ? `[${image}](${slugToRoute(imageSlug)})` : image;",
)
replace_once(
    "Site/scripts/sync-public-notes.mjs",
    "    return `[${label}](${route(slug)})`;",
    "    return `[${label}](${slugToRoute(slug)})`;",
)
replace_once(
    "Site/scripts/sync-public-notes.mjs",
    "  const sourcePath = path.relative(sourceDir, file).replace(/\\\\/g, '/');",
    "  const sourcePath = toPosixPath(path.relative(sourceDir, file));",
)

replace_once(
    "Site/sidebar.mjs",
    "import path from 'node:path';",
    "import path from 'node:path';\n"
    "import matter from 'gray-matter';\n"
    "import { slugToRoute, toPosixPath } from './src/lib/codex-paths.mjs';\n"
    "import { walk } from './scripts/lib/walk.mjs';",
)
replace_once(
    "Site/sidebar.mjs",
    dedent(r'''
    function frontmatterValue(raw, key) {
      const match = raw.match(new RegExp(`^---\\n[\\s\\S]*?^${key}:\\s*(.+?)\\s*$`, 'm'));
      return match?.[1]?.replace(/^['\"]|['\"]$/g, '');
    }

    '''),
    "",
)
replace_once(
    "Site/sidebar.mjs",
    "      const rel = path.relative(docsDir.pathname, file).replace(/\\\\/g, '/');",
    "      const rel = toPosixPath(path.relative(docsDir.pathname, file));",
)
replace_once(
    "Site/sidebar.mjs",
    "      const raw = await fs.readFile(file, 'utf8');\n"
    "      const title = frontmatterValue(raw, 'title') ?? labelFromSegment(path.basename(id));\n"
    "      const slug = frontmatterValue(raw, 'slug') ?? id;\n"
    "      const articleIcon = frontmatterValue(raw, 'sidebarIcon') ?? frontmatterValue(raw, 'icon');\n"
    "      const link = slug === 'index' ? '/' : `/${slug.replace(/^\\/+|\\/+$/g, '')}/`;",
    "      const raw = await fs.readFile(file, 'utf8');\n"
    "      const data = matter(raw).data ?? {};\n"
    "      const title = data.title ?? labelFromSegment(path.basename(id));\n"
    "      const slug = data.slug ?? id;\n"
    "      const articleIcon = data.sidebarIcon ?? data.icon;\n"
    "      const link = slugToRoute(slug);",
)
replace_once(
    "Site/sidebar.mjs",
    dedent(r'''
    async function walk(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
      const files = await Promise.all(entries.map((entry) => {
        const full = path.join(dir, entry.name);
        return entry.isDirectory() ? walk(full) : full;
      }));
      return files.flat();
    }
    '''),
    "",
)

replace_once(
    "Site/scripts/codex-formatting.mjs",
    "import { renderIconMarkup } from '../src/lib/icon-spec.mjs';",
    "import { escapeHtml } from '../src/lib/codex-paths.mjs';\n"
    "import { renderIconMarkup } from '../src/lib/icon-spec.mjs';",
)
replace_once(
    "Site/scripts/codex-formatting.mjs",
    dedent(r'''
    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    '''),
    "",
)

timeline_escape_block = dedent(r'''
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

''')

replace_once(
    "Site/src/lib/timeline/chronicle-view.mjs",
    "import { formatAbsoluteDay } from '../calendar/runtime.mjs';",
    "import { formatAbsoluteDay } from '../calendar/runtime.mjs';\n"
    "import { escapeHtml } from '../codex-paths.mjs';",
)
replace_once("Site/src/lib/timeline/chronicle-view.mjs", timeline_escape_block, "")

replace_once(
    "Site/src/lib/timeline/chronos-adapter.mjs",
    "import { attachChronosStyles, parseChronos } from 'chronos-timeline-md';",
    "import { attachChronosStyles, parseChronos } from 'chronos-timeline-md';\n"
    "import { escapeHtml } from '../codex-paths.mjs';",
)
replace_once("Site/src/lib/timeline/chronos-adapter.mjs", timeline_escape_block, "")

replace_once(
    "Site/src/lib/timeline/chronos-native-renderer.mjs",
    "import { VisceriumChronosTimeline } from '../chronos-fork/VisceriumChronosTimeline.mjs';",
    "import { VisceriumChronosTimeline } from '../chronos-fork/VisceriumChronosTimeline.mjs';\n"
    "import { escapeHtml } from '../codex-paths.mjs';",
)
replace_once("Site/src/lib/timeline/chronos-native-renderer.mjs", timeline_escape_block, "")

replace_once(
    "Site/scripts/build-content.mjs",
    "import { materializeDegelPlaceholders } from './materialize-degel-placeholders.mjs';\n",
    "",
)
replace_once(
    "Site/scripts/build-content.mjs",
    "    await materializeDegelPlaceholders();\n\n",
    "",
)
placeholder_script = SITE / "scripts/materialize-degel-placeholders.mjs"
if not placeholder_script.exists():
    raise RuntimeError("Expected materialize-degel-placeholders.mjs to exist")
placeholder_script.unlink()

package = json.loads(package_path.read_text(encoding="utf-8"))
for dependency in removed_dependencies:
    if dependency in package["dependencies"]:
        raise RuntimeError(f"Dependency still present after cleanup: {dependency}")

for relative in [
    "Site/scripts/generate-graph.mjs",
    "Site/scripts/generate-map-data.mjs",
    "Site/scripts/generate-timeline-data.mjs",
    "Site/scripts/transform-timeline-shortcodes.mjs",
    "Site/scripts/generate-category-pages.mjs",
    "Site/scripts/validate-math-output.mjs",
    "Site/scripts/sync-contributor-avatars.mjs",
]:
    if "from 'fs-extra'" in read(relative):
        raise RuntimeError(f"{relative}: fs-extra import remains")

for relative in [
    "Site/scripts/generate-category-pages.mjs",
    "Site/scripts/codex-formatting.mjs",
    "Site/src/lib/timeline/chronicle-view.mjs",
    "Site/src/lib/timeline/chronos-adapter.mjs",
    "Site/src/lib/timeline/chronos-native-renderer.mjs",
]:
    if "function escapeHtml" in read(relative):
        raise RuntimeError(f"{relative}: local escapeHtml remains")

if placeholder_script.exists():
    raise RuntimeError("Redundant placeholder script was not deleted")

print("Applied cleanup transformations successfully.")
