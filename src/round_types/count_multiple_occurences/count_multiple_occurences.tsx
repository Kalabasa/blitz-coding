import { RoundGenerator } from "game/generate";
import { Difficulty, Round } from "game/types";
import { modBanOperation } from "mods/ban_operation/ban_operation";
import {
  randomInt,
  range,
  rangeCases,
  sample,
  shuffle
} from "round_types/utils";
import { createPlainCaseGridGraphics } from "ui/puzzle_graphics/graphics";

const countMultiOccurences = (withSpecial: boolean, noAdd: boolean): Round => ({
  time: 60 + (noAdd ? 30 : 0),
  suite: {
    funcName: "counts",
    inputNames: ["a"],
    cases: rangeCases(0, 20, (i) => {
      const pool: any[] =
        withSpecial && i < 10
          ? [...specialPool, ...sample(4, elementPool)]
          : elementPool;

      const uniques = randomInt(1, 4);
      const values = sample(uniques, pool);
      const occurences = values.map((v) => [v, randomInt(1, 5 - uniques)]);

      const arr = occurences.reduce(
        (acc, [v, n]) => [...acc, ...Array.from({ length: n }, () => v)],
        []
      );
      shuffle(arr);

      return {
        inputs: [arr],
        output: Object.fromEntries(occurences),
      };
    }),
  },
  mods: [...(noAdd ? [modBanOperation("+", "-")] : [])],
  Graphics: createPlainCaseGridGraphics(3, 1),
});

export const createCountMultiOccurences: RoundGenerator = {
  minDifficulty: Difficulty.Medium,
  weight: 1,
  create: (difficulty: Difficulty) => ({
    fn: countMultiOccurences,
    params: [
      difficulty >= Difficulty.Impossible,
      (difficulty >= Difficulty.Medium && Math.random() < 0.1) ||
        difficulty >= Difficulty.Hard,
    ],
  }),
};

const elementPool = [...range(1, 9), ..."abcdefghijklmnopqrstuvwxyz"];
const specialPool = [NaN, undefined, null];
