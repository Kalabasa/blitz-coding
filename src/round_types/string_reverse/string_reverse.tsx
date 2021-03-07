import { RoundGenerator } from "game/generate";
import { Difficulty, Round } from "game/types";
import { modBanMethod } from "mods/ban_method/ban_method";
import { pick, RoundTypeUtil, sample } from "round_types/utils";
import { words } from "round_types/words";
import seedrandom from "seedrandom";
import { createPlainCaseGridGraphics } from "ui/puzzle_graphics/graphics";

const reverseString = (
  includeEmpty: boolean,
  includeEmoji: boolean,
  includeZalgo: boolean,
  banReverse: boolean
): Round => ({
  points: 1,
  time: 30 + (banReverse ? 30 : 0),
  suite: {
    funcName: "revStr",
    inputNames: ["s"],
    cases: sample(20, words)
      .map((word) => word.split(""))
      .concat(empty(includeEmpty))
      .concat(zalgo(includeZalgo))
      .map((chars, i) => {
        const emojiNow = includeEmoji && i < 5;

        if (emojiNow) {
          const emoji = pick(emojis, Math.random);
          chars = Math.random() < 0.1 ? [emoji, ...chars] : [...chars, emoji];
        }

        return {
          inputs: [chars.join("")],
          output: chars.reverse().join(""),
        };
      })
      .map(RoundTypeUtil.boxCase),
  },
  mods: banReverse ? [modBanMethod("Array", "reverse")] : [],
  Graphics: createPlainCaseGridGraphics(3, 1),
});

export const createReverseString: RoundGenerator = {
  minDifficulty: Difficulty.Easy,
  weight: 1,
  create: (difficulty: Difficulty, seed: string) => {
    const random = seedrandom(seed);
    return {
      fn: reverseString,
      params: [
        difficulty >= Difficulty.Medium,
        difficulty >= Difficulty.Hard,
        difficulty >= Difficulty.Hard,
        difficulty >= Difficulty.Medium && random() < 0.5,
      ],
    };
  },
};

const emojis = [
  "😄",
  "😢",
  "🤓",
  "✌🏽",
  "🧑🏻‍🦯",
  "🧑🏾‍🎓",
  "👩🏼‍🏫",
  "🧑🏿‍🍳",
  "🧑🏽‍🌾",
  "👩🏻‍🔧",
  "👨‍👩‍👧‍👦",
  "🏳️‍🌈",
];

const zalgoCharArray = ["Z̴̦̥̣̤̣̞̃̏", "A̶͐͛̈́́͗͋̚͜ͅ", "L̴̙̳̯̻̩̎ͅ", "G̵̯̟̞̫͍͛̄̀̊̈͝", "O̴̫̜̽͂́̾̆ͅ"];
const zalgo = (includeZalgo: boolean) => (includeZalgo ? [zalgoCharArray] : []);

const empty = (includeEmpty: boolean) => (includeEmpty ? [[]] : []);
