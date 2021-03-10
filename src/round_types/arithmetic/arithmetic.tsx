import { RoundGenerator } from "game/generate";
import { Difficulty, Round } from "game/types";
import { modBanOperation } from "mods/ban_operation/ban_operation";
import { pick, randomInt, rangeCases } from "round_types/utils";
import { createPlainCaseGridGraphics } from "ui/puzzle_graphics/graphics";

type Operation = {
  name: string;
  symbol: string;
  impl: (a: number, b: number) => number;
};

const arithmetic = (
  operation: Operation,
  withNonIntegers: boolean,
  withNegatives: boolean,
  noNativeOperation: boolean
): Round => ({
  time: 20 + (noNativeOperation ? 40 : 0),
  suite: {
    funcName: operation.name,
    inputNames: ["a", "b"],
    cases: rangeCases(0, 30, (i) => {
      const low = operation === divide || operation === remainder ? 1 : 0;
      const high = 9;

      let a = i < 1 ? randomInt(1, high) : randomInt(low, high);
      let b = i < 1 ? low : randomInt(low, high);

      if (withNonIntegers && i % 2 === 1) {
        a = Math.floor(10 * (a + Math.random())) / 10;
        b = Math.floor(10 * (b + Math.random())) / 10;
      }

      if (withNegatives && i % 5 === 0) {
        if (Math.random() < 0.2) {
          a *= -1;
          b *= -1;
        } else if (Math.random() < 0.5) {
          a *= -1;
        } else {
          b *= -1;
        }
      }

      return {
        inputs: [a, b],
        output: operation.impl(a, b),
      };
    }),
  },
  mods: noNativeOperation ? [modBanOperation(operation.symbol)] : [],
  Graphics: createPlainCaseGridGraphics(3, 2),
});

export const createArithmetic: RoundGenerator = {
  minDifficulty: Difficulty.Easy,
  maxDifficulty: Difficulty.Hard,
  weight: 4,
  create: (difficulty: Difficulty) => ({
    fn: arithmetic,
    params: [
      difficulty <= Difficulty.Easy
        ? pick([add, subtract, multiply])
        : difficulty <= Difficulty.Medium
        ? pick([add, subtract, multiply, remainder])
        : pick([add, subtract, multiply, divide, remainder]),
      difficulty >= Difficulty.Medium,
      difficulty >= Difficulty.Hard,
      difficulty >= Difficulty.Medium || Math.random() < 0.4,
    ],
  }),
};

const add: Operation = {
  name: "add",
  symbol: "+",
  impl: (a, b) => a + b,
};

const subtract: Operation = {
  name: "subtract",
  symbol: "-",
  impl: (a, b) => a - b,
};

const multiply: Operation = {
  name: "multiply",
  symbol: "*",
  impl: (a, b) => a * b,
};

const divide: Operation = {
  name: "divide",
  symbol: "/",
  impl: (a, b) => a / b,
};

const remainder: Operation = {
  name: "remainder",
  symbol: "%",
  impl: (a, b) => a % b,
};
