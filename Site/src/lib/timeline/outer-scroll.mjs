const EVENT_ITEM_SELECTOR = '.vis-item.vc-timeline-item';
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
 * Make the bounded canvas the user-facing vertical scroller. Chronos may grow to
 * its measured content height inside it, while normal vertical wheel and
 * keyboard input are claimed before vis-timeline can reinterpret them as date
 * navigation. During initial/lane/filter layout settling, frame the first event
 * near the top without adding a permanent spacer at the bottom.
 */
export function installTimelineOuterScroll(root) {
  const canvas = root.querySelector('[data-vc-canvas]');
  if (!canvas) return () => {};

  let destroyed = false;
  let frame;
  let settleInterval;
  let settleTimeout;
  let searchTimer;
  let automaticFraming = true;

  const maximumScroll = () => Math.max(0, canvas.scrollHeight - canvas.clientHeight);

  const stopSettling = () => {
    window.clearInterval(settleInterval);
    window.clearTimeout(settleTimeout);
    settleInterval = undefined;
    settleTimeout = undefined;
  };

  const frameFirstEvent = () => {
    if (destroyed || !automaticFraming || canvas.hidden) return;
    const items = renderedEventItems(canvas);
    if (!items.length) return;

    const canvasRect = canvas.getBoundingClientRect();
    const firstTop = Math.min(...items.map((item) => {
      const rect = item.getBoundingClientRect();
      return rect.top - canvasRect.top + canvas.scrollTop;
    }));
    const target = Math.max(0, Math.min(maximumScroll(), Math.round(firstTop - TOP_INSET)));

    if (Math.abs(canvas.scrollTop - target) > 1) canvas.scrollTop = target;
    canvas.dataset.vcInitialScroll = String(target);
    canvas.dataset.vcOuterScrollRange = String(maximumScroll());
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
    const previous = canvas.scrollTop;
    const next = Math.max(0, Math.min(maximumScroll(), previous + delta));
    if (Math.abs(next - previous) < 1) return false;
    canvas.scrollTop = next;
    canvas.dataset.vcOuterScrollRange = String(maximumScroll());
    return true;
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
    if (!scrollBy(event.deltaY)) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const handleKeyDown = (event) => {
    if (event.target !== canvas || event.ctrlKey || event.metaKey || event.altKey) return;
    const pageStep = Math.max(80, Math.round(canvas.clientHeight * 0.82));
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
      ? scrollBy(delta)
      : (() => {
          const previous = canvas.scrollTop;
          canvas.scrollTop = delta < 0 ? 0 : maximumScroll();
          return Math.abs(canvas.scrollTop - previous) >= 1;
        })();
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
        if (canvas.scrollTop <= TOP_INSET * 2) beginSettling();
        else canvas.dataset.vcOuterScrollRange = String(maximumScroll());
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
