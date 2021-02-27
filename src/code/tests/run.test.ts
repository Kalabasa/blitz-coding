import { Box } from "code/box";
import { Run } from "code/run";

it("runs code", () => {
  const runs = Run.code("return a + b;", {
    funcName: "sum",
    inputNames: ["a", "b"],
    cases: [{ inputs: Box.arrayValues([2, 3]), output: Box.value(undefined) }],
  }) as Run[];

  expect(runs).toHaveLength(1);
  expect(runs[0]).toHaveProperty("output");
  expect(runs[0].output).toEqual(5);
});
