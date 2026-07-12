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
 * Own one canonical body-level hovercard. Chronos can place interaction surfaces
 * above a card and can recycle stale DOM identity, so resolve the visible card
 * beneath the pointer by title without mutating vis-timeline internals.
 */
export function installTimelineTooltipCanonicalSync(root, dataset) {
  let positionFrame;
  let activeCard;
  let destroyed = false;
  const calendarSelect = root.querySelector('[data-vc-calendar]');
  const eventsByLongestTitle = [...(dataset?.events ?? [])]
    .sort((left, right) => right.title.length - left.title.length);
  const tooltipId = `vc-timeline-canonical-hovercard-${Math.random().toString(36).slice(2, 10)}`;
  const tooltip = document.createElement('div');
  tooltip.id = tooltipId;
  tooltip.className = 'vis-tooltip vc-timeline-hovercard is-canonical';
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

  const eventForCard = (card) => {
    const visibleText = normaliseVisibleText(card?.textContent);
    if (!visibleText) return undefined;
    return eventsByLongestTitle.find((event) => (
      visibleText === event.title || visibleText.includes(event.title)
    ));
  };

  const cardForTarget = (target) => {
    const card = target?.closest?.('.vis-item.vc-timeline-item');
    return card && root.contains(card) ? card : undefined;
  };

  const cardAtPoint = (x, y) => {
    for (const element of document.elementsFromPoint(x, y)) {
      const card = cardForTarget(element);
      if (card) return card;
    }
    return undefined;
  };

  const position = () => {
    if (destroyed || !activeCard || tooltip.hidden) return;

    const itemRect = activeCard.getBoundingClientRect();
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
    activeCard?.removeAttribute('aria-describedby');
    activeCard = undefined;
    tooltip.hidden = true;
  };

  const show = (card) => {
    const event = eventForCard(card);
    if (!event) {
      hide();
      return;
    }

    activeCard?.removeAttribute('aria-describedby');
    activeCard = card;
    const calendarId = calendarSelect?.value ?? dataset.defaultCalendar;
    dateElement.textContent = formatEventDate(event, calendarId);
    titleElement.textContent = event.title;
    descriptionElement.textContent = event.description;
    tooltip.dataset.vcCanonicalEventId = event.id;
    tooltip.hidden = false;
    activeCard.setAttribute('aria-describedby', tooltipId);
    schedulePosition();
  };

  const handlePointerMove = (event) => {
    const card = cardAtPoint(event.clientX, event.clientY);
    if (!card) {
      hide();
      return;
    }
    if (card !== activeCard) show(card);
    else schedulePosition();
  };

  const handlePointerLeave = () => hide();

  const handleFocusIn = (event) => {
    const card = cardForTarget(event.target);
    if (card) show(card);
  };

  const handleFocusOut = (event) => {
    const nextCard = cardForTarget(event.relatedTarget);
    if (nextCard === activeCard) return;
    hide();
  };

  const handleCalendarChange = () => {
    if (activeCard) show(activeCard);
  };

  document.addEventListener('pointermove', handlePointerMove, true);
  root.addEventListener('pointerleave', handlePointerLeave, true);
  root.addEventListener('focusin', handleFocusIn, true);
  root.addEventListener('focusout', handleFocusOut, true);
  calendarSelect?.addEventListener('change', handleCalendarChange);
  window.addEventListener('scroll', schedulePosition, true);
  window.addEventListener('resize', schedulePosition);

  return () => {
    destroyed = true;
    window.cancelAnimationFrame(positionFrame);
    document.removeEventListener('pointermove', handlePointerMove, true);
    root.removeEventListener('pointerleave', handlePointerLeave, true);
    root.removeEventListener('focusin', handleFocusIn, true);
    root.removeEventListener('focusout', handleFocusOut, true);
    calendarSelect?.removeEventListener('change', handleCalendarChange);
    window.removeEventListener('scroll', schedulePosition, true);
    window.removeEventListener('resize', schedulePosition);
    hide();
    tooltip.remove();
  };
}
