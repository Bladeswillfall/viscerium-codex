import { formatAbsoluteDay } from '../calendar/runtime.mjs';
import { createAdaptiveTimelineTicks } from './year-grid.mjs';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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

export function installCalendarYearAxisSync(root, dataset) {
  const axis = root.querySelector('[data-vc-axis]');
  const calendarSelect = root.querySelector('[data-vc-calendar]');
  if (!axis || !calendarSelect) return () => {};

  let renderFrame;
  let retryHandle;
  let destroyed = false;
  let previousScaleKey;

  const render = () => {
    if (destroyed) return;

    const { startDay, endDay } = currentWindow(dataset);
    const calendarId = calendarSelect.value || dataset.defaultCalendar;
    const centerPanel = root.querySelector('[data-vc-canvas] .vis-panel.vis-center');
    const width = Math.max(
      1,
      centerPanel?.getBoundingClientRect().width
        ?? axis.getBoundingClientRect().width
        ?? window.innerWidth,
    );
    const ticks = createAdaptiveTimelineTicks({
      startDay,
      endDay,
      calendarId,
      width,
      previousScaleKey,
    });
    previousScaleKey = ticks.primary.key;

    const span = Math.max(1, endDay - startDay);
    const key = `${calendarId}:${startDay}:${endDay}:${Math.round(width)}:${ticks.primary.key}`;
    const currentTicks = axis.querySelectorAll(':scope > [data-vc-axis-time-boundary="true"]');
    if (axis.dataset.vcTimeAxisKey === key && currentTicks.length === ticks.primary.length) return;

    axis.innerHTML = ticks.primary.map(({ absoluteDay }) => {
      const left = Math.min(100, Math.max(0, ((absoluteDay - startDay) / span) * 100));
      const label = formatAbsoluteDay(absoluteDay, calendarId, ticks.labelPrecision);
      return `<span data-vc-axis-time-boundary="true" data-vc-axis-scale="${escapeHtml(ticks.primary.key)}" data-vc-axis-absolute-day="${absoluteDay}" data-vc-axis-percent="${left}" style="left:${left}%">${escapeHtml(label)}</span>`;
    }).join('');
    axis.dataset.vcTimeAxisKey = key;
    axis.dataset.vcTimeAxisScale = ticks.primary.key;
    axis.removeAttribute('data-vc-year-axis-key');
  };

  const scheduleRender = () => {
    window.cancelAnimationFrame(renderFrame);
    renderFrame = window.requestAnimationFrame(render);
  };

  const mutationObserver = new MutationObserver(scheduleRender);
  mutationObserver.observe(axis, { childList: true });
  calendarSelect.addEventListener('change', scheduleRender);
  window.addEventListener('resize', scheduleRender);
  window.addEventListener('popstate', scheduleRender);

  scheduleRender();
  retryHandle = window.setTimeout(scheduleRender, 250);

  return () => {
    destroyed = true;
    window.cancelAnimationFrame(renderFrame);
    window.clearTimeout(retryHandle);
    mutationObserver.disconnect();
    calendarSelect.removeEventListener('change', scheduleRender);
    window.removeEventListener('resize', scheduleRender);
    window.removeEventListener('popstate', scheduleRender);
  };
}
