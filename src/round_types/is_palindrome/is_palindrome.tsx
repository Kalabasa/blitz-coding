import { RoundGenerator } from "game/generate";
import { Difficulty, Round } from "game/types";
import { modBanMethod } from "mods/ban_method/ban_method";
import { sample } from "round_types/utils";
import { words } from "round_types/words";
import { createPlainCaseGridGraphics } from "ui/puzzle_graphics/graphics";

const isPalindrome = (
  includeEmpty: boolean,
  includeEmoji: boolean,
  includeZalgo: boolean,
  banReverse?: boolean
): Round => ({
  time: 30 + (banReverse ? 30 : 0),
  suite: {
    funcName: "isPalindrome",
    inputNames: ["s"],
    cases: sample(10, palindromes)
      .map((palindrome) => {
        return {
          inputs: [palindrome],
          output: true,
        };
      })
      .concat(
        sample(10, nonPalindromes).map((nonPalindrome) => {
          return {
            inputs: [nonPalindrome],
            output: false,
          };
        })
      )
      .concat(empty(includeEmpty).map((s) => ({ inputs: [s], output: true })))
      .concat(emojis(includeEmoji).map((s) => ({ inputs: [s], output: true })))
      .concat(
        zalgoPalindrome(includeZalgo).map((s) => ({
          inputs: [s],
          output: true,
        }))
      )
      .concat(
        zalgoNonPalindrome(includeZalgo).map((s) => ({
          inputs: [s],
          output: false,
        }))
      ),
  },
  mods: banReverse ? [modBanMethod("Array", "reverse")] : [],
  Graphics: createPlainCaseGridGraphics(3, 1),
});

export const createIsPalindrome: RoundGenerator = {
  minDifficulty: Difficulty.Easy,
  weight: 1,
  create: (difficulty: Difficulty) => ({
    fn: isPalindrome,
    params: [
      difficulty >= Difficulty.Medium,
      difficulty >= Difficulty.Impossible,
      difficulty >= Difficulty.Impossible,
      (difficulty >= Difficulty.Medium && Math.random() < 0.8) ||
        difficulty >= Difficulty.Hard,
    ],
  }),
};

const palindromes = words.filter(
  (word) => word === [...word].reverse().join("")
);

if (!palindromes.length) palindromes.push("eye");

const nonPalindromes = words.filter(
  (word) => word !== [...word].reverse().join("")
);

if (!nonPalindromes.length) nonPalindromes.push("ear");

const emojis = (includeEmojis: boolean) =>
  includeEmojis
    ? [
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
      ]
    : [];

const zalgoCharArray = ["Z̴̦̥̣̤̣̞̃̏", "A̶͐͛̈́́͗͋̚͜ͅ", "L̴̙̳̯̻̩̎ͅ", "G̵̯̟̞̫͍͛̄̀̊̈͝", "O̴̫̜̽͂́̾̆ͅ"];
const zalgoPalindrome = (includeZalgo: boolean) =>
  includeZalgo
    ? [[...zalgoCharArray, ...zalgoCharArray.reverse()].join("")]
    : [];
const zalgoNonPalindrome = (includeZalgo: boolean) =>
  includeZalgo ? [[...zalgoCharArray].join("")] : [];

const empty = (includeEmpty: boolean) => (includeEmpty ? [""] : []);
