import morph from "../src/macro";

export default morph("./__fixtures__/data/simple.tsx", () => {
  return ({ deleteNode }) => {
    deleteNode("[name=second]");
  };
});
