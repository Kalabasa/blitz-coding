import { RoundGenerator } from "game/generate";
import { Difficulty, Round } from "game/types";
import { createModLimitCalls } from "mods/limit_calls/limit_calls";
import { formattedFunction, pick, rangeCases, sample } from "round_types/utils";
import { words } from "round_types/words";
import {
  createPlainCaseGridGraphics,
  toFormatString,
} from "ui/puzzle_graphics/graphics";

const hangman = (maxGuessMultiplier?: number): Round => {
  const maxGuesses = Math.ceil(globalMaxGuesses * (maxGuessMultiplier ?? 1));

  const { modLimitCalls, limitCalls } = createModLimitCalls(
    "makeGuess",
    maxGuesses
  );

  return {
    time: 300,
    suite: {
      funcName: "playHangman",
      inputNames: ["makeGuess", "length", "allWords"],
      cases: rangeCases(0, 14, () => {
        const currentWords = sample(20, hangmanWords);
        (currentWords as any)[toFormatString] = () => "array<string>";

        const word = pick(currentWords);

        let makeGuess = (letter: string) => indexOfAll(letter, word);
        if (maxGuessMultiplier) {
          makeGuess = limitCalls(makeGuess, maxGuesses);
        }
        makeGuess = formattedFunction(makeGuess, `c=>indexOfAll(c,'${word}')`);

        return {
          inputs: [makeGuess, word.length, currentWords],
          output: word,
        };
      }),
    },
    mods: [
      {
        code: `/*icon:add*/ var indexOfAll = (s,h,o=0) =>
     (i=h.indexOf(s,o))>=0?[i,...indexOfAll(s,h,i+1)]:[]`,
      },
      ...(maxGuessMultiplier ? [modLimitCalls] : []),
    ],
    Graphics: createPlainCaseGridGraphics(2, 1),
  };
};

export const createHangman: RoundGenerator = {
  minDifficulty: Difficulty.Medium,
  weight: 1,
  create: (difficulty: Difficulty) => ({
    fn: hangman,
    params: [
      difficulty <= Difficulty.Medium
        ? undefined
        : difficulty <= Difficulty.Hard
        ? 2
        : 1,
    ],
  }),
};

function indexOfAll(
  needle: string,
  haystack: string,
  start?: number
): number[] {
  const i = haystack.indexOf(needle, start);
  return i >= 0 ? [i, ...indexOfAll(needle, haystack, i + 1)] : [];
}

const hangmanWords = sample(
  100,
  words.filter((s) => s.length >= 3 && s.match(/^\w+$/))
);

// Minimum number guesses to guess the hardest word using optimal strategy
const globalMaxGuesses = Math.max(
  ...hangmanWords.map((w) => minGuess(w, hangmanWords))
);

function minGuess(word: string, availableWords: string[]): number {
  const pastGuesses: string[] = [];

  let wordsLeft = availableWords.filter((s) => s.length === word.length);

  while (wordsLeft.length > 1) {
    const occurences: { [k in string]: number } = {};
    for (let w of wordsLeft) {
      const occured: { [k in string]: boolean } = {};
      for (let c of w) {
        if (occured[c]) continue;
        occurences[c] = (occurences[c] || 0) + 1;
        occured[c] = true;
      }
    }

    let bestLetter = null;
    let bestCount = 0;
    for (let [letter, count] of Object.entries(occurences)) {
      if (pastGuesses.includes(letter)) continue;

      if (count > bestCount) {
        bestLetter = letter;
        bestCount = count;
      }
    }

    if (!bestLetter) throw new Error("Logic error");

    const guess = bestLetter!;
    if (word.includes(guess)) {
      // correct guess

      // find letter positions
      const positions: number[] = indexOfAll(guess, word);

      // discard all non-matching words left
      wordsLeft = wordsLeft.filter((s) =>
        positions.every((p) => s[p] === guess)
      );
    } else {
      // incorrect guess
      // the word does not include this letter
      // discard all non-matching words left
      wordsLeft = wordsLeft.filter((s) => !s.includes(guess));
    }

    pastGuesses.push(guess);
  }

  return pastGuesses.length;
}
