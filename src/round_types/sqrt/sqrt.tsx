import { RoundGenerator } from "game/generate";
import { Difficulty, Round } from "game/types";
import { modBanStaticMethod } from "mods/ban_method/ban_method";
import { modBanOperation } from "mods/ban_operation/ban_operation";
import { range, sample } from "round_types/utils";
import { createPlainCaseGridGraphics } from "ui/puzzle_graphics/graphics";

const sqrt = (
  withMaxRange: boolean,
  withImperfectSquares: boolean,
  noMathSqrt: boolean,
  noExponentiation: boolean
): Round => ({
  time:
    20 +
    Number(withMaxRange) * 60 +
    Number(withImperfectSquares) * 100 +
    Number(noMathSqrt) * 20 +
    Number(noExponentiation) * 10 +
    Number(noMathSqrt && noExponentiation) * 30,
  suite: {
    funcName: "sqrt",
    inputNames: ["n"],
    cases: getNumbers(20, withMaxRange)
      .map((i) => (withImperfectSquares ? Math.sqrt(i) : Math.ceil(i)))
      .filter(mapUnique)
      .map((root) => ({
        inputs: [root ** 2],
        output: root,
      })),
  },
  mods: [
    ...(noMathSqrt ? [modBanStaticMethod("Math", "sqrt")] : []),
    ...(noExponentiation ? [modBanOperation("**")] : []),
  ],
  Graphics: createPlainCaseGridGraphics(3, withMaxRange ? 1 : 3),
});

export const createSqrt: RoundGenerator = {
  minDifficulty: Difficulty.Easy,
  weight: 1,
  create: (difficulty: Difficulty) => ({
    fn: sqrt,
    params: [
      (difficulty >= Difficulty.Medium && Math.random() < 0.5) ||
        difficulty >= Difficulty.Hard,
      difficulty >= Difficulty.Hard,
      Math.random() < 0.95 || difficulty >= Difficulty.Medium,
      Math.random() < 0.8 || difficulty >= Difficulty.Hard,
    ],
  }),
};

function getNumbers(count: number, withMaxRange: boolean): number[] {
  if (withMaxRange) {
    const highCount = Math.floor(count * 0.9);
    const lowCount = count - highCount;

    const highs = Array.from({ length: highCount }, () =>
      Math.floor(Math.random() * Math.sqrt(Number.MAX_SAFE_INTEGER))
    );

    const lows = Array.from({ length: lowCount }, Math.random);

    return [...highs, ...lows];
  } else {
    return sample(count, range(0, 100));
  }
}

const mapUnique = (value: any, index: number, array: any[]) =>
  array.indexOf(value) === index;
