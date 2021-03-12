import { RoundGenerator } from "game/generate";
import { Difficulty, Round } from "game/types";
import { modBanStaticMethod } from "mods/ban_method/ban_method";
import { modBanOperation } from "mods/ban_operation/ban_operation";
import { randomInt, rangeCases } from "round_types/utils";
import { createPlainCaseGridGraphics } from "ui/puzzle_graphics/graphics";

const power = (
  withNegativeExponents: boolean,
  withNonIntegers: boolean,
  noMathPow: boolean,
  noNativeOperation: boolean
): Round => ({
  time: 20 + (noMathPow && noNativeOperation ? 30 : 0),
  suite: {
    funcName: "power",
    inputNames: ["b", "e"],
    cases: rangeCases(0, 30, (i) => {
      const base = i < 1 ? 1 : randomInt(2, 9);
      let exponent =
        withNegativeExponents && i < 10 ? randomInt(-2, -1) : randomInt(0, 9);

      if (withNonIntegers) {
        exponent *= 0.9 + (Math.random() * 0.2 - 0.1);
      }

      return {
        inputs: [base, exponent],
        output: base ** exponent,
      };
    }),
  },
  mods: [
    ...(noMathPow ? [modBanStaticMethod("Math", "pow")] : []),
    ...(noNativeOperation ? [modBanOperation("**")] : []),
  ],
  Graphics: createPlainCaseGridGraphics(3, 2),
});

export const createPower: RoundGenerator = {
  minDifficulty: Difficulty.Easy,
  weight: 1,
  create: (difficulty: Difficulty) => ({
    fn: power,
    params: [
      difficulty >= Difficulty.Hard,
      difficulty >= Difficulty.Impossible,
      (difficulty >= Difficulty.Medium && Math.random() < 0.8) ||
        difficulty >= Difficulty.Hard,
      (difficulty >= Difficulty.Medium && Math.random() < 0.8) ||
        difficulty >= Difficulty.Hard,
    ],
  }),
};
