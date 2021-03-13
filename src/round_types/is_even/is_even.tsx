import { RoundGenerator } from "game/generate";
import { Difficulty, Round } from "game/types";
import { modBanOperation } from "mods/ban_operation/ban_operation";
import { range } from "round_types/utils";
import { createPlainCaseGridGraphics } from "ui/puzzle_graphics/graphics";

const isEven = (
  inverted: boolean,
  withNegatives: boolean,
  noModulo: boolean
): Round => ({
  time: 20 + Number(noModulo) * 20,
  suite: {
    funcName: inverted ? "isOdd" : "isEven",
    inputNames: ["n"],
    cases: range(withNegatives ? -15 : 0, 15)
      .map((i) => (i <= 6 ? i : (i - 4) * i))
      .map((i) => ({
        inputs: [i],
        output: inverted ? i % 2 !== 0 : i % 2 === 0,
        visibility: i > 0 ? "visible" : "discoverable",
      })),
  },
  mods: noModulo ? [modBanOperation("%")] : [],
  Graphics: createPlainCaseGridGraphics(3, 2),
});

export const createIsEven: RoundGenerator = {
  minDifficulty: Difficulty.Easy,
  maxDifficulty: Difficulty.Hard,
  weight: 1,
  create: (difficulty: Difficulty) => ({
    fn: isEven,
    params: [
      Math.random() < 0.1 ||
        (difficulty >= Difficulty.Medium && Math.random() < 0.4),
      difficulty >= Difficulty.Medium,
      difficulty > Difficulty.Easy && Math.random() < 0.9,
    ],
  }),
};
