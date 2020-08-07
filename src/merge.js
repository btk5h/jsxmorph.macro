const CSSwhat = require("css-what");
const t = require("@babel/types");
const { buildConditionalWrapper } = require("./templates");
const { matchesSomeSelector } = require("./css");

function buildMergeSpec(statements = []) {
  const spec = {
    nodesToDelete: [],
    attributesToAdd: [],
    conditionallyRendered: [],
  };

  statements.forEach((s) => {
    if (!t.isExpressionStatement(s)) {
      throw new Error("Merge specification must only contain statements");
    }

    const c = s.expression;

    if (!t.isCallExpression(c)) {
      throw new Error("Must be a call expression");
    }

    const type = c.callee.name;

    if (type === "deleteNode") {
      const selectors = CSSwhat.parse(c.arguments[0].value);
      spec.nodesToDelete.push(...selectors);
    } else if (type === "addAttribute") {
      const selectors = CSSwhat.parse(c.arguments[0].value);
      const attributeName = c.arguments[1].value;
      const expr = c.arguments[2];
      const attributeValue = t.isStringLiteral(expr)
        ? expr
        : t.jsxExpressionContainer(expr);
      const attribute = t.jsxAttribute(
        t.jsxIdentifier(attributeName),
        attributeValue
      );

      spec.attributesToAdd.push({ selectors, attribute });
    } else if (type === "conditionallyRender") {
      const selectors = CSSwhat.parse(c.arguments[0].value);
      const condition = c.arguments[1];

      spec.conditionallyRendered.push({ selectors, condition });
    }
  });

  return spec;
}

function applySpec(mergeSpec, componentPath) {
  const componentBody = componentPath.node.body.body
  componentPath.node.body.body = [componentBody[componentBody.length - 1]]

  componentPath.traverse({
    JSXElement(path) {
      if (matchesSomeSelector(mergeSpec.nodesToDelete, path)) {
        path.remove();
      }

      for (const attrSpec of mergeSpec.attributesToAdd) {
        if (matchesSomeSelector(attrSpec.selectors, path)) {
          path
            .get("openingElement")
            .pushContainer("attributes", attrSpec.attribute);
        }
      }

      for (const condSpec of mergeSpec.conditionallyRendered) {
        if (matchesSomeSelector(condSpec.selectors, path)) {
          const conditionalElement = t.jsxExpressionContainer(
            buildConditionalWrapper({
              condition: condSpec.condition,
              value: path.node,
            })
          );

          path.replaceWith(conditionalElement);
          path.skip();
          break;
        }
      }
    },
  });
}

module.exports = {
  buildMergeSpec,
  applySpec,
};
