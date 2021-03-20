import * as acorn from "acorn";
import * as walk from "acorn-walk";
import { RoundGenerator } from "game/generate";
import { Difficulty, Round } from "game/types";
import { uuid } from "game/uuid";
import { createModLimitCalls } from "mods/limit_calls/limit_calls";
import { Mod } from "mods/mod";
import { formattedFunction, randomInt, rangeCases } from "round_types/utils";
import { createPlainCaseGridGraphics } from "ui/puzzle_graphics/graphics";

const diceSum = (rollLimit?: number): Round => {
  const checksumKey = `___${uuid()}diceRoll`;
  const key = randomInt(2, 4);

  const { modLimitCalls, limitCalls } = createModLimitCalls(
    "rollDice",
    rollLimit ?? 0
  );

  return {
    time: 100,
    suite: {
      funcName: "sumDiceTo7",
      inputNames: ["rollDice"],
      cases: rangeCases(0, 14, () => {
        let rollDice = () => doRollDice(checksumKey, key);

        if (rollLimit) {
          rollDice = limitCalls(rollDice, rollLimit);
        }

        rollDice = formattedFunction(
          rollDice,
          `() => getRandom(1,2,3,4,5,6)`,
          "rollDice"
        );

        return {
          inputs: [rollDice],
          output: 7,
          outputCheck: (output: any) => {
            let cheating = false;
            if (typeof output === "number") {
              cheating = true;
            } else if (output instanceof Number) {
              const expected = (output as any)[checksumKey];
              const actual = key ** output.valueOf();
              cheating = expected !== actual;
            }
            if (cheating) {
              throw new Error(
                "No cheating! Return value must be a sum of purely rollDice() results only."
              );
            }
            return true;
          },
        };
      }),
    },
    mods: [
      modDiceAdditionOverload(checksumKey, key),
      ...(rollLimit ? [modLimitCalls] : []),
    ],
    Graphics: createPlainCaseGridGraphics(2, 1),
  };
};

export const createDiceSum: RoundGenerator = {
  minDifficulty: Difficulty.Medium,
  weight: 1,
  create: (difficulty: Difficulty) => ({
    fn: diceSum,
    params: [difficulty <= Difficulty.Medium ? undefined : 8],
  }),
};

function doRollDice(checksumKey: string, key: number): Number {
  // eslint-disable-next-line no-new-wrappers
  const value = new Number(Math.floor(Math.random() * 6) + 1);

  Object.defineProperty(value, checksumKey, {
    value: key ** value.valueOf(),
    enumerable: false,
    writable: false,
    configurable: false,
  });

  return value;
}

type CodeWalkState = { start: number; end: number; insert: string }[];

// TODO Refactor out into general modOverloadOperator(...);
const modDiceAdditionOverload = (checksumKey: string, key: number): Mod => {
  const addFunc = `___${uuid()}add`;
  return {
    hiddenCode: `
function ${addFunc}(a, b){
  if (!a) return b;
  if (!b) return a;

  if (a['${checksumKey}'] === undefined || b['${checksumKey}'] === undefined) {
    return a + b;
  }

  var sum = new Number(a.valueOf() + b.valueOf());
  sum.${checksumKey} = a.${checksumKey} * b.${checksumKey};
  return sum;
}`,
    preprocess: (code: string) => {
      const prologue = "(function(){\n";
      const epilogue = "\n})()";

      let ast;
      try {
        ast = acorn.parse(prologue + code + epilogue);
      } catch (error) {
        return; // Ignore incomplete code
      }

      const splices: CodeWalkState = [];
      walk.recursive<CodeWalkState>(ast, splices, {
        BinaryExpression: (node: acorn.Node & any, state, c) => {
          if (node.operator !== "+") return;

          const leftStart = -prologue.length + node.left.start;
          const leftEnd = -prologue.length + node.left.end;
          const rightStart = -prologue.length + node.right.start;
          const rightEnd = -prologue.length + node.right.end;

          state.push({
            start: leftStart,
            end: leftStart,
            insert: `${addFunc}(`,
          });
          state.push({
            start: leftEnd,
            end: rightStart,
            insert: ",",
          });
          state.push({
            start: rightEnd,
            end: rightEnd,
            insert: ")",
          });

          c(node.left, state);
          c(node.right, state);
        },
        AssignmentExpression: (node: acorn.Node & any, state, c) => {
          if (node.operator !== "+=") return;

          const leftStart = -prologue.length + node.left.start;
          const leftEnd = -prologue.length + node.left.end;
          const rightStart = -prologue.length + node.right.start;
          const rightEnd = -prologue.length + node.right.end;

          const leftExpr = code.substring(leftStart, leftEnd);

          state.push({
            start: leftEnd,
            end: rightStart,
            insert: "=",
          });
          state.push({
            start: rightStart,
            end: rightStart,
            insert: `${addFunc}(${leftExpr},`,
          });
          state.push({
            start: rightEnd,
            end: rightEnd,
            insert: ")",
          });

          c(node.left, state);
          c(node.right, state);
        },
      });

      const chars = [...code];
      splices.sort((a, b) => b.start - a.start);
      for (let splice of splices) {
        chars.splice(splice.start, splice.end - splice.start, ...splice.insert);
      }

      return chars.join("");
    },
  };
};
