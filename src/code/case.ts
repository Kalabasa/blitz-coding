import { Box } from "code/box";
import deepEqual from "deep-equal";

export type Case = {
  inputs: Box[];
  output: Box;
  visibility?: "visible" | "discoverable";
};

function matchOutput(output: any, ex: Case): boolean {
  return deepEqual(output?.valueOf(), ex.output?.valueOf(), { strict: false });
}

export const Case = Object.freeze({
  matchOutput,
});
