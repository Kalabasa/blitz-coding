import { RoundGenerator } from "game/generate";
import { Difficulty, Round } from "game/types";
import { createModLimitCalls } from "mods/limit_calls/limit_calls";
import { modFake } from "mods/mod_fake/mod_fake";
import {
  formattedFunction,
  formatValueText,
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

  const {
    modLimitCalls: modLimitHigher,
    limitCalls: limitHigherCalls,
  } = createModLimitCalls("higher", logLimit);
  const {
    modLimitCalls: modLimitLower,
    limitCalls: limitLowerCalls,
  } = createModLimitCalls("lower", logLimit);

  return {
    time: 200 + Number(withNonIntegers) * 100,
    suite: {
      funcName: "playGuessTheNumber",
      inputNames: ["higher", "lower"],
      cases: rangeCases(0, 14, (i) => {
        let n = randomInt(low, high);
        if (n < 0 && Math.random() < 0.8) n = -n;

        if (withNonIntegers) {
          n += Math.floor(Math.random() * 10) / 10;
          if (i < 1) n += Math.E;
        }

        let higher = (guess: number) => guess > n;
        let lower = (guess: number) => guess < n;

        if (forceLogSearch) {
          higher = limitHigherCalls(higher, logLimit);
          lower = limitLowerCalls(lower, logLimit);
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
    mods: forceLogSearch ? [modLimitHigher, modLimitLower] : [],
    Graphics: createPlainCaseGridGraphics(3, 1),
  };
};

export const createHigherLower: RoundGenerator = {
  minDifficulty: Difficulty.Medium,
  weight: 1,
  create: (difficulty: Difficulty) => ({
    fn: higherLower,
    params: [
      Math.random() < 0.2 || difficulty >= Difficulty.Hard,
      difficulty >= Difficulty.Impossible,
    ],
  }),
};
