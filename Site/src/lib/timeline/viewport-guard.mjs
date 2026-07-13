import { ChronosTimeline } from 'chronos-timeline-md';

const GUARDED = Symbol('visceriumTimelineViewportGuard');
const LAYOUT_SETTLE_INTERVAL_MS = 50;
const LAYOUT_SETTLE_TIMEOUT_MS = 1_000;
const REQUIRED_STABLE_LAYOUT_PASSES = 3;

/**
 * Chronos creates the raw vis-timeline instance before the site renderer wraps
 * it in a compatibility proxy. Intercept that creation point so the raw
 * timeline uses the bounded canvas height and ignores the later adaptive pixel
 * heights that previously caused the canvas/timeline feedback loop.
 *
 * vis-timeline defaults both its axis and items to bottom orientation. That is
 * a poor fit for the Codex's separate ruler above the canvas: a tall unified
 * group is laid out from its lower edge, leaving a large empty ceiling and
 * pushing its final event rows below the clipped viewport. Keep both native
 * orientations at the top so rows begin directly beneath the Codex ruler and
 * overflow only into the timeline's own vertical scroller.
 *
 * Group geometry also settles lazily after Chronos mounts or replaces a grouped
 * timeline. vis-timeline does not measure every offscreen group until its native
 * row scroller reaches those groups, so the initial scroll range can be too
 * short. Prime that scroller to its current end over a few redraws, allowing the
 * range to expand, then restore the reader's original relative position.
 */
export function prepareTimelineViewportGuard(root) {
  const originalRenderParsed = ChronosTimeline.prototype.renderParsed;
  const activeTimelines = new Set();
  let resizeObserver;
  let observedCanvas;
  let restored = false;

  const getCanvas = () => root.querySelector('[data-vc-canvas]');

  const getRowScroller = () => getCanvas()?.querySelector('.vis-panel.vis-left.vis-vertical-scroll');

  const viewportHeight = () => {
    const canvas = getCanvas();
    return Math.max(320, Math.round(canvas?.clientHeight ?? 0));
  };

  const maximumRowScroll = (scroller) => Math.max(0, scroller.scrollHeight - scroller.clientHeight);

  const scrollRowsTo = (scroller, scrollTop) => {
    scroller.scrollTop = Math.max(0, Math.min(maximumRowScroll(scroller), scrollTop));
    scroller.dispatchEvent(new Event('scroll', { bubbles: true }));
  };

  const layoutSignature = () => {
    const canvas = getCanvas();
    const centerPanel = canvas?.querySelector('.vis-panel.vis-center');
    const itemset = centerPanel?.querySelector('.vis-itemset');
    const rowScroller = getRowScroller();
    if (!centerPanel || !itemset || !rowScroller) return undefined;

    return [
      centerPanel.clientHeight,
      centerPanel.scrollHeight,
      itemset.clientHeight,
      itemset.scrollHeight,
      rowScroller.clientHeight,
      rowScroller.scrollHeight,
      itemset.querySelectorAll('.vis-foreground > .vis-group').length,
      itemset.querySelectorAll('.vis-item.vc-timeline-item').length,
    ].join(':');
  };

  const settleTimelineLayout = (timeline) => {
    const guard = timeline?.[GUARDED];
    if (!guard || guard.destroyed || guard.settling) return;

    const initialScroller = getRowScroller();
    const initialMaximum = initialScroller ? maximumRowScroll(initialScroller) : 0;
    const initialScrollTop = initialScroller?.scrollTop ?? 0;

    guard.settling = true;
    guard.settleDeadline = Date.now() + LAYOUT_SETTLE_TIMEOUT_MS;
    guard.previousLayoutSignature = undefined;
    guard.stableLayoutPasses = 0;
    guard.initialScrollFraction = initialMaximum > 0 ? initialScrollTop / initialMaximum : 0;
    const canvas = getCanvas();
    if (canvas) canvas.dataset.vcLayoutSettled = 'false';

    const finish = () => {
      const rowScroller = getRowScroller();
      if (rowScroller) {
        scrollRowsTo(rowScroller, maximumRowScroll(rowScroller) * guard.initialScrollFraction);
      }
      guard.settling = false;
      guard.settleTimer = undefined;
      guard.settleFrame = undefined;
      const currentCanvas = getCanvas();
      if (currentCanvas) currentCanvas.dataset.vcLayoutSettled = 'true';
    };

    const measureAfterRedraw = () => {
      if (guard.destroyed) return;

      const signature = layoutSignature();
      if (signature && signature === guard.previousLayoutSignature) {
        guard.stableLayoutPasses += 1;
      } else {
        guard.previousLayoutSignature = signature;
        guard.stableLayoutPasses = signature ? 1 : 0;
      }

      if (
        guard.stableLayoutPasses >= REQUIRED_STABLE_LAYOUT_PASSES
        || Date.now() >= guard.settleDeadline
      ) {
        finish();
        return;
      }

      guard.settleTimer = window.setTimeout(runPass, LAYOUT_SETTLE_INTERVAL_MS);
    };

    const runPass = () => {
      if (guard.destroyed) return;
      const rowScroller = getRowScroller();
      if (rowScroller) scrollRowsTo(rowScroller, maximumRowScroll(rowScroller));
      guard.originalRedraw();
      window.cancelAnimationFrame(guard.settleFrame);
      guard.settleFrame = window.requestAnimationFrame(measureAfterRedraw);
    };

    runPass();
  };

  const observeCanvas = () => {
    const canvas = getCanvas();
    if (!canvas || canvas === observedCanvas || typeof ResizeObserver !== 'function') return;

    resizeObserver?.disconnect();
    observedCanvas = canvas;
    resizeObserver = new ResizeObserver(() => {
      for (const timeline of activeTimelines) applyViewportHeight(timeline);
    });
    resizeObserver.observe(canvas);
  };

  const applyViewportHeight = (timeline) => {
    const guard = timeline?.[GUARDED];
    if (!guard || guard.destroyed) return;

    const canvas = getCanvas();
    const height = viewportHeight();
    guard.originalSetOptions({
      height: `${height}px`,
      minHeight: `${height}px`,
      verticalScroll: true,
      orientation: {
        axis: 'top',
        item: 'top',
      },
    });
    if (canvas) canvas.dataset.vcViewportHeight = String(height);
    settleTimelineLayout(timeline);
  };

  const guardTimeline = (timeline) => {
    if (!timeline || timeline[GUARDED]) return;

    const originalSetOptions = timeline.setOptions.bind(timeline);
    const originalSetItems = timeline.setItems.bind(timeline);
    const originalRedraw = timeline.redraw.bind(timeline);
    const originalDestroy = timeline.destroy.bind(timeline);
    const guard = {
      originalSetOptions,
      originalSetItems,
      originalRedraw,
      originalDestroy,
      destroyed: false,
      settling: false,
      settleTimer: undefined,
      settleFrame: undefined,
    };
    timeline[GUARDED] = guard;
    activeTimelines.add(timeline);

    timeline.setOptions = (options = {}) => {
      const isAdaptiveHeightPass = (
        options.verticalScroll === true
        && typeof options.height === 'string'
        && /^\d+px$/.test(options.height)
        && options.horizontalScroll !== true
      );
      if (isAdaptiveHeightPass) {
        const { height: _height, minHeight: _minHeight, ...forwarded } = options;
        return originalSetOptions(forwarded);
      }
      return originalSetOptions(options);
    };

    timeline.setItems = (...args) => {
      const result = originalSetItems(...args);
      settleTimelineLayout(timeline);
      return result;
    };

    timeline.destroy = () => {
      guard.destroyed = true;
      window.clearTimeout(guard.settleTimer);
      window.cancelAnimationFrame(guard.settleFrame);
      activeTimelines.delete(timeline);
      return originalDestroy();
    };

    observeCanvas();
    applyViewportHeight(timeline);
  };

  function guardedRenderParsed(...args) {
    const result = originalRenderParsed.apply(this, args);
    guardTimeline(this.timeline);
    return result;
  }

  ChronosTimeline.prototype.renderParsed = guardedRenderParsed;

  const restorePrototype = () => {
    if (restored) return;
    restored = true;
    if (ChronosTimeline.prototype.renderParsed === guardedRenderParsed) {
      ChronosTimeline.prototype.renderParsed = originalRenderParsed;
    }
  };

  return {
    restorePrototype,
    cleanup() {
      restorePrototype();
      resizeObserver?.disconnect();
      for (const timeline of activeTimelines) {
        const guard = timeline?.[GUARDED];
        if (!guard) continue;
        window.clearTimeout(guard.settleTimer);
        window.cancelAnimationFrame(guard.settleFrame);
      }
      activeTimelines.clear();
    },
  };
}
