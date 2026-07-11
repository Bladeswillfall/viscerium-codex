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

function installTimelineDomGuards(root) {
  let alignmentFrame;
  let destroyed = false;

  const removeItemTitle = (element) => {
    const item = element?.matches?.('.vis-item') ? element : element?.closest?.('.vis-item');
    item?.removeAttribute('title');
  };

  const alignAxisToChronosCenter = () => {
    const axis = root.querySelector('[data-vc-axis]');
    const centerPanel = root.querySelector('[data-vc-canvas] .vis-panel.vis-center');
    if (!axis || !centerPanel) return;

    const axisRect = axis.getBoundingClientRect();
    const centerRect = centerPanel.getBoundingClientRect();
    const startOffset = Math.max(0, centerRect.left - axisRect.left);
    const usableWidth = Math.max(0, centerRect.width);

    for (const tick of axis.querySelectorAll(':scope > span')) {
      const rawPosition = tick.dataset.vcAxisPercent ?? tick.style.left;
      const percent = Number.parseFloat(rawPosition);
      if (!Number.isFinite(percent)) continue;

      tick.dataset.vcAxisPercent = String(percent);
      tick.style.left = `${startOffset + (usableWidth * percent) / 100}px`;
    }
  };

  const sanitizeItemTitles = () => {
    root.querySelectorAll('.vis-item[title]').forEach((item) => item.removeAttribute('title'));
  };

  const scheduleAlignment = () => {
    window.cancelAnimationFrame(alignmentFrame);
    alignmentFrame = window.requestAnimationFrame(() => {
      if (destroyed) return;
      sanitizeItemTitles();
      alignAxisToChronosCenter();
    });
  };

  const mutationObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'title') {
        removeItemTitle(mutation.target);
      }
    }
    scheduleAlignment();
  });
  mutationObserver.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['title'],
  });

  const handlePointerOver = (event) => removeItemTitle(event.target);
  root.addEventListener('pointerover', handlePointerOver, true);

  const resizeObserver = typeof ResizeObserver === 'function'
    ? new ResizeObserver(scheduleAlignment)
    : undefined;
  resizeObserver?.observe(root);

  scheduleAlignment();

  return () => {
    destroyed = true;
    window.cancelAnimationFrame(alignmentFrame);
    mutationObserver.disconnect();
    resizeObserver?.disconnect();
    root.removeEventListener('pointerover', handlePointerOver, true);
  };
}

/**
 * Keep the fast indexed/filtering shell, but let Chronos own every grouped
 * timeline render. Same-group item updates stay in place; changing declared
 * lanes or categories rebuilds the timeline through Chronos and restores the
 * existing world-time window behind a stable proxy used by the site controls.
 */
export function mountTimeline(root, dataset, options) {
  const originalRenderParsed = ChronosTimeline.prototype.renderParsed;
  let nativeCleanup;

  ChronosTimeline.prototype.renderParsed = function renderWithChronosLayout(result) {
    originalRenderParsed.call(this, result);
    installChronosTimelineProxy(this, result, originalRenderParsed);
  };

  try {
    nativeCleanup = mountNativeTimeline(root, dataset, options);
  } finally {
    ChronosTimeline.prototype.renderParsed = originalRenderParsed;
  }

  const cleanupDomGuards = installTimelineDomGuards(root);
  return () => {
    cleanupDomGuards();
    nativeCleanup?.();
  };
}
