import { Timeline } from 'vis-timeline/standalone';
import { mountTimeline as mountNativeTimeline } from './chronos-native-renderer.mjs';

/**
 * The canonical renderer historically supplies a fixed height to the primary
 * vis-timeline instance. That clips Chronos group rows before the island-owned
 * scroll viewport can contain them. Translate only that primary configuration
 * to maxHeight while mounting; the deferred 8rem overview timeline is left
 * untouched.
 */
export function mountTimeline(root, dataset, options) {
  const originalSetOptions = Timeline.prototype.setOptions;

  Timeline.prototype.setOptions = function setNaturalTimelineHeight(nextOptions = {}) {
    const isPrimaryTimeline = (
      nextOptions.verticalScroll === true
      && nextOptions.horizontalScroll === true
      && (nextOptions.height === '34rem' || nextOptions.height === '28rem')
    );

    if (!isPrimaryTimeline) return originalSetOptions.call(this, nextOptions);

    const { height, ...remainingOptions } = nextOptions;
    return originalSetOptions.call(this, {
      ...remainingOptions,
      maxHeight: height,
      groupHeightMode: 'fixed',
    });
  };

  try {
    return mountNativeTimeline(root, dataset, options);
  } finally {
    Timeline.prototype.setOptions = originalSetOptions;
  }
}
