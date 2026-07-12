import { Timeline } from 'vis-timeline/standalone';

function boundedHeight(compact) {
  const minimum = compact ? 320 : 420;
  const maximum = compact ? 512 : 672;
  const viewportShare = compact ? 0.48 : 0.58;
  return Math.round(Math.max(minimum, Math.min(maximum, window.innerHeight * viewportShare)));
}

/**
 * The shared renderer still receives legacy and adaptive height requests from
 * Chronos. Bound only the vertically-scrollable primary timeline instances;
 * minimaps and unrelated vis-timeline instances remain untouched.
 */
export function installTimelineViewportOptionGuard(root, compact = false) {
  const prototype = Timeline.prototype;
  const originalSetOptions = prototype.setOptions;
  const guardedInstances = new Set();
  let destroyed = false;

  const applyBoundedOptions = (instance, options = {}) => {
    const height = boundedHeight(compact);
    guardedInstances.add(instance);
    const canvas = root.querySelector('[data-vc-canvas]');
    if (canvas) {
      canvas.dataset.vcVerticalScroll = 'true';
      canvas.dataset.vcViewportHeight = String(height);
    }
    return originalSetOptions.call(instance, {
      ...options,
      height: `${height}px`,
      minHeight: `${Math.min(height, compact ? 288 : 360)}px`,
      verticalScroll: true,
    });
  };

  function guardedSetOptions(options = {}) {
    if (!destroyed && options.verticalScroll === true) {
      return applyBoundedOptions(this, options);
    }
    return originalSetOptions.call(this, options);
  }

  prototype.setOptions = guardedSetOptions;

  const handleResize = () => {
    if (destroyed) return;
    for (const instance of guardedInstances) {
      applyBoundedOptions(instance, { verticalScroll: true });
    }
  };
  window.addEventListener('resize', handleResize, { passive: true });

  return () => {
    destroyed = true;
    window.removeEventListener('resize', handleResize);
    guardedInstances.clear();
    if (prototype.setOptions === guardedSetOptions) prototype.setOptions = originalSetOptions;
  };
}
