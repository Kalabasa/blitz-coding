import { RoundGenerator } from "game/generate";
import { Difficulty, Round } from "game/types";
import { modBanLoops } from "mods/ban_loops/ban_loops";
import { randomInt, range, rangeCases } from "round_types/utils";
import { createPlainCaseGridGraphics } from "ui/puzzle_graphics/graphics";

const getRange = (
  noArray: boolean,
  noLoops: boolean,
  withDescending: boolean
): Round => ({
  time: 30,
  suite: {
    funcName: "range",
    inputNames: ["x", "y"],
    cases: rangeCases(0, 15, (i) => {
      const min = randomInt(-10, 10);
      const max = min + randomInt(0, 10);

      const bounds = [min, max];
      const sequence = range(min, max);

      const descendingNow = i < 5 && withDescending;
      if (descendingNow) {
        bounds.reverse();
        sequence.reverse();
      }

      return {
        inputs: bounds,
        output: sequence,
        visibility: min > 0 ? "visible" : "discoverable",
      };
    }),
  },
  mods: [
    ...(noArray ? [{ code: "/*icon:change*/ Array = null" }] : []),
    ...(noLoops ? [modBanLoops()] : []),
  ],
  Graphics: createPlainCaseGridGraphics(3, 1),
});

export const createRange: RoundGenerator = {
  minDifficulty: Difficulty.Easy,
  maxDifficulty: Difficulty.Hard,
  weight: 1,
  create: (difficulty: Difficulty) => ({
    fn: getRange,
    params: [
      difficulty >= Difficulty.Hard && Math.random() < 0.5,
      difficulty >= Difficulty.Medium && Math.random() < 0.5,
      difficulty >= Difficulty.Hard,
    ],
  }),
};
