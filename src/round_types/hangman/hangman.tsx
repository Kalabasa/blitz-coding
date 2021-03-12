import { RoundGenerator } from "game/generate";
import { Difficulty, Round } from "game/types";
import { modText } from "mods/mod_fake/mod_fake";
import {
  formattedFunction,
  limitCalls,
  pick,
  rangeCases,
  sample,
} from "round_types/utils";
import { words } from "round_types/words";
import {
  createPlainCaseGridGraphics,
  toFormatString,
} from "ui/puzzle_graphics/graphics";

const hangman = (maxGuessMultiplier?: number): Round => {
  const maxGuesses = Math.ceil(globalMaxGuesses * (maxGuessMultiplier ?? 1));
  return {
    time: 300,
    suite: {
      funcName: "playHangman",
      inputNames: ["makeGuess", "length", "allWords"],
      cases: rangeCases(0, 20, () => {
        const currentWords = sample(20, hangmanWords);
        (currentWords as any)[toFormatString] = () => "array<string>";

        const word = pick(currentWords);

        let makeGuess = (letter: string) => word.indexOf(letter);
        if (maxGuessMultiplier) {
          makeGuess = limitCalls(makeGuess, maxGuesses);
        }
        makeGuess = formattedFunction(makeGuess, `c=>'${word}'.indexOf(c)`);

        return {
          inputs: [makeGuess, word.length, currentWords],
          output: word,
        };
      }),
    },
    mods: maxGuessMultiplier
      ? [
          modText("limit_function_calls", [
            "'makeGuess'",
            maxGuesses.toString(),
          ]),
        ]
      : [],
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
      const positions: number[] = [];
      for (
        let p = -1;
        (p = word.indexOf(guess, p + 1)) >= 0;
        positions.push(p)
      );

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
