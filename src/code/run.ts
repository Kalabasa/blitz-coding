import { Case } from "code/case";

export type Run = {
  example: Case;
  output: any;
  match: boolean;
};

export type Suite = {
  funcName: string;
  inputNames: string[];
  cases: Case[];
};

export type AsyncFunction = (...any: any[]) => Promise<any>;

function runCases(fn: AsyncFunction, cases: Case[]): Promise<Run[]> {
  return Promise.all(cases.map((ex) => runCase(fn, ex)));
}

async function runCase(fn: AsyncFunction, example: Case): Promise<Run> {
  const output = await fn(...example.inputs);

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
