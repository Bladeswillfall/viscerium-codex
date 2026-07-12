const EVENT_ITEM_SELECTOR = '.vis-item.vc-timeline-item';
const TOP_INSET = 20;
const BOTTOM_INSET = 20;
const SETTLE_DURATION_MS = 1_800;
const SETTLE_INTERVAL_MS = 50;

function renderedEventItems(canvas) {
  return [...canvas.querySelectorAll(EVENT_ITEM_SELECTOR)].filter((element) => {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
}

/**
 * Frame the rendered Chronos cards inside the bounded outer viewport without a
 * permanent padding floor. Chronos can continue positioning cards after its DOM
 * has stopped mutating and may temporarily hide off-screen cards, so measurement
 * follows every rendered card with real geometry through a short settling window.
 */
export function installTimelineScrollFraming(root) {
  const canvas = root.querySelector('[data-vc-canvas]');
  if (!canvas) return () => {};

  let frame;
  let settleFrame;
  let settleTimer;
  let searchTimer;
  let destroyed = false;
  let reframeActive = true;
  let reframeDeadline = Date.now() + SETTLE_DURATION_MS;
  let tail;

  const ensureTail = () => {
    if (tail?.isConnected && tail.parentElement === canvas) return tail;
    tail = document.createElement('div');
    tail.className = 'vc-timeline-scroll-tail';
    tail.setAttribute('aria-hidden', 'true');
    canvas.append(tail);
    return tail;
  };

  const scheduleMeasure = () => {
    window.cancelAnimationFrame(frame);
    window.cancelAnimationFrame(settleFrame);
    frame = window.requestAnimationFrame(() => {
      settleFrame = window.requestAnimationFrame(measure);
    });
  };

  const scheduleSettlingPass = () => {
    window.clearTimeout(settleTimer);
    if (!reframeActive || destroyed) return;
    if (Date.now() >= reframeDeadline) {
      reframeActive = false;
      return;
    }
    settleTimer = window.setTimeout(scheduleMeasure, SETTLE_INTERVAL_MS);
  };

  const measure = () => {
    if (destroyed || canvas.hidden) return;

    const items = renderedEventItems(canvas);
    if (!items.length) {
      scheduleSettlingPass();
      return;
    }

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
    canvas.dataset.vcFirstEventTop = String(Math.round(firstTop));
    canvas.dataset.vcLastEventBottom = String(Math.round(lastBottom));

    if (reframeActive) {
      const maximumScroll = Math.max(0, canvas.scrollHeight - canvas.clientHeight);
      const targetScroll = Math.max(0, Math.min(maximumScroll, Math.floor(firstTop - TOP_INSET)));
      canvas.scrollTop = targetScroll;
      canvas.dataset.vcInitialScroll = String(targetScroll);
    }

    scheduleSettlingPass();
  };

  const requestReframe = () => {
    reframeActive = true;
    reframeDeadline = Date.now() + SETTLE_DURATION_MS;
    scheduleMeasure();
  };

  const mutationObserver = new MutationObserver((mutations) => {
    const hasChronosMutation = mutations.some((mutation) => mutation.target !== tail);
    if (hasChronosMutation) scheduleMeasure();
  });
  mutationObserver.observe(canvas, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['style', 'class'],
  });

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

  const stopAutomaticReframing = () => {
    reframeActive = false;
    window.clearTimeout(settleTimer);
  };

  root.addEventListener('change', handleChange);
  root.addEventListener('input', handleInput);
  root.addEventListener('click', handleClick);
  canvas.addEventListener('wheel', stopAutomaticReframing, { passive: true });
  canvas.addEventListener('pointerdown', stopAutomaticReframing, { passive: true });
  window.addEventListener('resize', scheduleMeasure, { passive: true });
  scheduleMeasure();

  return () => {
    destroyed = true;
    window.cancelAnimationFrame(frame);
    window.cancelAnimationFrame(settleFrame);
    window.clearTimeout(settleTimer);
    window.clearTimeout(searchTimer);
    mutationObserver.disconnect();
    resizeObserver?.disconnect();
    root.removeEventListener('change', handleChange);
    root.removeEventListener('input', handleInput);
    root.removeEventListener('click', handleClick);
    canvas.removeEventListener('wheel', stopAutomaticReframing);
    canvas.removeEventListener('pointerdown', stopAutomaticReframing);
    window.removeEventListener('resize', scheduleMeasure);
    tail?.remove();
  };
}
