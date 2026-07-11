import { ChronosTimeline } from 'chronos-timeline-md';
import { mountTimeline as mountNativeTimeline } from './chronos-native-renderer.mjs';

/**
 * The canonical renderer supplies a fixed height to the primary vis-timeline.
 * Chronos creates that timeline internally, so intercept the exact instance as
 * soon as renderParsed() exposes it and translate the primary configuration to
 * maxHeight. The separate 8rem overview timeline is not Chronos-owned and is
 * therefore unaffected.
 */
export function mountTimeline(root, dataset, options) {
  const originalRenderParsed = ChronosTimeline.prototype.renderParsed;

  ChronosTimeline.prototype.renderParsed = function renderWithNaturalTimelineHeight(...args) {
    const result = originalRenderParsed.apply(this, args);
    const timeline = this.timeline;

    if (timeline && !timeline.__visceriumNaturalHeightPatched) {
      const originalSetOptions = timeline.setOptions.bind(timeline);

      timeline.setOptions = (nextOptions = {}) => {
        const isPrimaryConfiguration = (
          nextOptions.verticalScroll === true
          && nextOptions.horizontalScroll === true
          && (nextOptions.height === '34rem' || nextOptions.height === '28rem')
        );

        if (!isPrimaryConfiguration) return originalSetOptions(nextOptions);

        const { height, ...remainingOptions } = nextOptions;
        return originalSetOptions({
          ...remainingOptions,
          maxHeight: height,
          groupHeightMode: 'fixed',
        });
      };

      timeline.__visceriumNaturalHeightPatched = true;
    }

    return result;
  };

  try {
    return mountNativeTimeline(root, dataset, options);
  } finally {
    ChronosTimeline.prototype.renderParsed = originalRenderParsed;
  }
}
