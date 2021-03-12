import memoize from "fast-memoize";
import { RoundGenerator } from "game/generate";
import { Difficulty, Round } from "game/types";
import { modBanOperation } from "mods/ban_operation/ban_operation";
import { rangeCases } from "round_types/utils";
import { GraphicsProps } from "ui/puzzle_graphics/graphics";
import { Sequence } from "ui/puzzle_graphics/sequence/sequence";

const factorial = (noMultiply: boolean): Round => ({
  time: 30 + (noMultiply ? 100 : 0),
  suite: {
    funcName: "factorial",
    inputNames: ["n"],
    cases: rangeCases(1, 20, (i) => ({
      inputs: [i],
      output: fac(i),
    })),
  },
  mods: noMultiply ? [modBanOperation("*")] : [],
  Graphics,
});

const Graphics = ({ suite, runs }: GraphicsProps) => (
  <Sequence length={6} suite={suite} runs={runs} />
);

export const createFactorial: RoundGenerator = {
  minDifficulty: Difficulty.Medium,
  weight: 1,
  create: (difficulty: Difficulty) => ({
    fn: factorial,
    params: [
      (difficulty >= Difficulty.Hard && Math.random() < 0.5) ||
        difficulty >= Difficulty.Impossible,
    ],
  }),
};

const fac: (n: number) => number = memoize((n: number) => {
  if (n <= 0) return 0;
  if (n <= 1) return 1;
  return n * fac(n - 1);
});
