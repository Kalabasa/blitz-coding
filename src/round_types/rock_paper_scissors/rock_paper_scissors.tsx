import { RoundGenerator } from "game/generate";
import { Difficulty, Round } from "game/types";
import { rangeCases } from "round_types/utils";
import { createPlainCaseGridGraphics } from "ui/puzzle_graphics/graphics";

const rockPaperScissors = (): Round => ({
  time: 30,
  suite: {
    funcName: "rockPaperScissors",
    inputNames: ["s"],
    cases: rangeCases(0, 2, (i) => {
      const opponent = ["rock", "paper", "scissors"][i];
      const answer = ["paper", "scissors", "rock"][i];
      return {
        inputs: [opponent],
        output: answer,
      };
    }),
  },
  Graphics: createPlainCaseGridGraphics(3, 1),
});

export const createRockPaperScissors: RoundGenerator = {
  minDifficulty: Difficulty.Easy,
  maxDifficulty: Difficulty.Medium,
  weight: 1,
  create: (difficulty: Difficulty) => ({
    fn: rockPaperScissors,
    params: [],
  }),
};
