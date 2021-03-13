import { RoundGenerator } from "game/generate";
import { Difficulty, Round } from "game/types";
import { randomInt, range, rangeCases, sample } from "round_types/utils";
import { createPlainCaseGridGraphics } from "ui/puzzle_graphics/graphics";

// TODO Mods
const average = (): Round => ({
  time: 30,
  suite: {
    funcName: "average",
    inputNames: ["a"],
    cases: rangeCases(0, 14, () => {
      const array = sample(randomInt(1, 4), range(-10, 100));

      return {
        inputs: [array],
        output: array.reduce((sum, v) => sum + v) / array.length,
      };
    }),
  },
  Graphics: createPlainCaseGridGraphics(3),
});

export const createAverage: RoundGenerator = {
  minDifficulty: Difficulty.Easy,
  maxDifficulty: Difficulty.Medium,
  weight: 1,
  create: (difficulty: Difficulty) => ({
    fn: average,
    params: [],
  }),
};
