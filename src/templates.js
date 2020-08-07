const template = require("@babel/template").default;

const buildConditionalWrapper = template.expression(`
  %%condition%% && %%value%%
`);

module.exports = {
  buildConditionalWrapper,
};
