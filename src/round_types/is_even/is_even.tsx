import { RoundGenerator } from "game/generate";
import { Difficulty, Round } from "game/types";
import { modBanOperation } from "mod_types/ban_operation/ban_operation";
import { boxCase, range } from "round_types/utils";
import seedrandom from "seedrandom";
import { createPlainCaseGridGraphics } from "ui/puzzle_graphics/graphics";

const isEven = (inverted: boolean, noModulo: boolean): Round => ({
  points: 1,
  time: 15 + (noModulo ? 45 : 0),
  suite: {
    funcName: inverted ? "isOdd" : "isEven",
    inputNames: ["n"],
    cases: range(-15, 25)
      .map((i) => (i <= 6 ? i : (i - 4) * i))
      .map((i) => ({
        inputs: [i],
        output: inverted ? i % 2 !== 0 : i % 2 === 0,
        visibility: i > 0 ? "visible" : "discoverable",
      }))
      .map(boxCase),
  },
  mods: noModulo ? [modBanOperation("%")] : [],
  Graphics: createPlainCaseGridGraphics(3, 2),
});

export const createIsEven: RoundGenerator = {
  minDifficulty: Difficulty.Easy,
  maxDifficulty: Difficulty.Easy,
  weight: 1,
  create: (difficulty: Difficulty, seed: string) => {
    const random = seedrandom(seed);
    return {
      fn: isEven,
      params: [random() < 0.1, difficulty > Difficulty.Easy && random() < 0.9],
    };
  },
};
