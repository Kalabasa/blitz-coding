import * as acorn from "acorn";
import * as walk from "acorn-walk";
import { RoundGenerator } from "game/generate";
import { Difficulty, Round } from "game/types";
import { Mod } from "mods/mod";
import { formattedFunction, rangeCases } from "round_types/utils";
import { createPlainCaseGridGraphics } from "ui/puzzle_graphics/graphics";

const diceSum = (): Round => {
  const diceRollTag = "_" + Date.now() + "diceRoll";

  return {
    time: 100,
    suite: {
      funcName: "sumDiceTo10",
      inputNames: ["rollDice"],
      cases: rangeCases(0, 9, () => {
        const rollDice = formattedFunction(
          () => doRollDice(diceRollTag),
          `() => getRandom(1,2,3,4,5,6)`,
          "rollDice"
        );

        return {
          inputs: [rollDice],
          output: 10,
          outputCheck: (output: any) => {
            if (typeof output === "number") {
              throw new Error(
                "Return value must be a sum purely from rollDice() results only."
              );
            }
            return true;
          },
        };
      }),
    },
    mods: [modDiceAdditionOverload(diceRollTag)],
    Graphics: createPlainCaseGridGraphics(2, 1),
  };
};

export const createDiceSum: RoundGenerator = {
  minDifficulty: Difficulty.Easy,
  weight: 1,
  create: (difficulty: Difficulty) => ({
    fn: diceSum,
    params: [],
  }),
};

function doRollDice(diceRollTag: string): Number {
  return wrapAsDiceRoll(
    // eslint-disable-next-line no-new-wrappers
    new Number(Math.floor(Math.random() * 6) + 1),
    diceRollTag
  );
}

function wrapAsDiceRoll(value: Number, diceRollTag: string): Number {
  Object.defineProperty(value, diceRollTag, {
    value: diceRollTag,
    enumerable: false,
  });
  return value;
}

type CodeWalkState = { start: number; end: number; insert: string }[];

const modDiceAdditionOverload = (diceRollTag: string): Mod => {
  const addFunc = "_" + Date.now() + "add";
  return {
    hiddenCode: `
function ${addFunc}(a, b){
  if (a === 0) return b;
  if (b === 0) return a;

  if (
    a['${diceRollTag}'] !== '${diceRollTag}' ||
    b['${diceRollTag}'] !== '${diceRollTag}'
  ) {
    return a + b;
  }

  const sum = new Number(a.valueOf() + b.valueOf());
  sum.${diceRollTag} = '${diceRollTag}';
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
        console.log(splice);
        console.log(chars.join(""));
        chars.splice(splice.start, splice.end - splice.start, ...splice.insert);
        console.log(chars.join(""));
      }

      return chars.join("");
    },
  };
};
