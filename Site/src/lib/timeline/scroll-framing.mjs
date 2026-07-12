const EVENT_ITEM_SELECTOR = '.vis-item.vc-timeline-item';
const TOP_INSET = 20;
const BOTTOM_INSET = 20;

function visibleEventItems(canvas) {
  return [...canvas.querySelectorAll(EVENT_ITEM_SELECTOR)].filter((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return rect.width > 0
      && rect.height > 0
      && style.display !== 'none'
      && style.visibility !== 'hidden';
  });
}

/**
 * Frame the rendered Chronos cards inside the bounded outer viewport without a
 * permanent padding floor. The first rendered card is brought near the top on
 * initial mount (and after explicit filter/lane changes), while a measured tail
 * supplies only the extra scroll range genuinely needed by the final card.
 */
export function installTimelineScrollFraming(root) {
  const canvas = root.querySelector('[data-vc-canvas]');
  if (!canvas) return () => {};

  let frame;
  let settleFrame;
  let searchTimer;
  let destroyed = false;
  let reframePending = true;
  let tail;

  const ensureTail = () => {
    if (tail?.isConnected && tail.parentElement === canvas) return tail;
    tail = document.createElement('div');
    tail.className = 'vc-timeline-scroll-tail';
    tail.setAttribute('aria-hidden', 'true');
    canvas.append(tail);
    return tail;
  };

  const measure = () => {
    if (destroyed || canvas.hidden) return;

    const items = visibleEventItems(canvas);
    if (!items.length) return;

    const scrollTail = ensureTail();
    const canvasRect = canvas.getBoundingClientRect();
    const scrollTop = canvas.scrollTop;
    const bounds = items.map((item) => {
      const rect = item.getBoundingClientRect();
      return {
        top: rect.top - canvasRect.top + scrollTop,
        bottom: rect.bottom - canvasRect.top + scrollTop,
      };
    });
    const firstTop = Math.min(...bounds.map(({ top }) => top));
    const lastBottom = Math.max(...bounds.map(({ bottom }) => bottom));

    const previousTail = scrollTail.offsetHeight;
    const contentHeightWithoutTail = Math.max(0, canvas.scrollHeight - previousTail);
    const requiredTail = Math.max(
      0,
      Math.ceil(lastBottom + BOTTOM_INSET - contentHeightWithoutTail),
    );

    if (Math.abs(requiredTail - previousTail) > 1) {
      scrollTail.style.blockSize = `${requiredTail}px`;
    }
    canvas.dataset.vcScrollTail = String(requiredTail);

    if (reframePending) {
      const maximumScroll = Math.max(0, canvas.scrollHeight - canvas.clientHeight);
      const targetScroll = Math.max(0, Math.min(maximumScroll, Math.floor(firstTop - TOP_INSET)));
      canvas.scrollTop = targetScroll;
      canvas.dataset.vcInitialScroll = String(targetScroll);
      reframePending = false;
    }
  };

  const scheduleMeasure = () => {
    window.cancelAnimationFrame(frame);
    window.cancelAnimationFrame(settleFrame);
    frame = window.requestAnimationFrame(() => {
      settleFrame = window.requestAnimationFrame(measure);
    });
  };

  const requestReframe = () => {
    reframePending = true;
    scheduleMeasure();
  };

  const mutationObserver = new MutationObserver(scheduleMeasure);
  mutationObserver.observe(canvas, { subtree: true, childList: true });

  const resizeObserver = typeof ResizeObserver === 'function'
    ? new ResizeObserver(scheduleMeasure)
    : undefined;
  resizeObserver?.observe(canvas);

  const handleChange = (event) => {
    if (event.target?.matches?.('[data-vc-lane], [data-vc-filters] input')) requestReframe();
  };

  const handleInput = (event) => {
    if (!event.target?.matches?.('[data-vc-search]')) return;
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(requestReframe, 180);
  };

  const handleClick = (event) => {
    if (event.target?.closest?.('[data-vc-clear], [data-vc-reset]')) requestReframe();
  };

  root.addEventListener('change', handleChange);
  root.addEventListener('input', handleInput);
  root.addEventListener('click', handleClick);
  window.addEventListener('resize', scheduleMeasure, { passive: true });
  scheduleMeasure();

  return () => {
    destroyed = true;
    window.cancelAnimationFrame(frame);
    window.cancelAnimationFrame(settleFrame);
    window.clearTimeout(searchTimer);
    mutationObserver.disconnect();
    resizeObserver?.disconnect();
    root.removeEventListener('change', handleChange);
    root.removeEventListener('input', handleInput);
    root.removeEventListener('click', handleClick);
    window.removeEventListener('resize', scheduleMeasure);
    tail?.remove();
  };
}
