import { Box } from "code/box";
import { Case } from "code/case";
import { Run } from "code/run";

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
