import { Box } from "code/box";
import { RoundGenerator } from "game/generate";
import { Difficulty, Round } from "game/types";
import { modBanMethod } from "mods/ban_method/ban_method";
import {
  range,
  rangeCases,
  RoundTypeUtil,
  sample,
  shuffle,
} from "round_types/utils";
import seedrandom from "seedrandom";
import { createPlainCaseGridGraphics } from "ui/puzzle_graphics/graphics";

const sortArray = (
  numeric: boolean,
  noNativeSort: boolean,
  stringSort: boolean
): Round => ({
  points: 1,
  time: 30 + (noNativeSort ? 90 : 0),
  suite: {
    funcName: "sort",
    inputNames: ["a"],
    cases: rangeCases(0, 20, (i) => {
      const array = numeric
        ? i < 5
          ? shuffle([
              ...sample(2, range(5, 9)),
              Math.floor(10 + Math.random() * 40),
              ...sample(2, range(1, 100)),
            ])
          : sample(5, range(1, 100))
        : sample(5, [
            ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
            "AA",
            "AB",
            "BB",
          ]);

      const compare = stringSort
        ? undefined
        : (a: any, b: any) => (a < b ? -1 : a > b ? 1 : 0);

      return {
        inputs: [Box.arrayValues(array)],
        output: Box.arrayValues([...array].sort(compare)),
      };
    }).map(RoundTypeUtil.boxCase),
  },
  mods: noNativeSort ? [modBanMethod("Array", "sort")] : [],
  Graphics: /*TODO arraymanipulationgraphics*/ createPlainCaseGridGraphics(3),
});

export const createSortArray: RoundGenerator = {
  minDifficulty: Difficulty.Medium,
  weight: 1,
  create: (difficulty: Difficulty, seed: string) => {
    const random = seedrandom(seed);

    return {
      fn: sortArray,
      params: [
        random() < 0.5 ||
          (difficulty >= Difficulty.Medium &&
            difficulty < Difficulty.Impossible),
        (difficulty >= Difficulty.Medium && random() < 0.25) ||
          difficulty >= Difficulty.Hard,
        difficulty >= Difficulty.Impossible,
      ],
    };
  },
};
