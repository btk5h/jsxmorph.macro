import morph from "../src/macro";

export default morph("./__fixtures__/data/simple.tsx", () => {
  return ({ addAttribute }) => {
    addAttribute("[name=first]", "foo", 1);
  };
});
