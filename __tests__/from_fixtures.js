const macros = require("babel-plugin-macros");
const pluginTester = require("babel-plugin-tester").default;
const globby = require("globby");
const path = require("path");
const fs = require("fs");

pluginTester({
  plugin: macros,
  pluginName: "jsxmorph.macro",
  snapshot: true,
  babelOptions: {
    filename: __filename,
    babelrc: true,
    plugins: ["@babel/plugin-syntax-jsx"],
  },
  tests: globby.sync("__fixtures__/*.js").map((p) => {
    const testCode = fs.readFileSync(p, "utf-8");
    return {
      title: path.basename(p, ".js"),
      fixture: path.resolve(p),
      only: testCode.includes("ONLY"),
    };
  }),
});
