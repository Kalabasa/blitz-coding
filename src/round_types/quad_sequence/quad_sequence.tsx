import { RoundGenerator } from "game/generate";
import { Difficulty } from "game/types";
import { rangeCases } from "round_types/utils";
import seedrandom from "seedrandom";
import { GraphicsProps } from "ui/puzzle_graphics/graphics";
import { Sequence } from "ui/puzzle_graphics/sequence/sequence";

const quadSequence = (a: number, b: number, c: number) => ({
  points: 2,
  time: 30,
  suite: {
    funcName: "seq",
    inputNames: ["n"],
    cases: rangeCases(1, 20, (i) => ({
      inputs: [i],
      output: a * i * i + b * i + c,
    })),
  },
  Graphics,
});

const Graphics = ({ suite, runs }: GraphicsProps) => (
  <Sequence length={6} suite={suite} runs={runs} />
);

export const createQuadSequence: RoundGenerator = {
  minDifficulty: Difficulty.Easy,
  weight: 1,
  create: (difficulty: Difficulty, seed: string) => {
    const random = seedrandom(seed);
    return {
      fn: quadSequence,
      params: [
        difficulty >= Difficulty.Hard ? Math.floor(random() * 2) : 0,
        (1 + Math.floor(random() * 20)) *
          (difficulty <= Difficulty.Easy ? 1 : random() < 0.7 ? -1 : 1),
        difficulty >= Difficulty.Medium
          ? (50 + Math.floor(random() * 100)) * (random() < 0.5 ? -1 : 1)
          : Math.floor(Math.pow(random(), 3) * 10),
      ],
    };
  },
};
