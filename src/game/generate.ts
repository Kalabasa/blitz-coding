import deepEqual from "deep-equal";
import { Difficulty, Round } from "game/types";
import { createArrayEquals } from "round_types/array_equals/array_equals";
import { createSortArray } from "round_types/array_sort/array_sort";
import { createFibonacciSequence } from "round_types/fibonacci/fibonacci";
import { createIsEven } from "round_types/is_even/is_even";
import { createQuadSequence } from "round_types/quad_sequence/quad_sequence";
import { createReverseString } from "round_types/string_reverse/string_reverse";

const allRoundGens: RoundGenerator[] = [
  createIsEven,
  createQuadSequence,
  createFibonacciSequence,
  createArrayEquals,
  createReverseString,
  createSortArray,
];

export type RoundType<P extends unknown[] = any[]> = {
  fn: (...params: P) => Round;
  params: P;
};

export type RoundGenerator = {
  minDifficulty: Difficulty;
  maxDifficulty?: Difficulty;
  weight: number;
  create: (difficulty: Difficulty, seed: string) => RoundType;
};

function generateRandomRounds(difficulty: Difficulty, count: number): Round[] {
  const roundGens = allRoundGens
    // .filter(
    //   (roundGen) =>
    //     difficulty >= roundGen.minDifficulty &&
    //     difficulty <= roundGen.maxDifficulty
    // )
    .map((roundGen) => ({ ...roundGen }));

  const types: RoundType[] = [];

  while (types.length < count) {
    const roundGen = pickRandom(roundGens);

    const seed = types.length.toString() + Date.now().toString();
    const type = roundGen.create(difficulty, seed);
    roundGen.weight *= 0;

    const typeExists = types.some(
      (t) => t.fn === type.fn && deepEqual(t.params, type.params)
    );

    if (!typeExists) {
      types.push(type);
    } else {
      // Unique types exhausted
      const totalWeight = roundGens.reduce((acc, el) => acc + el.weight, 0);
      if (totalWeight < 1e-6) {
        break;
      }
    }
  }

  return types.map((type) => type.fn(...type.params));
}

export const Generate = Object.freeze({
  randomRounds: generateRandomRounds,
});

function pickRandom<T extends { weight: number }>(array: T[]): T {
  const sum = array.reduce((acc, el) => acc + el.weight, 0);

  let t = Math.random() * sum;

  for (let item of array) {
    if (t < item.weight) return item;
    t -= item.weight;
  }

  return array[array.length - 1];
}
