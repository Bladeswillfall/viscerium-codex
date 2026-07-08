const TAGS = new Set(['cols', 'row', 'col', 'card', 'note', 'warning', 'lore', 'equation']);
const VOIDLESS_TAG_OUTPUT = new Map([
  ['cols', 'div'],
  ['row', 'div'],
  ['col', 'div'],
  ['card', 'div'],
  ['note', 'aside'],
  ['warning', 'aside'],
  ['lore', 'aside'],
  ['equation', 'section'],
]);

const GAP_VALUES = new Set(['none', 'xs', 'sm', 'md', 'lg', 'xl']);
const ALIGN_VALUES = new Set(['start', 'center', 'end', 'stretch']);
const JUSTIFY_VALUES = new Set(['start', 'center', 'end', 'between', 'around', 'evenly']);
const CARD_VARIANTS = new Set(['plain', 'accent', 'muted', 'warning', 'danger', 'success']);

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function classAttribute(classes, options) {
  const attribute = options?.jsx ? 'className' : 'class';
  return `${attribute}="${[...new Set(classes.filter(Boolean))].join(' ')}"`;
}

function isSafeRatio(value) {
  return /^\d+(?:-\d+){1,5}$/.test(value);
}

function isOneToTwelve(value) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= 12;
}

function parseKeyValueOptions(spec) {
  const options = new Map();
  const pattern = /([a-z][\w-]*)=(?:"([^"]*)"|'([^']*)'|([^\s]+))/gi;
  for (const match of String(spec ?? '').matchAll(pattern)) {
    options.set(match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? '');
  }
  return options;
}

function tokens(spec) {
  return String(spec ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function layoutUtilityClasses(spec) {
  const classes = [];
  for (const token of tokens(spec)) {
    const lower = token.toLowerCase();
    const [key, value] = lower.includes('=') ? lower.split('=', 2) : [lower, ''];

    if (key === 'gap' && GAP_VALUES.has(value)) classes.push(`cx-gap-${value}`);
    if (key === 'align' && ALIGN_VALUES.has(value)) classes.push(`cx-align-${value}`);
    if (key === 'justify' && JUSTIFY_VALUES.has(value)) classes.push(`cx-justify-${value}`);
    if (key === 'compact') classes.push('cx-compact');
    if (key === 'bleed') classes.push('cx-bleed');
    if (key === 'center') classes.push('cx-center');
  }
  return classes;
}

function colsClasses(spec) {
  const classes = ['cx-cols'];
  const firstRatio = tokens(spec).find((token) => isSafeRatio(token.toLowerCase()));
  if (firstRatio) classes.push(`cx-cols-${firstRatio.toLowerCase()}`);
  else classes.push('cx-cols-equal');
  classes.push(...layoutUtilityClasses(spec));
  return classes;
}

function rowClasses(spec) {
  return ['cx-row', ...layoutUtilityClasses(spec)];
}

function colClasses(spec) {
  const classes = ['cx-col'];

  for (const token of tokens(spec)) {
    const lower = token.toLowerCase();

    if (isOneToTwelve(lower)) {
      classes.push(`cx-span-${lower}`);
      continue;
    }

    const breakpointSpan = lower.match(/^(sm|md|lg|xl):(\d{1,2})$/);
    if (breakpointSpan && isOneToTwelve(breakpointSpan[2])) {
      classes.push(`cx-${breakpointSpan[1]}-${breakpointSpan[2]}`);
      continue;
    }

    const order = lower.match(/^order(?:-(sm|md|lg|xl))?[-:](\d{1,2})$/);
    if (order) {
      classes.push(order[1] ? `cx-order-${order[1]}-${order[2]}` : `cx-order-${order[2]}`);
      continue;
    }

    const selfAlign = lower.match(/^align=(start|center|end|stretch)$/);
    if (selfAlign) classes.push(`cx-self-${selfAlign[1]}`);
  }

  return classes;
}

function cardClasses(spec) {
  const classes = ['cx-card'];
  for (const token of tokens(spec)) {
    const lower = token.toLowerCase();
    if (CARD_VARIANTS.has(lower)) classes.push(`cx-card-${lower}`);
    if (lower === 'compact') classes.push('cx-card-compact');
  }
  return classes;
}

function calloutClasses(tag, spec) {
  const classes = ['cx-callout', `cx-callout-${tag}`];
  if (tokens(spec).includes('compact')) classes.push('cx-callout-compact');
  return classes;
}

function equationClasses(spec) {
  const classes = ['cx-equation', 'tex2jax_process'];
  if (tokens(spec).includes('compact')) classes.push('cx-equation-compact');
  return classes;
}

function titleMarkup(className, title, options) {
  return title ? `\n\n<p ${classAttribute([className], options)}>${escapeHtml(title)}</p>\n` : '\n';
}

function openTag(tag, spec, options) {
  const htmlTag = VOIDLESS_TAG_OUTPUT.get(tag);
  if (!htmlTag) return null;

  if (tag === 'cols') return `<div ${classAttribute(colsClasses(spec), options)}>\n`;
  if (tag === 'row') return `<div ${classAttribute(rowClasses(spec), options)}>\n`;
  if (tag === 'col') return `<div ${classAttribute(colClasses(spec), options)}>\n`;
  if (tag === 'card') return `<div ${classAttribute(cardClasses(spec), options)}>\n`;

  const optionMap = parseKeyValueOptions(spec);
  const title = optionMap.get('title');

  if (tag === 'equation') {
    return `<section ${classAttribute(equationClasses(spec), options)}>${titleMarkup('cx-equation-title', title, options)}`;
  }

  return `<aside ${classAttribute(calloutClasses(tag, spec), options)}>${titleMarkup('cx-callout-title', title, options)}`;
}

function closeTag(tag) {
  const htmlTag = VOIDLESS_TAG_OUTPUT.get(tag);
  return htmlTag ? `\n</${htmlTag}>` : null;
}

function parseCodexTagLine(line) {
  const match = line.match(/^\s*\[(\/)?([a-z][a-z0-9-]*)(?:(?::|\s+)([^\]]*))?\]\s*$/i);
  if (!match) return null;

  const closing = Boolean(match[1]);
  const tag = match[2].toLowerCase();
  const spec = match[3] ?? '';

  if (!TAGS.has(tag)) return null;
  return { closing, tag, spec };
}

function transformCodexTagLine(line, stack, options) {
  const parsed = parseCodexTagLine(line);
  if (!parsed) return null;

  if (!parsed.closing) {
    stack.push(parsed.tag);
    return openTag(parsed.tag, parsed.spec, options);
  }

  if (stack.at(-1) !== parsed.tag) {
    return null;
  }

  stack.pop();
  return closeTag(parsed.tag);
}

function isFenceStart(line) {
  const match = line.match(/^\s*(`{3,}|~{3,})/);
  if (!match) return null;
  return { marker: match[1][0], length: match[1].length };
}

function isFenceEnd(line, fence) {
  if (!fence) return false;
  const pattern = fence.marker === '`' ? /^\s*`{3,}/ : /^\s*~{3,}/;
  const match = line.match(pattern);
  return Boolean(match && match[0].trim().length >= fence.length);
}

export function transformCodexFormatting(markdown, options = {}) {
  const lines = String(markdown).split(/\r?\n/);
  const out = [];
  const stack = [];
  let fence = null;

  for (const line of lines) {
    if (fence) {
      out.push(line);
      if (isFenceEnd(line, fence)) fence = null;
      continue;
    }

    const fenceStart = isFenceStart(line);
    if (fenceStart) {
      fence = fenceStart;
      out.push(line);
      continue;
    }

    out.push(transformCodexTagLine(line, stack, options) ?? line);
  }

  return out.join('\n');
}
