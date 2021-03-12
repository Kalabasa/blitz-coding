import { RoundGenerator } from "game/generate";
import { Difficulty, Round } from "game/types";
import { modBanMethod } from "mods/ban_method/ban_method";
import { modBanOperation } from "mods/ban_operation/ban_operation";
import {
  pick,
  randomInt,
  range,
  rangeCases,
  sample,
  shuffle
} from "round_types/utils";
import { createPlainCaseGridGraphics } from "ui/puzzle_graphics/graphics";

const countOccurences = (
  withSpecial: boolean,
  noAdd: boolean,
  noMaps: boolean
): Round => ({
  time: 30 + (noAdd ? 30 : 0),
  suite: {
    funcName: "count",
    inputNames: ["x", "a"],
    cases: rangeCases(0, 20, (i) => {
      const pool: any[] = withSpecial && i < 5 ? specialPool : elementPool;

      const occurences = randomInt(0, 3);
      const value = pick(pool);
      const arr: any[] = sample(
        3 - occurences,
        pool.filter((v) => v !== value && !Number.isNaN(v) && !Number.isNaN(v)),
        false
      );

      for (let i = 0; i < occurences; i++) {
        arr.push(value);
      }
      shuffle(arr);

      return {
        inputs: [value, arr],
        output: occurences,
      };
    }),
  },
  mods: [
    ...(noAdd ? [modBanOperation("+", "-")] : []),
    ...(noMaps
      ? [modBanMethod("Array", "filter"), modBanMethod("Array", "reduce")]
      : []),
  ],
  Graphics: createPlainCaseGridGraphics(3, 1),
});

export const createCountOccurences: RoundGenerator = {
  minDifficulty: Difficulty.Easy,
  weight: 1,
  create: (difficulty: Difficulty) => ({
    fn: countOccurences,
    params: [
      difficulty >= Difficulty.Impossible,
      (difficulty >= Difficulty.Medium && Math.random() < 0.5) ||
        difficulty >= Difficulty.Hard,
      difficulty >= Difficulty.Hard,
    ],
  }),
};

const elementPool = [...range(1, 9), ..."abcdefghijklmnopqrstuvwxyz"];
const specialPool = [NaN, undefined, null];
