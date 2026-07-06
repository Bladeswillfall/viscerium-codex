const page = dv.current();
const options = input ?? {};
const title = options.title ?? page.title ?? page.file.name;
const subtitle = options.subtitle ?? page.description ?? '';
const type = options.type ?? page.type ?? 'entry';
const accent = options.accent ?? 'crimson';
const image = options.image ?? page.image ?? page.asset ?? '';
const alt = options.alt ?? page.alt ?? title;
const sections = options.sections ?? [];

const wrapper = dv.el('aside', '', {
  cls: `viscerium-infobox viscerium-infobox--${accent}`,
  attr: { 'aria-label': `${title} sidebar` },
});

const header = wrapper.createDiv({ cls: 'viscerium-infobox__header' });
header.createEl('div', { cls: 'viscerium-infobox__eyebrow', text: String(type).replace(/-/g, ' ') });
header.createEl('h2', { cls: 'viscerium-infobox__title', text: title });
if (subtitle) header.createEl('p', { cls: 'viscerium-infobox__subtitle', text: subtitle });

if (image) {
  const figure = wrapper.createEl('figure', { cls: 'viscerium-infobox__figure' });
  const img = figure.createEl('img', { attr: { src: image, alt } });
  img.addClass('viscerium-infobox__image');
  if (page.credit) figure.createEl('figcaption', { text: `Credit: ${page.credit}` });
}

function renderValue(parent, value) {
  if (value === null || value === undefined || value === '') {
    parent.createSpan({ cls: 'viscerium-infobox__empty', text: '—' });
    return;
  }

  if (Array.isArray(value)) {
    const list = parent.createEl('ul', { cls: 'viscerium-infobox__list' });
    value.forEach((item) => {
      const li = list.createEl('li');
      renderValue(li, item);
    });
    return;
  }

  if (typeof value === 'object' && value.path) {
    dv.el('span', value, { container: parent });
    return;
  }

  parent.createSpan({ text: String(value) });
}

function fieldValue(source, path) {
  if (!path) return undefined;
  return String(path).split('.').reduce((value, key) => value?.[key], source);
}

const body = wrapper.createDiv({ cls: 'viscerium-infobox__body' });
sections
  .filter((section) => section && section.label)
  .forEach((section) => {
    const value = section.value ?? fieldValue(page, section.field);
    const row = body.createDiv({ cls: 'viscerium-infobox__row' });
    row.createEl('dt', { text: section.label });
    const dd = row.createEl('dd');
    renderValue(dd, value);
  });

const footerItems = [page.status, page.publish === true ? 'publishable' : null].filter(Boolean);
if (footerItems.length) {
  const footer = wrapper.createDiv({ cls: 'viscerium-infobox__footer' });
  footerItems.forEach((item) => footer.createSpan({ text: item }));
}
