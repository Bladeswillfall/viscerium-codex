import { createAdaptiveTimelineTicks } from './year-grid.mjs';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

function integerParam(url, key) {
  const raw = url.searchParams.get(key);
  if (raw === null || raw.trim() === '') return undefined;
  const value = Number(raw);
  return Number.isSafeInteger(value) ? value : undefined;
}

function fallbackWindow(dataset) {
  const era = dataset.id === 'super' ? null : dataset.eras[0];
  const padding = era?.defaultViewport?.paddingDays ?? 30;
  return {
    startDay: era?.defaultViewport?.startDay ?? dataset.absoluteStartDay - padding,
    endDay: era?.defaultViewport?.endDay ?? dataset.absoluteEndDay + padding,
  };
}

function currentWindow(dataset) {
  const url = new URL(window.location.href);
  const fallback = fallbackWindow(dataset);
  const startDay = integerParam(url, 'start') ?? fallback.startDay;
  const endDay = integerParam(url, 'end') ?? fallback.endDay;
  return startDay < endDay ? { startDay, endDay } : fallback;
}

function tickPath(boundaries, startDay, span, width, height) {
  return boundaries.map(({ absoluteDay }) => {
    const x = Math.min(width, Math.max(0, ((absoluteDay - startDay) / span) * width));
    return `M${x.toFixed(2)} 0V${height.toFixed(2)}`;
  }).join(' ');
}

function createGridSvg() {
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
  svg.setAttribute('class', 'vc-timeline-time-grid');
  svg.setAttribute('data-vc-time-grid', '');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('preserveAspectRatio', 'none');

  for (const className of ['vc-time-grid-secondary', 'vc-time-grid-primary']) {
    const path = document.createElementNS(SVG_NAMESPACE, 'path');
    path.setAttribute('class', className);
    svg.append(path);
  }

  return svg;
}

export function installAdaptiveTimelineGrid(root, dataset) {
  const calendarSelect = root.querySelector('[data-vc-calendar]');
  const axis = root.querySelector('[data-vc-axis]');
  const listButton = root.querySelector('[data-vc-list]');
  if (!calendarSelect || !axis) return () => {};

  let renderFrame;
  let transitionFrame;
  let destroyed = false;
  let previousScaleKey;
  let activeSvg;

  const render = () => {
    if (destroyed) return;

    const canvas = root.querySelector('[data-vc-canvas]');
    const timelineElement = canvas?.querySelector('.vis-timeline');
    const centerPanel = timelineElement?.querySelector(':scope > .vis-panel.vis-center')
      ?? canvas?.querySelector('.vis-panel.vis-center');
    const itemset = centerPanel?.querySelector('.vis-itemset');
    if (!canvas || canvas.hidden || !centerPanel || !itemset) return;

    let svg = itemset.querySelector(':scope > [data-vc-time-grid]');
    if (!svg) {
      svg = createGridSvg();
      itemset.append(svg);
    }
    activeSvg = svg;

    const itemsetRect = itemset.getBoundingClientRect();
    const width = Math.max(0, itemsetRect.width);
    const height = Math.max(0, itemsetRect.height);
    if (!width || !height) return;

    const { startDay, endDay } = currentWindow(dataset);
    const span = Math.max(1, endDay - startDay);
    const calendarId = calendarSelect.value || dataset.defaultCalendar;
    const ticks = createAdaptiveTimelineTicks({
      startDay,
      endDay,
      calendarId,
      width,
      previousScaleKey,
    });
    const scaleChanged = previousScaleKey !== undefined && previousScaleKey !== ticks.primary.key;
    previousScaleKey = ticks.primary.key;

    svg.style.left = '0px';
    svg.style.top = '0px';
    svg.style.width = `${width}px`;
    svg.style.height = `${height}px`;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.querySelector('.vc-time-grid-secondary')?.setAttribute(
      'd',
      tickPath(ticks.secondary, startDay, span, width, height),
    );
    svg.querySelector('.vc-time-grid-primary')?.setAttribute(
      'd',
      tickPath(ticks.primary, startDay, span, width, height),
    );
    svg.dataset.vcTimeScale = ticks.primary.key;
    svg.dataset.vcTimeSecondaryScale = ticks.secondary?.key ?? '';
    svg.dataset.vcTimePrimaryCount = String(ticks.primary.length);
    svg.dataset.vcTimeSecondaryCount = String(ticks.secondary.length);
    svg.dataset.vcTimeCalendar = calendarId;
    root.dataset.vcTimelineScale = ticks.primary.key;

    if (scaleChanged) {
      svg.classList.remove('is-scale-transitioning');
      window.cancelAnimationFrame(transitionFrame);
      transitionFrame = window.requestAnimationFrame(() => {
        if (!destroyed) svg.classList.add('is-scale-transitioning');
      });
    }
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

  calendarSelect.addEventListener('change', scheduleRender);
  listButton?.addEventListener('click', scheduleRender);
  window.addEventListener('popstate', scheduleRender);
  scheduleRender();

  return () => {
    destroyed = true;
    window.cancelAnimationFrame(renderFrame);
    window.cancelAnimationFrame(transitionFrame);
    mutationObserver.disconnect();
    resizeObserver?.disconnect();
    calendarSelect.removeEventListener('change', scheduleRender);
    listButton?.removeEventListener('click', scheduleRender);
    window.removeEventListener('popstate', scheduleRender);
    activeSvg?.remove();
    delete root.dataset.vcTimelineScale;
  };
}
