const safeTokenPattern = /^[a-z0-9][a-z0-9-]*$/i;
const fontAwesomeStylePattern = /^fa-(solid|regular|brands|thin|light|duotone|sharp|sharp-duotone)$/i;
const iconLabelPattern = /^\[icon:([^\]]+)\]\s*(.*)$/i;
const legacyIconLabelPattern = /^\[([a-z0-9][a-z0-9-]*)\]\s*(.*)$/i;

function cleanSpec(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

function safeTokens(value) {
  const tokens = cleanSpec(value).split(' ').filter(Boolean);
  return tokens.length > 0 && tokens.every((token) => safeTokenPattern.test(token)) ? tokens : [];
}

export function parseIconSpec(value) {
  const raw = cleanSpec(value);
  if (!raw) return null;

  const tokens = safeTokens(raw);
  if (tokens.length === 0) return null;

  if (tokens[0].toLowerCase() === 'local') {
    if (tokens.length !== 2) return null;
    return {
      provider: 'local',
      name: tokens[1],
      spec: `local ${tokens[1]}`,
    };
  }

  // A single token is retained as shorthand for the Codex's local SVG library.
  if (tokens.length === 1) {
    if (fontAwesomeStylePattern.test(tokens[0])) return null;
    return {
      provider: 'local',
      name: tokens[0],
      spec: `local ${tokens[0]}`,
    };
  }

  if (fontAwesomeStylePattern.test(tokens[0]) && !tokens.slice(1).some((token) => /^fa-/i.test(token))) {
    return null;
  }

  // Multi-token specifications are rendered as CSS classes. This preserves
  // Font Awesome's native authoring format, e.g. "fa-solid fa-people-group",
  // and leaves room for future class-based icon libraries.
  return {
    provider: 'classes',
    classes: tokens,
    spec: tokens.join(' '),
  };
}

export function iconLabel(spec, label) {
  const parsed = parseIconSpec(spec);
  return parsed ? `[Icon:${parsed.spec}] ${label}` : label;
}

export function parseIconLabel(value) {
  const raw = typeof value === 'string' ? value : '';
  const explicit = raw.match(iconLabelPattern);
  if (explicit) {
    const icon = parseIconSpec(explicit[1]);
    return {
      icon: icon?.spec,
      label: explicit[2].trim(),
    };
  }

  const legacy = raw.match(legacyIconLabelPattern);
  if (legacy) {
    return {
      icon: `local ${legacy[1]}`,
      label: legacy[2].trim(),
    };
  }

  return { icon: undefined, label: raw };
}

function classAttribute(jsx) {
  return jsx ? 'className' : 'class';
}

export function renderIconMarkup(spec, options = {}) {
  const parsed = parseIconSpec(spec);
  if (!parsed) return '';

  const jsx = options.jsx === true;
  const attr = classAttribute(jsx);
  const classes = ['codex-icon', options.className].filter(Boolean).join(' ');

  if (parsed.provider === 'local') {
    const iconPath = `/icons/${parsed.name}.svg`;
    const style = jsx
      ? `style={"--icon: url('${iconPath}')"}`
      : `style="--icon: url('${iconPath}')"`;
    return `<span ${attr}="${classes} codex-local-icon" aria-hidden="true" ${style}></span>`;
  }

  return `<span ${attr}="${classes}" aria-hidden="true"><i ${attr}="${parsed.classes.join(' ')}"></i></span>`;
}
