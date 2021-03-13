import { RoundGenerator } from "game/generate";
import { Difficulty, Round } from "game/types";
import { pick, randomInt, range } from "round_types/utils";
import { createPlainCaseGridGraphics } from "ui/puzzle_graphics/graphics";

const bars = "▁▂▃▄▅▆▇█";

const sparkline = (quantization: number, provideBars: boolean): Round => ({
  time: 200 + Math.floor(Math.log10(quantization)) * 10,
  suite: {
    funcName: "sparklineChart",
    inputNames: ["a"],
    cases: [
      ...illustrativeData,
      ...range(0, 10).map(() => generateData(randomInt(4, 10))),
    ]
      .map((data) =>
        data.map((x) => Math.round(x * quantization) / quantization)
      )
      .map((data) => ({
        inputs: [data],
        output: generateSparkline(data),
      })),
  },
  mods: provideBars ? [{ code: "/*icon:add*/ var bars = '" + bars + "'" }] : [],
  Graphics: createPlainCaseGridGraphics(3, 1),
});

export const createSparkline: RoundGenerator = {
  minDifficulty: Difficulty.Medium,
  weight: 1,
  create: (difficulty: Difficulty) => ({
    fn: sparkline,
    params: [
      difficulty <= Difficulty.Medium
        ? 1
        : difficulty <= Difficulty.Hard
        ? 5
        : 100,
      difficulty <= Difficulty.Easy ||
        (difficulty <= Difficulty.Medium && Math.random() < 0.8),
    ],
  }),
};

function generateSparkline(data: number[]): string {
  const min = Math.min(...data);
  const max = Math.max(...data);
  return data
    .map((x) => (x - min) / (max - min))
    .map((x) => bars[Math.floor((bars.length - 1) * x)])
    .join("");
}

const illustrativeData = [
  [100, 50, 0],
  [0, 0.5, 1, 3, 4, 6, 6.5, 7],
];

function generateData(length: number) {
  const offset = Math.floor(Math.random() * 6);
  const multiplier = 0.5 + Math.random() * 20;
  return pick([generateNoiseData, generateRandomData, generateSinusoidalData])(
    length
  ).map((x) => offset + x * multiplier);
}

function generateNoiseData(length: number) {
  return Array.from(
    { length },
    (_, i) =>
      2 +
      Math.sin(0.1 * i) +
      0.5 * Math.sin(0.2 * i) +
      0.25 * Math.sin(0.3 * i) +
      0.125 * Math.sin(0.4 * i)
  );
}

function generateRandomData(length: number) {
  return Array.from({ length }, Math.random);
}

function generateSinusoidalData(length: number) {
  return Array.from({ length }, (_, i) => 1 + Math.sin(i));
}
