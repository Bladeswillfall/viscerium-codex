import { ChronosTimeline } from 'chronos-timeline-md';

const GUARDED = Symbol('visceriumTimelineViewportGuard');

/**
 * Chronos creates the raw vis-timeline instance before the site renderer wraps
 * it in a compatibility proxy. Intercept that creation point so the raw
 * timeline uses the bounded canvas height and ignores the later adaptive pixel
 * heights that previously caused the canvas/timeline feedback loop.
 */
export function prepareTimelineViewportGuard(root) {
  const canvas = root.querySelector('[data-vc-canvas]');
  const originalRenderParsed = ChronosTimeline.prototype.renderParsed;
  const activeTimelines = new Set();
  let restored = false;

  const viewportHeight = () => Math.max(320, Math.round(canvas?.clientHeight ?? 0));

  const applyViewportHeight = (timeline) => {
    const guard = timeline?.[GUARDED];
    if (!guard || guard.destroyed) return;
    const height = viewportHeight();
    guard.originalSetOptions({
      height: `${height}px`,
      minHeight: `${height}px`,
      verticalScroll: true,
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

    applyViewportHeight(timeline);
  };

  function guardedRenderParsed(...args) {
    const result = originalRenderParsed.apply(this, args);
    guardTimeline(this.timeline);
    return result;
  }

  ChronosTimeline.prototype.renderParsed = guardedRenderParsed;

  const resizeObserver = typeof ResizeObserver === 'function' && canvas
    ? new ResizeObserver(() => {
      for (const timeline of activeTimelines) applyViewportHeight(timeline);
    })
    : undefined;
  resizeObserver?.observe(canvas);

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
