import { Children, isValidElement } from 'react';

const FORBIDDEN_EMOJI_REGEX = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]|\u{200D}|\u{FE0E}|\u{FE0F}|\u{20E3}/u;
const TEXT_PROPS = ['title', 'alt', 'aria-label', 'aria-description', 'placeholder', 'label', 'value'];

export function checkForbiddenEmojis(value) {
  return typeof value === 'string' && FORBIDDEN_EMOJI_REGEX.test(value);
}

export function scanReactTree(element) {
  const violations = [];
  const walk = (node, path = 'root') => {
    if (typeof node === 'string') {
      if (checkForbiddenEmojis(node)) violations.push(`${path}: forbidden pictograph`);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach((child, index) => walk(child, `${path}[${index}]`));
      return;
    }
    if (!isValidElement(node)) return;
    for (const key of TEXT_PROPS) {
      if (checkForbiddenEmojis(node.props[key])) violations.push(`${path}.${key}: forbidden pictograph`);
    }
    Children.forEach(node.props.children, (child, index) => walk(child, `${path}.children[${index}]`));
  };
  walk(element);
  return violations;
}
