const t = require("@babel/types");
const generate = require("@babel/generator").default;

function matches(searchNodePaths, selectorStack) {
  if (searchNodePaths.length === 0) {
    return false;
  }

  if (selectorStack.length === 0) {
    return true;
  }

  const nextSelectorStack = selectorStack.slice(0, -1);
  const selector = selectorStack[selectorStack.length - 1];

  if (selector.type === "attribute") {
    let attributeFilter;
    if (selector.action === "equals") {
      attributeFilter = (attr) =>
        t.isJSXAttribute(attr) &&
        attr.name.name === selector.name &&
        getAttributeValue(attr.value) === selector.value;
    } else if (selector.action === "start") {
      attributeFilter = (attr) =>
        t.isJSXAttribute(attr) &&
        attr.name.name === selector.name &&
        getAttributeValue(attr.value).startsWith(selector.value);
    } else if (selector.action === "end") {
      attributeFilter = (attr) =>
        t.isJSXAttribute(attr) &&
        attr.name.name === selector.name &&
        getAttributeValue(attr.value).endsWith(selector.value);
    } else {
      throw new Error(
        `Unsupported CSS attribute selector feature: ${selector.action}`
      );
    }

    searchNodePaths = searchNodePaths.filter((el) =>
      el.node.openingElement.attributes.some(attributeFilter)
    );
  } else if (selector.type === "tag") {
    searchNodePaths = searchNodePaths.filter(
      (el) => el.node.openingElement.name.name === selector.name
    );
  } else if (selector.type === "universal") {
    // matches everything
  } else {
    throw new Error(`Unsupported CSS selector feature: ${selector.type}`);
  }

  return matches(searchNodePaths, nextSelectorStack);
}

function getAttributeValue(attrValue) {
  if (t.isStringLiteral(attrValue)) {
    return attrValue.value;
  }

  return generate(attrValue.expression).code;
}

function matchesSomeSelector(selectors, nodePath) {
  return selectors.some((selectorStack) => matches([nodePath], selectorStack));
}

module.exports = {
  matchesSomeSelector,
};
