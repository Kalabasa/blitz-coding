import memoize from "fast-memoize";
import { RoundGenerator } from "game/generate";
import { Difficulty } from "game/types";
import { rangeCases } from "round_types/utils";
import seedrandom from "seedrandom";
import { GraphicsProps } from "ui/puzzle_graphics/graphics";
import { Sequence } from "ui/puzzle_graphics/sequence/sequence";

const fibonacciSequence = () => ({
  points: 3,
  time: 60,
  suite: {
    funcName: "fib",
    inputNames: ["n"],
    cases: rangeCases(1, 20, (i) => ({
      inputs: [i],
      output: fib(i),
    })),
  },
  Graphics,
});

const Graphics = ({ suite, runs }: GraphicsProps) => (
  <Sequence length={6} suite={suite} runs={runs} />
);

export const createFibonacciSequence: RoundGenerator = {
  minDifficulty: Difficulty.Medium,
  maxDifficulty: Difficulty.Hard,
  weight: 1,
  create: (difficulty: Difficulty, seed: string) => {
    const random = seedrandom(seed);
    return {
      fn: fibonacciSequence,
      params: [],
    };
  },
};

const fib: (n: number) => number = memoize((n: number) => {
  if (n <= 0) return 0;
  if (n <= 2) return 1;
  return fib(n - 1) + fib(n - 2);
});
