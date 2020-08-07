const fs = require("fs");
const t = require("@babel/types");
const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const { createMacro } = require("babel-plugin-macros");
const { buildMergeSpec, applySpec } = require("./merge");

function mergeImports(ref, imports) {
  const program = ref.findParent(t.isProgram);
  program.unshiftContainer("body", imports);
}

function transformMorphCalls(ref) {
  const importedFileName = ref.parent.arguments[0].value;
  const morphSpec = ref.parent.arguments[1].body;

  const importedFileContents = fs.readFileSync(importedFileName, "utf-8");
  const importedAST = parse(importedFileContents, {
    sourceType: "module",
    sourceFilename: importedFileName,
    plugins: ["jsx", "typescript"],
  });

  let mergeSpec = buildMergeSpec();

  if (t.isReturnStatement(morphSpec.body[morphSpec.body.length - 1])) {
    const tree = morphSpec.body.pop();
    mergeSpec = buildMergeSpec(tree.argument.body.body);
  }

  const imports = [];
  let importedComponentPath;

  traverse(importedAST, {
    ImportDeclaration(path) {
      imports.push(path.node);
    },
    ExportDefaultDeclaration(path) {
      importedComponentPath = path.get("declaration");
      path.stop();
    },
  });

  mergeImports(ref, imports);
  applySpec(mergeSpec, importedComponentPath);
  importedComponentPath.get("body").unshiftContainer("body", morphSpec.body);

  ref.parentPath.parentPath.replaceWith(
    t.exportDefaultDeclaration(importedComponentPath.node)
  );
  ref.skip();
}

function macro({ references }) {
  references.default.forEach(transformMorphCalls);
}

module.exports = createMacro(macro);
