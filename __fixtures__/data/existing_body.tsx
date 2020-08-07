import React from "react";

export default function ComponentWithExistingBody() {
  const foo = "bar";
  return (
    <div id={foo} />
  );
}
