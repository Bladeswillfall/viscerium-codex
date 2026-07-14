const GENERATED_MARKER = '/* viscerium-progressive-colors */';

const NAMED_COLORS = new Map([
  ['black', '#000000'],
  ['silver', '#c0c0c0'],
  ['gray', '#808080'],
  ['grey', '#808080'],
  ['white', '#ffffff'],
  ['maroon', '#800000'],
  ['red', '#ff0000'],
  ['purple', '#800080'],
  ['fuchsia', '#ff00ff'],
  ['green', '#008000'],
  ['lime', '#00ff00'],
  ['olive', '#808000'],
  ['yellow', '#ffff00'],
  ['navy', '#000080'],
  ['blue', '#0000ff'],
  ['teal', '#008080'],
  ['aqua', '#00ffff'],
  ['orange', '#ffa500'],
  ['rebeccapurple', '#663399'],
]);

const DECLARATION_AT_RULES = new Set([
  'counter-style',
  'font-face',
  'font-feature-values',
  'font-palette-values',
  'page',
  'property',
  'view-transition',
]);

export function progressiveCssColors(options = {}) {
  const include = options.include ?? ((id) => {
    const normalized = id.replaceAll('\\', '/');
    if (normalized.includes('/node_modules/')) return false;
    return (
      normalized.includes('/Site/src/') ||
      normalized.includes('/Site/vendor/starlight-ion-theme/') ||
      normalized.includes('/src/') ||
      normalized.includes('/vendor/starlight-ion-theme/')
    );
  });

  return {
    name: 'viscerium-progressive-css-colors',
    enforce: 'pre',
    transform(code, id) {
      if (!isCssModule(id) || !include(id) || code.includes(GENERATED_MARKER)) return null;
      const transformed = enhanceCssColors(code);
      return transformed === code ? null : { code: transformed, map: null };
    },
  };
}

export function enhanceCssColors(code) {
  if (code.includes(GENERATED_MARKER)) return code;
  const p3 = mirrorCss(code, 'p3');
  const oklch = mirrorCss(code, 'oklch');
  if (!p3 && !oklch) return code;

  const sections = [GENERATED_MARKER];
  if (p3) {
    sections.push(`@supports (color: color(display-p3 1 1 1)) {\n${indent(p3)}\n}`);
  }
  if (oklch) {
    sections.push(`@supports (color: oklch(50% 0.1 120)) {\n${indent(oklch)}\n}`);
  }
  return `${code.trimEnd()}\n\n${sections.join('\n')}\n`;
}

function isCssModule(id) {
  const normalized = id.replaceAll('\\', '/');
  return /(?:\.css(?:$|\?)|type=style)/.test(normalized);
}

function mirrorCss(code, mode) {
  return parseRange(code, 0, code.length, mode, false).trim();
}

function parseRange(code, start, end, mode, declarationContainer) {
  let output = '';
  let segmentStart = start;
  let cursor = start;

  while (cursor < end) {
    const token = nextStructuralToken(code, cursor, end);
    if (!token) break;

    if (token.char === ';') {
      if (declarationContainer) {
        const declaration = convertDeclaration(code.slice(segmentStart, token.index + 1), mode);
        if (declaration) output += declaration;
      }
      segmentStart = token.index + 1;
      cursor = token.index + 1;
      continue;
    }

    if (token.char === '{') {
      const prelude = code.slice(segmentStart, token.index).trim();
      const close = findMatchingBrace(code, token.index, end);
      if (close < 0) break;

      const atRule = getAtRuleName(prelude);
      if (mode === 'p3' && atRule === 'supports' && /oklch\s*\(/i.test(prelude)) {
        const flattened = parseRange(code, token.index + 1, close, mode, false);
        if (flattened.trim()) output += `${flattened.trim()}\n`;
        segmentStart = close + 1;
        cursor = close + 1;
        continue;
      }
      if (mode === 'oklch' && atRule === 'supports' && /display-p3/i.test(prelude)) {
        const flattened = parseRange(code, token.index + 1, close, mode, false);
        if (flattened.trim()) output += `${flattened.trim()}\n`;
        segmentStart = close + 1;
        cursor = close + 1;
        continue;
      }

      const childIsDeclarationContainer = atRule
        ? DECLARATION_AT_RULES.has(atRule)
        : true;
      const child = parseRange(code, token.index + 1, close, mode, childIsDeclarationContainer);
      if (child.trim()) {
        output += `${prelude} {\n${indent(child.trim())}\n}\n`;
      }

      segmentStart = close + 1;
      cursor = close + 1;
      continue;
    }

    cursor = token.index + 1;
  }

  if (declarationContainer && segmentStart < end) {
    const declaration = convertDeclaration(code.slice(segmentStart, end), mode);
    if (declaration) output += declaration;
  }

  return output;
}

function nextStructuralToken(code, start, end) {
  let quote = null;
  let comment = false;
  let parenDepth = 0;
  let bracketDepth = 0;

  for (let i = start; i < end; i += 1) {
    const char = code[i];
    const next = code[i + 1];

    if (comment) {
      if (char === '*' && next === '/') {
        comment = false;
        i += 1;
      }
      continue;
    }
    if (quote) {
      if (char === '\\') {
        i += 1;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }
    if (char === '/' && next === '*') {
      comment = true;
      i += 1;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === '(') parenDepth += 1;
    else if (char === ')') parenDepth = Math.max(0, parenDepth - 1);
    else if (char === '[') bracketDepth += 1;
    else if (char === ']') bracketDepth = Math.max(0, bracketDepth - 1);
    else if (parenDepth === 0 && bracketDepth === 0 && (char === '{' || char === ';')) {
      return { index: i, char };
    }
  }
  return null;
}

function findMatchingBrace(code, openIndex, end) {
  let depth = 1;
  let quote = null;
  let comment = false;

  for (let i = openIndex + 1; i < end; i += 1) {
    const char = code[i];
    const next = code[i + 1];
    if (comment) {
      if (char === '*' && next === '/') {
        comment = false;
        i += 1;
      }
      continue;
    }
    if (quote) {
      if (char === '\\') i += 1;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '/' && next === '*') {
      comment = true;
      i += 1;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === '{') depth += 1;
    else if (char === '}') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function getAtRuleName(prelude) {
  const match = /^@([\w-]+)/.exec(prelude);
  return match?.[1]?.toLowerCase() ?? null;
}

function convertDeclaration(raw, mode) {
  const cleaned = stripLeadingComments(raw).trim();
  if (!cleaned) return '';
  const semicolonless = cleaned.endsWith(';') ? cleaned.slice(0, -1) : cleaned;
  const match = /^([\w-]+)\s*:\s*([\s\S]*?)\s*(!important)?\s*$/.exec(semicolonless);
  if (!match) return '';

  const [, property, value, important] = match;
  if (/^(?:content|src|font-family)$/i.test(property)) return '';
  const converted = convertValue(value, mode);
  if (!converted.changed) return '';
  return `${property}: ${converted.value}${important ? ' !important' : ''};\n`;
}

function stripLeadingComments(value) {
  return value.replace(/^(?:\s|\/\*[\s\S]*?\*\/)+/, '');
}

export function convertValue(value, mode) {
  let output = '';
  let changed = false;

  for (let i = 0; i < value.length;) {
    const char = value[i];
    const next = value[i + 1];

    if (char === '"' || char === "'") {
      const end = consumeString(value, i, char);
      output += value.slice(i, end);
      i = end;
      continue;
    }
    if (char === '/' && next === '*') {
      const end = value.indexOf('*/', i + 2);
      const stop = end < 0 ? value.length : end + 2;
      output += value.slice(i, stop);
      i = stop;
      continue;
    }
    if (char === '#') {
      const match = /^#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-fA-F])/.exec(value.slice(i));
      if (match) {
        const color = parseHex(match[0]);
        output += formatColor(color, mode);
        changed = true;
        i += match[0].length;
        continue;
      }
    }

    const namedMatch = /^([a-zA-Z]+)(?![\w-])/.exec(value.slice(i));
    if (namedMatch && (i === 0 || !/[\w-]/.test(value[i - 1]))) {
      const fallback = NAMED_COLORS.get(namedMatch[1].toLowerCase());
      if (fallback) {
        output += formatColor(parseHex(fallback), mode);
        changed = true;
        i += namedMatch[1].length;
        continue;
      }
    }

    const functionMatch = /^([a-zA-Z-]+)\(/.exec(value.slice(i));
    if (functionMatch) {
      const name = functionMatch[1].toLowerCase();
      const open = i + functionMatch[0].length - 1;
      const close = findMatchingParen(value, open);
      if (close >= 0) {
        const full = value.slice(i, close + 1);
        const args = value.slice(open + 1, close);
        if (name === 'url') {
          output += full;
          i = close + 1;
          continue;
        }
        if (name === 'rgb' || name === 'rgba') {
          const color = parseRgb(args);
          if (color) {
            output += formatColor(color, mode);
            changed = true;
            i = close + 1;
            continue;
          }
        }
        if (name === 'hsl' || name === 'hsla') {
          const color = parseHsl(args);
          if (color) {
            output += formatColor(color, mode);
            changed = true;
            i = close + 1;
            continue;
          }
        }
        if (name === 'oklch') {
          const color = parseOklch(args);
          if (color) {
            output += mode === 'oklch' ? full : formatColor(color, mode);
            changed = true;
            i = close + 1;
            continue;
          }
        }
        if (name === 'color' && /^\s*display-p3\b/i.test(args)) {
          const color = parseDisplayP3(args);
          if (color) {
            output += mode === 'p3' ? full : formatColor(color, mode);
            changed = true;
            i = close + 1;
            continue;
          }
        }
        if (name === 'color-mix') {
          const convertedInner = convertValue(args, mode);
          const replacement = mode === 'p3' ? 'in display-p3' : 'in oklch';
          const mixed = convertedInner.value.replace(
            /^\s*in\s+(?:srgb(?:-linear)?|display-p3|oklch)\b/i,
            (current) => current.trim().toLowerCase() === replacement ? current : replacement,
          );
          if (mixed !== args || convertedInner.changed) changed = true;
          output += `${functionMatch[1]}(${mixed})`;
          i = close + 1;
          continue;
        }
      }
    }

    output += char;
    i += 1;
  }

  return { value: output, changed };
}

function consumeString(value, start, quote) {
  for (let i = start + 1; i < value.length; i += 1) {
    if (value[i] === '\\') i += 1;
    else if (value[i] === quote) return i + 1;
  }
  return value.length;
}

function findMatchingParen(value, open) {
  let depth = 1;
  let quote = null;
  for (let i = open + 1; i < value.length; i += 1) {
    const char = value[i];
    if (quote) {
      if (char === '\\') i += 1;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") quote = char;
    else if (char === '(') depth += 1;
    else if (char === ')') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function parseHex(input) {
  let hex = input.slice(1);
  if (hex.length === 3 || hex.length === 4) hex = [...hex].map((character) => character + character).join('');
  const alpha = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
  return {
    space: 'srgb',
    channels: [0, 2, 4].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255),
    alpha,
  };
}

function parseRgb(args) {
  if (/\b(?:from|calc|var)\b/i.test(args)) return null;
  const [channelsPart, alphaPart] = splitAlpha(args);
  const tokens = channelsPart.includes(',')
    ? channelsPart.split(',').map((part) => part.trim())
    : channelsPart.trim().split(/\s+/);
  if (tokens.length !== 3) return null;
  const channels = tokens.map(parseRgbChannel);
  if (channels.some((channel) => channel == null)) return null;
  return { space: 'srgb', channels, alpha: parseAlpha(alphaPart) ?? 1 };
}

function parseRgbChannel(token) {
  if (token.endsWith('%')) return clamp(parseFloat(token) / 100, 0, 1);
  const number = Number(token);
  return Number.isFinite(number) ? clamp(number / 255, 0, 1) : null;
}

function splitAlpha(args) {
  let depth = 0;
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '(') depth += 1;
    else if (args[i] === ')') depth -= 1;
    else if (args[i] === '/' && depth === 0) return [args.slice(0, i), args.slice(i + 1)];
  }
  if (args.includes(',')) {
    const parts = args.split(',').map((part) => part.trim());
    if (parts.length === 4) return [parts.slice(0, 3).join(','), parts[3]];
  }
  return [args, null];
}

function parseAlpha(token) {
  if (token == null || token === '') return null;
  const trimmed = token.trim();
  if (trimmed.endsWith('%')) return clamp(parseFloat(trimmed) / 100, 0, 1);
  const number = Number(trimmed);
  return Number.isFinite(number) ? clamp(number, 0, 1) : null;
}

function parseHsl(args) {
  if (/\b(?:from|calc|var)\b/i.test(args)) return null;
  const [channelsPart, alphaPart] = splitAlpha(args);
  const tokens = channelsPart.includes(',')
    ? channelsPart.split(',').map((part) => part.trim())
    : channelsPart.trim().split(/\s+/);
  if (tokens.length !== 3) return null;
  const hue = parseHue(tokens[0]);
  const saturation = parsePercentage(tokens[1]);
  const lightness = parsePercentage(tokens[2]);
  if ([hue, saturation, lightness].some((part) => part == null)) return null;
  return { space: 'srgb', channels: hslToRgb(hue, saturation, lightness), alpha: parseAlpha(alphaPart) ?? 1 };
}

function parseHue(token) {
  const value = parseFloat(token);
  if (!Number.isFinite(value)) return null;
  if (token.endsWith('turn')) return value * 360;
  if (token.endsWith('rad')) return value * (180 / Math.PI);
  if (token.endsWith('grad')) return value * .9;
  return value;
}

function parsePercentage(token) {
  if (!token.endsWith('%')) return null;
  const value = parseFloat(token);
  return Number.isFinite(value) ? clamp(value / 100, 0, 1) : null;
}

function hslToRgb(hue, saturation, lightness) {
  const h = ((hue % 360) + 360) % 360 / 360;
  if (saturation === 0) return [lightness, lightness, lightness];
  const q = lightness < .5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;
  return [h + 1 / 3, h, h - 1 / 3].map((channel) => {
    let value = channel;
    if (value < 0) value += 1;
    if (value > 1) value -= 1;
    if (value < 1 / 6) return p + (q - p) * 6 * value;
    if (value < 1 / 2) return q;
    if (value < 2 / 3) return p + (q - p) * (2 / 3 - value) * 6;
    return p;
  });
}

function parseOklch(args) {
  if (/\b(?:calc|var|none)\b/i.test(args)) return null;
  const [channelsPart, alphaPart] = splitAlpha(args);
  const tokens = channelsPart.trim().split(/\s+/);
  if (tokens.length !== 3) return null;
  const lightness = tokens[0].endsWith('%') ? parseFloat(tokens[0]) / 100 : Number(tokens[0]);
  const chroma = Number(tokens[1]);
  const hue = parseHue(tokens[2]);
  if (![lightness, chroma, hue].every(Number.isFinite)) return null;
  return { space: 'oklch', channels: [lightness, chroma, hue], alpha: parseAlpha(alphaPart) ?? 1 };
}

function parseDisplayP3(args) {
  if (/\b(?:calc|var|none)\b/i.test(args)) return null;
  const body = args.replace(/^\s*display-p3\s+/i, '');
  const [channelsPart, alphaPart] = splitAlpha(body);
  const tokens = channelsPart.trim().split(/\s+/).map(Number);
  if (tokens.length !== 3 || tokens.some((number) => !Number.isFinite(number))) return null;
  return { space: 'p3', channels: tokens.map((number) => clamp(number, 0, 1)), alpha: parseAlpha(alphaPart) ?? 1 };
}

function formatColor(color, mode) {
  if (mode === 'p3') {
    const [red, green, blue] = colorToP3(color).map((channel) => trimNumber(clamp(channel, 0, 1), 5));
    return `color(display-p3 ${red} ${green} ${blue}${formatAlpha(color.alpha)})`;
  }
  const [lightness, rawChroma, rawHue] = colorToOklch(color);
  const chroma = Math.abs(rawChroma) < 0.000005 ? 0 : Math.max(0, rawChroma);
  const hue = chroma === 0 ? 0 : normalizeHue(rawHue);
  return `oklch(${trimNumber(lightness * 100, 3)}% ${trimNumber(chroma, 5)} ${trimNumber(hue, 3)}${formatAlpha(color.alpha)})`;
}

function formatAlpha(alpha) {
  return alpha < .999999 ? ` / ${trimNumber(alpha, 4)}` : '';
}

function colorToP3(color) {
  if (color.space === 'p3') return color.channels;
  const xyz = color.space === 'oklch'
    ? linearSrgbToXyz(oklchToLinearSrgb(color.channels))
    : linearSrgbToXyz(color.channels.map(gammaToLinear));
  return xyzToLinearP3(xyz).map(linearToGamma);
}

function colorToOklch(color) {
  if (color.space === 'oklch') return color.channels;
  const linearSrgb = color.space === 'p3'
    ? xyzToLinearSrgb(linearP3ToXyz(color.channels.map(gammaToLinear)))
    : color.channels.map(gammaToLinear);
  return linearSrgbToOklch(linearSrgb);
}

function linearSrgbToOklch([red, green, blue]) {
  const l = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue);
  const m = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue);
  const s = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue);
  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const b = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [lightness, Math.hypot(a, b), Math.atan2(b, a) * 180 / Math.PI];
}

function oklchToLinearSrgb([lightness, chroma, hue]) {
  const radians = hue * Math.PI / 180;
  const a = chroma * Math.cos(radians);
  const b = chroma * Math.sin(radians);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

function linearSrgbToXyz([red, green, blue]) {
  return [
    0.4123907993 * red + 0.3575843394 * green + 0.1804807884 * blue,
    0.2126390059 * red + 0.7151686788 * green + 0.0721923154 * blue,
    0.0193308187 * red + 0.1191947798 * green + 0.9505321522 * blue,
  ];
}

function xyzToLinearSrgb([x, y, z]) {
  return [
    3.2409699419 * x - 1.5373831776 * y - 0.4986107603 * z,
    -0.9692436363 * x + 1.8759675015 * y + 0.0415550574 * z,
    0.0556300797 * x - 0.2039769589 * y + 1.0569715142 * z,
  ];
}

function linearP3ToXyz([red, green, blue]) {
  return [
    0.4865709486 * red + 0.2656676932 * green + 0.1982172852 * blue,
    0.2289745641 * red + 0.6917385218 * green + 0.0792869141 * blue,
    0.0451133819 * green + 1.0439443689 * blue,
  ];
}

function xyzToLinearP3([x, y, z]) {
  return [
    2.4934969119 * x - 0.9313836179 * y - 0.4027107845 * z,
    -0.8294889696 * x + 1.7626640603 * y + 0.0236246858 * z,
    0.0358458302 * x - 0.0761723893 * y + 0.956884524 * z,
  ];
}

function gammaToLinear(value) {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function linearToGamma(value) {
  return value <= 0.0031308 ? 12.92 * value : 1.055 * Math.max(value, 0) ** (1 / 2.4) - 0.055;
}

function normalizeHue(hue) {
  return ((hue % 360) + 360) % 360;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function trimNumber(value, precision) {
  const rounded = Number(value.toFixed(precision));
  return Object.is(rounded, -0) ? '0' : String(rounded);
}

function indent(value) {
  return value.split('\n').map((line) => line ? `  ${line}` : line).join('\n');
}
