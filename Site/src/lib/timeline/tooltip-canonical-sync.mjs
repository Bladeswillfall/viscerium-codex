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
 * Chronos can recycle a visual card while leaving stale internal identity on
 * its DOM node. Do not mutate that internal state; instead make the external
 * hovercard follow the canonical event title the user is actually pointing at.
 */
export function installTimelineTooltipCanonicalSync(root, dataset) {
  let syncFrame;
  let activeCard;
  let destroyed = false;
  const calendarSelect = root.querySelector('[data-vc-calendar]');
  const eventsByLongestTitle = [...(dataset?.events ?? [])]
    .sort((left, right) => right.title.length - left.title.length);

  const eventForCard = (card) => {
    const visibleText = normaliseVisibleText(card?.textContent);
    if (!visibleText) return undefined;
    return eventsByLongestTitle.find((event) => (
      visibleText === event.title || visibleText.includes(event.title)
    ));
  };

  const sync = () => {
    if (destroyed || !activeCard) return;
    const event = eventForCard(activeCard);
    const tooltip = document.querySelector('body > .vc-timeline-hovercard:not([hidden])');
    if (!event || !tooltip) return;

    const calendarId = calendarSelect?.value ?? dataset.defaultCalendar;
    tooltip.querySelector('.vc-timeline-hovercard-date').textContent = formatEventDate(event, calendarId);
    tooltip.querySelector('.vc-timeline-hovercard-title').textContent = event.title;
    tooltip.querySelector('.vc-timeline-hovercard-description').textContent = event.description;
    tooltip.dataset.vcCanonicalEventId = event.id;
  };

  const scheduleSync = (card) => {
    activeCard = card;
    window.cancelAnimationFrame(syncFrame);
    syncFrame = window.requestAnimationFrame(sync);
  };

  const cardForTarget = (target) => target?.closest?.('.vis-item.vc-timeline-item');

  const handlePointerOver = (event) => {
    const card = cardForTarget(event.target);
    if (card) scheduleSync(card);
  };

  const handleFocusIn = (event) => {
    const card = cardForTarget(event.target);
    if (card) scheduleSync(card);
  };

  const handleCalendarChange = () => {
    if (activeCard) scheduleSync(activeCard);
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
