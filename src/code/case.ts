import { Box } from "code/box";
import deepEqual from "deep-equal";

export type Case = {
  inputs: Box[];
  output: Box;
  visibility?: "visible" | "discoverable";
};

function matchOutput(output: any, ex: Case): boolean {
  const a = Box.deepUnbox(output);
  const b = Box.deepUnbox(ex.output);
  return deepEqual(a, b, { strict: false });
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Case = Object.freeze({
  matchOutput,
});
