import { MarkdownRenderChild, Notice, Plugin, TFile } from 'obsidian';
import 'vis-timeline/styles/vis-timeline-graph2d.min.css';
import '../../Site/src/styles/timelines.css';
import '../../Site/src/styles/chronos.css';
import { compileTimelineRecords, TimelineCompilationError } from '../../Site/src/lib/timeline/compiler.mjs';
import { LANE_MODES, TIMELINE_IDS } from '../../Site/src/lib/timeline/core.mjs';
import { mountTimeline } from '../../Site/src/lib/timeline/renderer.mjs';

type TimelineBlock = {
  timeline: string;
  defaultCalendar?: string;
  laneMode?: string;
  showFilters?: boolean;
  showMinimap?: boolean;
  showLegend?: boolean;
  compact?: boolean;
};

type CompiledResult = ReturnType<typeof compileTimelineRecords>;

function parseBoolean(value: unknown, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  if (typeof value === 'boolean') return value;
  const normalized = String(value).toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return fallback;
}

function parseInlineBlock(id: string, specification = ''): TimelineBlock {
  const block: TimelineBlock = { timeline: id };
  const pairs = String(specification).matchAll(/([a-z][\w-]*)=(?:"([^"]*)"|'([^']*)'|([^\s]+))/gi);
  for (const pair of pairs) {
    const key = pair[1].toLowerCase();
    const value = pair[2] ?? pair[3] ?? pair[4] ?? '';
    if (key === 'timeline') block.timeline = value;
    if (key === 'calendar') block.defaultCalendar = value;
    if (key === 'lane' || key === 'lanemode') block.laneMode = value;
    if (key === 'filters' || key === 'showfilters') block.showFilters = parseBoolean(value, true);
    if (key === 'minimap' || key === 'showminimap') block.showMinimap = parseBoolean(value, true);
    if (key === 'legend' || key === 'showlegend') block.showLegend = parseBoolean(value, true);
    if (key === 'compact') block.compact = parseBoolean(value, false);
  }
  return block;
}

function normalizeBlock(value: unknown): TimelineBlock | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.timeline !== 'string' || !TIMELINE_IDS.includes(raw.timeline)) return null;
  return {
    timeline: raw.timeline,
    defaultCalendar: typeof raw.defaultCalendar === 'string' ? raw.defaultCalendar : undefined,
    laneMode: typeof raw.laneMode === 'string' && LANE_MODES.includes(raw.laneMode) ? raw.laneMode : 'unified',
    showFilters: parseBoolean(raw.showFilters, true),
    showMinimap: parseBoolean(raw.showMinimap, true),
    showLegend: parseBoolean(raw.showLegend, true),
    compact: parseBoolean(raw.compact, false),
  };
}

function cleanSegment(segment: string): string {
  return segment.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function sourcePathFromVaultFile(file: TFile): string {
  return file.path.replace(/^Lore\//i, '');
}

function routeFromVaultPath(file: TFile): string {
  const withoutExtension = sourcePathFromVaultFile(file).replace(/\.md$/i, '');
  const slug = withoutExtension.split('/').map(cleanSegment).filter(Boolean).join('/');
  return slug === 'introduction/start-here' ? '/' : `/${slug}/`;
}

function inferType(file: TFile): string {
  const segments = file.path.split('/').map((segment) => segment.toLowerCase());
  if (segments.includes('events')) return 'event';
  const stem = file.basename.toLowerCase();
  if (segments.includes('eras') && ['citadel', 'smog', 'nearsight', 'entropy'].includes(stem)) return 'era';
  return 'article';
}

class TimelineRenderChild extends MarkdownRenderChild {
  private readonly disposeRenderer: () => void;

  constructor(container: HTMLElement, disposeRenderer: () => void) {
    super(container);
    this.disposeRenderer = disposeRenderer;
  }

  onunload(): void {
    this.disposeRenderer();
  }
}

export default class VisceriumTimelinesPlugin extends Plugin {
  private compiled: CompiledResult | null = null;
  private compilePromise: Promise<CompiledResult> | null = null;

  async onload(): Promise<void> {
    this.registerEvent(this.app.metadataCache.on('changed', () => this.invalidate()));
    this.registerEvent(this.app.vault.on('create', () => this.invalidate()));
    this.registerEvent(this.app.vault.on('delete', () => this.invalidate()));
    this.registerEvent(this.app.vault.on('rename', () => this.invalidate()));

    this.addCommand({
      id: 'refresh-viscerium-timelines',
      name: 'Refresh compiled timelines',
      callback: async () => {
        this.invalidate();
        try {
          const compiled = await this.getCompiled();
          new Notice(`VISCERIUM timelines refreshed: ${compiled.events.length} events, ${compiled.eras.length} eras.`);
        } catch (error) {
          new Notice(error instanceof Error ? error.message : String(error), 10000);
        }
      },
    });

    this.registerMarkdownPostProcessor(async (element, context) => {
      const sourceFile = this.app.vault.getAbstractFileByPath(context.sourcePath);
      const frontmatter = sourceFile instanceof TFile
        ? this.app.metadataCache.getFileCache(sourceFile)?.frontmatter ?? {}
        : {};
      const configuredBlocks = frontmatter.timelineBlocks && typeof frontmatter.timelineBlocks === 'object'
        ? frontmatter.timelineBlocks as Record<string, unknown>
        : {};

      const candidates = [...element.querySelectorAll('p')].filter((paragraph) => /^\s*\[Timeline:[^\]]+\]\s*$/i.test(paragraph.textContent ?? ''));
      for (const paragraph of candidates) {
        const match = (paragraph.textContent ?? '').match(/^\s*\[Timeline:([^\]\s]+)(?:\s+([^\]]+))?\]\s*$/i);
        if (!match) continue;
        const id = match[1];
        const block = normalizeBlock(configuredBlocks[id]) ?? normalizeBlock(parseInlineBlock(id, match[2]));
        const mount = document.createElement('div');
        mount.className = 'vc-obsidian-timeline-mount';
        paragraph.replaceWith(mount);

        if (!block) {
          mount.createEl('p', { cls: 'codex-warning', text: `Invalid timeline shortcode: ${id}` });
          continue;
        }

        try {
          const compiled = await this.getCompiled();
          const dataset = compiled.datasets[block.timeline];
          if (!dataset) throw new Error(`Unknown timeline '${block.timeline}'.`);
          const dispose = mountTimeline(mount, dataset, {
            defaultCalendar: block.defaultCalendar,
            laneMode: block.laneMode,
            showFilters: block.showFilters,
            showMinimap: block.showMinimap,
            showLegend: block.showLegend,
            compact: block.compact,
            articleHandler: (event: { sourcePath?: string }) => this.openSourceArticle(event.sourcePath),
          });
          context.addChild(new TimelineRenderChild(mount, dispose));
        } catch (error) {
          const message = error instanceof TimelineCompilationError
            ? `Timeline compilation failed:\n${error.issues.map((entry: { sourcePath: string; field: string; message: string }) => `${entry.sourcePath} [${entry.field}] ${entry.message}`).join('\n')}`
            : error instanceof Error ? error.message : String(error);
          mount.empty();
          mount.createEl('pre', { cls: 'codex-warning', text: message });
        }
      }
    });
  }

  private invalidate(): void {
    this.compiled = null;
    this.compilePromise = null;
  }

  private async getCompiled(): Promise<CompiledResult> {
    if (this.compiled) return this.compiled;
    if (!this.compilePromise) this.compilePromise = this.compileVault();
    this.compiled = await this.compilePromise;
    return this.compiled;
  }

  private async compileVault(): Promise<CompiledResult> {
    const records = [];
    for (const file of this.app.vault.getMarkdownFiles().sort((left, right) => left.path.localeCompare(right.path))) {
      if (!file.path.startsWith('Lore/')) continue;
      const cache = this.app.metadataCache.getFileCache(file);
      const data = cache?.frontmatter ? { ...cache.frontmatter } : {};
      if (data.publish !== true || data.status !== 'canon') continue;
      data.type ||= inferType(file);
      records.push({
        data,
        sourcePath: sourcePathFromVaultFile(file),
        href: routeFromVaultPath(file),
      });
    }
    return compileTimelineRecords(records);
  }

  private async openSourceArticle(sourcePath?: string): Promise<void> {
    if (!sourcePath) return;
    const vaultPath = sourcePath.startsWith('Lore/') ? sourcePath : `Lore/${sourcePath}`;
    const file = this.app.vault.getAbstractFileByPath(vaultPath);
    if (file instanceof TFile) await this.app.workspace.getLeaf(false).openFile(file);
    else new Notice(`Timeline source note not found: ${vaultPath}`);
  }
}
