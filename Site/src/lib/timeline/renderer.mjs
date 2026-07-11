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
 * Chronos normally sizes its timeline to the rendered groups and only enables
 * fixed-height vertical scrolling when the Chronos source contains a HEIGHT
 * flag. The Codex renderer still applies an older fixed-height host override
 * after Chronos mounts; remove only those host layout fields and retain the
 * behavioural options such as stacking, zoom limits and selection.
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
        const isLegacyHostLayoutOverride = (
          nextOptions.verticalScroll === true
          && nextOptions.horizontalScroll === true
          && (nextOptions.height === '34rem' || nextOptions.height === '28rem')
        );

        if (!isLegacyHostLayoutOverride) return originalSetOptions(nextOptions);

        const {
          height: _height,
          horizontalScroll: _horizontalScroll,
          verticalScroll: _verticalScroll,
          ...chronosOptions
        } = nextOptions;
        return originalSetOptions(chronosOptions);
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
