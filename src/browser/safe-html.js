const ALLOWED_TAGS = new Set([
  'A', 'B', 'BLOCKQUOTE', 'BR', 'BUTTON', 'CODE', 'DIV', 'EM', 'H1', 'H2', 'H3', 'H4', 'H5',
  'LI', 'OL', 'P', 'PRE', 'SMALL', 'SPAN', 'STRONG', 'TABLE', 'TBODY', 'TD', 'TH', 'THEAD',
  'TR', 'UL'
]);

const ALLOWED_ATTRIBUTES = new Set([
  'class', 'code', 'data-action', 'data-area', 'data-location', 'data-step', 'data-trigger-point',
  'disabled', 'href', 'id', 'target', 'title'
]);

function sanitizeNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return document.createTextNode(node.textContent || '');
  }

  if (node.nodeType !== Node.ELEMENT_NODE || !ALLOWED_TAGS.has(node.tagName)) {
    return document.createTextNode(node.textContent || '');
  }

  const clone = document.createElement(node.tagName.toLowerCase());
  for (const attribute of node.attributes) {
    if (!ALLOWED_ATTRIBUTES.has(attribute.name) || attribute.name.startsWith('on')) {
      continue;
    }
    if (attribute.name === 'href' && !attribute.value.startsWith('https://')) {
      continue;
    }
    clone.setAttribute(attribute.name, attribute.value);
  }

  for (const child of node.childNodes) {
    clone.appendChild(sanitizeNode(child));
  }
  return clone;
}

export function setSafeHtml(element, html) {
  const template = document.createElement('template');
  template.innerHTML = String(html);
  element.replaceChildren(...[...template.content.childNodes].map(sanitizeNode));
}
