import { useEffect } from "react";
import morph from "../src/macro";

export default morph("./__fixtures__/data/simple.tsx", () => {
  useEffect(() => {
    console.log("ext");
  }, []);
});
