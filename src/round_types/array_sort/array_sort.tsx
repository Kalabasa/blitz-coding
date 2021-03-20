import { RoundGenerator } from "game/generate";
import { Difficulty, Round } from "game/types";
import { modBanMethod } from "mods/ban_method/ban_method";
import {
  randomInt,
  range,
  rangeCases,
  sample,
  shuffle,
} from "round_types/utils";
import { createPlainCaseGridGraphics } from "ui/puzzle_graphics/graphics";

const sortArray = (
  numeric: boolean,
  noNativeSort: boolean,
  stringSort: boolean
): Round => ({
  time: 30 + Number(noNativeSort) * 90,
  suite: {
    funcName: "sort",
    inputNames: ["a"],
    cases: rangeCases(0, 14, (i) => {
      const array = numeric
        ? i < 5
          ? shuffle([
              ...sample(2, range(5, 9)),
              randomInt(10, 40),
              ...sample(2, range(1, 100)),
            ])
          : sample(5, range(1, 100))
        : sample(5, [
            ..."abcdefghijklmnopqrstuvwxyz".split(""),
            "aa",
            "ab",
            "bb",
          ]);

      const compare = stringSort
        ? undefined
        : (a: any, b: any) => (a < b ? -1 : a > b ? 1 : 0);

      return {
        inputs: [array],
        output: [...array].sort(compare),
      };
    }),
  },
  mods: noNativeSort ? [modBanMethod("Array", "sort")] : [],
  Graphics: /*TODO arraymanipulationgraphics*/ createPlainCaseGridGraphics(3),
});

export const createSortArray: RoundGenerator = {
  minDifficulty: Difficulty.Medium,
  weight: 1,
  create: (difficulty: Difficulty) => ({
    fn: sortArray,
    params: [
      Math.random() < 0.5 || difficulty >= Difficulty.Impossible,
      difficulty >= Difficulty.Medium,
      (difficulty >= Difficulty.Hard && Math.random() < 0.2) ||
        difficulty >= Difficulty.Impossible,
    ],
  }),
};
