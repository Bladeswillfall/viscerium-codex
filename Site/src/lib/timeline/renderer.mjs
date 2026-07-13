import { ChronosTimeline } from 'chronos-timeline-md';
import { mountTimeline as mountNativeTimeline } from './chronos-native-renderer.mjs';

function temporalValue(value) {
  if (value instanceof Date) return value.valueOf();
  if (value && typeof value.valueOf === 'function') return value.valueOf();
  return value ?? '';
}

function collectionValues(collection) {
  if (Array.isArray(collection)) return collection;
  if (collection && typeof collection.get === 'function') return collection.get();
  return [];
}

function itemSignature(items) {
  return collectionValues(items).map((item) => [
    item.id,
    item.group,
    temporalValue(item.start),
    temporalValue(item.end),
    item.type,
    item.className,
    item.content,
    item.title,
  ].join('\u001f')).join('\u001e');
}

function groupSignature(groups) {
  return collectionValues(groups).map((group) => [
    group.id,
    group.content,
    group.className,
    group.order,
  ].join('\u001f')).join('\u001e');
}

function makeTimelineSettersIdempotent(timeline, initialItems, initialGroups) {
  if (!timeline) return;

  const setItems = timeline.setItems.bind(timeline);
  const setGroups = timeline.setGroups.bind(timeline);
  let appliedItems = itemSignature(initialItems);
  let appliedGroups = groupSignature(initialGroups);

  timeline.setItems = (items) => {
    const next = itemSignature(items);
    if (next === appliedItems) return;
    appliedItems = next;
    setItems(items);
  };

  timeline.setGroups = (groups) => {
    const next = groupSignature(groups);
    if (next === appliedGroups) return;
    appliedGroups = next;
    setGroups(groups);
  };
}

/**
 * Chronos owns the live vis-timeline instance and every interaction after mount.
 * Chronos 1.1.0 does not expose vis-timeline's orientation in its public settings,
 * and its grouped-timeline workaround performs an animated zoom-out/zoom-in after
 * creation. Preserve the layout correction as one non-animated refresh, apply the
 * missing top orientation synchronously, and skip identical later model assignments.
 * No observer, remount or redraw loop remains active.
 */
export function mountTimeline(root, dataset, options) {
  const prototype = ChronosTimeline.prototype;
  const originalRenderParsed = prototype.renderParsed;
  const originalZoomWorkaround = prototype._handleZoomWorkaround;
  let groupedRefreshHandle;

  function refreshGroupedLayoutWithoutZoom(timeline, groups) {
    if (!groups?.length || typeof window === 'undefined') return;
    groupedRefreshHandle = window.setTimeout(() => {
      if (!timeline?.getWindow) return;
      timeline.redraw?.();
      const range = timeline.getWindow();
      timeline.setWindow(range.start, range.end, { animation: false });
    }, 150);
  }

  function renderParsedWithStableTopOrientation(result) {
    originalRenderParsed.call(this, result);
    this.timeline?.setOptions({
      orientation: {
        axis: 'top',
        item: 'top',
      },
    });
    makeTimelineSettersIdempotent(this.timeline, result.items, result.groups);
  }

  prototype.renderParsed = renderParsedWithStableTopOrientation;
  if (typeof originalZoomWorkaround === 'function') {
    prototype._handleZoomWorkaround = refreshGroupedLayoutWithoutZoom;
  }

  let cleanup;
  try {
    cleanup = mountNativeTimeline(root, dataset, options);
  } catch (error) {
    if (groupedRefreshHandle !== undefined && typeof window !== 'undefined') {
      window.clearTimeout(groupedRefreshHandle);
    }
    throw error;
  } finally {
    if (prototype.renderParsed === renderParsedWithStableTopOrientation) {
      prototype.renderParsed = originalRenderParsed;
    }
    if (prototype._handleZoomWorkaround === refreshGroupedLayoutWithoutZoom) {
      prototype._handleZoomWorkaround = originalZoomWorkaround;
    }
  }

  return () => {
    if (groupedRefreshHandle !== undefined && typeof window !== 'undefined') {
      window.clearTimeout(groupedRefreshHandle);
    }
    cleanup?.();
  };
}
