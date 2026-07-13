import { ChronosTimeline } from 'chronos-timeline-md';

const GUARDED = Symbol('visceriumTimelineViewportGuard');
const LAYOUT_SETTLE_INTERVAL_MS = 50;
const LAYOUT_SETTLE_TIMEOUT_MS = 1_000;
const REQUIRED_STABLE_LAYOUT_PASSES = 3;
const BOTTOM_ROW_INSET = 32;

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
 * row scroller reaches those groups, and it can discard that discovered height
 * when returned to the top. Prime the scroller over several redraws, record the
 * largest measured native content height, pin that height inside vis-timeline,
 * then restore the reader's original relative position. A small measured tail
 * keeps the final card and its native item margin clear of the clipped edge.
 */
export function prepareTimelineViewportGuard(root) {
  const originalRenderParsed = ChronosTimeline.prototype.renderParsed;
  const activeTimelines = new Set();
  let resizeObserver;
  let observedCanvas;
  let restored = false;

  const getCanvas = () => root.querySelector('[data-vc-canvas]');

  const getTimelineParts = () => {
    const canvas = getCanvas();
    const centerPanel = canvas?.querySelector('.vis-panel.vis-center');
    const centerContent = centerPanel?.querySelector(':scope > .vis-content');
    const itemset = centerContent?.querySelector(':scope > .vis-itemset')
      ?? centerPanel?.querySelector('.vis-itemset');
    const rowScroller = canvas?.querySelector('.vis-panel.vis-left.vis-vertical-scroll');
    const rowContent = rowScroller?.querySelector(':scope > .vis-content');
    const labelset = rowContent?.querySelector(':scope > .vis-labelset')
      ?? rowScroller?.querySelector('.vis-labelset');
    return { canvas, centerPanel, centerContent, itemset, rowScroller, rowContent, labelset };
  };

  const viewportHeight = () => {
    const canvas = getCanvas();
    return Math.max(320, Math.round(canvas?.clientHeight ?? 0));
  };

  const maximumRowScroll = (scroller) => Math.max(0, scroller.scrollHeight - scroller.clientHeight);

  const scrollRowsTo = (scroller, scrollTop) => {
    scroller.scrollTop = Math.max(0, Math.min(maximumRowScroll(scroller), scrollTop));
    scroller.dispatchEvent(new Event('scroll', { bubbles: true }));
  };

  const setPinnedContentHeight = (height) => {
    const { canvas, centerContent, itemset, rowContent, labelset } = getTimelineParts();
    const value = height > 0 ? `${Math.ceil(height)}px` : '';
    for (const element of [centerContent, itemset, rowContent, labelset]) {
      if (element) element.style.minHeight = value;
    }
    if (canvas) {
      if (height > 0) canvas.dataset.vcPinnedRowHeight = String(Math.ceil(height));
      else delete canvas.dataset.vcPinnedRowHeight;
    }
  };

  const measuredContentHeight = () => {
    const { itemset, rowScroller, rowContent, labelset } = getTimelineParts();
    return Math.max(
      0,
      itemset?.clientHeight ?? 0,
      rowScroller?.scrollHeight ?? 0,
      rowContent?.clientHeight ?? 0,
      labelset?.clientHeight ?? 0,
    );
  };

  const layoutSignature = () => {
    const { centerPanel, itemset, rowScroller } = getTimelineParts();
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
    if (!guard || guard.destroyed) return;

    window.clearTimeout(guard.settleTimer);
    window.cancelAnimationFrame(guard.settleFrame);
    guard.settleGeneration += 1;
    const generation = guard.settleGeneration;

    const initialScroller = getTimelineParts().rowScroller;
    const initialMaximum = initialScroller ? maximumRowScroll(initialScroller) : 0;
    const initialScrollTop = initialScroller?.scrollTop ?? 0;

    setPinnedContentHeight(0);
    guard.settling = true;
    guard.settleDeadline = Date.now() + LAYOUT_SETTLE_TIMEOUT_MS;
    guard.previousLayoutSignature = undefined;
    guard.stableLayoutPasses = 0;
    guard.maximumMeasuredContentHeight = 0;
    guard.initialScrollFraction = initialMaximum > 0 ? initialScrollTop / initialMaximum : 0;
    const canvas = getCanvas();
    if (canvas) canvas.dataset.vcLayoutSettled = 'false';

    const finish = () => {
      if (guard.destroyed || generation !== guard.settleGeneration) return;
      const pinnedHeight = Math.max(guard.maximumMeasuredContentHeight, measuredContentHeight())
        + BOTTOM_ROW_INSET;
      setPinnedContentHeight(pinnedHeight);
      const { rowScroller } = getTimelineParts();
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
      if (guard.destroyed || generation !== guard.settleGeneration) return;

      guard.maximumMeasuredContentHeight = Math.max(
        guard.maximumMeasuredContentHeight,
        measuredContentHeight(),
      );
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
      if (guard.destroyed || generation !== guard.settleGeneration) return;
      const { rowScroller } = getTimelineParts();
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
      const height = viewportHeight();
      for (const timeline of activeTimelines) {
        const guard = timeline?.[GUARDED];
        if (guard?.appliedViewportHeight !== height) applyViewportHeight(timeline);
      }
    });
    resizeObserver.observe(canvas);
  };

  const applyViewportHeight = (timeline) => {
    const guard = timeline?.[GUARDED];
    if (!guard || guard.destroyed) return;

    const canvas = getCanvas();
    const height = viewportHeight();
    if (guard.appliedViewportHeight === height) return;
    guard.appliedViewportHeight = height;
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
      appliedViewportHeight: undefined,
      destroyed: false,
      settling: false,
      settleGeneration: 0,
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
      guard.settleGeneration += 1;
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
        guard.settleGeneration += 1;
        window.clearTimeout(guard.settleTimer);
        window.cancelAnimationFrame(guard.settleFrame);
      }
      activeTimelines.clear();
    },
  };
}
