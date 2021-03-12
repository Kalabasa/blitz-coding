import { RoundGenerator } from "game/generate";
import { Difficulty, Round } from "game/types";
import { rangeCases } from "round_types/utils";
import { createPlainCaseGridGraphics } from "ui/puzzle_graphics/graphics";

const convert24HourTo12 = (): Round => ({
  time: 60,
  suite: {
    funcName: "to12Hour",
    inputNames: ["n"],
    cases: rangeCases(0, 23, (i) => {
      const t24 = i;
      const t12 = (t24 % 12 || 12) + (t24 < 12 ? "am" : "pm");
      return {
        inputs: [t24],
        output: t12,
      };
    }),
  },
  Graphics: createPlainCaseGridGraphics(3, 2),
});

export const create24To12: RoundGenerator = {
  minDifficulty: Difficulty.Easy,
  maxDifficulty: Difficulty.Medium,
  weight: 1,
  create: (difficulty: Difficulty) => ({
    fn: convert24HourTo12,
    params: [],
  }),
};
