// Chronos owns the live vis-timeline instance and its interaction lifecycle.
// VISCERIUM supplies canonical data, fictional-calendar labels, filters and
// navigation through the native renderer without replacing or remounting the
// Chronos canvas during ordinary pan, zoom or group-view interactions.
export { mountTimeline } from './chronos-native-renderer.mjs';
