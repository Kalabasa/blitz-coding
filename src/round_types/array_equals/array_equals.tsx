import { Case } from "code/case";
import { RoundGenerator } from "game/generate";
import { Difficulty, Round } from "game/types";
import {
  pick,
  randomInt,
  range,
  rangeCases,
  sample,
  shuffle
} from "round_types/utils";
import { createPlainCaseGridGraphics } from "ui/puzzle_graphics/graphics";

/*
FIXME {"inputs":[["d","e","k"],["d","e","k"]],"output":false}
*/

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
  time: 60,
  suite: {
    funcName: ignoreOrder ? "equalSets" : "equalArrays",
    inputNames: ["a", "b"],
    cases: rangeCases(0, 40, (i) => {
      const mixedTypesNow = mixedTypes === "regular" && i < 35;
      const specialTypesNow = mixedTypes === "special" && i < 35;
      const varyLengthNow = varyLength && i < 5;

      const pool = specialTypesNow
        ? specialPool()
        : mixedTypesNow
        ? mixedPool()
        : pick([numberPool, letterPool])();

      const caseTypes = [caseForEqual, caseForUnequal];
      if (mixedTypesNow || specialTypesNow) {
        caseTypes.push(caseForLooselyUnequal);
      }
      const caseFunc = varyLengthNow ? caseForEqual : pick(caseTypes);

      const example: any = caseFunc({
        pool,
        unique,
        ignoreOrder,
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
  weight: 1,
  create: (difficulty: Difficulty) => {
    const params: RoundTypeParameters = {
      unique: difficulty <= Difficulty.Medium,
      varyLength: difficulty >= Difficulty.Medium,
      ignoreOrder: difficulty >= Difficulty.Medium && Math.random() < 0.5,
      mixedTypes:
        difficulty <= Difficulty.Medium
          ? "none"
          : difficulty <= Difficulty.Hard
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

const exampleArrayLength = 3;

// pools of values
const numberPool = () => range(1, 9);
const letterPool = () =>
  range(0, 25).flatMap((i) => [String.fromCharCode(97 + i)]);
const mixedPool = () => [
  ...numberPool(),
  ...numberPool().map(String),
  ...sample(1, letterPool()),
];
const specialPool = () => [
  0,
  1,
  pick(numberPool().map(String)),
  pick(letterPool().map(String)),
  undefined,
  null,
  NaN,
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
}: {
  pool: any[];
  unique: boolean;
  ignoreOrder: boolean;
}) {
  const a = sample(exampleArrayLength, pool, unique);
  const b = [...a];

  if (ignoreOrder) {
    shuffle(b);

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
}: {
  pool: any[];
  ignoreOrder: boolean;
}) {
  let a, b;

  if (ignoreOrder || Math.random() < 0.75) {
    a = sample(exampleArrayLength, pool, true);
    b = sample(exampleArrayLength, pool, false);
  } else {
    a = sample(exampleArrayLength, pool, true);
    b = [...a];
    shuffle(b);

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
}) {
  const example = caseForEqual(options);

  example.inputs[1] = mixupTypes(example.inputs[1]);
  example.output = false;

  return example;
}

// Generates a new array whose elements are loosely equal
// or equal after serialization to corresponding original elements
function mixupTypes(array: any[]): any[] {
  const target = randomInt(0, array.length - 1);
  return array.map((value: any, i) => {
    if (i !== target) return value;

    if (value === null) return Math.random() < 0.5 ? undefined : Infinity;
    if (value === undefined) return Math.random() < 0.5 ? null : Infinity;

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
