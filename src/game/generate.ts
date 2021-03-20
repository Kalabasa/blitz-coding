import deepEqual from "deep-equal";
import { Difficulty, Round } from "game/types";
import { create24To12 } from "round_types/24_to_12/24_to_12";
import { createAbbreviate } from "round_types/abbreviate/abbreviate";
import { createArithmetic } from "round_types/arithmetic/arithmetic";
import { createArrayEquals } from "round_types/array_equals/array_equals";
import { createSortArray } from "round_types/array_sort/array_sort";
import { createAverage } from "round_types/average/average";
import { createCountMultiOccurences } from "round_types/count_multiple_occurences/count_multiple_occurences";
import { createCountOccurences } from "round_types/count_occurences/count_occurences";
import { createDiceSum } from "round_types/dice_sum/dice_sum";
import { createFactorial } from "round_types/factorial/factorial";
import { createFibonacciSequence } from "round_types/fibonacci/fibonacci";
import { createHangman } from "round_types/hangman/hangman";
import { createHigherLower } from "round_types/higher_lower/higher_lower";
import { createIsEven } from "round_types/is_even/is_even";
import { createIsPalindrome } from "round_types/is_palindrome/is_palindrome";
import { createListToArray } from "round_types/list_to_array/list_to_array";
import { createMathExpression } from "round_types/math_expression/math_expression";
import { createPower } from "round_types/power/power";
import { createQuadSequence } from "round_types/quad_sequence/quad_sequence";
import { createRange } from "round_types/range/range";
import { createRockPaperScissors } from "round_types/rock_paper_scissors/rock_paper_scissors";
import { createSparkline } from "round_types/sparkline/sparkline";
import { createSqrt } from "round_types/sqrt/sqrt";
import { createReverseString } from "round_types/string_reverse/string_reverse";
import { createTicTacToe } from "round_types/tic_tac_toe/tic_tac_toe";
import { createZip } from "round_types/zip/zip";

const allRoundGens: RoundGenerator[] = [
  create24To12,
  createAbbreviate,
  createArithmetic,
  createArrayEquals,
  createAverage,
  createCountMultiOccurences,
  createCountOccurences,
  createDiceSum,
  createFactorial,
  createFibonacciSequence,
  createHangman,
  createHigherLower,
  createIsEven,
  createIsPalindrome,
  createListToArray,
  createMathExpression,
  createPower,
  createQuadSequence,
  createRange,
  createReverseString,
  createRockPaperScissors,
  createSortArray,
  createSparkline,
  createSqrt,
  createTicTacToe,
  createZip,
]; //.filter((x) => x === createTicTacToe);

export type RoundType<P extends unknown[] = any[]> = {
  fn: (...params: P) => Round;
  params: P;
};

export type RoundGenerator = {
  minDifficulty: Difficulty;
  maxDifficulty?: Difficulty;
  weight: number;
  create: (difficulty: Difficulty) => RoundType;
};

function generateRandomRounds(difficulty: Difficulty, count: number): Round[] {
  const roundGens = allRoundGens
    .filter(
      (roundGen) =>
        difficulty >= roundGen.minDifficulty &&
        (roundGen.maxDifficulty === undefined ||
          difficulty <= roundGen.maxDifficulty)
    )
    .map((roundGen) => ({ ...roundGen }));

  const types: RoundType[] = [];

  while (types.length < count) {
    const roundGen = pickRandom(roundGens);

    const type = roundGen.create(difficulty);
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
