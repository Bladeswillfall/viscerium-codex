import { attachChronosStyles, parseChronos } from 'chronos-timeline-md';
import { DataSet, Timeline } from 'vis-timeline/standalone';

/**
 * VISCERIUM fork of the Chronos 1.1.0 renderer.
 *
 * Upstream reference:
 * https://github.com/clairefro/chronos-timeline-md/blob/e26587822aa902214848479c346380fe96afd476/src/core/ChronosTimeline.ts
 *
 * The Chronos parser and default stylesheet remain upstream dependencies. This
 * fork owns only the renderer boundary so the host can provide a fictional
 * calendar axis without hiding or rebuilding vis-timeline's native axis.
 */

function collectionValues(collection) {
  if (Array.isArray(collection)) return collection;
  if (collection && typeof collection.get === 'function') return collection.get();
  return [];
}

function temporalValue(value) {
  if (value instanceof Date) return value.valueOf();
  if (value && typeof value.valueOf === 'function') return value.valueOf();
  return value ?? '';
}

function itemSignature(items) {
  return collectionValues(items).map((item) => [
    item.id,
    item.group,
    temporalValue(item.start),
    temporalValue(item.end),
    item.type,
    item.className,
    item.content,
    item.title,
    item.style,
  ].join('\u001f')).join('\u001e');
}

function groupSignature(groups) {
  return collectionValues(groups).map((group) => [
    group.id,
    group.content,
    group.className,
    group.order,
  ].join('\u001f')).join('\u001e');
}

function replaceDataSet(dataSet, values) {
  const next = collectionValues(values);
  const nextIds = new Set(next.map((item) => item.id));
  const removed = dataSet.getIds().filter((id) => !nextIds.has(id));
  if (removed.length) dataSet.remove(removed);
  if (next.length) dataSet.update(next);
  dataSet.flush?.();
}

function fallbackTooltip(element, text) {
  element?.setAttribute?.('title', String(text ?? ''));
}

function refitIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5M8 12h8M12 8v8"
        fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </svg>`;
}

export class VisceriumChronosTimeline {
  constructor({
    container,
    settings = {},
    callbacks = {},
    cssRootClass,
    axis = {},
    timelineOptions = {},
  }) {
    if (!container) throw new Error('Chronos renderer requires a container.');

    this.container = container;
    this.settings = {
      selectedLocale: 'en',
      align: 'left',
      clickToUse: false,
      roundRanges: true,
      useUtc: true,
      useAI: false,
      ...settings,
    };
    this.callbacks = callbacks;
    this.cssRootClass = cssRootClass;
    this.axis = axis;
    this.hostTimelineOptions = timelineOptions;
    this.setTooltip = callbacks.setTooltip ?? fallbackTooltip;
    this.timeline = undefined;
    this.itemsDataSet = undefined;
    this.groupsDataSet = undefined;
    this.items = [];
    this.itemModelSignature = '';
    this.groupModelSignature = '';
    this.refitButton = undefined;

    const documentRef = container.ownerDocument ?? globalThis.document;
    if (documentRef) {
      attachChronosStyles(
        documentRef,
        undefined,
        this.settings.theme?.cssVariables,
        cssRootClass,
        this.settings.theme?.disableDefaultStyles,
      );
    }
  }

  render(source) {
    const parsed = parseChronos(source, {
      selectedLocale: this.settings.selectedLocale,
      roundRanges: this.settings.roundRanges,
      settings: this.settings,
    });
    this.renderParsed(parsed);
    return parsed;
  }

  renderParsed(result) {
    if (this.timeline) {
      this.updateParsed(result);
      return;
    }

    const items = collectionValues(result?.items);
    const groups = collectionValues(result?.groups);
    const markers = collectionValues(result?.markers);
    const flags = result?.flags ?? {};

    this.container.classList.add('chronos-timeline-container');
    if (this.cssRootClass) this.container.classList.add(this.cssRootClass);

    this.items = items;
    this.itemModelSignature = itemSignature(items);
    this.groupModelSignature = groupSignature(groups);
    this.itemsDataSet = new DataSet(items, { queue: true });
    this.groupsDataSet = new DataSet(groups, { queue: true });

    const options = this.#timelineOptions(flags);
    this.timeline = groups.length
      ? new Timeline(this.container, this.itemsDataSet, this.groupsDataSet, options)
      : new Timeline(this.container, this.itemsDataSet, options);

    this.#addMarkers(markers);
    this.#installTooltipBridge();
    this.#createRefitButton();

    if (!flags?.defaultView?.start || !flags?.defaultView?.end) {
      requestAnimationFrame(() => this.timeline?.fit({ animation: false }));
    }
  }

  updateParsed(result) {
    if (!this.timeline) {
      this.renderParsed(result);
      return;
    }

    const items = collectionValues(result?.items);
    const groups = collectionValues(result?.groups);
    const nextItems = itemSignature(items);
    const nextGroups = groupSignature(groups);
    let changed = false;

    if (nextGroups !== this.groupModelSignature) {
      this.groupModelSignature = nextGroups;
      replaceDataSet(this.groupsDataSet, groups);
      changed = true;
    }

    if (nextItems !== this.itemModelSignature) {
      this.itemModelSignature = nextItems;
      this.items = items;
      replaceDataSet(this.itemsDataSet, items);
      changed = true;
    }

    if (changed) this.timeline.redraw();
  }

  redraw() {
    this.timeline?.redraw();
  }

  #timelineOptions(flags) {
    const options = {
      zoomMax: 2.997972e14,
      zoomable: true,
      moveable: true,
      selectable: true,
      multiselect: false,
      minHeight: '20rem',
      align: this.settings.align,
      clickToUse: this.settings.clickToUse,
      orientation: { axis: 'top', item: 'top' },
      groupHeightMode: 'fitItems',
      stack: true,
      stackSubgroups: true,
      showCurrentTime: false,
      showMajorLabels: true,
      showMinorLabels: true,
      horizontalScroll: true,
      verticalScroll: true,
      format: {
        minorLabels: (date, scale, step) => this.axis.formatMinorLabel?.(date, scale, step) ?? '',
        majorLabels: (date, scale, step) => this.axis.formatMajorLabel?.(date, scale, step) ?? '',
      },
      ...this.hostTimelineOptions,
    };

    if (flags?.defaultView?.start && flags?.defaultView?.end) {
      options.start = flags.defaultView.start;
      options.end = flags.defaultView.end;
    }
    if (flags?.noToday) options.showCurrentTime = false;
    if (flags?.noStack) options.stack = false;
    if (flags?.height) {
      options.height = `${flags.height}px`;
      options.verticalScroll = true;
    }
    return options;
  }

  #addMarkers(markers) {
    for (const [index, marker] of markers.entries()) {
      const id = `marker_${index}`;
      this.timeline.addCustomTime(new Date(marker.start), id);
      try {
        this.timeline.setCustomTimeMarker(marker.content, id, true);
      } catch {
        // Older vis-timeline builds do not expose marker labels.
      }
    }
  }

  #installTooltipBridge() {
    this.timeline.on('itemover', ({ item, event }) => {
      const model = this.itemsDataSet?.get(item);
      const target = event?.target?.closest?.('.vis-item') ?? event?.target;
      if (!model || !target) return;
      this.setTooltip(target, model.title ?? model.cDescription ?? model.content ?? '');
    });
  }

  #createRefitButton() {
    const button = this.container.ownerDocument.createElement('button');
    button.type = 'button';
    button.className = 'chronos-timeline-refit-button';
    button.setAttribute('aria-label', 'Fit all timeline events');
    button.innerHTML = refitIcon();
    this.setTooltip(button, 'Fit all');
    button.addEventListener('click', () => this.timeline?.fit({ animation: true }));
    this.container.appendChild(button);
    this.refitButton = button;
  }

  destroy() {
    this.refitButton?.remove();
    this.refitButton = undefined;
    this.timeline?.destroy();
    this.timeline = undefined;
    this.itemsDataSet = undefined;
    this.groupsDataSet = undefined;
    this.items = [];
  }
}
