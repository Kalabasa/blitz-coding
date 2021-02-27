import { Box } from "code/box";
import { Case } from "code/case";

it("correctly matches outputs", () => {
  const ex: Case = {
    inputs: [],
    output: Box.value({ x: 2, a: [3], b: { y: 4 } }),
  };

  const match = Case.matchOutput({ x: 2, a: [3], b: { y: 4 } }, ex);
  expect(match).toBeTruthy();

  const mismatchProperty = Case.matchOutput({ x: 0, a: [3], b: { y: 4 } }, ex);
  expect(mismatchProperty).toBeFalsy();

  const mismatchArrayValue = Case.matchOutput(
    { x: 2, a: [0], b: { y: 4 } },
    ex
  );
  expect(mismatchArrayValue).toBeFalsy();

  const mismatchObjectValue = Case.matchOutput(
    { x: 2, a: [3], b: { y: 0 } },
    ex
  );
  expect(mismatchObjectValue).toBeFalsy();
});
