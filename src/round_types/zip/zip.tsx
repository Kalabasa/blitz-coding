import { RoundGenerator } from "game/generate";
import { Difficulty, Round } from "game/types";
import { modBanLoops } from "mods/ban_loops/ban_loops";
import { rangeCases, sample } from "round_types/utils";
import { words } from "round_types/words";
import { createPlainCaseGridGraphics } from "ui/puzzle_graphics/graphics";

const zip = (noLoops: boolean): Round => ({
  time: 60,
  suite: {
    funcName: "zip",
    inputNames: ["s", "t"],
    cases: rangeCases(0, 14, (i) => {
      const [s, t] = sample(2, words);
      return {
        inputs: [s, t],
        output: realZip(s, t),
      };
    }),
  },
  mods: noLoops ? [modBanLoops()] : [],
  Graphics: createPlainCaseGridGraphics(2, 2),
});

export const createZip: RoundGenerator = {
  minDifficulty: Difficulty.Medium,
  weight: 1,
  create: (difficulty: Difficulty) => ({
    fn: zip,
    params: [
      (difficulty >= Difficulty.Medium && Math.random() < 0.5) ||
        difficulty >= Difficulty.Hard,
    ],
  }),
};

function realZip(a: string, b: string): string {
  const x = [...a];
  const y = [...b];
  const z = [];

  let i = 0;
  while (z.length < x.length + y.length) {
    if (i < x.length && i < y.length) {
      z.push(x[i]);
      z.push(y[i]);
    } else if (i < x.length) {
      z.push(x[i]);
    } else if (i < y.length) {
      z.push(y[i]);
    }
    i++;
  }

  return z.join("");
}
