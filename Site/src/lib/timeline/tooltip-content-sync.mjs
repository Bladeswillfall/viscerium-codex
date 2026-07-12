import { formatAbsoluteDay } from '../calendar/runtime.mjs';

function normaliseVisibleText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function formatEventDate(event, calendarId) {
  const start = formatAbsoluteDay(event.absoluteStartDay, calendarId, event.precision);
  if (event.absoluteEndDay === undefined) return start;
  return `${start} — ${formatAbsoluteDay(
    event.absoluteEndDay,
    calendarId,
    event.endPrecision ?? event.precision,
  )}`;
}

/**
 * Chronos can recycle an item's outer data-id. The renderer still owns hover,
 * focus, placement and cleanup; this synchroniser only corrects the opened
 * hovercard from the title visibly rendered on the card the user entered.
 */
export function installTimelineTooltipContentSync(root, dataset) {
  let syncFrame;
  let activeItem;
  let destroyed = false;
  const calendarSelect = root.querySelector('[data-vc-calendar]');
  const eventsByLongestTitle = [...(dataset?.events ?? [])]
    .sort((left, right) => right.title.length - left.title.length);

  const eventForItem = (item) => {
    const visibleText = normaliseVisibleText(item?.textContent);
    if (!visibleText) return undefined;
    return eventsByLongestTitle.find((event) => (
      visibleText === event.title || visibleText.includes(event.title)
    ));
  };

  const sync = () => {
    if (destroyed || !activeItem) return;
    const event = eventForItem(activeItem);
    const tooltip = document.querySelector('body > .vc-timeline-hovercard:not([hidden])');
    if (!event || !tooltip) return;

    const calendarId = calendarSelect?.value ?? dataset.defaultCalendar;
    tooltip.querySelector('.vc-timeline-hovercard-date').textContent = formatEventDate(event, calendarId);
    tooltip.querySelector('.vc-timeline-hovercard-title').textContent = event.title;
    tooltip.querySelector('.vc-timeline-hovercard-description').textContent = event.description;
    tooltip.dataset.vcEventId = event.id;
  };

  const scheduleSync = (item) => {
    activeItem = item;
    window.cancelAnimationFrame(syncFrame);
    syncFrame = window.requestAnimationFrame(() => {
      sync();
      syncFrame = window.requestAnimationFrame(sync);
    });
  };

  const itemForTarget = (target) => target?.closest?.('.vis-item.vc-timeline-item');

  const handlePointerOver = (event) => {
    const item = itemForTarget(event.target);
    if (item) scheduleSync(item);
  };

  const handleFocusIn = (event) => {
    const item = itemForTarget(event.target);
    if (item) scheduleSync(item);
  };

  const handleCalendarChange = () => {
    if (activeItem) scheduleSync(activeItem);
  };

  root.addEventListener('pointerover', handlePointerOver, true);
  root.addEventListener('focusin', handleFocusIn, true);
  calendarSelect?.addEventListener('change', handleCalendarChange);

  return () => {
    destroyed = true;
    window.cancelAnimationFrame(syncFrame);
    root.removeEventListener('pointerover', handlePointerOver, true);
    root.removeEventListener('focusin', handleFocusIn, true);
    calendarSelect?.removeEventListener('change', handleCalendarChange);
  };
}
