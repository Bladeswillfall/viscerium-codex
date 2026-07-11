function fencedSourceWithoutCodeBlocks(source) {
  const kept = [];
  let fence;

  for (const line of String(source ?? '').split(/\r?\n/)) {
    if (fence) {
      const trimmed = line.trimStart();
      const closing = trimmed.match(fence.marker === '`' ? /^`{3,}/ : /^~{3,}/);
      if (closing && closing[0].length >= fence.length) fence = undefined;
      continue;
    }

    const opening = line.match(/^\s{0,3}(`{3,}|~{3,})\s*([^\s`]*)/);
    if (opening) {
      const language = String(opening[2] ?? '').toLowerCase();
      if (language === 'math') return { source: kept.join('\n'), hasMathFence: true };
      fence = { marker: opening[1][0], length: opening[1].length };
      continue;
    }

    kept.push(line);
  }

  return { source: kept.join('\n'), hasMathFence: false };
}

function removeInlineCode(source) {
  return String(source).replace(/(`+)([^`]|\n)*?\1/g, '');
}

function hasInlineDollarMath(source) {
  const text = String(source);

  for (let index = 0; index < text.length; index += 1) {
    if (text[index] !== '$' || text[index - 1] === '\\' || text[index - 1] === '$' || text[index + 1] === '$') continue;

    for (let end = index + 1; end < text.length; end += 1) {
      if (text[end] === '\n') break;
      if (text[end] !== '$' || text[end - 1] === '\\' || text[end + 1] === '$') continue;

      const expression = text.slice(index + 1, end);
      if (
        expression
        && expression.trim() === expression
        && /[A-Za-z\\^_{}=+\-*/<>]/.test(expression)
      ) return true;

      index = end;
      break;
    }
  }

  return false;
}

export function sourceUsesMath(source) {
  const fenced = fencedSourceWithoutCodeBlocks(source);
  if (fenced.hasMathFence) return true;

  const searchable = removeInlineCode(fenced.source);
  return (
    /\$\$[\s\S]+?\$\$/.test(searchable)
    || /\\\[[\s\S]+?\\\]/.test(searchable)
    || /\\\([\s\S]+?\\\)/.test(searchable)
    || /\\begin\{[A-Za-z*]+\}/.test(searchable)
    || /^\s*\[equation(?::[^\]]+)?\]\s*$/im.test(searchable)
    || hasInlineDollarMath(searchable)
  );
}
