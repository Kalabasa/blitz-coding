import { RoundGenerator } from "game/generate";
import { Difficulty, Round } from "game/types";
import { modBanMethod } from "mods/ban_method/ban_method";
import { pick, sample } from "round_types/utils";
import { words } from "round_types/words";
import { createPlainCaseGridGraphics } from "ui/puzzle_graphics/graphics";

const reverseString = (
  includeEmpty: boolean,
  includeEmoji: boolean,
  includeZalgo: boolean,
  banReverse: boolean
): Round => ({
  time: 30 + Number(banReverse) * 30,
  suite: {
    funcName: "reverseString",
    inputNames: ["s"],
    cases: sample(15, words)
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
      }),
  },
  mods: banReverse ? [modBanMethod("Array", "reverse")] : [],
  Graphics: createPlainCaseGridGraphics(3, 1),
});

export const createReverseString: RoundGenerator = {
  minDifficulty: Difficulty.Easy,
  weight: 1,
  create: (difficulty: Difficulty) => ({
    fn: reverseString,
    params: [
      difficulty >= Difficulty.Medium,
      difficulty >= Difficulty.Impossible,
      difficulty >= Difficulty.Impossible,
      (difficulty >= Difficulty.Medium && Math.random() < 0.8) ||
        difficulty >= Difficulty.Hard,
    ],
  }),
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
