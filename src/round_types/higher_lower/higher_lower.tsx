import { RoundGenerator } from "game/generate";
import { Difficulty, Round } from "game/types";
import { modText } from "mods/mod_fake/mod_fake";
import {
  formattedFunction,
  formatValueText,
  limitCalls,
  randomInt,
  rangeCases,
} from "round_types/utils";
import { createPlainCaseGridGraphics } from "ui/puzzle_graphics/graphics";

const higherLower = (
  forceLogSearch: boolean,
  withNonIntegers: boolean
): Round => {
  const low = -100;
  const high = 100;
  const logLimit = Math.ceil((2.5 * Math.log2(high - low)) / 10) * 10;

  return {
    time: 200 + (withNonIntegers ? 100 : 0),
    suite: {
      funcName: "guess",
      inputNames: ["higher", "lower"],
      cases: rangeCases(0, 20, (i) => {
        let n = randomInt(low, high);
        if (n < 0 && Math.random() < 0.8) n = -n;

        if (withNonIntegers) {
          n += Math.floor(Math.random() * 10) / 10;
          if (i < 1) n += Math.E;
        }

        let higher = (guess: number) => guess > n;
        let lower = (guess: number) => guess < n;

        if (forceLogSearch) {
          higher = limitCalls(higher, logLimit);
          lower = limitCalls(lower, logLimit);
        }

        const formattedN = formatValueText(n);
        higher = formattedFunction(higher, `n => n > ${formattedN}`);
        lower = formattedFunction(lower, `n => n < ${formattedN}`);

        return {
          inputs: [higher, lower],
          output: n,
          visibility: n > 0 ? "visible" : "discoverable",
        };
      }),
    },
    mods: forceLogSearch
      ? [
          modText("limit_function_calls", ["'higher'", logLimit.toString()]),
          modText("limit_function_calls", ["'lower'", logLimit.toString()]),
        ]
      : [],
    Graphics: createPlainCaseGridGraphics(3, 1),
  };
};

export const createHigherLower: RoundGenerator = {
  minDifficulty: Difficulty.Medium,
  weight: 1,
  create: (difficulty: Difficulty) => ({
    fn: higherLower,
    params: [
      difficulty >= Difficulty.Hard,
      difficulty >= Difficulty.Impossible,
    ],
  }),
};
