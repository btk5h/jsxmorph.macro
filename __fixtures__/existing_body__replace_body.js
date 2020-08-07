import morph from "../src/macro";

export default morph("./__fixtures__/data/existing_body.tsx", () => {
  const foo = "replaced";
});
