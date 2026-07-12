const EVENT_ITEM_SELECTOR = '.vis-item.vc-timeline-item';
const SCROLLER_SELECTOR = '.vis-panel.vis-left.vis-vertical-scroll';
const TOP_INSET = 12;
const SETTLE_DURATION_MS = 1_800;
const SETTLE_INTERVAL_MS = 50;

function renderedEventItems(canvas) {
  return [...canvas.querySelectorAll(EVENT_ITEM_SELECTOR)].filter((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return rect.width > 0
      && rect.height > 0
      && style.display !== 'none';
  });
}

/**
 * Give the bounded Chronos viewport a genuine user-facing vertical row scroll.
 * Normal vertical wheel and keyboard input is routed to vis-timeline's lane
 * scroller, while modified/horizontal input remains available for date
 * navigation. The adapter supplies an invisible final group so vis-timeline's
 * own row model includes enough clearance for the last event card.
 */
export function installTimelineRowScroll(root) {
  const canvas = root.querySelector('[data-vc-canvas]');
  if (!canvas) return () => {};

  let destroyed = false;
  let frame;
  let settleInterval;
  let settleTimeout;
  let searchTimer;
  let automaticFraming = true;

  const getScroller = () => canvas.querySelector(SCROLLER_SELECTOR);
  const maximumScroll = (scroller = getScroller()) => (
    scroller ? Math.max(0, scroller.scrollHeight - scroller.clientHeight) : 0
  );

  const applyScroll = (scroller, next) => {
    const previous = scroller.scrollTop;
    const target = Math.max(0, Math.min(maximumScroll(scroller), next));
    if (Math.abs(target - previous) < 1) return false;
    scroller.scrollTop = target;
    scroller.dispatchEvent(new Event('scroll', { bubbles: true }));
    canvas.dataset.vcRowScroll = String(scroller.scrollTop);
    canvas.dataset.vcRowScrollRange = String(maximumScroll(scroller));
    return true;
  };

  const stopSettling = () => {
    window.clearInterval(settleInterval);
    window.clearTimeout(settleTimeout);
    settleInterval = undefined;
    settleTimeout = undefined;
  };

  const frameFirstEvent = () => {
    if (destroyed || !automaticFraming || canvas.hidden) return;
    const scroller = getScroller();
    if (!scroller) return;

    const items = renderedEventItems(canvas);
    if (!items.length) return;

    const canvasRect = canvas.getBoundingClientRect();
    const firstTop = Math.min(...items.map((item) => {
      const rect = item.getBoundingClientRect();
      return rect.top - canvasRect.top + scroller.scrollTop;
    }));
    const target = Math.max(
      0,
      Math.min(maximumScroll(scroller), Math.round(firstTop - TOP_INSET)),
    );
    applyScroll(scroller, target);

    canvas.dataset.vcInitialRowScroll = String(target);
    canvas.dataset.vcRowScrollRange = String(maximumScroll(scroller));
  };

  const scheduleFrame = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(frameFirstEvent);
  };

  const beginSettling = () => {
    stopSettling();
    automaticFraming = true;
    scheduleFrame();
    settleInterval = window.setInterval(scheduleFrame, SETTLE_INTERVAL_MS);
    settleTimeout = window.setTimeout(() => {
      stopSettling();
      scheduleFrame();
    }, SETTLE_DURATION_MS);
  };

  const stopAutomaticFraming = () => {
    automaticFraming = false;
    stopSettling();
  };

  const scrollBy = (delta) => {
    const scroller = getScroller();
    if (!scroller) return false;
    return applyScroll(scroller, scroller.scrollTop + delta);
  };

  const handleWheel = (event) => {
    if (
      event.ctrlKey
      || event.metaKey
      || event.shiftKey
      || Math.abs(event.deltaY) <= Math.abs(event.deltaX)
      || maximumScroll() <= 1
    ) return;

    stopAutomaticFraming();
    const changed = scrollBy(event.deltaY);
    event.stopPropagation();
    if (changed) event.preventDefault();
  };

  const handleKeyDown = (event) => {
    if (event.target !== canvas || event.ctrlKey || event.metaKey || event.altKey) return;
    const scroller = getScroller();
    if (!scroller) return;

    const pageStep = Math.max(80, Math.round(scroller.clientHeight * 0.82));
    const deltas = {
      ArrowDown: 48,
      ArrowUp: -48,
      PageDown: pageStep,
      PageUp: -pageStep,
      Home: -Infinity,
      End: Infinity,
    };
    if (!(event.key in deltas)) return;

    stopAutomaticFraming();
    const delta = deltas[event.key];
    const changed = Number.isFinite(delta)
      ? applyScroll(scroller, scroller.scrollTop + delta)
      : applyScroll(scroller, delta < 0 ? 0 : maximumScroll(scroller));
    if (changed) event.preventDefault();
  };

  const handleChange = (event) => {
    if (event.target?.matches?.('[data-vc-lane], [data-vc-filters] input')) beginSettling();
  };

  const handleInput = (event) => {
    if (!event.target?.matches?.('[data-vc-search]')) return;
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(beginSettling, 180);
  };

  const handleClick = (event) => {
    if (event.target?.closest?.('[data-vc-clear], [data-vc-reset]')) beginSettling();
  };

  const mutationObserver = new MutationObserver(() => {
    if (automaticFraming) scheduleFrame();
  });
  mutationObserver.observe(canvas, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['style', 'class'],
  });

  const resizeObserver = typeof ResizeObserver === 'function'
    ? new ResizeObserver(() => {
        if (automaticFraming) beginSettling();
        else canvas.dataset.vcRowScrollRange = String(maximumScroll());
      })
    : undefined;
  resizeObserver?.observe(canvas);

  canvas.addEventListener('wheel', handleWheel, { capture: true, passive: false });
  canvas.addEventListener('keydown', handleKeyDown);
  canvas.addEventListener('pointerdown', stopAutomaticFraming, { passive: true });
  canvas.addEventListener('touchstart', stopAutomaticFraming, { passive: true });
  root.addEventListener('change', handleChange);
  root.addEventListener('input', handleInput);
  root.addEventListener('click', handleClick);
  beginSettling();

  return () => {
    destroyed = true;
    window.cancelAnimationFrame(frame);
    window.clearTimeout(searchTimer);
    stopSettling();
    mutationObserver.disconnect();
    resizeObserver?.disconnect();
    canvas.removeEventListener('wheel', handleWheel, true);
    canvas.removeEventListener('keydown', handleKeyDown);
    canvas.removeEventListener('pointerdown', stopAutomaticFraming);
    canvas.removeEventListener('touchstart', stopAutomaticFraming);
    root.removeEventListener('change', handleChange);
    root.removeEventListener('input', handleInput);
    root.removeEventListener('click', handleClick);
  };
}
