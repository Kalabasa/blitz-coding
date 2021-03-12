import memoize from "fast-memoize";
import { RoundGenerator } from "game/generate";
import { Difficulty, Round } from "game/types";
import { modBanRecursion } from "mods/ban_recursion/ban_recursion";
import { rangeCases } from "round_types/utils";
import { GraphicsProps } from "ui/puzzle_graphics/graphics";
import { Sequence } from "ui/puzzle_graphics/sequence/sequence";

const fibonacciSequence = (noRecursion: boolean): Round => ({
  time: 40 + (noRecursion ? 40 : 0),
  suite: {
    funcName: "fibonacci",
    inputNames: ["n"],
    cases: rangeCases(1, 20, (i) => ({
      inputs: [i],
      output: fib(i),
    })),
  },
  mods: noRecursion ? [modBanRecursion("fibonacci")] : [],
  Graphics,
});

const Graphics = ({ suite, runs }: GraphicsProps) => (
  <Sequence length={6} suite={suite} runs={runs} />
);

export const createFibonacciSequence: RoundGenerator = {
  minDifficulty: Difficulty.Medium,
  weight: 1,
  create: (difficulty: Difficulty) => ({
    fn: fibonacciSequence,
    params: [difficulty >= Difficulty.Medium && Math.random() < 0.5],
  }),
};

const fib: (n: number) => number = memoize((n: number) => {
  if (n <= 0) return 0;
  if (n <= 2) return 1;
  return fib(n - 1) + fib(n - 2);
});
