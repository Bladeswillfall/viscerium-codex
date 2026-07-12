import { formatAbsoluteDay } from '../calendar/runtime.mjs';
import { selectCalendarYearTicks } from './year-grid.mjs';

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

  const render = () => {
    if (destroyed) return;

    const { startDay, endDay } = currentWindow(dataset);
    const calendarId = calendarSelect.value || dataset.defaultCalendar;
    const maximumCount = window.innerWidth < 640 ? 3 : 6;
    const ticks = selectCalendarYearTicks(startDay, endDay, calendarId, maximumCount);
    if (ticks.length < 2) {
      axis.removeAttribute('data-vc-year-axis-key');
      return;
    }

    const span = Math.max(1, endDay - startDay);
    const key = `${calendarId}:${startDay}:${endDay}:${maximumCount}`;
    if (axis.dataset.vcYearAxisKey === key) return;

    axis.innerHTML = ticks.map(({ year, absoluteDay }) => {
      const left = Math.min(100, Math.max(0, ((absoluteDay - startDay) / span) * 100));
      const label = formatAbsoluteDay(absoluteDay, calendarId, 'year');
      return `<span data-vc-axis-year-boundary="true" data-vc-axis-year="${year}" data-vc-axis-absolute-day="${absoluteDay}" style="left:${left}%">${escapeHtml(label)}</span>`;
    }).join('');
    axis.dataset.vcYearAxisKey = key;
  };

  const scheduleRender = () => {
    window.cancelAnimationFrame(renderFrame);
    renderFrame = window.requestAnimationFrame(render);
  };

  const mutationObserver = new MutationObserver(scheduleRender);
  mutationObserver.observe(axis, { childList: true });
  calendarSelect.addEventListener('change', scheduleRender);
  window.addEventListener('resize', scheduleRender);

  scheduleRender();
  retryHandle = window.setTimeout(scheduleRender, 250);

  return () => {
    destroyed = true;
    window.cancelAnimationFrame(renderFrame);
    window.clearTimeout(retryHandle);
    mutationObserver.disconnect();
    calendarSelect.removeEventListener('change', scheduleRender);
    window.removeEventListener('resize', scheduleRender);
  };
}
