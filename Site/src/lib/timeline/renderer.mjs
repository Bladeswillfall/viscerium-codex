import { ChronosTimeline } from 'chronos-timeline-md';
import { mountTimeline as mountNativeTimeline } from './chronos-native-renderer.mjs';

function groupSignature(groups) {
  const values = Array.isArray(groups)
    ? groups
    : typeof groups?.get === 'function'
      ? groups.get()
      : [];
  return values.map((group) => `${group.id}:${group.content ?? ''}`).join('|');
}

/**
 * Chronos sizes the timeline from its parsed source and settings. The older
 * Codex renderer follows that render with a second vis-timeline option pass,
 * which invalidates Chronos' completed group geometry. Ignore that one legacy
 * pass and leave Chronos' own layout, ordering, stacking and viewport intact.
 *
 * Chronos also performs a small zoom jiggle after initially rendering groups
 * because vis-timeline can otherwise retain stale panel geometry. The Codex
 * can replace groups at runtime, so repeat that native Chronos workaround only
 * when the group structure actually changes.
 */
export function mountTimeline(root, dataset, options) {
  const originalRenderParsed = ChronosTimeline.prototype.renderParsed;

  ChronosTimeline.prototype.renderParsed = function renderWithChronosLayout(...args) {
    const result = originalRenderParsed.apply(this, args);
    const timeline = this.timeline;

    if (timeline && !timeline.__visceriumChronosLayoutPatched) {
      const originalSetOptions = timeline.setOptions.bind(timeline);
      const originalSetGroups = timeline.setGroups.bind(timeline);
      let renderedGroupSignature = groupSignature(timeline.groupsData);
      let layoutFrame;

      timeline.setOptions = (nextOptions = {}) => {
        const isLegacyHostOptionPass = (
          nextOptions.verticalScroll === true
          && nextOptions.horizontalScroll === true
          && (nextOptions.height === '34rem' || nextOptions.height === '28rem')
        );

        if (isLegacyHostOptionPass) return undefined;
        return originalSetOptions(nextOptions);
      };

      timeline.setGroups = (groups) => {
        const nextSignature = groupSignature(groups);
        const groupsChanged = nextSignature !== renderedGroupSignature;
        const setResult = originalSetGroups(groups);
        renderedGroupSignature = nextSignature;

        if (groupsChanged) {
          window.cancelAnimationFrame(layoutFrame);
          layoutFrame = window.requestAnimationFrame(() => {
            timeline.redraw();
            this._jiggleZoom?.(timeline);
          });
        }
        return setResult;
      };

      timeline.__visceriumChronosLayoutPatched = true;
    }

    return result;
  };

  try {
    return mountNativeTimeline(root, dataset, options);
  } finally {
    ChronosTimeline.prototype.renderParsed = originalRenderParsed;
  }
}
