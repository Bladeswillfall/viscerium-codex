import { ChronosTimeline } from 'chronos-timeline-md';
import { mountTimeline as mountNativeTimeline } from './chronos-native-renderer.mjs';

/**
 * Chronos owns the live vis-timeline instance and every interaction after mount.
 * Chronos 1.1.0 does not expose vis-timeline's orientation in its public settings,
 * so apply this one VISCERIUM presentation requirement at the synchronous creation
 * boundary, then immediately restore Chronos's prototype. No proxy, observer,
 * remount or redraw loop remains active after this function returns.
 */
export function mountTimeline(root, dataset, options) {
  const originalRenderParsed = ChronosTimeline.prototype.renderParsed;

  function renderParsedWithTopOrientation(result) {
    originalRenderParsed.call(this, result);
    this.timeline?.setOptions({
      orientation: {
        axis: 'top',
        item: 'top',
      },
    });
  }

  ChronosTimeline.prototype.renderParsed = renderParsedWithTopOrientation;
  try {
    return mountNativeTimeline(root, dataset, options);
  } finally {
    if (ChronosTimeline.prototype.renderParsed === renderParsedWithTopOrientation) {
      ChronosTimeline.prototype.renderParsed = originalRenderParsed;
    }
  }
}
