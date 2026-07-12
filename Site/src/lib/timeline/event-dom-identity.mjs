function normaliseVisibleText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

/**
 * Chronos/vis-timeline can recycle an event DOM node without refreshing its
 * outer data-id. Keep each rendered card tied to the canonical event whose
 * title it actually displays so hover, focus and selection resolve correctly.
 */
export function installTimelineEventDomIdentity(root, dataset) {
  let syncFrame;
  let destroyed = false;
  const eventsByLongestTitle = [...(dataset?.events ?? [])]
    .sort((left, right) => right.title.length - left.title.length);

  const eventForCard = (card) => {
    const visibleText = normaliseVisibleText(card.textContent);
    if (!visibleText) return undefined;
    return eventsByLongestTitle.find((event) => (
      visibleText === event.title || visibleText.includes(event.title)
    ));
  };

  const sync = () => {
    if (destroyed) return;
    for (const card of root.querySelectorAll('.vis-item.vc-timeline-item')) {
      const event = eventForCard(card);
      if (!event || card.getAttribute('data-id') === event.id) continue;
      card.setAttribute('data-id', event.id);
      card.dataset.vcCanonicalEventId = event.id;
    }
  };

  const scheduleSync = () => {
    window.cancelAnimationFrame(syncFrame);
    syncFrame = window.requestAnimationFrame(sync);
  };

  const observer = new MutationObserver(scheduleSync);
  observer.observe(root, { subtree: true, childList: true, characterData: true });
  scheduleSync();

  return () => {
    destroyed = true;
    window.cancelAnimationFrame(syncFrame);
    observer.disconnect();
  };
}
