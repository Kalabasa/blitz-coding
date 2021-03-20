import { RoundGenerator } from "game/generate";
import { Difficulty, Round } from "game/types";
import { randomInt, range, rangeCases, sample } from "round_types/utils";
import { createPlainCaseGridGraphics } from "ui/puzzle_graphics/graphics";

const listToArray = (): Round => ({
  time: 60,
  suite: {
    funcName: "listToArray",
    inputNames: ["head"],
    cases: rangeCases(1, 10, () => {
      const arr = sample(randomInt(2, 4), valuePool);
      const list = createList(arr);
      return {
        inputs: [list],
        output: arr,
      };
    }),
  },
  Graphics: createPlainCaseGridGraphics(2, 1),
});

export const createListToArray: RoundGenerator = {
  minDifficulty: Difficulty.Medium,
  maxDifficulty: Difficulty.Hard,
  weight: 1,
  create: (difficulty: Difficulty) => ({
    fn: listToArray,
    params: [],
  }),
};

const valuePool = range(1, 20);

type Node = { value: any; next: Node | null };

function createList(array: any[]): Node | null {
  if (!array.length) return null;

  return {
    value: array[0],
    next: createList(array.slice(1)),
  };
}
