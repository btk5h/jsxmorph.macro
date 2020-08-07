import morph from "../src/macro";

export default morph("./__fixtures__/data/simple.tsx", () => {
  const condition = true;
  return ({ conditionallyRender }) => {
    conditionallyRender("[name=first]", condition);
  };
});
