export function cleanSlug(value) {
  return String(value ?? '').trim().replace(/^\/+|\/+$/g, '').toLowerCase();
}

export function slugToRoute(slug) {
  const cleaned = cleanSlug(slug);
  return cleaned === 'index' ? '/' : `/${cleaned}/`;
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function toPosixPath(value) {
  return String(value ?? '').replace(/\\/g, '/');
}
