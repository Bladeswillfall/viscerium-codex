import { ChronosTimeline } from 'chronos-timeline-md';
import { formatAbsoluteDay } from '../calendar/runtime.mjs';
import { syntheticDateToAbsoluteDay } from './core.mjs';
import { mountTimeline as mountNativeTimeline } from './chronos-native-renderer.mjs';
import { calendarYearBoundaries } from './year-grid.mjs';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const TIMELINE_MIN_HEIGHT = 420;
const TIMELINE_MAX_HEIGHT = 1152;
const TIMELINE_COMPACT_MIN_HEIGHT = 320;
const TIMELINE_COMPACT_MAX_HEIGHT = 768;

function groupSignature(groups) {
  const values = Array.isArray(groups)
    ? groups
    : typeof groups?.get === 'function'
      ? groups.get()
      : [];
  return values.map((group) => `${group.id}:${group.content ?? ''}`).join('|');
}

function renderParsedWithoutChronosTooltip(chronos, result, originalRenderParsed) {
  const hadOwnSetupTooltip = Object.prototype.hasOwnProperty.call(chronos, '_setupTooltip');
  const previousSetupTooltip = chronos._setupTooltip;
  chronos._setupTooltip = () => {};

  try {
    originalRenderParsed.call(chronos, result);
  } finally {
    if (hadOwnSetupTooltip) chronos._setupTooltip = previousSetupTooltip;
    else delete chronos._setupTooltip;
  }
}

function installChronosTimelineProxy(chronos, initialResult, originalRenderParsed) {
  let target = chronos.timeline;
  let currentGroupSignature = groupSignature(initialResult.groups);
  let pendingGroups;
  let redrawFrame;
  let destroyed = false;
  const listeners = new Map();
  let proxy;

  const removeRefitButtons = () => {
    chronos.container?.querySelectorAll?.('.chronos-timeline-refit-button')
      .forEach((button) => button.remove());
  };

  const attachExternalListeners = () => {
    for (const [eventType, handlers] of listeners) {
      for (const handler of handlers) target.on(eventType, handler);
    }
  };

  const scheduleNativeRedraw = () => {
    window.cancelAnimationFrame(redrawFrame);
    redrawFrame = window.requestAnimationFrame(() => target?.redraw?.());
  };

  const remountWithChronos = (items, groups) => {
    if (destroyed) return undefined;

    const visibleWindow = target?.getWindow?.();
    const selection = target?.getSelection?.() ?? [];
    target?.destroy?.();
    removeRefitButtons();

    renderParsedWithoutChronosTooltip(chronos, {
      items,
      groups,
      markers: initialResult.markers ?? [],
      flags: initialResult.flags ?? {},
    }, originalRenderParsed);

    target = chronos.timeline;
    if (!target) throw new Error('Chronos did not recreate its timeline after a group change.');

    if (visibleWindow) {
      target.setWindow(visibleWindow.start, visibleWindow.end, { animation: false });
    }
    if (selection.length) target.setSelection(selection, { focus: false });
    attachExternalListeners();

    currentGroupSignature = groupSignature(groups);
    pendingGroups = undefined;
    chronos.timeline = proxy;
    return undefined;
  };

  proxy = new Proxy({}, {
    get(_proxyTarget, property) {
      if (property === '__visceriumChronosProxy') return true;
      if (property === '__visceriumChronosTarget') return target;

      if (property === 'on') {
        return (eventType, handler) => {
          if (!listeners.has(eventType)) listeners.set(eventType, new Set());
          listeners.get(eventType).add(handler);
          target.on(eventType, handler);
          return proxy;
        };
      }

      if (property === 'off') {
        return (eventType, handler) => {
          listeners.get(eventType)?.delete(handler);
          target.off?.(eventType, handler);
          return proxy;
        };
      }

      if (property === 'setOptions') {
        return (nextOptions = {}) => {
          const isLegacyHostOptionPass = (
            nextOptions.verticalScroll === true
            && nextOptions.horizontalScroll === true
            && (nextOptions.height === '34rem' || nextOptions.height === '28rem')
          );
          if (isLegacyHostOptionPass) {
            const { height: _legacyFixedHeight, ...forwardedOptions } = nextOptions;
            return target.setOptions(forwardedOptions);
          }
          return target.setOptions(nextOptions);
        };
      }

      if (property === 'setGroups') {
        return (groups) => {
          const nextSignature = groupSignature(groups);
          if (nextSignature !== currentGroupSignature) pendingGroups = groups;
          return undefined;
        };
      }

      if (property === 'setItems') {
        return (items) => {
          if (pendingGroups !== undefined) return remountWithChronos(items, pendingGroups);
          const result = target.setItems(items);
          scheduleNativeRedraw();
          return result;
        };
      }

      if (property === 'destroy') {
        return () => {
          destroyed = true;
          window.cancelAnimationFrame(redrawFrame);
          removeRefitButtons();
          return target?.destroy?.();
        };
      }

      const value = target?.[property];
      return typeof value === 'function' ? value.bind(target) : value;
    },

    set(_proxyTarget, property, value) {
      target[property] = value;
      return true;
    },

    has(_proxyTarget, property) {
      return property in target;
    },
  });

  chronos.timeline = proxy;
  return proxy;
}

function yearPath(boundaries, startDay, span, width, height) {
  return boundaries.map(({ absoluteDay }) => {
    const x = Math.min(width, Math.max(0, ((absoluteDay - startDay) / span) * width));
    return `M${x.toFixed(2)} 0V${height.toFixed(2)}`;
  }).join(' ');
}

function createYearGridSvg() {
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
  svg.setAttribute('class', 'vc-timeline-year-grid');
  svg.setAttribute('data-vc-year-grid', '');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('preserveAspectRatio', 'none');

  for (const className of ['vc-year-grid-annual', 'vc-year-grid-decade', 'vc-year-grid-century']) {
    const path = document.createElementNS(SVG_NAMESPACE, 'path');
    path.setAttribute('class', className);
    svg.append(path);
  }

  return svg;
}

function installAnnualYearGrid(root, dataset, timeline) {
  let renderFrame;
  let destroyed = false;
  const calendarSelect = root.querySelector('[data-vc-calendar]');
  const listButton = root.querySelector('[data-vc-list]');

  const render = () => {
    if (destroyed) return;

    const canvas = root.querySelector('[data-vc-canvas]');
    const timelineElement = canvas?.querySelector('.vis-timeline');
    const centerPanel = timelineElement?.querySelector(':scope > .vis-panel.vis-center')
      ?? canvas?.querySelector('.vis-panel.vis-center');
    const itemset = centerPanel?.querySelector('.vis-itemset');
    if (!canvas || canvas.hidden || !centerPanel || !itemset) return;

    let svg = itemset.querySelector(':scope > [data-vc-year-grid]');
    if (!svg) {
      svg = createYearGridSvg();
      itemset.append(svg);
    }

    const itemsetRect = itemset.getBoundingClientRect();
    const width = Math.max(0, itemsetRect.width);
    const height = Math.max(0, itemsetRect.height);
    if (!width || !height) return;

    svg.style.left = '0px';
    svg.style.top = '0px';
    svg.style.width = `${width}px`;
    svg.style.height = `${height}px`;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    const range = timeline.getWindow();
    const startDay = syntheticDateToAbsoluteDay(range.start, dataset.absoluteStartDay);
    const endDay = syntheticDateToAbsoluteDay(range.end, dataset.absoluteStartDay);
    const span = Math.max(1, endDay - startDay);
    const calendarId = calendarSelect?.value ?? dataset.defaultCalendar;
    const boundaries = calendarYearBoundaries(startDay, endDay, calendarId);
    const annual = [];
    const decades = [];
    const centuries = [];

    for (const boundary of boundaries) {
      if (boundary.year % 100 === 0) centuries.push(boundary);
      else if (boundary.year % 10 === 0) decades.push(boundary);
      else annual.push(boundary);
    }

    svg.querySelector('.vc-year-grid-annual')?.setAttribute('d', yearPath(annual, startDay, span, width, height));
    svg.querySelector('.vc-year-grid-decade')?.setAttribute('d', yearPath(decades, startDay, span, width, height));
    svg.querySelector('.vc-year-grid-century')?.setAttribute('d', yearPath(centuries, startDay, span, width, height));
    svg.dataset.vcYearLineCount = String(boundaries.length);
    svg.dataset.vcYearCalendar = calendarId;
  };

  const scheduleRender = () => {
    window.cancelAnimationFrame(renderFrame);
    renderFrame = window.requestAnimationFrame(render);
  };

  const mutationObserver = new MutationObserver(scheduleRender);
  mutationObserver.observe(root, { subtree: true, childList: true });

  const resizeObserver = typeof ResizeObserver === 'function'
    ? new ResizeObserver(scheduleRender)
    : undefined;
  resizeObserver?.observe(root);

  timeline.on('rangechange', scheduleRender);
  timeline.on('rangechanged', scheduleRender);
  calendarSelect?.addEventListener('change', scheduleRender);
  listButton?.addEventListener('click', scheduleRender);
  scheduleRender();

  return () => {
    destroyed = true;
    window.cancelAnimationFrame(renderFrame);
    mutationObserver.disconnect();
    resizeObserver?.disconnect();
    timeline.off?.('rangechange', scheduleRender);
    timeline.off?.('rangechanged', scheduleRender);
    calendarSelect?.removeEventListener('change', scheduleRender);
    listButton?.removeEventListener('click', scheduleRender);
  };
}

function installAdaptiveTimelineHeight(root, timeline, compact = false) {
  let renderFrame;
  let settleFrame;
  let destroyed = false;
  let appliedHeight = 0;
  let appliedScrollable;
  const canvas = root.querySelector('[data-vc-canvas]');
  const minHeight = compact ? TIMELINE_COMPACT_MIN_HEIGHT : TIMELINE_MIN_HEIGHT;
  const maxHeight = compact ? TIMELINE_COMPACT_MAX_HEIGHT : TIMELINE_MAX_HEIGHT;

  const measure = () => {
    if (destroyed || !canvas || canvas.hidden) return;

    const timelineElement = canvas.querySelector('.vis-timeline');
    const itemset = canvas.querySelector('.vis-panel.vis-center .vis-itemset');
    if (!timelineElement || !itemset) return;

    const itemsetRect = itemset.getBoundingClientRect();
    const timelineRect = timelineElement.getBoundingClientRect();
    const eventItems = [...itemset.querySelectorAll('.vis-foreground .vis-item.vc-timeline-item')]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      });

    const lowestEventBottom = eventItems.reduce((bottom, element) => (
      Math.max(bottom, element.getBoundingClientRect().bottom)
    ), itemsetRect.top);
    const contentHeight = Math.max(0, lowestEventBottom - itemsetRect.top) + 32;
    const timelineChromeHeight = Math.max(0, timelineRect.height - itemsetRect.height);
    const naturalHeight = Math.max(minHeight, Math.ceil(contentHeight + timelineChromeHeight));
    const desiredHeight = Math.min(maxHeight, naturalHeight);
    const scrollable = naturalHeight > maxHeight;

    if (
      Math.abs(desiredHeight - appliedHeight) < 2
      && scrollable === appliedScrollable
    ) return;

    appliedHeight = desiredHeight;
    appliedScrollable = scrollable;
    canvas.dataset.vcAdaptiveHeight = String(desiredHeight);
    canvas.dataset.vcVerticalScroll = String(scrollable);
    timeline.setOptions({
      height: `${desiredHeight}px`,
      minHeight: `${minHeight}px`,
      verticalScroll: true,
    });
  };

  const scheduleMeasure = () => {
    window.cancelAnimationFrame(renderFrame);
    window.cancelAnimationFrame(settleFrame);
    renderFrame = window.requestAnimationFrame(() => {
      settleFrame = window.requestAnimationFrame(measure);
    });
  };

  const mutationObserver = new MutationObserver(scheduleMeasure);
  mutationObserver.observe(root, { subtree: true, childList: true });

  const resizeObserver = typeof ResizeObserver === 'function'
    ? new ResizeObserver(scheduleMeasure)
    : undefined;
  resizeObserver?.observe(root);

  timeline.on('changed', scheduleMeasure);
  timeline.on('rangechanged', scheduleMeasure);
  window.addEventListener('resize', scheduleMeasure);
  scheduleMeasure();

  return () => {
    destroyed = true;
    window.cancelAnimationFrame(renderFrame);
    window.cancelAnimationFrame(settleFrame);
    mutationObserver.disconnect();
    resizeObserver?.disconnect();
    timeline.off?.('changed', scheduleMeasure);
    timeline.off?.('rangechanged', scheduleMeasure);
    window.removeEventListener('resize', scheduleMeasure);
  };
}

function formatTooltipDate(event, calendarId) {
  const start = formatAbsoluteDay(event.absoluteStartDay, calendarId, event.precision);
  if (event.absoluteEndDay === undefined) return start;
  return `${start} — ${formatAbsoluteDay(
    event.absoluteEndDay,
    calendarId,
    event.endPrecision ?? event.precision,
  )}`;
}

function installTimelineHoverTooltip(root, dataset) {
  const eventById = new Map(dataset.events.map((event) => [event.id, event]));
  const eventByTitle = new Map(dataset.events.map((event) => [event.title, event]));
  const eventsByLongestTitle = [...dataset.events].sort((left, right) => right.title.length - left.title.length);
  const calendarSelect = root.querySelector('[data-vc-calendar]');
  const tooltip = document.createElement('div');
  const tooltipId = `vc-timeline-hovercard-${Math.random().toString(36).slice(2, 10)}`;
  tooltip.id = tooltipId;
  tooltip.className = 'vis-tooltip vc-timeline-hovercard';
  tooltip.hidden = true;
  tooltip.setAttribute('role', 'tooltip');
  tooltip.innerHTML = `
    <span class="vc-timeline-hovercard-date"></span>
    <strong class="vc-timeline-hovercard-title"></strong>
    <span class="vc-timeline-hovercard-description"></span>`;
  document.body.append(tooltip);

  const dateElement = tooltip.querySelector('.vc-timeline-hovercard-date');
  const titleElement = tooltip.querySelector('.vc-timeline-hovercard-title');
  const descriptionElement = tooltip.querySelector('.vc-timeline-hovercard-description');
  let activeItem;
  let activeEvent;
  let positionFrame;

  const position = () => {
    if (!activeItem || tooltip.hidden) return;
    const itemRect = activeItem.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportPadding = 8;
    const gap = 10;
    const maximumLeft = Math.max(viewportPadding, window.innerWidth - tooltipRect.width - viewportPadding);
    const left = Math.min(
      maximumLeft,
      Math.max(viewportPadding, itemRect.left + itemRect.width / 2 - tooltipRect.width / 2),
    );
    let top = itemRect.top - tooltipRect.height - gap;
    if (top < viewportPadding) {
      top = Math.min(
        window.innerHeight - tooltipRect.height - viewportPadding,
        itemRect.bottom + gap,
      );
    }
    tooltip.style.left = `${Math.round(left)}px`;
    tooltip.style.top = `${Math.max(viewportPadding, Math.round(top))}px`;
  };

  const schedulePosition = () => {
    window.cancelAnimationFrame(positionFrame);
    positionFrame = window.requestAnimationFrame(position);
  };

  const hide = () => {
    if (activeItem) activeItem.removeAttribute('aria-describedby');
    activeItem = undefined;
    activeEvent = undefined;
    tooltip.hidden = true;
  };

  const eventForItem = (item) => {
    const id = item?.getAttribute?.('data-id');
    if (id && eventById.has(id)) return eventById.get(id);

    const visibleTitle = item?.textContent?.replace(/\s+/g, ' ').trim();
    if (!visibleTitle) return undefined;
    return eventByTitle.get(visibleTitle)
      ?? eventsByLongestTitle.find((event) => visibleTitle.includes(event.title));
  };

  const show = (item) => {
    const event = eventForItem(item);
    if (!event) {
      hide();
      return;
    }

    activeItem?.removeAttribute('aria-describedby');
    activeItem = item;
    activeEvent = event;
    const calendarId = calendarSelect?.value ?? dataset.defaultCalendar;
    dateElement.textContent = formatTooltipDate(event, calendarId);
    titleElement.textContent = event.title;
    descriptionElement.textContent = event.description;
    activeItem.setAttribute('aria-describedby', tooltipId);
    tooltip.hidden = false;
    schedulePosition();
  };

  const eventItemFor = (target) => target?.closest?.('.vis-item.vc-timeline-item');

  const handlePointerOver = (event) => {
    const item = eventItemFor(event.target);
    if (!item || item === activeItem) return;
    show(item);
  };

  const handlePointerOut = (event) => {
    if (!activeItem) return;
    const nextItem = eventItemFor(event.relatedTarget);
    if (nextItem === activeItem) return;
    hide();
  };

  const handleFocusIn = (event) => {
    const item = eventItemFor(event.target);
    if (item) show(item);
  };

  const handleFocusOut = (event) => {
    const nextItem = eventItemFor(event.relatedTarget);
    if (nextItem === activeItem) return;
    hide();
  };

  const handleCalendarChange = () => {
    if (activeItem && activeEvent) show(activeItem);
  };

  root.addEventListener('pointerover', handlePointerOver, true);
  root.addEventListener('pointerout', handlePointerOut, true);
  root.addEventListener('focusin', handleFocusIn, true);
  root.addEventListener('focusout', handleFocusOut, true);
  calendarSelect?.addEventListener('change', handleCalendarChange);
  window.addEventListener('scroll', schedulePosition, true);
  window.addEventListener('resize', schedulePosition);

  return () => {
    window.cancelAnimationFrame(positionFrame);
    root.removeEventListener('pointerover', handlePointerOver, true);
    root.removeEventListener('pointerout', handlePointerOut, true);
    root.removeEventListener('focusin', handleFocusIn, true);
    root.removeEventListener('focusout', handleFocusOut, true);
    calendarSelect?.removeEventListener('change', handleCalendarChange);
    window.removeEventListener('scroll', schedulePosition, true);
    window.removeEventListener('resize', schedulePosition);
    activeItem?.removeAttribute('aria-describedby');
    tooltip.remove();
  };
}

function installTimelineDomGuards(root) {
  let alignmentFrame;
  let destroyed = false;

  const removeItemTitles = (element) => {
    if (!element) return;
    const item = element.matches?.('.vis-item') ? element : element.closest?.('.vis-item');
    if (!item) return;

    element.removeAttribute?.('title');
    item.removeAttribute('title');
    item.querySelectorAll?.('[title]').forEach((child) => child.removeAttribute('title'));
  };

  const alignAxisToChronosCenter = () => {
    const axis = root.querySelector('[data-vc-axis]');
    const centerPanel = root.querySelector('[data-vc-canvas] .vis-panel.vis-center');
    if (!axis || !centerPanel) return;

    const axisRect = axis.getBoundingClientRect();
    const centerRect = centerPanel.getBoundingClientRect();
    const startOffset = Math.max(0, centerRect.left - axisRect.left);
    const usableWidth = Math.max(0, centerRect.width);

    for (const tick of axis.querySelectorAll(':scope > span')) {
      const rawPosition = tick.dataset.vcAxisPercent ?? tick.style.left;
      const percent = Number.parseFloat(rawPosition);
      if (!Number.isFinite(percent)) continue;

      tick.dataset.vcAxisPercent = String(percent);
      tick.style.left = `${startOffset + (usableWidth * percent) / 100}px`;
    }
  };

  const sanitizeItemTitles = () => {
    root.querySelectorAll('.vis-item[title], .vis-item [title]')
      .forEach((element) => element.removeAttribute('title'));
  };

  const scheduleAlignment = () => {
    window.cancelAnimationFrame(alignmentFrame);
    alignmentFrame = window.requestAnimationFrame(() => {
      if (destroyed) return;
      sanitizeItemTitles();
      alignAxisToChronosCenter();
    });
  };

  const mutationObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'title') {
        removeItemTitles(mutation.target);
      }
    }
    scheduleAlignment();
  });
  mutationObserver.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['title'],
  });

  const handlePointerOver = (event) => removeItemTitles(event.target);
  root.addEventListener('pointerover', handlePointerOver, true);

  const resizeObserver = typeof ResizeObserver === 'function'
    ? new ResizeObserver(scheduleAlignment)
    : undefined;
  resizeObserver?.observe(root);

  scheduleAlignment();

  return () => {
    destroyed = true;
    window.cancelAnimationFrame(alignmentFrame);
    mutationObserver.disconnect();
    resizeObserver?.disconnect();
    root.removeEventListener('pointerover', handlePointerOver, true);
  };
}

/**
 * Keep the fast indexed/filtering shell, but let Chronos own every grouped
 * timeline render. Same-group item updates stay in place; changing declared
 * lanes or categories rebuilds the timeline through Chronos and restores the
 * existing world-time window behind a stable proxy used by the site controls.
 * Chronos's secondary tooltip installer is suppressed in favour of a body-level
 * VISCERIUM hovercard that cannot be clipped by the timeline viewport.
 */
export function mountTimeline(root, dataset, options) {
  const originalRenderParsed = ChronosTimeline.prototype.renderParsed;
  let nativeCleanup;
  let activeChronos;

  ChronosTimeline.prototype.renderParsed = function renderWithChronosLayout(result) {
    activeChronos = this;
    renderParsedWithoutChronosTooltip(this, result, originalRenderParsed);
    installChronosTimelineProxy(this, result, originalRenderParsed);
  };

  try {
    nativeCleanup = mountNativeTimeline(root, dataset, options);
  } finally {
    ChronosTimeline.prototype.renderParsed = originalRenderParsed;
  }

  const timeline = activeChronos?.timeline;
  const cleanupDomGuards = installTimelineDomGuards(root);
  const cleanupYearGrid = timeline
    ? installAnnualYearGrid(root, dataset, timeline)
    : undefined;
  const cleanupAdaptiveHeight = timeline
    ? installAdaptiveTimelineHeight(root, timeline, options?.compact === true)
    : undefined;
  const cleanupHoverTooltip = installTimelineHoverTooltip(root, dataset);

  return () => {
    cleanupHoverTooltip();
    cleanupAdaptiveHeight?.();
    cleanupYearGrid?.();
    cleanupDomGuards();
    nativeCleanup?.();
  };
}
