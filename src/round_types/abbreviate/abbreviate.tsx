import { RoundGenerator } from "game/generate";
import { Difficulty, Round } from "game/types";
import { modBanMethod } from "mods/ban_method/ban_method";
import { sample } from "round_types/utils";
import { createPlainCaseGridGraphics } from "ui/puzzle_graphics/graphics";

const abbreviate = (
  noSplit: boolean,
  noMap: boolean,
  noJoin: boolean,
  noToUpperCase: boolean,
  withHyphens: boolean
): Round => ({
  time:
    60 +
    (Number(noSplit) + Number(noMap) + Number(noJoin)) * 20 +
    Number(noToUpperCase) * 40 +
    Number(withHyphens) * 15,
  suite: {
    funcName: "abbreviate",
    inputNames: ["s"],
    cases: sample(20, phrases)
      .concat(withHyphens ? hyphenatedPhrases : [])
      .map((phrase: string) => {
        return {
          inputs: [phrase],
          output:
            phrase
              .split(/[- ]/g)
              .map((w) => w[0])
              .join(".")
              .toUpperCase() + ".",
        };
      }),
  },
  mods: [
    ...(noToUpperCase ? [modBanMethod("String", "toUpperCase")] : []),
    ...(noSplit ? [modBanMethod("String", "split")] : []),
    ...(noJoin ? [modBanMethod("Array", "join")] : []),
    ...(noMap ? [modBanMethod("Array", "map")] : []),
  ],
  Graphics: createPlainCaseGridGraphics(3, 1),
});

export const createAbbreviate: RoundGenerator = {
  minDifficulty: Difficulty.Easy,
  weight: 1,
  create: (difficulty: Difficulty) => ({
    fn: abbreviate,
    params: [
      (difficulty >= Difficulty.Medium && Math.random() < 0.05) ||
        (difficulty >= Difficulty.Hard && Math.random() < 0.1),
      (difficulty >= Difficulty.Easy && Math.random() < 0.05) ||
        (difficulty >= Difficulty.Medium && Math.random() < 0.1) ||
        difficulty >= Difficulty.Hard,
      (difficulty >= Difficulty.Easy && Math.random() < 0.05) ||
        (difficulty >= Difficulty.Medium && Math.random() < 0.1) ||
        difficulty >= Difficulty.Hard,
      difficulty >= Difficulty.Hard,
      (difficulty >= Difficulty.Medium && Math.random() < 0.6) ||
        (difficulty >= Difficulty.Hard && Math.random() < 0.1),
    ],
  }),
};

const phrases = [
  "Adlard Moore Freight Company",
  "Advanced Idea Mechanics",
  "American Standard Code For Information Interchange",
  "Application programming interface",
  "Artificial intelligence",
  "as far as I know",
  "as soon as possible",
  "Asia Pacific Economic Cooperation",
  "Axis aligned bounding box",
  "Berkeley Software Distribution",
  "Blue screen of death",
  "Builder's League United",
  "by the way",
  "Cascading Style Sheets",
  "Computer science",
  "Document Object Model",
  "Domain Name Service",
  "End of file",
  "Environmental Management System",
  "for what it's worth",
  "for your information",
  "Frequently asked questions",
  "Global Liberation Army",
  "Graphical Interchange Format",
  "International Affairs Agency",
  "International Business Nachines",
  "International Contract Agency",
  "Joint Photographic Experts Group",
  "Local Area Network",
  "on the other hand",
  "Personal computer",
  "PHP Hypertext Preprocessor",
  "Portable Document Format",
  "Portable Network Graphics",
  "Pretty Good Privacy",
  "Random access memory",
  "red green blue",
  "Scalable Vector Graphics",
  "Secure, Contain, Protect",
  "Shinra Electric Power Company",
  "Structured Query Language",
  "Super Star Cafe",
  "Transmission Control Protocol",
  "United Nations Space Command",
  "User Datagram Protocol",
  "Virtual reality",
  "World Wide Web",
];

const hyphenatedPhrases = [
  "Computer-generated imagery",
  "Hyper-text Markup Language",
  "Hyper-text Transfer Protocol",
  "Server-side rendering",
];
