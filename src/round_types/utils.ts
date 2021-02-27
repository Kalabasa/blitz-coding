import { Box } from "code/box";
import { Case } from "code/case";
import { Run, Suite } from "code/run";

export function range(min: number, max: number): number[] {
  return Array.from({ length: max - min + 1 }, (_, i) => min + i);
}

export function rangeCases(
  min: number,
  max: number,
  makeCase: (n: number) => { inputs: unknown[]; output: unknown }
): Case[] {
  return Array.from({ length: max - min + 1 }, (_, i) => min + i)
    .map(makeCase)
    .map(boxCase);
}

export function boxCase(unboxedCase: { inputs: unknown[]; output: unknown }) {
  const { inputs, output, ...rest } = unboxedCase;

  return {
    ...rest,
    inputs: Box.arrayValues(inputs),
    output: Box.value(output),
  };
}

export function runOutcome(run?: Run): "success" | "failure" | undefined {
  return run === undefined ? undefined : run.match ? "success" : "failure";
}

// returns: range[0, 1]
function inputValueSortOrder(value: Box) {
  const p = value.valueOf();

  if (typeof p === "boolean") {
    return p ? 1 : 0.5;
  }

  if (typeof p === "number") {
    return p > 0 ? 1 / p : 0.01 / (1 - p);
  }

  if (typeof p === "string") {
    return 1 / (1 + p.length);
  }

  return 0;
}

function caseSortOrder(example: Case, run?: Run) {
  let order = 0;

  if (!example.visibility || example.visibility === "visible") order += 10;

  if (run?.match === false) order += 100;

  order +=
    example.inputs.reduce((acc, value) => acc + inputValueSortOrder(value), 0) /
    example.inputs.length;

  return order;
}

const orderKey = Symbol("order");

export function getVisibleRuns(
  stableCount: number,
  suite: Suite,
  runs?: Run[]
): { example: Case; run?: Run }[] {
  const items = [...suite.cases].map((c, i) => ({
    example: c,
    run: runs?.[i],
  }));

  const stableItems = items
    .map((obj) => ({
      ...obj,
      [orderKey]: caseSortOrder(obj.example),
    }))
    .sort((a, b) => b[orderKey] - a[orderKey])
    .slice(0, stableCount);

  const dynamicItems = items
    .filter((item) => !stableItems.some((si) => si.example === item.example))
    .map((obj) => ({
      ...obj,
      [orderKey]: caseSortOrder(obj.example, obj.run),
    }))
    .sort((a, b) => b[orderKey] - a[orderKey]);

  return stableItems.concat(dynamicItems);
}
