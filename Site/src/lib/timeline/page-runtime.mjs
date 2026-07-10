export function createTimelinePageRuntime({ getRoots, mountRoot, onError = console.error }) {
  if (typeof getRoots !== 'function') throw new TypeError('Timeline runtime requires getRoots().');
  if (typeof mountRoot !== 'function') throw new TypeError('Timeline runtime requires mountRoot().');

  const mounted = new Map();

  function cleanupRoot(root) {
    const cleanup = mounted.get(root);
    if (!cleanup) return;
    try {
      cleanup();
    } finally {
      mounted.delete(root);
    }
  }

  function pruneDetached() {
    for (const root of mounted.keys()) {
      if (!root?.isConnected) cleanupRoot(root);
    }
  }

  function mountAll() {
    pruneDetached();
    for (const root of getRoots()) {
      if (!root || mounted.has(root)) continue;
      try {
        const cleanup = mountRoot(root);
        if (typeof cleanup === 'function') mounted.set(root, cleanup);
      } catch (error) {
        mounted.delete(root);
        onError(error, root);
      }
    }
  }

  function destroyAll() {
    for (const root of [...mounted.keys()]) cleanupRoot(root);
  }

  return {
    mountAll,
    destroyAll,
    isMounted: (root) => mounted.has(root),
    mountedCount: () => mounted.size,
  };
}
