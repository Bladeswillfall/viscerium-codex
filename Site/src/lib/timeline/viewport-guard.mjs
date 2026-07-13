import { ChronosTimeline } from 'chronos-timeline-md';

const GUARDED = Symbol('visceriumTimelineViewportGuard');

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
 */
export function prepareTimelineViewportGuard(root) {
  const originalRenderParsed = ChronosTimeline.prototype.renderParsed;
  const activeTimelines = new Set();
  let resizeObserver;
  let observedCanvas;
  let restored = false;

  const getCanvas = () => root.querySelector('[data-vc-canvas]');

  const viewportHeight = () => {
    const canvas = getCanvas();
    return Math.max(320, Math.round(canvas?.clientHeight ?? 0));
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
  };

  const guardTimeline = (timeline) => {
    if (!timeline || timeline[GUARDED]) return;

    const originalSetOptions = timeline.setOptions.bind(timeline);
    const originalDestroy = timeline.destroy.bind(timeline);
    const guard = {
      originalSetOptions,
      originalDestroy,
      destroyed: false,
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

    timeline.destroy = () => {
      guard.destroyed = true;
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
      activeTimelines.clear();
    },
  };
}
