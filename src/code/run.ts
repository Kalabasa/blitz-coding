import { Box } from "code/box";
import { Case } from "code/case";

export type Run = {
  example: Case;
  output: Box;
  match: boolean;
};

export type Suite = {
  funcName: string;
  inputNames: string[];
  cases: Case[];
};

function runCases(fn: Function, cases: Case[]): Run[] {
  return cases.map((ex) => runCase(fn, ex));
}

function runCase(fn: Function, example: Case): Run {
  const output = fn(...example.inputs.map(Box.unbox));

  return {
    example,
    output,
    match: Case.matchOutput(output, example),
  };
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Run = Object.freeze({
  cases: runCases,
});
