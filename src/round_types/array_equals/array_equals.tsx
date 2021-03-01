import { Case } from "code/case";
import { RoundGenerator } from "game/generate";
import { Difficulty, Round } from "game/types";
import { range, rangeCases } from "round_types/utils";
import seedrandom from "seedrandom";
import { createPlainCaseGridGraphics } from "ui/puzzle_graphics/graphics";

type RoundTypeParameters = {
  unique: boolean;
  varyLength: boolean;
  ignoreOrder: boolean;
  mixedTypes: "none" | "regular" | "special";
};

const arrayEquals = ({
  unique,
  varyLength,
  ignoreOrder,
  mixedTypes,
}: RoundTypeParameters): Round => ({
  points: 3,
  time: 60,
  suite: {
    funcName: ignoreOrder ? "setEq" : "arrEq",
    inputNames: ["a", "b"],
    cases: rangeCases(0, 40, (i) => {
      const random = seedrandom(Date.now().toString() + i.toString());

      const mixedTypesNow = mixedTypes === "regular" && i < 35;
      const specialTypesNow = mixedTypes === "special" && i < 35;
      const varyLengthNow = varyLength && i < 5;

      const pool = specialTypesNow
        ? specialPool()
        : mixedTypesNow
        ? mixedPool()
        : pick([numberPool, letterPool], random)();

      const caseTypes = [caseForEqual, caseForUnequal];
      if (mixedTypesNow || specialTypesNow) {
        caseTypes.push(caseForLooselyUnequal);
      }
      const caseFunc = varyLengthNow ? caseForEqual : pick(caseTypes, random);

      const example: any = caseFunc({
        pool,
        unique,
        ignoreOrder,
        random,
      });

      if (varyLengthNow) {
        example.inputs[i % 2].pop();
        example.output = false;
      }

      if (mixedTypesNow || varyLengthNow || specialTypesNow) {
        (example as Case).visibility = "discoverable";
      }

      return example;
    }),
  },
  Graphics: createPlainCaseGridGraphics(2, 1),
});

export const createArrayEquals: RoundGenerator = {
  minDifficulty: Difficulty.Easy,
  maxDifficulty: Difficulty.Hard,
  weight: 1,
  create: (difficulty: Difficulty, seed: string) => {
    const random = seedrandom(seed);

    const params: RoundTypeParameters = {
      unique: difficulty <= Difficulty.Easy,
      varyLength: difficulty >= Difficulty.Medium,
      ignoreOrder: difficulty >= Difficulty.Medium && random() < 0.5,
      mixedTypes:
        difficulty <= Difficulty.Easy
          ? "none"
          : difficulty <= Difficulty.Medium
          ? "regular"
          : "special",
    };

    return {
      fn: arrayEquals,
      params: [params],
    };
  },
};

/**
 *  Helpers
 */

type Random = () => number;
const exampleArrayLength = 3;

// pools of values
const numberPool = () => range(1, 9);
const letterPool = () =>
  range(0, 25).flatMap((i) => [String.fromCharCode(97 + i)]);
const mixedPool = () => [
  ...numberPool(),
  ...numberPool().map(String),
  ...array({
    length: 1,
    pool: letterPool(),
    unique: true,
    random: Math.random,
  }),
];
const specialPool = () => [
  0,
  1,
  pick(numberPool().map(String), Math.random),
  pick(letterPool().map(String), Math.random),
  undefined,
  null,
  Infinity,
  -Infinity,
  true,
  false,
  "true",
  "false",
];

function caseForEqual({
  pool,
  unique,
  ignoreOrder,
  random,
}: {
  pool: any[];
  unique: boolean;
  ignoreOrder: boolean;
  random: Random;
}) {
  const a = array({ length: exampleArrayLength, pool, unique, random });
  const b = [...a];

  if (ignoreOrder) {
    shuffle(b, random);

    for (let i = 0; i < a.length; i++) {
      if (a[0] !== b[i]) {
        [b[i], b[0]] = [b[0], b[i]];
        break;
      }
    }
  }

  return {
    inputs: [a, b],
    output: true,
  };
}

function caseForUnequal({
  pool,
  ignoreOrder,
  random,
}: {
  pool: any[];
  ignoreOrder: boolean;
  random: Random;
}) {
  let a, b;

  if (ignoreOrder || random() < 0.75) {
    a = array({ length: exampleArrayLength, pool, unique: true, random });
    b = array({ length: exampleArrayLength, pool, unique: false, random });
  } else {
    a = array({ length: exampleArrayLength, pool, unique: true, random });
    b = [...a];
    shuffle(b, random);

    for (let i = 0; i < a.length; i++) {
      if (a[0] !== b[i]) {
        [b[i], b[0]] = [b[0], b[i]];
        break;
      }
    }
  }

  return {
    inputs: [a, b],
    output: false,
  };
}

function caseForLooselyUnequal(options: {
  pool: any[];
  unique: boolean;
  ignoreOrder: boolean;
  random: Random;
}) {
  const example = caseForEqual(options);

  example.inputs[1] = mixupTypes(example.inputs[1], options.random);
  example.output = false;

  return example;
}

function array({
  length,
  pool,
  unique,
  random,
}: {
  length: number;
  pool: any[];
  unique: boolean;
  random: Random;
}) {
  length = Math.min(length, pool.length);
  const a = [];
  while (a.length < length) {
    a.push((unique || a.length === 0 ? pluck : pick)(pool, random));
  }
  return a;
}

function pick<T>(array: T[], random: Random): T {
  const i = Math.floor(random() * array.length);
  return array[i];
}

function pluck<T>(array: T[], random: Random): T {
  const i = Math.floor(random() * array.length);
  return array.splice(i, 1)[0];
}

function shuffle(array: any[], random: Random) {
  for (let i = 0; i < array.length; i++) {
    const j = Math.floor(random() * i);
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Generates a new array whose elements are loosely equal
// or equal after serialization to corresponding original elements
function mixupTypes(array: any[], random: Random): any[] {
  const target = Math.floor(random() * array.length);
  return array.map((value: any, i) => {
    if (i !== target) return value;

    if (value === null) return random() < 0.5 ? undefined : Infinity;
    if (value === undefined) return random() < 0.5 ? null : Infinity;

    switch (typeof value) {
      case "number":
        if (value === 0) return false;
        if (value === 1) return true;
        if (!isFinite(value)) return null;
        return value.toString();
      case "string":
        if (!isNaN(value as any)) {
          const strNum = Number(value);
          if (strNum === 0) return false;
          if (strNum === 1) return true;
          return strNum;
        }
        // Function source formatting for display via toString
        // eslint-disable-next-line no-new-func
        return new Function(`return {toString:()=>"${value}"}`)();
      case "boolean":
        return value ? 1 : 0;
    }

    return value.toString();
  });
}
