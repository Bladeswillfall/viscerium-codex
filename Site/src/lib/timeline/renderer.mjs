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

function installChronosTimelineProxy(chronos, initialResult, originalRenderParsed) {
  let target = chronos.timeline;
  let currentGroupSignature = groupSignature(initialResult.groups);
  let pendingGroups;
  let redrawFrame;
  let destroyed = false;
  const listeners = new Map();
  let proxy;

  const configureChronosSurface = () => {
    if (!target) return;
    // The site renders its world-calendar axis immediately above the Chronos
    // canvas, so vis-timeline's internal axis reservation is unnecessary. Use
    // the native option rather than compensating with a host height or offset.
    target.setOptions({ margin: { axis: 0 } });
    target.redraw();
  };

  const removeRefitButtons = () => {
    chronos.container?.querySelectorAll?.('.chronos-timeline-refit-button')
      .forEach((button) => button.remove());
  };

  const attachExternalListeners = () => {
    for (const [eventType, handlers] of listeners) {
      for (const handler of handlers) target.on(eventType, handler);
    }
  };

  const scheduleNativeRedraw = () => {
    window.cancelAnimationFrame(redrawFrame);
    redrawFrame = window.requestAnimationFrame(() => target?.redraw?.());
  };

  const remountWithChronos = (items, groups) => {
    if (destroyed) return undefined;

    const visibleWindow = target?.getWindow?.();
    const selection = target?.getSelection?.() ?? [];
    target?.destroy?.();
    removeRefitButtons();

    originalRenderParsed.call(chronos, {
      items,
      groups,
      markers: initialResult.markers ?? [],
      flags: initialResult.flags ?? {},
    });

    target = chronos.timeline;
    if (!target) throw new Error('Chronos did not recreate its timeline after a group change.');
    configureChronosSurface();

    if (visibleWindow) {
      target.setWindow(visibleWindow.start, visibleWindow.end, { animation: false });
    }
    if (selection.length) target.setSelection(selection, { focus: false });
    attachExternalListeners();

    currentGroupSignature = groupSignature(groups);
    pendingGroups = undefined;
    chronos.timeline = proxy;
    return undefined;
  };

  configureChronosSurface();

  proxy = new Proxy({}, {
    get(_proxyTarget, property) {
      if (property === '__visceriumChronosProxy') return true;
      if (property === '__visceriumChronosTarget') return target;

      if (property === 'on') {
        return (eventType, handler) => {
          if (!listeners.has(eventType)) listeners.set(eventType, new Set());
          listeners.get(eventType).add(handler);
          target.on(eventType, handler);
          return proxy;
        };
      }

      if (property === 'off') {
        return (eventType, handler) => {
          listeners.get(eventType)?.delete(handler);
          target.off?.(eventType, handler);
          return proxy;
        };
      }

      if (property === 'setOptions') {
        return (nextOptions = {}) => {
          const isLegacyHostOptionPass = (
            nextOptions.verticalScroll === true
            && nextOptions.horizontalScroll === true
            && (nextOptions.height === '34rem' || nextOptions.height === '28rem')
          );
          if (isLegacyHostOptionPass) return undefined;
          return target.setOptions(nextOptions);
        };
      }

      if (property === 'setGroups') {
        return (groups) => {
          const nextSignature = groupSignature(groups);
          if (nextSignature !== currentGroupSignature) pendingGroups = groups;
          return undefined;
        };
      }

      if (property === 'setItems') {
        return (items) => {
          if (pendingGroups !== undefined) return remountWithChronos(items, pendingGroups);
          const result = target.setItems(items);
          scheduleNativeRedraw();
          return result;
        };
      }

      if (property === 'destroy') {
        return () => {
          destroyed = true;
          window.cancelAnimationFrame(redrawFrame);
          removeRefitButtons();
          return target?.destroy?.();
        };
      }

      const value = target?.[property];
      return typeof value === 'function' ? value.bind(target) : value;
    },

    set(_proxyTarget, property, value) {
      target[property] = value;
      return true;
    },

    has(_proxyTarget, property) {
      return property in target;
    },
  });

  chronos.timeline = proxy;
  return proxy;
}

/**
 * Keep the fast indexed/filtering shell, but let Chronos own every grouped
 * timeline render. Same-group item updates stay in place; changing declared
 * lanes or categories rebuilds the timeline through Chronos and restores the
 * existing world-time window behind a stable proxy used by the site controls.
 */
export function mountTimeline(root, dataset, options) {
  const originalRenderParsed = ChronosTimeline.prototype.renderParsed;

  ChronosTimeline.prototype.renderParsed = function renderWithChronosLayout(result) {
    originalRenderParsed.call(this, result);
    installChronosTimelineProxy(this, result, originalRenderParsed);
  };

  try {
    return mountNativeTimeline(root, dataset, options);
  } finally {
    ChronosTimeline.prototype.renderParsed = originalRenderParsed;
  }
}
